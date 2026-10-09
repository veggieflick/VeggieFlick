import { and, desc, eq, gt, count } from "drizzle-orm";
import { db } from "@/db";
import { otpCodes } from "@/db/schema";
import { ApiError, handle, ok, parseBody } from "@/lib/api";
import { generateOtp, hashOtp } from "@/lib/auth";
import { sendOtpSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

const OTP_TTL_SECONDS = 120;
const RESEND_AFTER_SECONDS = 30;
const MAX_PER_WINDOW = 5;

export async function POST(request: Request) {
  return handle(async () => {
    const { phone } = await parseBody(request, sendOtpSchema);
    const code = generateOtp(6);

    const windowStart = new Date(Date.now() - 15 * 60 * 1000);
    const recentRecords = await db
      .select({ value: count() })
      .from(otpCodes)
      .where(and(eq(otpCodes.phone, phone), gt(otpCodes.createdAt, windowStart)))
      .catch(() => [{ value: 0 }]);

    const recentCount = Number(recentRecords[0]?.value ?? 0);
    if (recentCount >= MAX_PER_WINDOW) {
      throw new ApiError("Too many OTP requests. Please try again in a few minutes.", 429, "RATE_LIMIT_EXCEEDED");
    }

    await db
      .insert(otpCodes)
      .values({
        phone,
        codeHash: hashOtp(phone, code),
        expiresAt: new Date(Date.now() + OTP_TTL_SECONDS * 1000),
      })
      .catch((err) => {
        console.warn("sendOtp db insertion warning:", err);
      });

    const fast2smsKey = process.env.FAST2SMS_API_KEY;
    const msg91Key = process.env.MSG91_API_KEY;
    const smsConfigured = Boolean(fast2smsKey || msg91Key);

    if (fast2smsKey) {
      await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: fast2smsKey,
        },
        body: JSON.stringify({
          route: "otp",
          variables_values: code,
          numbers: phone,
        }),
      }).catch((err) => {
        console.warn("Fast2SMS API dispatch warning:", err);
      });
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

    return ok({
      phone,
      expiresIn: OTP_TTL_SECONDS,
      resendAfter: RESEND_AFTER_SECONDS,
      channel: smsConfigured ? "sms" : "preview",
      otpPreview: smsConfigured ? null : code,
    });
  });
}
