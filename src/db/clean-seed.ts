import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { sql } from "drizzle-orm";
import * as schema from "./schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const db = drizzle(pool, { schema });

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const CATEGORIES = [
  { name: "Fresh Vegetables", tamil: "காய்கறிகள்", icon: "vegetables", accent: "#15803d", desc: "Handpicked daily fresh whole vegetables." },
  { name: "Cut Vegetables", tamil: "நறுக்கிய காய்கறிகள்", icon: "cut", accent: "#15803d", desc: "Washed, peeled and chopped — cooking made effortless." },
  { name: "Fresh Fruits", tamil: "பழங்கள்", icon: "fruits", accent: "#15803d", desc: "Naturally ripened seasonal fruits, sweetness guaranteed." },
  { name: "Leafy Vegetables", tamil: "கீரைகள்", icon: "leafy", accent: "#15803d", desc: "Farm-fresh keerai bunches sorted every morning." },
  { name: "Organic", tamil: "ஆர்கானிக்", icon: "organic", accent: "#15803d", desc: "Certified organic, zero pesticide residue produce." },
  { name: "Exotic Vegetables", tamil: "எக்சோடிக் காய்கறிகள்", icon: "exotic", accent: "#15803d", desc: "Continental favourites for your gourmet kitchen." },
  { name: "Salads", tamil: "சாலட்", icon: "salad", accent: "#15803d", desc: "Ready-to-toss salad bowls and healthy mixes." },
  { name: "Ready To Cook", tamil: "ரெடி டு குக்", icon: "ready", accent: "#15803d", desc: "Recipe kits with pre-cut veggies and spice packs." },
];

async function cleanSeed() {
  console.log("Cleaning Supabase DB and seeding exact VeggieFlick products...");
  const client = await pool.connect();
  try {
    // 1. Truncate tables cleanly
    await client.query(`
      TRUNCATE TABLE 
        public.product_images, 
        public.inventory, 
        public.product_variants, 
        public.products, 
        public.sub_categories, 
        public.categories 
      RESTART IDENTITY CASCADE;
    `);
    console.log("Truncated old tables successfully.");

    // 2. Insert Categories
    const categoryIdMap = new Map<string, string>();
    for (let i = 0; i < CATEGORIES.length; i++) {
      const cat = CATEGORIES[i];
      const slug = slugify(cat.name);
      const res = await client.query(
        `INSERT INTO public.categories (name, slug, tamil_name, icon, accent, description, sort_order, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')
         RETURNING id;`,
        [cat.name, slug, cat.tamil, cat.icon, cat.accent, cat.desc, i + 1]
      );
      const catId = res.rows[0].id;
      categoryIdMap.set(cat.name, catId);
    }
    console.log(`Seeded ${categoryIdMap.size} categories.`);

    // 3. Import & Insert ALL 37 PRODUCTS from seed definitions
    const { ALL_PRODUCTS } = await import("../lib/data/all-products");
    console.log(`Seeding ${ALL_PRODUCTS.length} clean products into Supabase...`);

    for (let idx = 0; idx < ALL_PRODUCTS.length; idx++) {
      const p = ALL_PRODUCTS[idx];
      let catId = categoryIdMap.get(p.categoryName);
      if (!catId) {
        if (p.isCutVegetable) catId = categoryIdMap.get("Cut Vegetables");
        else catId = categoryIdMap.get("Fresh Vegetables");
      }

      const sku = `VF-${String(idx + 1001).padStart(4, "0")}`;

      // Insert Product
      const prodRes = await client.query(
        `INSERT INTO public.products (
          category_id, name, tamil_name, slug, sku, emoji, short_description,
          is_featured, is_best_seller, is_organic, is_cut_vegetable, is_fresh_today, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'active')
        RETURNING id;`,
        [
          catId,
          p.name,
          p.tamilName || null,
          p.slug,
          sku,
          p.emoji || "🥬",
          p.shortDescription || null,
          !!p.isFeatured,
          !!p.isBestSeller,
          !!p.isOrganic,
          !!p.isCutVegetable,
          !!p.isFreshToday,
        ]
      );
      const productId = prodRes.rows[0].id;

      // Insert Variant
      const mrpVal = String(p.mrp || p.price);
      const priceVal = String(p.price);
      const discountVal = String(p.discountPercentage || 0);

      const varRes = await client.query(
        `INSERT INTO public.product_variants (
          product_id, variant_name, weight, unit, mrp, selling_price, cost_price, discount_percentage, is_default, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, 'active')
        RETURNING id;`,
        [productId, p.variantName || "500 g", "0.500", p.unit || "g", mrpVal, priceVal, String(Math.round(p.price * 0.7)), discountVal]
      );
      const variantId = varRes.rows[0].id;

      // Insert Inventory
      await client.query(
        `INSERT INTO public.inventory (variant_id, available_stock, reserved_stock, reorder_level)
         VALUES ($1, $2, 0, 10);`,
        [variantId, p.availableStock ?? 100]
      );

      // Insert Primary Image if exists
      if (p.imageUrl) {
        await client.query(
          `INSERT INTO public.product_images (product_id, image_url, is_primary)
           VALUES ($1, $2, true);`,
          [productId, p.imageUrl]
        );
      }
    }

    console.log("SUCCESS: Supabase DB cleared & re-seeded with 100% clean VeggieFlick products!");
  } catch (err) {
    console.error("Clean seed error:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

cleanSeed();
