import { promises as fs } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { db } from "@/db";
import { appSettings } from "@/db/schema";
import { ApiError, handle, ok, parseBody } from "@/lib/api";
import { requirePermission } from "@/lib/auth";
import { getEmailConfig, sendEmail } from "@/lib/services/email";

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

async function updateEnvFile(updates: Record<string, string>) {
  for (const [key, value] of Object.entries(updates)) {
    process.env[key] = value;
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

/** GET /api/v1/admin/settings/email — inspect current email service status */
export async function GET() {
  return handle(async () => {
    await requirePermission("orders.read");
    const config = await getEmailConfig();

    return ok({
      provider: config.provider,
      isConfigured: config.provider !== "none",
      smtpUser: config.smtpUser ? `${config.smtpUser.slice(0, 3)}***@gmail.com` : null,
      hasSmtpPass: Boolean(config.smtpPass),
      hasResendKey: Boolean(config.resendApiKey),
      hasBrevoKey: Boolean(config.brevoApiKey),
      fromEmail: config.fromEmail,
    });
  });
}

const updateSchema = z.object({
  action: z.enum(["save", "test"]),
  provider: z.enum(["gmail_smtp", "resend", "brevo", "none"]).optional(),
  smtpUser: z.string().trim().optional(),
  smtpPass: z.string().trim().optional(),
  resendApiKey: z.string().trim().optional(),
  brevoApiKey: z.string().trim().optional(),
  fromEmail: z.string().trim().optional(),
  testEmail: z.string().trim().email().optional(),
});

/** POST /api/v1/admin/settings/email — save settings or test live dispatch */
export async function POST(request: Request) {
  return handle(async () => {
    await requirePermission("orders.update");
    const body = await parseBody(request, updateSchema);

    // Action 1: Test Email Dispatch
    if (body.action === "test") {
      const testRecipient = body.testEmail || "sujithjai007@gmail.com";
      const res = await sendEmail({
        to: testRecipient,
        subject: "VeggieFlick - Email Delivery Test",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #10b981; border-radius: 12px; background-color: #f0fdf4;">
            <h2 style="color: #065f46; margin-bottom: 8px;">VeggieFlick Email Delivery Verified!</h2>
            <p style="color: #374151; font-size: 14px;">This confirms your email service is connected and sending real emails to Gmail successfully.</p>
            <div style="background-color: #ffffff; border: 1px solid #a7f3d0; padding: 12px; border-radius: 8px; text-align: center; margin: 16px 0;">
              <span style="font-size: 20px; font-weight: bold; color: #047857;">Verification Working Perfectly</span>
            </div>
            <p style="color: #6b7280; font-size: 12px;">Timestamp: ${new Date().toLocaleString("en-IN")}</p>
          </div>
        `,
      });

      if (!res.success) {
        throw new ApiError(res.error || "Email test delivery failed", 400, "EMAIL_TEST_FAILED");
      }

      return ok({
        delivered: true,
        provider: res.provider,
        recipient: testRecipient,
        message: `Test email successfully sent to ${testRecipient}! Please check inbox.`,
      });
    }

    // Action 2: Save Email Settings
    const envUpdates: Record<string, string> = {};

    if (body.smtpUser !== undefined) {
      await saveSettingToDb("smtp_user", body.smtpUser);
      envUpdates.SMTP_USER = body.smtpUser;
    }
    if (body.smtpPass !== undefined) {
      await saveSettingToDb("smtp_pass", body.smtpPass);
      envUpdates.SMTP_PASS = body.smtpPass;
    }
    if (body.resendApiKey !== undefined) {
      await saveSettingToDb("resend_api_key", body.resendApiKey);
      envUpdates.RESEND_API_KEY = body.resendApiKey;
    }
    if (body.brevoApiKey !== undefined) {
      await saveSettingToDb("brevo_api_key", body.brevoApiKey);
      envUpdates.BREVO_API_KEY = body.brevoApiKey;
    }
    if (body.fromEmail !== undefined) {
      await saveSettingToDb("from_email", body.fromEmail);
    }
    if (body.provider) {
      await saveSettingToDb("email_provider", body.provider);
    }

    if (Object.keys(envUpdates).length > 0) {
      await updateEnvFile(envUpdates);
    }

    return ok({
      saved: true,
      message: "Email credentials saved and activated successfully!",
    });
  });
}
