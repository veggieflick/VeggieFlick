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
import { ALL_PRODUCTS, getLiveProductsList, updateLiveProduct } from "@/lib/data/all-products";

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// GET /api/v1/admin/products - List all products from Supabase DB (with live memory merge)
export async function GET() {
  try {
    let rawProducts: any[] = [];
    try {
      rawProducts = await db
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
    } catch (dbErr) {
      console.warn("Supabase query notice, fallback to static catalog:", dbErr);
    }

    // Deduplicate by product ID / Slug
    const productMap = new Map();
    for (const p of rawProducts) {
      const key = p.id;
      if (!productMap.has(key)) {
        productMap.set(key, {
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

    // If database is empty or unseeded on Vercel deployment, populate ALL_PRODUCTS
    if (productMap.size === 0) {
      ALL_PRODUCTS.forEach((p, idx) => {
        productMap.set(p.id, {
          id: p.id,
          name: p.name,
          tamilName: p.tamilName || "",
          slug: p.slug,
          sku: `VF-${String(idx + 1001).padStart(4, "0")}`,
          emoji: p.emoji || "🥬",
          shortDescription: p.shortDescription || "",
          status: "active",
          isOrganic: p.isOrganic,
          isBestSeller: p.isBestSeller,
          isFeatured: p.isFeatured,
          isFreshToday: p.isFreshToday,
          isCutVegetable: p.isCutVegetable,
          categoryName: p.categoryName || "Fresh Vegetables",
          variantId: p.variantId || `var-${p.id}`,
          variantName: p.variantName || "500 g",
          unit: p.unit || "g",
          mrp: p.mrp || 40,
          price: p.price || 30,
          availableStock: p.availableStock ?? 100,
          imageUrl: p.imageUrl || null,
        });
      });
    }

    // Merge live dynamic in-memory product overrides
    const liveList = getLiveProductsList();
    const resultList = Array.from(productMap.values());

    for (const liveItem of liveList) {
      const matchIdx = resultList.findIndex(
        (p: any) =>
          p.id === liveItem.id ||
          p.slug === liveItem.slug ||
          p.name.toLowerCase().trim() === liveItem.name.toLowerCase().trim()
      );
      if (matchIdx >= 0) {
        resultList[matchIdx] = {
          ...resultList[matchIdx],
          name: liveItem.name,
          tamilName: liveItem.tamilName || resultList[matchIdx].tamilName,
          price: Number(liveItem.price),
          mrp: Number(liveItem.mrp),
          availableStock: Number(liveItem.availableStock),
          categoryName: liveItem.categoryName || resultList[matchIdx].categoryName,
          imageUrl: liveItem.imageUrl || resultList[matchIdx].imageUrl,
          isOrganic: liveItem.isOrganic,
          isBestSeller: liveItem.isBestSeller,
          isFeatured: liveItem.isFeatured,
          isFreshToday: liveItem.isFreshToday,
          isCutVegetable: liveItem.isCutVegetable,
        };
      }
    }

    return NextResponse.json({
      success: true,
      products: resultList,
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

    let categoryId: string | null = null;
    try {
      const foundCategory = await db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.name, categoryName || "Fresh Vegetables"))
        .limit(1);

      if (foundCategory.length > 0) {
        categoryId = foundCategory[0].id;
      } else {
        const allCat = await db.select({ id: categories.id }).from(categories).limit(1);
        if (allCat.length > 0) categoryId = allCat[0].id;
      }
    } catch (e) {
      console.warn("Category lookup warning:", e);
    }

    let newProductId = `prod-${Date.now()}`;
    let newVariantId = `var-${Date.now()}`;

    if (categoryId) {
      try {
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
        newProductId = newProduct.id;

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
        newVariantId = newVariant.id;

        await db.insert(inventory).values({
          variantId: newVariant.id,
          availableStock: Number(stock ?? 100),
          reservedStock: 0,
          reorderLevel: 10,
        });

        if (imageUrl) {
          await db.insert(productImages).values({
            productId: newProduct.id,
            imageUrl,
            isPrimary: true,
          });
        }
      } catch (err) {
        console.warn("Product DB insert notice:", err);
      }
    }

    // Add to in-memory live catalog
    updateLiveProduct(newProductId, {
      name,
      tamilName,
      slug,
      emoji: emoji || "🥬",
      categoryName: categoryName || "Fresh Vegetables",
      price: Number(price),
      mrp: Number(mrp || price),
      availableStock: Number(stock ?? 100),
      imageUrl: imageUrl || undefined,
      shortDescription: shortDescription || undefined,
      isOrganic: !!isOrganic,
      isBestSeller: !!isBestSeller,
      isFeatured: !!isFeatured,
      isFreshToday: !!isFreshToday,
      isCutVegetable: !!isCutVegetable,
    });

    return NextResponse.json({
      success: true,
      product: {
        id: newProductId,
        name,
        tamilName: tamilName || "",
        slug,
        emoji: emoji || "🥬",
        shortDescription: shortDescription || "",
        status: "active",
        isOrganic: !!isOrganic,
        isBestSeller: !!isBestSeller,
        isFeatured: !!isFeatured,
        isFreshToday: !!isFreshToday,
        isCutVegetable: !!isCutVegetable,
        categoryName: categoryName || "Fresh Vegetables",
        variantId: newVariantId,
        variantName: variantName || "500 g",
        unit: unit || "g",
        mrp: Number(mrp || price),
        price: Number(price),
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
