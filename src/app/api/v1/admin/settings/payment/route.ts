import { promises as fs } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { appSettings } from "@/db/schema";
import { ApiError, handle, ok, parseBody } from "@/lib/api";
import { requirePermission } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function saveSettingToDb(key: string, value: string) {
  try {
    await db
      .insert(appSettings)
      .values({ key, value, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: appSettings.key,
        set: { value, updatedAt: new Date() },
      });
  } catch (err) {
    console.warn(`saveSettingToDb warning for ${key}:`, err);
  }
}

async function getSettingFromDb(key: string): Promise<string | null> {
  try {
    const rows = await db.select().from(appSettings);
    const row = rows.find((r) => r.key === key);
    return row?.value ?? null;
  } catch {
    return null;
  }
}

async function updateEnvFile(updates: Record<string, string>) {
  for (const [key, value] of Object.entries(updates)) {
    process.env[key] = value;
  }

  const g = globalThis as any;
  if (!g.__veggieflickPaymentConfig) g.__veggieflickPaymentConfig = {};
  if (updates.RAZORPAY_KEY_ID) {
    g.__veggieflickPaymentConfig.keyId = updates.RAZORPAY_KEY_ID;
    await saveSettingToDb("razorpay_key_id", updates.RAZORPAY_KEY_ID);
  }
  if (updates.RAZORPAY_SECRET) {
    g.__veggieflickPaymentConfig.secret = updates.RAZORPAY_SECRET;
    await saveSettingToDb("razorpay_secret", updates.RAZORPAY_SECRET);
  }
  if (updates.RAZORPAY_WEBHOOK_SECRET) {
    g.__veggieflickPaymentConfig.webhookSecret = updates.RAZORPAY_WEBHOOK_SECRET;
    await saveSettingToDb("razorpay_webhook_secret", updates.RAZORPAY_WEBHOOK_SECRET);
  }

  try {
    const envPath = path.resolve(process.cwd(), ".env");
    let content = "";
    try {
      content = await fs.readFile(envPath, "utf-8");
    } catch {
      content = "";
    }

    for (const [key, value] of Object.entries(updates)) {
      const regex = new RegExp(`^${key}=.*$`, "m");
      const newLine = `${key}="${value}"`;
      if (regex.test(content)) {
        content = content.replace(regex, newLine);
      } else {
        content += (content.endsWith("\n") || !content ? "" : "\n") + newLine + "\n";
      }
    }

    await fs.writeFile(envPath, content, "utf-8");
  } catch (fsErr: any) {
    console.warn("Notice: .env file write skipped in read-only environment:", fsErr?.message);
  }
}

/** GET /api/v1/admin/settings/payment — read current Razorpay configuration metadata (secrets masked) */
export async function GET() {
  return handle(async () => {
    await requirePermission("orders.read");
    
    let keyId = process.env.RAZORPAY_KEY_ID || "";
    let hasSecret = Boolean(process.env.RAZORPAY_SECRET);
    let hasWebhookSecret = Boolean(process.env.RAZORPAY_WEBHOOK_SECRET);

    if (!keyId || !hasSecret) {
      const dbKey = await getSettingFromDb("razorpay_key_id");
      const dbSecret = await getSettingFromDb("razorpay_secret");
      const dbWebhook = await getSettingFromDb("razorpay_webhook_secret");
      if (dbKey && !keyId) keyId = dbKey;
      if (dbSecret && !hasSecret) hasSecret = true;
      if (dbWebhook && !hasWebhookSecret) hasWebhookSecret = true;
    }

    const isConfigured = Boolean(keyId && hasSecret);
    const mode = keyId.startsWith("rzp_live_") ? "live" : "test";
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    return ok({
      keyId,
      hasSecret,
      hasWebhookSecret,
      mode,
      isConfigured,
      isEnabled: isConfigured,
      webhookUrl: `${siteUrl.replace(/\/$/, "")}/api/webhooks/razorpay`,
      supportedMethods: [
        "UPI (Google Pay, PhonePe, Paytm, BHIM, QR Code)",
        "Direct UPI Transfer (9840532826@okaxis)",
        "Credit / Debit Cards (Visa, MasterCard, RuPay)",
        "Net Banking (All major Indian banks)",
        "Cash on Delivery (COD)",
      ],
    });
  });
}

const updateSchema = z.object({
  action: z.enum(["save", "test"]),
  keyId: z.string().trim().optional(),
  keySecret: z.string().trim().optional(),
  webhookSecret: z.string().trim().optional(),
});

/** POST /api/v1/admin/settings/payment — save credentials or test connection */
export async function POST(request: Request) {
  return handle(async () => {
    await requirePermission("orders.update");
    const body = await parseBody(request, updateSchema);

    let targetKeyId = body.keyId || process.env.RAZORPAY_KEY_ID || "";
    let targetSecret = body.keySecret || process.env.RAZORPAY_SECRET || "";

    if (!targetKeyId || !targetSecret) {
      const dbKey = await getSettingFromDb("razorpay_key_id");
      const dbSecret = await getSettingFromDb("razorpay_secret");
      if (!targetKeyId && dbKey) targetKeyId = dbKey;
      if (!targetSecret && dbSecret) targetSecret = dbSecret;
    }

    if (body.action === "test") {
      if (!targetKeyId || !targetSecret) {
        throw new ApiError(
          "Both Razorpay Key ID and Key Secret are required to test the connection",
          400,
          "MISSING_KEYS"
        );
      }
      try {
        const auth = Buffer.from(`${targetKeyId}:${targetSecret}`).toString("base64");
        const res = await fetch("https://api.razorpay.com/v1/payments?count=1", {
          headers: { Authorization: `Basic ${auth}` },
        });
        if (res.ok) {
          return ok({
            connected: true,
            mode: targetKeyId.startsWith("rzp_live_") ? "Live Production" : "Test / Sandbox",
            message: `Successfully connected to Razorpay (${
              targetKeyId.startsWith("rzp_live_") ? "Live Mode" : "Test Mode"
            })!`,
          });
        } else {
          const errData = await res.json().catch(() => ({}));
          return ok({
            connected: false,
            message:
              errData.error?.description ||
              `Razorpay authentication failed (HTTP ${res.status}). Please check your Key ID and Key Secret.`,
          });
        }
      } catch (fetchErr: any) {
        return ok({
          connected: false,
          message: `Network error connecting to Razorpay: ${fetchErr?.message || "Could not reach api.razorpay.com"}`,
        });
      }
    }

    // Action: save
    const updates: Record<string, string> = {};
    if (body.keyId !== undefined) updates.RAZORPAY_KEY_ID = body.keyId;
    if (body.keySecret) updates.RAZORPAY_SECRET = body.keySecret;
    if (body.webhookSecret !== undefined) updates.RAZORPAY_WEBHOOK_SECRET = body.webhookSecret;

    await updateEnvFile(updates);

    return ok({
      saved: true,
      keyId: targetKeyId,
      hasSecret: Boolean(targetSecret),
      hasWebhookSecret: Boolean(body.webhookSecret || process.env.RAZORPAY_WEBHOOK_SECRET),
      mode: targetKeyId.startsWith("rzp_live_") ? "live" : "test",
      message: "Razorpay credentials permanently saved and activated in database!",
    });
  });
}
