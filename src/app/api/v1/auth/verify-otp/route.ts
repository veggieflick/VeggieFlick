import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { notifications, otpCodes, profiles, wallets } from "@/db/schema";
import { ApiError, handle, ok, parseBody } from "@/lib/api";
import { checkOtpInMemory, ensureValidProfileUuid, hashOtp, issueSession, readGuestToken } from "@/lib/auth";
import { mergeGuestCart } from "@/lib/services/cart";
import { verifyOtpSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

const MAX_ATTEMPTS = 5;

export async function POST(request: Request) {
  return handle(async () => {
    const { phone, code, fullName, rememberMe } = await parseBody(request, verifyOtpSchema);

    let isNewCustomer = false;

    const [record] = await db
      .select()
      .from(otpCodes)
      .where(and(eq(otpCodes.phone, phone), eq(otpCodes.consumed, false)))
      .orderBy(desc(otpCodes.createdAt))
      .limit(1)
      .catch(() => []);

    let isValid = false;
    if (record) {
      if (record.codeHash === hashOtp(phone, code) && record.expiresAt >= new Date()) {
        isValid = true;
        await db.update(otpCodes).set({ consumed: true }).where(eq(otpCodes.id, record.id)).catch(() => undefined);
      }
    }

    if (!isValid) {
      isValid = checkOtpInMemory(phone, code);
    }

    if (!isValid) {
      throw new ApiError("Invalid or expired OTP code", 400, "INVALID_OTP");
    }

    const cleanPhone = phone.trim();
    const profileId = await ensureValidProfileUuid(null, cleanPhone, null, fullName);

    const [profile] = await db.select().from(profiles).where(eq(profiles.id, profileId)).limit(1).catch(() => []);

    const sessionUser = {
      id: profileId,
      name: profile?.fullName ?? fullName?.trim() ?? `Customer ${cleanPhone.slice(-4)}`,
      phone: cleanPhone,
      email: profile?.email ?? null,
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
