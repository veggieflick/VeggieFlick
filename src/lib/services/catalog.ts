import { and, asc, desc, eq, gte, ilike, lte, ne, or, sql, count } from "drizzle-orm";
import { db } from "@/db";
import {
  categories,
  inventory,
  productImages,
  productVariants,
  products,
  reviews,
  profiles,
  subCategories,
} from "@/db/schema";
import type { ProductQuery } from "@/lib/validation";
import { toNumber } from "@/lib/utils";
import { ALL_PRODUCTS, CORE_CATEGORIES, getLiveProductsList } from "@/lib/data/all-products";

function isUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

export type ProductCard = {
  id: string;
  name: string;
  tamilName: string | null;
  slug: string;
  emoji: string;
  shortDescription: string | null;
  isOrganic: boolean;
  isBestSeller: boolean;
  isFeatured: boolean;
  isFreshToday: boolean;
  isCutVegetable: boolean;
  isPreOrder?: boolean;
  rating: number;
  ratingCount: number;
  soldCount: number;
  categoryName: string;
  categorySlug: string;
  subCategorySlug?: string;
  variantId: string;
  variantName: string;
  unit: string;
  mrp: number;
  price: number;
  discountPercentage: number;
  availableStock: number;
  imageUrl?: string | null;
  customIngredients?: string[];
};

const cardColumns = {
  id: products.id,
  name: products.name,
  tamilName: products.tamilName,
  slug: products.slug,
  emoji: products.emoji,
  shortDescription: products.shortDescription,
  isOrganic: products.isOrganic,
  isBestSeller: products.isBestSeller,
  isFeatured: products.isFeatured,
  isFreshToday: products.isFreshToday,
  isCutVegetable: products.isCutVegetable,
  rating: products.ratingAverage,
  ratingCount: products.ratingCount,
  soldCount: products.soldCount,
  createdAt: products.createdAt,
  categoryName: categories.name,
  categorySlug: categories.slug,
  variantId: productVariants.id,
  variantName: productVariants.variantName,
  unit: productVariants.unit,
  mrp: productVariants.mrp,
  price: productVariants.sellingPrice,
  discountPercentage: productVariants.discountPercentage,
  availableStock: inventory.availableStock,
  imageUrl: productImages.imageUrl,
};

type CardRow = {
  id: string;
  name: string;
  tamilName: string | null;
  slug: string;
  emoji: string;
  shortDescription: string | null;
  isOrganic: boolean;
  isBestSeller: boolean;
  isFeatured: boolean;
  isFreshToday: boolean;
  isCutVegetable: boolean;
  rating: string;
  ratingCount: number;
  soldCount: number;
  categoryName: string;
  categorySlug: string;
  variantId: string;
  variantName: string;
  unit: string;
  mrp: string;
  price: string;
  discountPercentage: string;
  availableStock: number | null;
  imageUrl?: string | null;
};

function mapCard(row: CardRow): ProductCard {
  return {
    id: row.id,
    name: row.name,
    tamilName: row.tamilName,
    slug: row.slug,
    emoji: row.emoji,
    shortDescription: row.shortDescription,
    isOrganic: row.isOrganic,
    isBestSeller: row.isBestSeller,
    isFeatured: row.isFeatured,
    isFreshToday: row.isFreshToday,
    isCutVegetable: row.isCutVegetable,
    rating: toNumber(row.rating, 4.5),
    ratingCount: row.ratingCount,
    soldCount: row.soldCount,
    categoryName: row.categoryName,
    categorySlug: row.categorySlug,
    variantId: row.variantId,
    variantName: row.variantName,
    unit: row.unit,
    mrp: toNumber(row.mrp),
    price: toNumber(row.price),
    discountPercentage: toNumber(row.discountPercentage),
    availableStock: row.availableStock ?? 0,
    imageUrl: row.imageUrl ?? null,
  };
}

function buildFilters(query: Partial<ProductQuery>) {
  const filters = [eq(products.status, "active"), eq(productVariants.status, "active")];

  if (query.category) {
    if (query.category === "chopped-vegetable" || query.category === "chopped-vegetables" || query.category === "cut-vegetables") {
      filters.push(
        or(
          eq(categories.slug, "chopped-vegetables"),
          eq(categories.slug, "chopped-vegetable"),
          eq(categories.slug, "cut-vegetables")
        )!
      );
    } else if (query.category === "fruits" || query.category === "chopped-fruits" || query.category === "fresh-fruits") {
      filters.push(
        or(
          eq(categories.slug, "chopped-fruits"),
          eq(categories.slug, "fruits"),
          eq(categories.slug, "fresh-fruits")
        )!
      );
    } else if (query.category === "combos" || query.category === "combo" || query.category === "recipe-combo-kits" || query.category === "vegetable-rice-aviyal-combo") {
      filters.push(
        or(
          eq(categories.slug, "combos"),
          eq(categories.slug, "combo"),
          eq(categories.slug, "recipe-combo-kits"),
          eq(categories.slug, "vegetable-rice-aviyal-combo")
        )!
      );
    } else if (query.category === "fruit-salad" || query.category === "vegetable-salad-fruit-salad") {
      filters.push(
        or(
          eq(categories.slug, "fruit-salad"),
          eq(categories.slug, "vegetable-salad-fruit-salad")
        )!
      );
    } else if (query.category === "sprouts-salads" || query.category === "sprouts-combo") {
      filters.push(
        or(
          eq(categories.slug, "sprouts-salads"),
          eq(categories.slug, "sprouts-combo")
        )!
      );
    } else if (query.category === "vegetables-salads" || query.category === "salad" || query.category === "salads") {
      filters.push(
        or(
          eq(categories.slug, "vegetables-salads"),
          eq(categories.slug, "salad"),
          eq(categories.slug, "salads")
        )!
      );
    } else {
      filters.push(eq(categories.slug, query.category));
    }
  }
  if (query.subCategory) filters.push(eq(subCategories.slug, query.subCategory));
  if (query.search) {
    const term = `%${query.search}%`;
    const searchClause = or(
      ilike(products.name, term),
      ilike(products.tamilName, term),
      ilike(products.sku, term),
      ilike(products.shortDescription, term),
      ilike(categories.name, term),
    );
    if (searchClause) filters.push(searchClause);
  }
  if (query.minPrice !== undefined) filters.push(gte(productVariants.sellingPrice, String(query.minPrice)));
  if (query.maxPrice !== undefined) filters.push(lte(productVariants.sellingPrice, String(query.maxPrice)));
  if (query.organic === "true") filters.push(eq(products.isOrganic, true));
  if (query.bestSeller === "true") filters.push(eq(products.isBestSeller, true));
  if (query.featured === "true") filters.push(eq(products.isFeatured, true));
  if (query.freshToday === "true") filters.push(eq(products.isFreshToday, true));
  if (query.cut === "true") filters.push(eq(products.isCutVegetable, true));
  if (query.inStock === "true") filters.push(gte(inventory.availableStock, 1));
  if (query.minDiscount !== undefined)
    filters.push(gte(productVariants.discountPercentage, String(query.minDiscount)));
  if (query.minRating !== undefined) filters.push(gte(products.ratingAverage, String(query.minRating)));

  return and(...filters);
}

function orderClause(sort: ProductQuery["sort"]) {
  switch (sort) {
    case "newest":
      return [desc(products.createdAt)];
    case "price_asc":
      return [asc(productVariants.sellingPrice)];
    case "price_desc":
      return [desc(productVariants.sellingPrice)];
    case "discount":
      return [desc(productVariants.discountPercentage)];
    case "rating":
      return [desc(products.ratingAverage), desc(products.ratingCount)];
    default:
      return [desc(products.soldCount), desc(products.isBestSeller)];
  }
}

export const FALLBACK_CATEGORIES = CORE_CATEGORIES.map((cat, idx) => ({
  id: cat.id,
  name: cat.name,
  slug: cat.slug,
  tamilName: cat.tamilName,
  icon: cat.icon,
  accent: cat.accent,
  description: cat.description,
  sortOrder: idx + 1,
}));

export const FALLBACK_PRODUCTS: (ProductCard & { imageUrl?: string; isPreOrder?: boolean; customIngredients?: string[] })[] = ALL_PRODUCTS as any;

export async function listProducts(query: ProductQuery) {
  try {
    const where = buildFilters(query);
    const offset = (query.page - 1) * query.limit;

    const rows = await db
      .select(cardColumns)
      .from(products)
      .innerJoin(categories, eq(categories.id, products.categoryId))
      .leftJoin(subCategories, eq(subCategories.id, products.subCategoryId))
      .innerJoin(productVariants, eq(productVariants.productId, products.id))
      .leftJoin(inventory, eq(inventory.variantId, productVariants.id))
      .leftJoin(productImages, and(eq(productImages.productId, products.id), eq(productImages.isPrimary, true)))
      .where(where)
      .orderBy(...orderClause(query.sort))
      .limit(query.limit)
      .offset(offset);

    const [{ value: total }] = await db
      .select({ value: count() })
      .from(products)
      .innerJoin(categories, eq(categories.id, products.categoryId))
      .leftJoin(subCategories, eq(subCategories.id, products.subCategoryId))
      .innerJoin(productVariants, eq(productVariants.productId, products.id))
      .leftJoin(inventory, eq(inventory.variantId, productVariants.id))
      .where(where);

    if (rows && rows.length > 0) {
      const items = rows.map(mapCard);
      return { items, total: Number(total) };
    }
  } catch (err) {
    console.warn("listProducts query error:", err);
  }

function getActiveFallbackProducts(): (ProductCard & { imageUrl?: string })[] {
  let rawList: any[] = FALLBACK_PRODUCTS;
  if (
    typeof globalThis !== "undefined" &&
    Array.isArray((globalThis as any).__VF_SAVED_CATALOG__) &&
    (globalThis as any).__VF_SAVED_CATALOG__.length > 0
  ) {
    rawList = (globalThis as any).__VF_SAVED_CATALOG__;
  }
  
  const liveList = getLiveProductsList();
  
  return rawList
    .filter((p: any) => p.status !== "deleted" && p.status !== "inactive")
    .map((p: any) => {
      const live = liveList.find(
        (l) => l.id === p.id || l.slug === p.slug || l.name.toLowerCase() === p.name.toLowerCase()
      );
      const price = live ? Number(live.price) : Number(p.price) || 35;
      const mrp = live ? Number(live.mrp) : Number(p.mrp) || 50;
      const stock = live ? Number(live.availableStock) : p.stock ?? 100;
      const name = live ? live.name : p.name;
      const tamilName = live?.tamilName ?? p.tamilName ?? null;

      return {
        id: p.id,
        name,
        tamilName,
        slug: p.slug,
        emoji: p.emoji || "",
        imageUrl: live?.imageUrl || p.imageUrl || (p.images && p.images[0]) || null,
        shortDescription: p.shortDescription ?? null,
        isOrganic: Boolean(live?.isOrganic ?? p.isOrganic),
        isBestSeller: Boolean(live?.isBestSeller ?? p.isBestSeller),
        isFeatured: Boolean(live?.isFeatured ?? p.isFeatured),
        isFreshToday: true,
        isCutVegetable: Boolean(live?.isCutVegetable ?? p.isCutVegetable),
        isPreOrder: Boolean(live?.isPreOrder ?? p.isPreOrder),
        rating: 4.8,
        ratingCount: 350,
        soldCount: 2500,
        categoryName: live?.categoryName || p.categoryName || "Chopped Vegetable",
        categorySlug: live?.categorySlug || p.categorySlug || "chopped-vegetable",
        variantId: p.variantId || `var-${p.id}`,
        variantName: live?.variantName || p.variantName || p.weight || "250 g",
        unit: p.unit || "g",
        mrp,
        price,
        discountPercentage: Math.round(((mrp - price) / (mrp || 1)) * 100) || 20,
        availableStock: stock,
        customIngredients: live?.customIngredients || p.customIngredients,
      };
    });
}

  // Filter fallback products dynamically
  let filtered = getActiveFallbackProducts();
  if (query.category) filtered = filtered.filter(p => p.categorySlug === query.category);
  if (query.organic === "true") filtered = filtered.filter(p => p.isOrganic);
  if (query.bestSeller === "true") filtered = filtered.filter(p => p.isBestSeller);
  if (query.freshToday === "true") filtered = filtered.filter(p => p.isFreshToday);
  if (query.cut === "true") filtered = filtered.filter(p => p.isCutVegetable);
  if (query.minDiscount !== undefined) {
    const minD = query.minDiscount;
    filtered = filtered.filter(p => p.discountPercentage >= minD);
  }

  return { items: filtered.slice(0, query.limit ?? 24), total: filtered.length };
}

export async function listCollection(
  filter: Partial<ProductQuery>,
  limit = 8,
  sort: ProductQuery["sort"] = "popularity",
): Promise<ProductCard[]> {
  const { items } = await listProducts({
    page: 1,
    limit,
    sort,
    ...filter,
  } as ProductQuery);
  return items;
}

export async function listCategories() {
  try {
    const rows = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        tamilName: categories.tamilName,
        icon: categories.icon,
        accent: categories.accent,
        description: categories.description,
        sortOrder: categories.sortOrder,
      })
      .from(categories)
      .where(eq(categories.status, "active"))
      .orderBy(asc(categories.sortOrder));

    if (rows && rows.length > 0) return rows;
  } catch (err) {
    console.warn("listCategories query error:", err);
  }
  return FALLBACK_CATEGORIES;
}

export async function listSubCategories(categorySlug?: string) {
  try {
    const filters = [eq(subCategories.status, "active")];
    if (categorySlug) filters.push(eq(categories.slug, categorySlug));
    return await db
      .select({
        id: subCategories.id,
        name: subCategories.name,
        slug: subCategories.slug,
        categorySlug: categories.slug,
        categoryName: categories.name,
      })
      .from(subCategories)
      .innerJoin(categories, eq(categories.id, subCategories.categoryId))
      .where(and(...filters))
      .orderBy(asc(subCategories.sortOrder));
  } catch (err) {
    console.warn("listSubCategories warning:", err);
    return [];
  }
}

export async function getCategoryBySlug(slug: string) {
  try {
    const [row] = await db
      .select()
      .from(categories)
      .where(and(eq(categories.slug, slug), eq(categories.status, "active")))
      .limit(1);
    if (row) return row;
  } catch (err) {
    console.warn("getCategoryBySlug db error:", err);
  }
  return FALLBACK_CATEGORIES.find((c) => c.slug === slug) ?? null;
}

export async function getProductBySlug(slug: string) {
  const isUuidSlug = isUUID(slug);
  const cleanKeyword = slug
    .replace(/^prod-/, "")
    .replace(/^whole-/, "")
    .replace(/^cut-/, "")
    .replace(/-/g, " ")
    .trim();

  const liveList = getLiveProductsList();
  const liveMatch = liveList.find(
    (l) =>
      l.id === slug ||
      l.slug === slug ||
      l.name.toLowerCase().trim() === slug.replace(/-/g, " ").toLowerCase().trim() ||
      (cleanKeyword.length > 2 &&
        (l.id.toLowerCase().includes(cleanKeyword.toLowerCase()) ||
          l.slug.toLowerCase().includes(cleanKeyword.toLowerCase()) ||
          l.name.toLowerCase().includes(cleanKeyword.toLowerCase())))
  );

  try {
    const dbConditions = [
      eq(products.slug, slug),
      ilike(products.name, slug.replace(/-/g, " ")),
    ];
    if (isUuidSlug) dbConditions.push(eq(products.id, slug));
    if (liveMatch) {
      if (liveMatch.slug) dbConditions.push(eq(products.slug, liveMatch.slug));
      if (liveMatch.name) dbConditions.push(ilike(products.name, liveMatch.name));
    }
    if (cleanKeyword.length > 2) {
      dbConditions.push(ilike(products.slug, `%${cleanKeyword}%`));
      dbConditions.push(ilike(products.name, `%${cleanKeyword}%`));
    }

    const [row] = await db
      .select({
        product: products,
        categoryName: categories.name,
        categorySlug: categories.slug,
        categoryIcon: categories.icon,
      })
      .from(products)
      .innerJoin(categories, eq(categories.id, products.categoryId))
      .where(and(or(...dbConditions), eq(products.status, "active")))
      .limit(1);

    if (row) {
      const variants = await db
        .select({
          id: productVariants.id,
          variantName: productVariants.variantName,
          weight: productVariants.weight,
          unit: productVariants.unit,
          mrp: productVariants.mrp,
          sellingPrice: productVariants.sellingPrice,
          discountPercentage: productVariants.discountPercentage,
          taxPercentage: productVariants.taxPercentage,
          isDefault: productVariants.isDefault,
          availableStock: inventory.availableStock,
        })
        .from(productVariants)
        .leftJoin(inventory, eq(inventory.variantId, productVariants.id))
        .where(and(eq(productVariants.productId, row.product.id), eq(productVariants.status, "active")))
        .orderBy(desc(productVariants.isDefault), asc(productVariants.sellingPrice));

      const images = await db
        .select()
        .from(productImages)
        .where(eq(productImages.productId, row.product.id))
        .orderBy(asc(productImages.displayOrder));

      const productReviews = await db
        .select({
          id: reviews.id,
          rating: reviews.rating,
          reviewTitle: reviews.reviewTitle,
          review: reviews.review,
          isVerifiedPurchase: reviews.isVerifiedPurchase,
          createdAt: reviews.createdAt,
          authorName: profiles.fullName,
        })
        .from(reviews)
        .innerJoin(profiles, eq(profiles.id, reviews.profileId))
        .where(eq(reviews.productId, row.product.id))
        .orderBy(desc(reviews.createdAt))
        .limit(12);

      const finalName = row.product.name;
      const finalTamilName = row.product.tamilName || liveMatch?.tamilName;
      const finalEmoji = row.product.emoji || liveMatch?.emoji || "";
      const finalShortDesc = row.product.shortDescription || liveMatch?.shortDescription;

      const formattedVariants = variants.map((v) => {
        const sellingPrice = toNumber(v.sellingPrice);
        const mrp = toNumber(v.mrp);
        const stock = v.availableStock ?? 0;
        const discountPercentage = mrp > sellingPrice ? Math.round(((mrp - sellingPrice) / mrp) * 100) : toNumber(v.discountPercentage);

        return {
          id: v.id,
          variantName: v.variantName,
          weight: toNumber(v.weight),
          unit: v.unit,
          mrp,
          sellingPrice,
          discountPercentage,
          taxPercentage: toNumber(v.taxPercentage),
          isDefault: v.isDefault,
          availableStock: stock,
        };
      });

      const finalImages = images.length > 0
        ? images
        : (liveMatch?.imageUrl ? [{ id: "img-live-1", productId: row.product.id, imageUrl: liveMatch.imageUrl, thumbnailUrl: null, displayOrder: 0, isPrimary: true, createdAt: new Date() }] : []);

      return {
        ...row.product,
        name: finalName,
        tamilName: finalTamilName,
        emoji: finalEmoji,
        shortDescription: finalShortDesc,
        isOrganic: row.product.isOrganic,
        isBestSeller: row.product.isBestSeller,
        isFeatured: row.product.isFeatured,
        ratingAverageNumber: toNumber(row.product.ratingAverage, 4.5),
        categoryName: row.categoryName,
        categorySlug: row.categorySlug,
        categoryIcon: row.categoryIcon,
        variants: formattedVariants,
        images: finalImages,
        reviews: productReviews,
      };
    }
  } catch (err) {
    console.warn("getProductBySlug db error:", err);
  }

  const fb =
    FALLBACK_PRODUCTS.find(
      (p) =>
        p.slug === slug ||
        p.id === slug ||
        (cleanKeyword.length > 2 && (p.slug.includes(cleanKeyword) || p.id.includes(cleanKeyword)))
    ) ?? (liveMatch ? ({
      id: liveMatch.id,
      name: liveMatch.name,
      tamilName: liveMatch.tamilName,
      slug: liveMatch.slug || slug,
      emoji: liveMatch.emoji || "",
      shortDescription: liveMatch.shortDescription || "",
      categoryName: liveMatch.categoryName || "Chopped Vegetable",
      categorySlug: liveMatch.categorySlug || "chopped-vegetable",
      variantId: liveMatch.variantId || `var-${liveMatch.id}`,
      variantName: liveMatch.variantName || "250 g",
      isPreOrder: liveMatch.isPreOrder,
      customIngredients: liveMatch.customIngredients,
      unit: "g",
      mrp: liveMatch.mrp,
      price: liveMatch.price,
      discountPercentage: liveMatch.discountPercentage || 20,
      availableStock: liveMatch.availableStock,
      isOrganic: liveMatch.isOrganic,
      isBestSeller: liveMatch.isBestSeller,
      isFeatured: liveMatch.isFeatured,
      isFreshToday: liveMatch.isFreshToday,
      isCutVegetable: liveMatch.isCutVegetable,
      rating: 4.8,
      ratingCount: 350,
      soldCount: 2500,
      imageUrl: liveMatch.imageUrl,
    } as any) : null);

  if (!fb) return null;

  const finalFbName = liveMatch ? liveMatch.name : fb.name;
  const finalFbTamil = liveMatch?.tamilName ?? fb.tamilName;
  const finalFbPrice = liveMatch ? Number(liveMatch.price) : Number(fb.price);
  const finalFbMrp = liveMatch ? Number(liveMatch.mrp) : Number(fb.mrp);
  const finalFbStock = liveMatch ? Number(liveMatch.availableStock) : fb.availableStock;
  const finalFbImage = liveMatch?.imageUrl || fb.imageUrl;

  return {
    id: fb.id,
    categoryId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380c01",
    subCategoryId: null,
    brandId: null,
    name: finalFbName,
    tamilName: finalFbTamil,
    slug: fb.slug,
    sku: `VF-${fb.slug}`,
    barcode: "8901000001",
    emoji: liveMatch?.emoji || fb.emoji,
    shortDescription: liveMatch?.shortDescription || fb.shortDescription,
    description: `${liveMatch?.shortDescription || fb.shortDescription} Sourced daily from Kovambedu & hill partner farms in Tamil Nadu.`,
    nutrition: [
      { label: "Energy", value: "35 kcal / 100 g" },
      { label: "Protein", value: "1.2 g" },
      { label: "Carbohydrates", value: "6.5 g" },
      { label: "Dietary Fibre", value: "2.1 g" },
    ],
    origin: "Ooty & Hosur, Tamil Nadu",
    shelfLife: "4-5 days refrigerated",
    isFeatured: liveMatch?.isFeatured !== undefined ? Boolean(liveMatch.isFeatured) : fb.isFeatured,
    isBestSeller: liveMatch?.isBestSeller !== undefined ? Boolean(liveMatch.isBestSeller) : fb.isBestSeller,
    isOrganic: liveMatch?.isOrganic !== undefined ? Boolean(liveMatch.isOrganic) : fb.isOrganic,
    isCutVegetable: fb.isCutVegetable,
    isFreshToday: fb.isFreshToday,
    ratingAverage: fb.rating ? fb.rating.toFixed(2) : "4.80",
    ratingAverageNumber: fb.rating || 4.8,
    ratingCount: fb.ratingCount || 350,
    soldCount: fb.soldCount || 2500,
    status: "active" as const,
    seoTitle: `Buy ${finalFbName} Online in Chennai`,
    seoDescription: fb.shortDescription ?? "",
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    categoryName: fb.categoryName,
    categorySlug: fb.categorySlug,
    categoryIcon: "vegetables",
    variants: [
      {
        id: fb.variantId || `var-${fb.id}`,
        variantName: fb.variantName || "500 g",
        weight: 0.5,
        unit: fb.unit || "g",
        mrp: finalFbMrp,
        sellingPrice: finalFbPrice,
        discountPercentage: Math.round(((finalFbMrp - finalFbPrice) / (finalFbMrp || 1)) * 100) || 20,
        taxPercentage: 0,
        isDefault: true,
        availableStock: finalFbStock,
      },
    ],
    images: [{ id: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380d01", productId: fb.id, imageUrl: finalFbImage ?? "", thumbnailUrl: null, displayOrder: 0, isPrimary: true, createdAt: new Date() }],
    reviews: [
      { id: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380e01", rating: 5, reviewTitle: "Genuinely fresh", review: "Delivered fast and looks harvest fresh!", isVerifiedPurchase: true, createdAt: new Date(), authorName: "Priya N." },
    ],
  };
}

export type ProductDetail = NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>;

export async function getRelatedProducts(categorySlug: string, excludeId: string, limit = 6) {
  try {
    const rows = await db
      .select(cardColumns)
      .from(products)
      .innerJoin(categories, eq(categories.id, products.categoryId))
      .innerJoin(
        productVariants,
        and(eq(productVariants.productId, products.id), eq(productVariants.isDefault, true)),
      )
      .leftJoin(inventory, eq(inventory.variantId, productVariants.id))
      .where(
        and(eq(products.status, "active"), eq(categories.slug, categorySlug), ne(products.id, excludeId)),
      )
      .orderBy(desc(products.soldCount))
      .limit(limit);
    if (rows.length > 0) return rows.map(mapCard);
  } catch (err) {
    console.warn("getRelatedProducts db error:", err);
  }
  return FALLBACK_PRODUCTS.filter((p) => p.id !== excludeId).slice(0, limit);
}

export async function searchSuggestions(term: string, limit = 8) {
  if (!term.trim()) return [];
  const like = `%${term.trim()}%`;
  try {
    const results = await db
      .select({
        name: products.name,
        slug: products.slug,
        emoji: products.emoji,
        categoryName: categories.name,
        price: productVariants.sellingPrice,
      })
      .from(products)
      .innerJoin(categories, eq(categories.id, products.categoryId))
      .innerJoin(
        productVariants,
        and(eq(productVariants.productId, products.id), eq(productVariants.isDefault, true)),
      )
      .where(
        and(
          eq(products.status, "active"),
          or(
            ilike(products.name, like),
            ilike(products.tamilName, like),
            ilike(products.sku, like),
            ilike(categories.name, like),
          ),
        ),
      )
      .orderBy(desc(products.soldCount))
      .limit(limit);
    if (results && results.length > 0) return results;
  } catch (err) {
    console.warn("searchSuggestions db error:", err);
  }

  const q = term.toLowerCase().trim();
  const liveList = getLiveProductsList();
  return liveList
    .filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.tamilName && p.tamilName.includes(q)) ||
        p.slug.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q)
    )
    .slice(0, limit)
    .map((p) => ({
      name: p.name,
      slug: p.slug,
      emoji: p.emoji || "",
      categoryName: p.categoryName,
      price: String(p.price),
    }));
}

export async function catalogCounts() {
  try {
    const [row] = await db
      .select({
        productCount: count(products.id),
        organicCount: sql<number>`count(*) filter (where ${products.isOrganic})`,
      })
      .from(products)
      .where(eq(products.status, "active"));
    const pCount = Number(row?.productCount ?? 0);
    const oCount = Number(row?.organicCount ?? 0);
    if (pCount > 0) return { productCount: pCount, organicCount: oCount };
  } catch (err) {
    console.warn("catalogCounts error:", err);
  }
  return { productCount: 36, organicCount: 3 };
}
