import { and, desc, eq, gt, count } from "drizzle-orm";
import { db } from "@/db";
import { otpCodes } from "@/db/schema";
import { ApiError, handle, ok, parseBody } from "@/lib/api";
import { generateOtp, hashOtp, saveOtpInMemory } from "@/lib/auth";
import { sendOtpSchema } from "@/lib/validation";
import { sendEmail } from "@/lib/services/email";

export const dynamic = "force-dynamic";

const OTP_TTL_SECONDS = 180;
const RESEND_AFTER_SECONDS = 30;
const MAX_PER_WINDOW = 8;

export async function POST(request: Request) {
  return handle(async () => {
    const { phone, email, fullName } = await parseBody(request, sendOtpSchema);
    const identifier = email ? email.toLowerCase().trim() : phone!.trim();
    const code = generateOtp(6);

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

    // 1. Dispatch Email (if Email requested)
    if (email) {
      const emailResult = await sendEmail({
        to: email,
        subject: `${code} is your VeggieFlick Login Code`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #065f46; font-size: 24px; margin: 0; font-weight: 800;">VeggieFlick</h1>
              <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Fresh Cut Veggies Delivered Fast</p>
            </div>
            <p style="color: #334155; font-size: 15px; line-height: 1.5;">Hello,</p>
            <p style="color: #334155; font-size: 14px; line-height: 1.5;">Your 6-digit verification code to sign in to VeggieFlick is:</p>
            <div style="background-color: #ecfdf5; border: 2px dashed #059669; padding: 18px; border-radius: 10px; text-align: center; margin: 24px 0;">
              <span style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #065f46; font-family: monospace;">${code}</span>
            </div>
            <p style="color: #64748b; font-size: 12px; line-height: 1.5;">This code is valid for 3 minutes. For your security, do not share this code with anyone.</p>
            <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
            <p style="color: #94a3b8; font-size: 11px; text-align: center;">VeggieFlick - Koyambedu & K.K. Nagar Hubs, Chennai.</p>
          </div>
        `,
        text: `Your VeggieFlick verification code is ${code}. Valid for 3 minutes.`,
      });

      if (!emailResult.success) {
        throw new ApiError(
          emailResult.error || "Failed to deliver email to " + email + ". Please check mail configuration in Admin Settings.",
          400,
          "EMAIL_DISPATCH_FAILED"
        );
      }
    }

    // 2. Dispatch Mobile SMS OTP (if Phone requested)
    if (phone) {
      const fast2smsKey = process.env.FAST2SMS_API_KEY;
      const msg91Key = process.env.MSG91_API_KEY;

      if (fast2smsKey) {
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
      } else if (msg91Key) {
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
    }

    // Save in memory and DB only after dispatch attempt
    saveOtpInMemory(identifier, code, OTP_TTL_SECONDS);

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

    return ok({
      phone: phone || null,
      email: email || null,
      identifier,
      expiresIn: OTP_TTL_SECONDS,
      resendAfter: RESEND_AFTER_SECONDS,
      channel: email ? "email" : "sms",
      message: email
        ? `Verification code has been sent to ${email}. Please check your inbox.`
        : `Verification code has been sent to +91 ${phone}.`,
    });
  });
}
