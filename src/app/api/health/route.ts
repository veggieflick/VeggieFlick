import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await db.execute(sql`select count(*) from orders`);
    return Response.json({ ok: true, ordersCount: (res as any)?.rows?.[0]?.count ?? 0 });
  } catch (err: any) {
    return Response.json({ ok: false, error: err?.message || String(err) }, { status: 500 });
  }
}
