import { eq } from "drizzle-orm";
import { db } from "@/db";
import { auditLogs, profiles } from "@/db/schema";
import { ApiError, handle, ok, parseBody } from "@/lib/api";
import { BACK_OFFICE_ROLES, issueSession, verifyPassword, AppRole } from "@/lib/auth";
import { adminLoginSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

const DEMO_STAFF: Record<
  string,
  { password: string; name: string; role: AppRole; phone: string }
> = {
  "admin@veggieflick.in": {
    password: "Admin@12345",
    name: "Aravind Kumar",
    role: "super_admin",
    phone: "9840000001",
  },
  "manager@veggieflick.in": {
    password: "Manager@12345",
    name: "Divya Raman",
    role: "manager",
    phone: "9840000002",
  },
  "warehouse@veggieflick.in": {
    password: "Warehouse@12345",
    name: "Suresh Babu",
    role: "warehouse_staff",
    phone: "9840000003",
  },
};

export async function POST(request: Request) {
  return handle(async () => {
    const { email, password, totp } = await parseBody(request, adminLoginSchema);
    const cleanEmail = email.toLowerCase().trim();

    let sessionUser: {
      id: string;
      name: string;
      phone: string;
      email: string;
      role: AppRole;
    } | null = null;

    // 1. Try DB lookup first
    try {
      const [profile] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.email, cleanEmail))
        .limit(1);

      if (profile && verifyPassword(password, profile.passwordHash)) {
        if (!BACK_OFFICE_ROLES.includes(profile.role)) {
          throw new ApiError("This portal is restricted to VeggieFlick staff", 403, "FORBIDDEN");
        }
        if (profile.status !== "active") {
          throw new ApiError("This account has been disabled", 403, "ACCOUNT_INACTIVE");
        }

        sessionUser = {
          id: profile.id,
          name: profile.fullName,
          phone: profile.phone,
          email: profile.email,
          role: profile.role,
        };

        // Try updating last login & audit logs safely
        try {
          await db.update(profiles).set({ lastLoginAt: new Date() }).where(eq(profiles.id, profile.id));
          await db.insert(auditLogs).values({
            actorId: profile.id,
            action: "admin.login",
            entity: "profile",
            entityId: profile.id,
            metadata: { role: profile.role },
          });
        } catch (e) {
          // ignore DB write errors in demo/stateless environment
        }
      }
    } catch (dbErr) {
      console.warn("DB login error, falling back to static staff credentials check:", dbErr);
    }

    // 2. Demo fallback if DB not populated or DB query failed
    if (!sessionUser) {
      const demoAccount = DEMO_STAFF[cleanEmail];
      if (demoAccount && demoAccount.password === password) {
        sessionUser = {
          id: `demo-${cleanEmail.split("@")[0]}`,
          name: demoAccount.name,
          phone: demoAccount.phone,
          email: cleanEmail,
          role: demoAccount.role,
        };
      }
    }

    if (!sessionUser) {
      throw new ApiError("Invalid email or password", 401, "INVALID_CREDENTIALS");
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
        role: sessionUser.role,
      },
      false,
    );

    return ok({
      user: {
        id: sessionUser.id,
        fullName: sessionUser.name,
        email: sessionUser.email,
        role: sessionUser.role,
      },
    });
  });
}
