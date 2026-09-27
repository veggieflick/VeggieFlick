import { eq } from "drizzle-orm";
import { db } from "@/db";
import { profiles, wallets } from "@/db/schema";
import { handle, ok } from "@/lib/api";
import { ROLE_PERMISSIONS, clearSession, getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  return handle(async () => {
    const session = await getSession();
    if (!session) return ok({ authenticated: false, user: null });

    let profile: typeof profiles.$inferSelect | undefined;
    let walletBalance = "0.00";

    try {
      const [row] = await db.select().from(profiles).where(eq(profiles.id, session.id)).limit(1);
      profile = row;
      if (profile) {
        const [wallet] = await db.select().from(wallets).where(eq(wallets.profileId, profile.id)).limit(1);
        if (wallet) walletBalance = wallet.balance;
      }
    } catch {
      // Fallback for demo/stateless session environment
    }

    return ok({
      authenticated: true,
      user: {
        id: session.id,
        fullName: profile?.fullName ?? session.name,
        phone: profile?.phone ?? session.phone,
        email: profile?.email ?? session.email,
        role: profile?.role ?? session.role,
        loyaltyTier: profile?.loyaltyTier ?? "Bronze",
        loyaltyPoints: profile?.loyaltyPoints ?? 0,
        referralCode: profile?.referralCode ?? null,
        walletBalance,
      },
      permissions: ROLE_PERMISSIONS[profile?.role ?? session.role] ?? [],
    });
  });
}

export async function DELETE() {
  return handle(async () => {
    await clearSession();
    return ok({ loggedOut: true });
  });
}
