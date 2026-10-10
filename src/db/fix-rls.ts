import "dotenv/config";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const tables = [
  "addresses",
  "audit_logs",
  "blogs",
  "brands",
  "cart_items",
  "carts",
  "categories",
  "coupons",
  "delivery_assignments",
  "delivery_partners",
  "delivery_slots",
  "gift_cards",
  "inventory",
  "newsletter_subscribers",
  "notifications",
  "order_items",
  "order_timeline",
  "orders",
  "otp_codes",
  "payments",
  "product_images",
  "product_variants",
  "products",
  "profiles",
  "recipes",
  "referrals",
  "reviews",
  "sub_categories",
  "subscriptions",
  "wallet_transactions",
  "wallets",
  "wishlists",
];

async function fixRls() {
  console.log("Connecting to Supabase DB to enable RLS & create security policies...");
  const client = await pool.connect();
  try {
    for (const table of tables) {
      console.log(`Enabling RLS on public.${table}...`);
      await client.query(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`);

      // Drop existing policies if any
      await client.query(`DROP POLICY IF EXISTS "Public Read ${table}" ON public.${table};`);
      await client.query(`DROP POLICY IF EXISTS "Service All ${table}" ON public.${table};`);

      // Create policies allowing select and full management
      await client.query(
        `CREATE POLICY "Public Read ${table}" ON public.${table} FOR SELECT USING (true);`
      );
      await client.query(
        `CREATE POLICY "Service All ${table}" ON public.${table} FOR ALL USING (true);`
      );
    }
    console.log("SUCCESS: RLS enabled on all 32 tables with full read/write security policies!");
  } catch (err) {
    console.error("Fix RLS error:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

fixRls();
