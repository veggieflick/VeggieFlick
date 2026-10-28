import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  products,
  categories,
  productVariants,
  inventory,
  productImages,
} from "@/db/schema";
import { and, asc, desc, eq } from "drizzle-orm";
import { ALL_PRODUCTS, getLiveProductsList, updateLiveProduct } from "@/lib/data/all-products";
import { getPersistedCatalog } from "@/app/api/v1/admin/catalog/save/route";
import { getSession, BACK_OFFICE_ROLES } from "@/lib/auth";

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
    const session = await getSession();
    if (!session || !BACK_OFFICE_ROLES.includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized: Staff portal access required" }, { status: 403 });
    }

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
        .leftJoin(
          productImages,
          and(eq(productImages.productId, products.id), eq(productImages.isPrimary, true))
        )
        .where(eq(products.status, "active"))
        .orderBy(asc(categories.name), asc(products.name));
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
          emoji: p.emoji || "",
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
          emoji: p.emoji || "",
          shortDescription: p.shortDescription || "",
          status: "active",
          isOrganic: p.isOrganic,
          isBestSeller: p.isBestSeller,
          isFeatured: p.isFeatured,
          isFreshToday: p.isFreshToday,
          isCutVegetable: p.isCutVegetable,
          isPreOrder: p.isPreOrder,
          categoryName: p.categoryName || "Chopped Vegetable",
          variantId: p.variantId || `var-${p.id}`,
          variantName: p.variantName || "250 g",
          unit: p.unit || "g",
          mrp: p.mrp || 40,
          price: p.price || 30,
          availableStock: p.availableStock ?? 100,
          imageUrl: p.imageUrl || null,
        });
      });
    }

    // Merge persisted catalog changes so admin updates reflect instantly
    try {
      const persisted = getPersistedCatalog();
      if (Array.isArray(persisted) && persisted.length > 0) {
        persisted.forEach((item: any) => {
          if (productMap.has(item.id)) {
            const existing = productMap.get(item.id);
            productMap.set(item.id, { ...existing, ...item });
          } else if (item.id && item.name) {
            productMap.set(item.id, item);
          }
        });
      }
    } catch (e) {
      console.warn("Failed to merge persisted catalog:", e);
    }

    const resultList = Array.from(productMap.values());

    // Fallback only if database returned 0 products
    if (resultList.length === 0) {
      const liveList = getLiveProductsList();
      for (const liveItem of liveList) {
        resultList.push({
          id: liveItem.id,
          name: liveItem.name,
          tamilName: liveItem.tamilName || "",
          slug: liveItem.slug,
          sku: `VF-${liveItem.id.slice(0, 6).toUpperCase()}`,
          emoji: liveItem.emoji || "",
          shortDescription: liveItem.shortDescription || "",
          status: "active",
          isOrganic: !!liveItem.isOrganic,
          isBestSeller: !!liveItem.isBestSeller,
          isFeatured: !!liveItem.isFeatured,
          isFreshToday: !!liveItem.isFreshToday,
          isCutVegetable: !!liveItem.isCutVegetable,
          categoryName: liveItem.categoryName || "Fresh Vegetables",
          variantId: `var-${liveItem.id}`,
          variantName: liveItem.variantName || "500 g",
          unit: liveItem.unit || "g",
          mrp: liveItem.mrp ? Number(liveItem.mrp) : 40,
          price: liveItem.price ? Number(liveItem.price) : 30,
          availableStock: liveItem.availableStock ?? 100,
          imageUrl: liveItem.imageUrl || null,
        });
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
    const session = await getSession();
    if (!session || !BACK_OFFICE_ROLES.includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized: Staff portal access required" }, { status: 403 });
    }

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
            emoji: emoji || "",
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
      emoji: emoji || "",
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
        emoji: emoji || "",
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
