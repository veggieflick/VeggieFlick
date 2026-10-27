import { eq, or } from "drizzle-orm";
import { db } from "@/db";
import { auditLogs, profiles } from "@/db/schema";
import { ApiError, handle, ok, parseBody } from "@/lib/api";
import { issueSession, verifyPassword, AppRole } from "@/lib/auth";
import { adminLoginSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

// Server-side Super Admin credentials (Configured via private environment variables)
const SUPER_ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "admin@veggieflick.in").toLowerCase().trim();
const SUPER_ADMIN_USERNAME = (process.env.ADMIN_USERNAME || "admin").toLowerCase().trim();
const SUPER_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@12345";

export async function POST(request: Request) {
  return handle(async () => {
    const { email: identifier, password, totp } = await parseBody(request, adminLoginSchema);
    const cleanId = identifier.toLowerCase().trim();

    let sessionUser: {
      id: string;
      name: string;
      phone: string;
      email: string | null;
      role: AppRole;
    } | null = null;

    // 1. Try DB lookup first
    try {
      const [profile] = await db
        .select()
        .from(profiles)
        .where(or(eq(profiles.email, cleanId), eq(profiles.referralCode, cleanId.toUpperCase())))
        .limit(1);

      if (profile && verifyPassword(password, profile.passwordHash)) {
        // Enforce Super Admin only — reject any other staff role
        if (profile.role !== "super_admin") {
          throw new ApiError("This portal is strictly restricted to Super Admin only", 403, "FORBIDDEN");
        }
        if (profile.status !== "active") {
          throw new ApiError("This account has been disabled", 403, "ACCOUNT_INACTIVE");
        }

        sessionUser = {
          id: profile.id,
          name: profile.fullName,
          phone: profile.phone,
          email: profile.email,
          role: "super_admin",
        };

        // Try updating last login & audit logs safely
        try {
          await db.update(profiles).set({ lastLoginAt: new Date() }).where(eq(profiles.id, profile.id));
          await db.insert(auditLogs).values({
            actorId: profile.id,
            action: "admin.login",
            entity: "profile",
            entityId: profile.id,
            metadata: { role: "super_admin" },
          });
        } catch {
          // ignore DB write errors in demo/stateless environment
        }
      }
    } catch (dbErr) {
      if (dbErr instanceof ApiError) throw dbErr;
      console.warn("DB login error, checking server-side credentials:", dbErr);
    }

    // 2. Server-side Super Admin authentication (Strictly private server-side check)
    if (!sessionUser) {
      const isSuperAdminMatch =
        (cleanId === SUPER_ADMIN_EMAIL || cleanId === SUPER_ADMIN_USERNAME) &&
        password === SUPER_ADMIN_PASSWORD;

      if (isSuperAdminMatch) {
        sessionUser = {
          id: "super-admin-root",
          name: "Super Admin",
          phone: "9840532826",
          email: SUPER_ADMIN_EMAIL,
          role: "super_admin",
        };
      }
    }

    if (!sessionUser) {
      throw new ApiError("Invalid username or password", 401, "INVALID_CREDENTIALS");
    }

    // Second factor check if configured
    const requiredTotp = process.env.ADMIN_TOTP_CODE;
    if (requiredTotp && totp !== requiredTotp) {
      throw new ApiError("Invalid two-factor authentication code", 401, "INVALID_2FA");
    }

    await issueSession(
      {
        id: sessionUser.id,
        name: sessionUser.name,
        phone: sessionUser.phone,
        email: sessionUser.email,
        role: "super_admin",
      },
      false,
    );

    return ok({
      user: {
        id: sessionUser.id,
        fullName: sessionUser.name,
        email: sessionUser.email,
        role: "super_admin",
      },
    });
  });
}
