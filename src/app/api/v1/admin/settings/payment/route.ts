import { promises as fs } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { ApiError, handle, ok, parseBody } from "@/lib/api";
import { requirePermission } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function updateEnvFile(updates: Record<string, string>) {
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
    process.env[key] = value;
  }

  await fs.writeFile(envPath, content, "utf-8");
}

/** GET /api/v1/admin/settings/payment — read current Razorpay configuration metadata (secrets masked) */
export async function GET() {
  return handle(async () => {
    await requirePermission("orders.read");
    const keyId = process.env.RAZORPAY_KEY_ID || "";
    const hasSecret = Boolean(process.env.RAZORPAY_SECRET);
    const hasWebhookSecret = Boolean(process.env.RAZORPAY_WEBHOOK_SECRET);
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

    const targetKeyId = body.keyId || process.env.RAZORPAY_KEY_ID || "";
    const targetSecret = body.keySecret || process.env.RAZORPAY_SECRET || "";

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
      keyId: process.env.RAZORPAY_KEY_ID || "",
      hasSecret: Boolean(process.env.RAZORPAY_SECRET),
      hasWebhookSecret: Boolean(process.env.RAZORPAY_WEBHOOK_SECRET),
      mode: (process.env.RAZORPAY_KEY_ID || "").startsWith("rzp_live_") ? "live" : "test",
      message: "Razorpay credentials saved and activated successfully on server!",
    });
  });
}
