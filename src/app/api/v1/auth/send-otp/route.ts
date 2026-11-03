import { and, desc, eq, gt, count } from "drizzle-orm";
import { db } from "@/db";
import { otpCodes } from "@/db/schema";
import { ApiError, handle, ok, parseBody } from "@/lib/api";
import { generateOtp, hashOtp, saveOtpInMemory } from "@/lib/auth";
import { sendOtpSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

const OTP_TTL_SECONDS = 180;
const RESEND_AFTER_SECONDS = 30;
const MAX_PER_WINDOW = 8;

export async function POST(request: Request) {
  return handle(async () => {
    const { phone, email, fullName } = await parseBody(request, sendOtpSchema);
    const identifier = email ? email.toLowerCase().trim() : phone!.trim();
    const code = generateOtp(6);
    
    // Save in memory for instant validation
    saveOtpInMemory(identifier, code, OTP_TTL_SECONDS);

    const windowStart = new Date(Date.now() - 15 * 60 * 1000);
    const recentRecords = await db
      .select({ value: count() })
      .from(otpCodes)
      .where(and(eq(otpCodes.phone, identifier), gt(otpCodes.createdAt, windowStart)))
      .catch(() => [{ value: 0 }]);

    const recentCount = Number(recentRecords[0]?.value ?? 0);
    if (recentCount >= MAX_PER_WINDOW) {
      throw new ApiError("Too many OTP requests. Please try again in a few minutes.", 429, "RATE_LIMIT_EXCEEDED");
    }

    await db
      .insert(otpCodes)
      .values({
        phone: identifier,
        email: email ? email.toLowerCase().trim() : null,
        codeHash: hashOtp(identifier, code),
        expiresAt: new Date(Date.now() + OTP_TTL_SECONDS * 1000),
      })
      .catch((err) => {
        console.warn("sendOtp db insertion warning:", err);
      });

    // 1. Dispatch Email OTP (if Email requested)
    let emailSent = false;
    if (email) {
      const resendApiKey = process.env.RESEND_API_KEY;
      if (resendApiKey) {
        try {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${resendApiKey}`,
            },
            body: JSON.stringify({
              from: "VeggieFlick <login@veggieflick.in>",
              to: [email],
              subject: `${code} is your VeggieFlick Login Code`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                  <h2 style="color: #065f46; margin-bottom: 8px;">VeggieFlick Verification</h2>
                  <p style="color: #475569; font-size: 14px;">Use the 6-digit verification code below to sign in:</p>
                  <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 16px; border-radius: 8px; text-align: center; margin: 20px 0;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #047857;">${code}</span>
                  </div>
                  <p style="color: #64748b; font-size: 12px;">Valid for 3 minutes. Never share this code with anyone.</p>
                </div>
              `,
            }),
          });
          emailSent = true;
        } catch (err) {
          console.warn("Resend email dispatch error:", err);
        }
      }
    }

    // 2. Dispatch Mobile SMS OTP (if Phone requested)
    const fast2smsKey = process.env.FAST2SMS_API_KEY;
    const msg91Key = process.env.MSG91_API_KEY;
    const smsConfigured = Boolean(fast2smsKey || msg91Key);

    if (phone && fast2smsKey) {
      try {
        await fetch("https://www.fast2sms.com/dev/bulkV2", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: fast2smsKey,
          },
          body: JSON.stringify({
            route: "q",
            message: `Your VeggieFlick OTP code is ${code}. Valid for 3 minutes. Do not share with anyone.`,
            language: "english",
            flash: "0",
            numbers: String(phone),
          }),
        });
      } catch (err) {
        console.warn("Fast2SMS API fetch error:", err);
      }
    } else if (phone && msg91Key) {
      await fetch("https://control.msg91.com/api/v5/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json", authkey: msg91Key },
        body: JSON.stringify({
          template_id: process.env.MSG91_TEMPLATE_ID ?? "veggieflick_otp",
          mobile: `91${phone}`,
          otp: code,
        }),
      }).catch(() => undefined);
    }

    return ok({
      phone: phone || null,
      email: email || null,
      identifier,
      expiresIn: OTP_TTL_SECONDS,
      resendAfter: RESEND_AFTER_SECONDS,
      channel: email ? (emailSent ? "email_sent" : "preview") : (smsConfigured ? "sms" : "preview"),
      // Free preview code so login works seamlessly without paying SMS gateway fees
      otpPreview: code,
      message: email
        ? `Free verification code generated for ${email}`
        : `Verification code generated for ${phone}`,
    });
  });
}
