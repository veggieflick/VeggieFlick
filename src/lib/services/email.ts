import nodemailer from "nodemailer";
import { db } from "@/db";
import { appSettings } from "@/db/schema";

export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export type EmailConfig = {
  provider: "gmail_smtp" | "resend" | "brevo" | "none";
  smtpUser?: string;
  smtpPass?: string;
  resendApiKey?: string;
  brevoApiKey?: string;
  fromEmail?: string;
};

/** Load active email settings from PostgreSQL DB and process.env */
export async function getEmailConfig(): Promise<EmailConfig> {
  const settingsMap: Record<string, string> = {};

  try {
    const rows = await db.select().from(appSettings);
    for (const r of rows) {
      settingsMap[r.key] = r.value;
    }
  } catch (err) {
    console.warn("Could not load email settings from db:", err);
  }

  const resendApiKey = process.env.RESEND_API_KEY || settingsMap.resend_api_key || "";
  const brevoApiKey = process.env.BREVO_API_KEY || settingsMap.brevo_api_key || "";
  const smtpUser = process.env.SMTP_USER || settingsMap.smtp_user || process.env.EMAIL_USER || "";
  const smtpPass = process.env.SMTP_PASS || settingsMap.smtp_pass || process.env.EMAIL_PASS || "";
  const fromEmail = settingsMap.from_email || smtpUser || "login@veggieflick.in";

  if (resendApiKey) {
    return { provider: "resend", resendApiKey, fromEmail };
  }
  if (smtpUser && smtpPass) {
    return { provider: "gmail_smtp", smtpUser, smtpPass, fromEmail };
  }
  if (brevoApiKey) {
    return { provider: "brevo", brevoApiKey, fromEmail };
  }

  return { provider: "none", fromEmail };
}

/** Send real email to recipient using the configured provider */
export async function sendEmail(payload: EmailPayload): Promise<{ success: boolean; provider: string; error?: string }> {
  const config = await getEmailConfig();

  // 1. Resend API
  if (config.provider === "resend" && config.resendApiKey) {
    try {
      const fromAddr = config.fromEmail?.includes("@") ? config.fromEmail : "VeggieFlick <login@veggieflick.in>";
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.resendApiKey}`,
        },
        body: JSON.stringify({
          from: fromAddr,
          to: [payload.to],
          subject: payload.subject,
          html: payload.html,
          text: payload.text,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error("Resend API error:", data);
        return { success: false, provider: "resend", error: data.message || "Resend email delivery failed" };
      }
      return { success: true, provider: "resend" };
    } catch (err: any) {
      console.error("Resend dispatch error:", err);
      return { success: false, provider: "resend", error: err?.message || "Network error sending email via Resend" };
    }
  }

  // 2. Gmail / Custom SMTP via Nodemailer
  if (config.provider === "gmail_smtp" && config.smtpUser && config.smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: config.smtpUser,
          pass: config.smtpPass.replace(/\s+/g, ""), // clean spaces from 16-char app password
        },
      });

      await transporter.sendMail({
        from: `"VeggieFlick" <${config.smtpUser}>`,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
      });

      return { success: true, provider: "gmail_smtp" };
    } catch (err: any) {
      console.error("Nodemailer Gmail SMTP error:", err);
      return {
        success: false,
        provider: "gmail_smtp",
        error: err?.message || "Gmail SMTP delivery failed. Please verify your 16-character Google App Password.",
      };
    }
  }

  // 3. Brevo API
  if (config.provider === "brevo" && config.brevoApiKey) {
    try {
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": config.brevoApiKey,
        },
        body: JSON.stringify({
          sender: { name: "VeggieFlick", email: config.fromEmail || "noreply@veggieflick.in" },
          to: [{ email: payload.to }],
          subject: payload.subject,
          htmlContent: payload.html,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { success: false, provider: "brevo", error: data.message || "Brevo delivery failed" };
      }
      return { success: true, provider: "brevo" };
    } catch (err: any) {
      return { success: false, provider: "brevo", error: err?.message || "Brevo API network error" };
    }
  }

  return {
    success: false,
    provider: "none",
    error:
      "Email service is not yet configured on the server. Please add your Gmail App Password or Resend API key in Admin Settings > Email & Auth.",
  };
}
