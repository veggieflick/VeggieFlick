import "dotenv/config";
import { db } from "./src/db";
import { products, productVariants, inventory, productImages } from "./src/db/schema";
import { eq, ilike, or } from "drizzle-orm";

async function checkOnion() {
  console.log("=== CHECKING ONION DB ROWS IN SUPABASE ===");

  const onionProducts = await db
    .select()
    .from(products)
    .where(or(ilike(products.name, "%onion%"), ilike(products.slug, "%onion%")));

  console.log("Products count matching onion:", onionProducts.length);
  for (const p of onionProducts) {
    console.log("\nProduct Row:", { id: p.id, name: p.name, slug: p.slug });

    const variants = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productId, p.id));
    console.log("  Variants count:", variants.length);
    for (const v of variants) {
      console.log("    Variant:", { id: v.id, name: v.variantName, price: v.sellingPrice, mrp: v.mrp, isDefault: v.isDefault });
    }
  }

  process.exit(0);
}

checkOnion().catch((e) => {
  console.error("Error checking onion:", e);
  process.exit(1);
});
