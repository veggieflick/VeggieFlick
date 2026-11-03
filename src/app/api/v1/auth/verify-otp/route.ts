import { and, desc, eq, or } from "drizzle-orm";
import { db } from "@/db";
import { otpCodes, profiles } from "@/db/schema";
import { ApiError, handle, ok, parseBody } from "@/lib/api";
import { checkOtpInMemory, ensureValidProfileUuid, hashOtp, issueSession, readGuestToken } from "@/lib/auth";
import { mergeGuestCart } from "@/lib/services/cart";
import { verifyOtpSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return handle(async () => {
    const { phone, email, code, fullName, rememberMe } = await parseBody(request, verifyOtpSchema);

    const identifier = email ? email.toLowerCase().trim() : phone!.trim();
    let isNewCustomer = false;

    // 1. Check in Database
    let record: any = null;
    try {
      const records = await db
        .select()
        .from(otpCodes)
        .where(
          and(
            or(eq(otpCodes.phone, identifier), email ? eq(otpCodes.email, identifier) : undefined),
            eq(otpCodes.consumed, false)
          )
        )
        .orderBy(desc(otpCodes.createdAt))
        .limit(1);
      record = records[0];
    } catch (err) {
      console.warn("verifyOtp db check warning:", err);
    }

    let isValid = false;
    if (record) {
      if (record.codeHash === hashOtp(identifier, code) && record.expiresAt >= new Date()) {
        isValid = true;
        await db.update(otpCodes).set({ consumed: true }).where(eq(otpCodes.id, record.id)).catch(() => undefined);
      }
    }

    // 2. Check in In-Memory Store
    if (!isValid) {
      isValid = checkOtpInMemory(identifier, code);
    }

    if (!isValid) {
      throw new ApiError("Invalid or expired OTP code", 400, "INVALID_OTP");
    }

    // 3. Resolve Profile
    const cleanPhone = phone ? phone.trim() : null;
    const cleanEmail = email ? email.toLowerCase().trim() : null;
    const profileId = await ensureValidProfileUuid(null, cleanPhone, cleanEmail, fullName);

    const [profile] = await db.select().from(profiles).where(eq(profiles.id, profileId)).limit(1).catch(() => []);

    const sessionUser = {
      id: profileId,
      name:
        profile?.fullName ??
        fullName?.trim() ??
        (cleanEmail ? cleanEmail.split("@")[0] : `Customer ${cleanPhone?.slice(-4) || "VF"}`),
      phone: profile?.phone ?? cleanPhone ?? "9840532826",
      email: profile?.email ?? cleanEmail ?? null,
      role: (profile?.role as any) ?? "customer",
    };

    const guestToken = await readGuestToken().catch(() => null);
    if (profile?.id) {
      await mergeGuestCart(profile.id, guestToken).catch(() => undefined);
    }

    await issueSession(sessionUser, rememberMe);

    return ok({
      isNewCustomer,
      user: {
        id: sessionUser.id,
        fullName: sessionUser.name,
        phone: sessionUser.phone,
        email: sessionUser.email,
        role: sessionUser.role,
        loyaltyTier: profile?.loyaltyTier ?? "Bronze",
      },
    });
  });
}
