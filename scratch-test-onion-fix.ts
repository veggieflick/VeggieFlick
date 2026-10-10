import "dotenv/config";
import { db } from "./src/db";
import { products, productVariants, inventory } from "./src/db/schema";
import { eq, ilike, or, sql } from "drizzle-orm";

function isUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function findTargetProduct(productId: string, name?: string) {
  if (isUUID(productId)) {
    const found = await db.select({ id: products.id, slug: products.slug, name: products.name }).from(products).where(eq(products.id, productId)).limit(1);
    if (found.length > 0) return found[0];
  }

  const cleanId = productId.replace(/^prod-/, ""); // "whole-onion" or "cut-beans"
  const targetSlug = slugify(name || cleanId);
  const coreKeyword = cleanId.replace(/^(whole|cut|salad|combo)-/, ""); // "onion", "beans", "carrot"

  console.log({ productId, cleanId, targetSlug, coreKeyword, name });

  // Search by exact slug, cleanId slug, or core keyword in slug/name
  const matches = await db
    .select({ id: products.id, slug: products.slug, name: products.name })
    .from(products)
    .where(
      or(
        eq(products.slug, productId),
        eq(products.slug, cleanId),
        eq(products.slug, targetSlug),
        ilike(products.slug, `%${coreKeyword}%`),
        ilike(products.name, `%${coreKeyword}%`)
      )
    );

  console.log("Matches found in DB:", matches);
  return matches[0] || null;
}

async function run() {
  const result = await findTargetProduct("prod-whole-onion", "Onion Slices");
  console.log("FINAL MATCHED ROW:", result);
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
