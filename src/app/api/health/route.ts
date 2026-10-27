import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await db.execute(sql`select count(*) from orders`);
    return Response.json({
      ok: true,
      status: "healthy",
      database: "connected",
      ordersCount: (res as any)?.rows?.[0]?.count ?? 0,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return Response.json({
      ok: true,
      status: "degraded",
      database: "disconnected",
      mode: "fallback-catalog",
      message: err?.message || String(err),
      timestamp: new Date().toISOString(),
    });
  }
}
