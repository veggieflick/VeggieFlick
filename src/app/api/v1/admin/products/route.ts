import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  products,
  categories,
  productVariants,
  inventory,
  productImages,
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// GET /api/v1/admin/products - List all products from Supabase DB
export async function GET() {
  try {
    const rawProducts = await db
      .select({
        id: products.id,
        name: products.name,
        tamilName: products.tamilName,
        slug: products.slug,
        sku: products.sku,
        emoji: products.emoji,
        shortDescription: products.shortDescription,
        status: products.status,
        isOrganic: products.isOrganic,
        isBestSeller: products.isBestSeller,
        isFeatured: products.isFeatured,
        isFreshToday: products.isFreshToday,
        isCutVegetable: products.isCutVegetable,
        categoryId: products.categoryId,
        categoryName: categories.name,
        categorySlug: categories.slug,
        createdAt: products.createdAt,
        variantId: productVariants.id,
        variantName: productVariants.variantName,
        unit: productVariants.unit,
        mrp: productVariants.mrp,
        price: productVariants.sellingPrice,
        availableStock: inventory.availableStock,
        imageUrl: productImages.imageUrl,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(productVariants, eq(productVariants.productId, products.id))
      .leftJoin(inventory, eq(inventory.variantId, productVariants.id))
      .leftJoin(productImages, eq(productImages.productId, products.id))
      .orderBy(desc(products.createdAt));

    // Deduplicate by product ID
    const productMap = new Map();
    for (const p of rawProducts) {
      if (!productMap.has(p.id)) {
        productMap.set(p.id, {
          id: p.id,
          name: p.name,
          tamilName: p.tamilName || "",
          slug: p.slug,
          sku: p.sku || `VF-${p.id.slice(0, 6).toUpperCase()}`,
          emoji: p.emoji || "🥬",
          shortDescription: p.shortDescription || "",
          status: p.status || "active",
          isOrganic: !!p.isOrganic,
          isBestSeller: !!p.isBestSeller,
          isFeatured: !!p.isFeatured,
          isFreshToday: !!p.isFreshToday,
          isCutVegetable: !!p.isCutVegetable,
          categoryId: p.categoryId,
          categoryName: p.categoryName || "Fresh Vegetables",
          variantId: p.variantId,
          variantName: p.variantName || "500 g",
          unit: p.unit || "g",
          mrp: p.mrp ? Number(p.mrp) : 40,
          price: p.price ? Number(p.price) : 30,
          availableStock: p.availableStock ?? 100,
          imageUrl: p.imageUrl || null,
        });
      }
    }

    return NextResponse.json({
      success: true,
      products: Array.from(productMap.values()),
    });
  } catch (error) {
    console.error("Failed to fetch admin products:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to load products" },
      { status: 500 }
    );
  }
}

// POST /api/v1/admin/products - Create a new product in Supabase DB
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      tamilName,
      emoji,
      categoryName,
      price,
      mrp,
      variantName,
      unit,
      stock,
      imageUrl,
      shortDescription,
      isOrganic,
      isBestSeller,
      isFeatured,
      isFreshToday,
      isCutVegetable,
    } = body;

    if (!name || price === undefined) {
      return NextResponse.json({ error: "Product name and price are required" }, { status: 400 });
    }

    const slug = slugify(name);
    const generatedSku = `VF-${Math.floor(100000 + Math.random() * 900000)}`;

    // Find category ID
    let categoryId: string;
    const foundCategory = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.name, categoryName || "Fresh Vegetables"))
      .limit(1);

    if (foundCategory.length > 0) {
      categoryId = foundCategory[0].id;
    } else {
      const allCat = await db.select({ id: categories.id }).from(categories).limit(1);
      if (allCat.length === 0) {
        return NextResponse.json({ error: "No category found in database" }, { status: 400 });
      }
      categoryId = allCat[0].id;
    }

    // Insert Product
    const [newProduct] = await db
      .insert(products)
      .values({
        name,
        tamilName: tamilName || null,
        slug,
        sku: generatedSku,
        emoji: emoji || "🥬",
        categoryId,
        shortDescription: shortDescription || null,
        isOrganic: !!isOrganic,
        isBestSeller: !!isBestSeller,
        isFeatured: !!isFeatured,
        isFreshToday: !!isFreshToday,
        isCutVegetable: !!isCutVegetable,
        status: "active",
      })
      .returning();

    // Insert Variant
    const numPrice = Number(price);
    const numMrp = Number(mrp || price);
    const discount = numMrp > numPrice ? Math.round(((numMrp - numPrice) / numMrp) * 100) : 0;

    const [newVariant] = await db
      .insert(productVariants)
      .values({
        productId: newProduct.id,
        variantName: variantName || "500 g",
        weight: "0.500",
        unit: unit || "g",
        mrp: String(numMrp),
        sellingPrice: String(numPrice),
        costPrice: String(Math.round(numPrice * 0.7)),
        discountPercentage: String(discount),
        isDefault: true,
      })
      .returning();

    // Insert Inventory
    await db.insert(inventory).values({
      variantId: newVariant.id,
      availableStock: Number(stock ?? 100),
      reservedStock: 0,
      reorderLevel: 10,
    });

    // Insert Image if provided
    if (imageUrl) {
      await db.insert(productImages).values({
        productId: newProduct.id,
        imageUrl,
        isPrimary: true,
      });
    }

    return NextResponse.json({
      success: true,
      product: {
        id: newProduct.id,
        name: newProduct.name,
        tamilName: newProduct.tamilName || "",
        slug: newProduct.slug,
        emoji: newProduct.emoji,
        shortDescription: newProduct.shortDescription || "",
        status: "active",
        isOrganic: newProduct.isOrganic,
        isBestSeller: newProduct.isBestSeller,
        isFeatured: newProduct.isFeatured,
        isFreshToday: newProduct.isFreshToday,
        isCutVegetable: newProduct.isCutVegetable,
        categoryName: categoryName || "Fresh Vegetables",
        variantId: newVariant.id,
        variantName: newVariant.variantName,
        unit: newVariant.unit,
        mrp: numMrp,
        price: numPrice,
        sku: generatedSku,
        availableStock: Number(stock ?? 100),
        imageUrl: imageUrl || null,
      },
    });
  } catch (error) {
    console.error("Failed to create product:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to create product" },
      { status: 500 }
    );
  }
}
