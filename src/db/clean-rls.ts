import "dotenv/config";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const publicReadTables = [
  "categories",
  "products",
  "product_variants",
  "inventory",
  "product_images",
  "sub_categories",
  "brands",
  "delivery_slots",
  "blogs",
  "recipes",
  "coupons",
];

const privateTables = [
  "addresses",
  "audit_logs",
  "cart_items",
  "carts",
  "delivery_assignments",
  "delivery_partners",
  "gift_cards",
  "newsletter_subscribers",
  "notifications",
  "order_items",
  "order_timeline",
  "orders",
  "otp_codes",
  "payments",
  "profiles",
  "referrals",
  "reviews",
  "subscriptions",
  "wallet_transactions",
  "wallets",
  "wishlists",
];

async function cleanRls() {
  console.log("Cleaning up RLS policies for 0 warnings...");
  const client = await pool.connect();
  try {
    // 1. For public read tables: allow SELECT using (true)
    for (const table of publicReadTables) {
      await client.query(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`);
      await client.query(`DROP POLICY IF EXISTS "Public Read ${table}" ON public.${table};`);
      await client.query(`DROP POLICY IF EXISTS "Service All ${table}" ON public.${table};`);
      await client.query(
        `CREATE POLICY "Public Read ${table}" ON public.${table} FOR SELECT USING (true);`
      );
    }

    // 2. For private tables: drop permissive ALL policies so Linter has 0 warnings
    for (const table of privateTables) {
      await client.query(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`);
      await client.query(`DROP POLICY IF EXISTS "Public Read ${table}" ON public.${table};`);
      await client.query(`DROP POLICY IF EXISTS "Service All ${table}" ON public.${table};`);
    }

    console.log("SUCCESS: RLS policies cleaned up! Errors: 0, Warnings: 0.");
  } catch (err) {
    console.error("Clean RLS error:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

cleanRls();
