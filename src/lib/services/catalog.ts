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
import { getLiveProductsList } from "@/lib/data/all-products";

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
  };
}

function buildFilters(query: Partial<ProductQuery>) {
  const filters = [eq(products.status, "active"), eq(productVariants.status, "active")];

  if (query.category) {
    if (query.category === "vegetables-shopping") {
      filters.push(
        or(
          eq(categories.slug, "vegetables-shopping"),
          eq(categories.slug, "fresh-vegetables"),
          eq(categories.slug, "cut-vegetables")
        )!
      );
    } else if (query.category === "salad") {
      filters.push(or(eq(categories.slug, "salad"), eq(categories.slug, "salads"))!);
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

export const FALLBACK_CATEGORIES = [
  {
    id: "cat-veg",
    name: "Vegetables Shopping",
    slug: "vegetables-shopping",
    tamilName: "காய்கறிகள்",
    icon: "vegetables",
    accent: "#15803d",
    description: "Fresh whole produce & precision chopped vegetables, ready to cook.",
    sortOrder: 1,
  },
  {
    id: "cat-salad",
    name: "Salad",
    slug: "salad",
    tamilName: "சாலட்",
    icon: "salad",
    accent: "#16a34a",
    description: "Custom tossed Fruit, Sprouts, and Vegetable salads in 250g & 500g packs.",
    sortOrder: 2,
    subCategories: [
      { id: "sub-fruit-salad", name: "Fruit Salad", slug: "fruit-salad" },
      { id: "sub-sprouts-salad", name: "Sprouts Salad", slug: "sprouts-salad" },
      { id: "sub-vegetable-salad", name: "Vegetable Salad", slug: "vegetable-salad" },
    ],
  },
];

export const FALLBACK_PRODUCTS: (ProductCard & { imageUrl?: string })[] = [
  /* ---------------- 1. Vegetables Shopping (Chopped & Cut Vegetables) ---------------- */
  {
    id: "prod-cut-beans",
    name: "Cut Beans (Chopped)",
    tamilName: "நறுக்கிய பீன்ஸ்",
    slug: "cut-beans",
    emoji: "vegetables",
    imageUrl: "/images/products/cut-beans.jpg",
    shortDescription: "Tender beans precision chopped, ready for poriyal or stir fry.",
    isOrganic: false,
    isBestSeller: true,
    isFeatured: true,
    isFreshToday: true,
    isCutVegetable: true,
    rating: 4.8,
    ratingCount: 420,
    soldCount: 3100,
    categoryName: "Vegetables Shopping",
    categorySlug: "vegetables-shopping",
    variantId: "var-cut-beans",
    variantName: "250 g",
    unit: "g",
    mrp: 45,
    price: 35,
    discountPercentage: 24,
    availableStock: 180,
  },
  {
    id: "prod-cut-carrot",
    name: "Cut Carrot (Diced)",
    tamilName: "நறுக்கிய கேரட்",
    slug: "cut-carrot",
    emoji: "carrot",
    imageUrl: "/images/products/cut-carrot.jpg",
    shortDescription: "Sweet carrots evenly diced for quick daily cooking.",
    isOrganic: false,
    isBestSeller: true,
    isFeatured: true,
    isFreshToday: true,
    isCutVegetable: true,
    rating: 4.7,
    ratingCount: 380,
    soldCount: 2900,
    categoryName: "Vegetables Shopping",
    categorySlug: "vegetables-shopping",
    variantId: "var-cut-carrot",
    variantName: "250 g",
    unit: "g",
    mrp: 40,
    price: 29,
    discountPercentage: 28,
    availableStock: 160,
  },
  {
    id: "prod-cut-beetroot",
    name: "Cut Beetroot (Cubed)",
    tamilName: "நறுக்கிய பீட்ரூட்",
    slug: "cut-beetroot",
    emoji: "beetroot",
    imageUrl: "/images/products/cut-beetroot.jpg",
    shortDescription: "Peeled and cleanly cubed beetroot, zero mess preparation.",
    isOrganic: false,
    isBestSeller: false,
    isFeatured: true,
    isFreshToday: true,
    isCutVegetable: true,
    rating: 4.6,
    ratingCount: 210,
    soldCount: 1850,
    categoryName: "Vegetables Shopping",
    categorySlug: "vegetables-shopping",
    variantId: "var-cut-beetroot",
    variantName: "250 g",
    unit: "g",
    mrp: 42,
    price: 32,
    discountPercentage: 24,
    availableStock: 140,
  },
  {
    id: "prod-cut-lady-finger",
    name: "Lady's Finger (Ring Cut)",
    tamilName: "வெண்டைக்காய் (நறுக்கியது)",
    slug: "cut-lady-finger",
    emoji: "capsicum",
    imageUrl: "/images/products/cut-lady-finger.jpg",
    shortDescription: "Crisp okra sliced into clean rings for fry or sambar.",
    isOrganic: false,
    isBestSeller: true,
    isFeatured: false,
    isFreshToday: true,
    isCutVegetable: true,
    rating: 4.7,
    ratingCount: 310,
    soldCount: 2400,
    categoryName: "Vegetables Shopping",
    categorySlug: "vegetables-shopping",
    variantId: "var-cut-lady-finger",
    variantName: "250 g",
    unit: "g",
    mrp: 40,
    price: 28,
    discountPercentage: 30,
    availableStock: 120,
  },
  {
    id: "prod-cut-cauliflower",
    name: "Cauliflower Florets",
    tamilName: "காலிஃபிளவர் நறுக்கியது",
    slug: "cut-cauliflower",
    emoji: "broccoli",
    imageUrl: "/images/products/cut-cauliflower.jpg",
    shortDescription: "Washed bite-sized florets, completely clean and ready to cook.",
    isOrganic: false,
    isBestSeller: true,
    isFeatured: true,
    isFreshToday: true,
    isCutVegetable: true,
    rating: 4.8,
    ratingCount: 490,
    soldCount: 3800,
    categoryName: "Vegetables Shopping",
    categorySlug: "vegetables-shopping",
    variantId: "var-cut-cauliflower",
    variantName: "300 g",
    unit: "g",
    mrp: 60,
    price: 42,
    discountPercentage: 30,
    availableStock: 150,
  },
  {
    id: "prod-cut-peeled-onion-garlic",
    name: "Peeled Shallots & Garlic Mix",
    tamilName: "உரித்த சின்ன வெங்காயம் பூண்டு",
    slug: "cut-peeled-onion-garlic",
    emoji: "onion",
    imageUrl: "/images/products/peeled-onion-garlic.jpg",
    shortDescription: "Fresh peeled small onions and garlic cloves, ready to use.",
    isOrganic: false,
    isBestSeller: true,
    isFeatured: true,
    isFreshToday: true,
    isCutVegetable: true,
    rating: 4.9,
    ratingCount: 610,
    soldCount: 4900,
    categoryName: "Vegetables Shopping",
    categorySlug: "vegetables-shopping",
    variantId: "var-cut-peeled-onion-garlic",
    variantName: "200 g",
    unit: "g",
    mrp: 75,
    price: 55,
    discountPercentage: 26,
    availableStock: 200,
  },
  {
    id: "prod-cut-sambar-mix",
    name: "Cut Sambar Veggie Mix",
    tamilName: "சாம்பார் நறுக்கிய காய்கறி கலவை",
    slug: "sambar-cut-mix",
    emoji: "soup",
    imageUrl: "/images/products/sambar-cut-mix.jpg",
    shortDescription: "Drumstick, carrot, pumpkin, shallots & beans cut for sambar.",
    isOrganic: false,
    isBestSeller: true,
    isFeatured: true,
    isFreshToday: true,
    isCutVegetable: true,
    rating: 4.9,
    ratingCount: 780,
    soldCount: 5200,
    categoryName: "Vegetables Shopping",
    categorySlug: "vegetables-shopping",
    variantId: "var-cut-sambar-mix",
    variantName: "500 g",
    unit: "g",
    mrp: 65,
    price: 49,
    discountPercentage: 25,
    availableStock: 190,
  },
  {
    id: "prod-grated-coconut",
    name: "Fresh Grated Coconut",
    tamilName: "தேங்காய் துருவல்",
    slug: "grated-coconut",
    emoji: "coconut",
    imageUrl: "/images/products/grated-coconut.jpg",
    shortDescription: "Fine fresh coconut shavings for chutneys, gravies & poriyal.",
    isOrganic: false,
    isBestSeller: true,
    isFeatured: false,
    isFreshToday: true,
    isCutVegetable: true,
    rating: 4.9,
    ratingCount: 540,
    soldCount: 4100,
    categoryName: "Vegetables Shopping",
    categorySlug: "vegetables-shopping",
    variantId: "var-grated-coconut",
    variantName: "200 g",
    unit: "g",
    mrp: 55,
    price: 42,
    discountPercentage: 24,
    availableStock: 220,
  },

  /* ---------------- 1. Vegetables Shopping (Fresh Whole Vegetables) ---------------- */
  {
    id: "prod-whole-tomato",
    name: "Country Tomato (Desi)",
    tamilName: "நாட்டு தக்காளி",
    slug: "country-tomato",
    emoji: "tomato",
    imageUrl: "/images/products/whole-tomato.jpg",
    shortDescription: "Juicy, firm red tomatoes ideal for daily cooking.",
    isOrganic: false,
    isBestSeller: true,
    isFeatured: true,
    isFreshToday: true,
    isCutVegetable: false,
    rating: 4.6,
    ratingCount: 810,
    soldCount: 5200,
    categoryName: "Vegetables Shopping",
    categorySlug: "vegetables-shopping",
    variantId: "var-whole-tomato",
    variantName: "500 g",
    unit: "g",
    mrp: 40,
    price: 29,
    discountPercentage: 28,
    availableStock: 180,
  },
  {
    id: "prod-whole-onion",
    name: "Onion Slices",
    tamilName: "வெங்காயம்",
    slug: "onion-slices",
    emoji: "onion",
    imageUrl: "/images/products/whole-onion.jpg",
    shortDescription: "Crisp, tight-layered onions with great shelf life.",
    isOrganic: false,
    isBestSeller: true,
    isFeatured: true,
    isFreshToday: false,
    isCutVegetable: false,
    rating: 4.5,
    ratingCount: 640,
    soldCount: 4800,
    categoryName: "Vegetables Shopping",
    categorySlug: "vegetables-shopping",
    variantId: "var-whole-onion",
    variantName: "1 kg",
    unit: "kg",
    mrp: 52,
    price: 38,
    discountPercentage: 27,
    availableStock: 260,
  },
  {
    id: "prod-whole-carrot",
    name: "Ooty Tender Carrot (Whole)",
    tamilName: "கேரட் (முழு)",
    slug: "ooty-carrot",
    emoji: "carrot",
    imageUrl: "/images/products/whole-carrot.jpg",
    shortDescription: "Sweet, crunchy whole carrots with vibrant color.",
    isOrganic: false,
    isBestSeller: true,
    isFeatured: true,
    isFreshToday: true,
    isCutVegetable: false,
    rating: 4.7,
    ratingCount: 390,
    soldCount: 2900,
    categoryName: "Vegetables Shopping",
    categorySlug: "vegetables-shopping",
    variantId: "var-whole-carrot",
    variantName: "500 g",
    unit: "g",
    mrp: 55,
    price: 39,
    discountPercentage: 29,
    availableStock: 170,
  },
  {
    id: "prod-whole-potato",
    name: "Fresh Baby Potato",
    tamilName: "உருளைக்கிழங்கு",
    slug: "fresh-potato",
    emoji: "potato",
    imageUrl: "/images/products/whole-potato.jpg",
    shortDescription: "Clean, thin-skinned potatoes perfect for curries and roasts.",
    isOrganic: false,
    isBestSeller: false,
    isFeatured: false,
    isFreshToday: true,
    isCutVegetable: false,
    rating: 4.6,
    ratingCount: 410,
    soldCount: 3100,
    categoryName: "Vegetables Shopping",
    categorySlug: "vegetables-shopping",
    variantId: "var-whole-potato",
    variantName: "1 kg",
    unit: "kg",
    mrp: 48,
    price: 36,
    discountPercentage: 25,
    availableStock: 210,
  },

  /* ---------------- 2. Salad Category (Fruit Salad, Sprouts Salad, Vegetable Salad) ---------------- */
  {
    id: "prod-salad-fruit-custom",
    name: "Fruit Salad (Custom Bowl)",
    tamilName: "பழ சாலட்",
    slug: "fruit-salad-bowl",
    emoji: "fruit",
    imageUrl: "/images/products/fruit-salad-exotic.jpg",
    shortDescription: "Custom bowl of fresh seasonal fruits (Raspberry, Blueberry, Strawberry, Watermelon, Apple, etc.).",
    isOrganic: false,
    isBestSeller: true,
    isFeatured: true,
    isFreshToday: true,
    isCutVegetable: false,
    rating: 4.9,
    ratingCount: 610,
    soldCount: 4400,
    categoryName: "Salad",
    categorySlug: "salad",
    subCategorySlug: "fruit-salad",
    variantId: "var-salad-fruit-custom",
    variantName: "250 g",
    unit: "g",
    mrp: 140,
    price: 99,
    discountPercentage: 29,
    availableStock: 130,
  },
  {
    id: "prod-salad-sprouts-custom",
    name: "Sprouts Salad (Custom Bowl)",
    tamilName: "முளைகட்டிய பயறு சாலட்",
    slug: "sprouts-salad-bowl",
    emoji: "sprout",
    imageUrl: "/images/products/veg-salad-sprouts.jpg",
    shortDescription: "Protein sprouts salad with Green Moong, Channa, Soya Beans, Cucumber & Groundnut.",
    isOrganic: false,
    isBestSeller: true,
    isFeatured: true,
    isFreshToday: true,
    isCutVegetable: true,
    rating: 4.9,
    ratingCount: 520,
    soldCount: 3900,
    categoryName: "Salad",
    categorySlug: "salad",
    subCategorySlug: "sprouts-salad",
    variantId: "var-salad-sprouts-custom",
    variantName: "250 g",
    unit: "g",
    mrp: 110,
    price: 79,
    discountPercentage: 28,
    availableStock: 140,
  },
  {
    id: "prod-salad-veg-custom",
    name: "Vegetable Salad (Custom Bowl)",
    tamilName: "காய்கறி சாலட்",
    slug: "vegetable-salad-bowl",
    emoji: "salad",
    imageUrl: "/images/products/veg-salad-fresh.jpg",
    shortDescription: "Crisp vegetable salad with Cucumber, Cabbage, Corn, Carrot, Beetroot & Broccoli.",
    isOrganic: false,
    isBestSeller: true,
    isFeatured: true,
    isFreshToday: true,
    isCutVegetable: true,
    rating: 4.8,
    ratingCount: 340,
    soldCount: 2600,
    categoryName: "Salad",
    categorySlug: "salad",
    subCategorySlug: "vegetable-salad",
    variantId: "var-salad-veg-custom",
    variantName: "250 g",
    unit: "g",
    mrp: 130,
    price: 89,
    discountPercentage: 31,
    availableStock: 110,
  },
  {
    id: "prod-salad-citrus-glow",
    name: "Citrus Glow Fruit Bowl",
    tamilName: "சிட்ரஸ் பழ சாலட்",
    slug: "citrus-glow-fruit-bowl",
    emoji: "orange",
    imageUrl: "/images/products/fruit-salad-citrus.jpg",
    shortDescription: "Sweet orange segments, sweet lime, and fresh pomegranate arils.",
    isOrganic: false,
    isBestSeller: true,
    isFeatured: true,
    isFreshToday: true,
    isCutVegetable: false,
    rating: 4.8,
    ratingCount: 380,
    soldCount: 2600,
    categoryName: "Salad",
    categorySlug: "salad",
    subCategorySlug: "fruit-salad",
    variantId: "var-salad-citrus-glow",
    variantName: "250 g",
    unit: "g",
    mrp: 150,
    price: 109,
    discountPercentage: 27,
    availableStock: 110,
  },
  {
    id: "prod-veg-salad-rainbow",
    name: "Rainbow Crunch Veg Salad",
    tamilName: "ரெயின்போ சாலட்",
    slug: "rainbow-crunch-salad",
    emoji: "salad",
    imageUrl: "/images/products/veg-salad-rainbow.jpg",
    shortDescription: "Purple cabbage, carrot, cucumber & toasted seeds with dressing.",
    isOrganic: false,
    isBestSeller: false,
    isFeatured: true,
    isFreshToday: true,
    isCutVegetable: true,
    rating: 4.7,
    ratingCount: 280,
    soldCount: 1800,
    categoryName: "Salad",
    categorySlug: "salad",
    subCategorySlug: "vegetable-salad",
    variantId: "var-veg-salad-rainbow",
    variantName: "250 g",
    unit: "g",
    mrp: 130,
    price: 89,
    discountPercentage: 31,
    availableStock: 100,
  },
  {
    id: "prod-veg-salad-corn",
    name: "Sweet Corn & Bell Pepper Toss",
    tamilName: "சோளம் & குடைமிளகாய் சாலட்",
    slug: "sweet-corn-pepper-salad",
    emoji: "salad",
    imageUrl: "/images/products/veg-salad-corn.jpg",
    shortDescription: "Tender sweet corn, tri-color bell peppers, and chat herb dressing.",
    isOrganic: false,
    isBestSeller: true,
    isFeatured: true,
    isFreshToday: true,
    isCutVegetable: true,
    rating: 4.8,
    ratingCount: 310,
    soldCount: 2200,
    categoryName: "Salad",
    categorySlug: "salad",
    subCategorySlug: "vegetable-salad",
    variantId: "var-veg-salad-corn",
    variantName: "250 g",
    unit: "g",
    mrp: 120,
    price: 85,
    discountPercentage: 29,
    availableStock: 120,
  },

  /* ---------------- 4. Fruits Cutting & Combo Pack ---------------- */
  {
    id: "prod-cut-watermelon",
    name: "Seedless Watermelon Cubes",
    tamilName: "தர்பூசணி (நறுக்கியது)",
    slug: "fruit-watermelon",
    emoji: "watermelon",
    imageUrl: "/images/products/fruit-cut-watermelon.jpg",
    shortDescription: "Sweet, cold, ready-to-eat watermelon cubes, deseeded.",
    isOrganic: false,
    isBestSeller: true,
    isFeatured: true,
    isFreshToday: true,
    isCutVegetable: false,
    rating: 4.8,
    ratingCount: 510,
    soldCount: 4100,
    categoryName: "Fruits Cutting & Combo Pack",
    categorySlug: "fruits-cutting-combo",
    variantId: "var-fruit-watermelon",
    variantName: "400 g",
    unit: "g",
    mrp: 60,
    price: 42,
    discountPercentage: 30,
    availableStock: 180,
  },
  {
    id: "prod-cut-papaya",
    name: "Papaya Cubes (Ready-to-Eat)",
    tamilName: "பப்பாளி (நறுக்கியது)",
    slug: "fruit-papaya",
    emoji: "papaya",
    imageUrl: "/images/products/fruit-cut-papaya.jpg",
    shortDescription: "Cleanly sliced sweet Red Lady papaya cubes.",
    isOrganic: false,
    isBestSeller: true,
    isFeatured: true,
    isFreshToday: true,
    isCutVegetable: false,
    rating: 4.7,
    ratingCount: 390,
    soldCount: 2800,
    categoryName: "Fruits Cutting & Combo Pack",
    categorySlug: "fruits-cutting-combo",
    variantId: "var-fruit-papaya",
    variantName: "300 g",
    unit: "g",
    mrp: 65,
    price: 48,
    discountPercentage: 26,
    availableStock: 140,
  },
  {
    id: "prod-cut-pineapple",
    name: "Pineapple Slices / Diced",
    tamilName: "அன்னாசிப்பழம் (நறுக்கியது)",
    slug: "fruit-pineapple",
    emoji: "pineapple",
    imageUrl: "/images/products/fruit-cut-pineapple.jpg",
    shortDescription: "Peeled and de-eyed sweet pineapple slices.",
    isOrganic: false,
    isBestSeller: true,
    isFeatured: true,
    isFreshToday: true,
    isCutVegetable: false,
    rating: 4.8,
    ratingCount: 450,
    soldCount: 3200,
    categoryName: "Fruits Cutting & Combo Pack",
    categorySlug: "fruits-cutting-combo",
    variantId: "var-fruit-pineapple",
    variantName: "300 g",
    unit: "g",
    mrp: 80,
    price: 59,
    discountPercentage: 26,
    availableStock: 120,
  },
  {
    id: "prod-cut-pomegranate",
    name: "Pomegranate Arils (Seeded)",
    tamilName: "மாதுளை விதைகள்",
    slug: "fruit-pomegranate",
    emoji: "apple",
    imageUrl: "/images/products/fruit-cut-pomegranate.jpg",
    shortDescription: "Ruby red sweet pomegranate arils, ready to eat.",
    isOrganic: false,
    isBestSeller: true,
    isFeatured: true,
    isFreshToday: true,
    isCutVegetable: false,
    rating: 4.9,
    ratingCount: 680,
    soldCount: 4800,
    categoryName: "Fruits Cutting & Combo Pack",
    categorySlug: "fruits-cutting-combo",
    variantId: "var-fruit-pomegranate",
    variantName: "200 g",
    unit: "g",
    mrp: 110,
    price: 79,
    discountPercentage: 28,
    availableStock: 160,
  },
  {
    id: "prod-cut-dragon",
    name: "Dragon Fruit Cubes",
    tamilName: "டிராகன் பழம் (நறுக்கியது)",
    slug: "fruit-dragon",
    emoji: "fruit",
    imageUrl: "/images/products/fruit-cut-dragon.jpg",
    shortDescription: "Fresh diced dragon fruit, packed with antioxidants.",
    isOrganic: false,
    isBestSeller: false,
    isFeatured: true,
    isFreshToday: true,
    isCutVegetable: false,
    rating: 4.6,
    ratingCount: 220,
    soldCount: 1500,
    categoryName: "Fruits Cutting & Combo Pack",
    categorySlug: "fruits-cutting-combo",
    variantId: "var-fruit-dragon",
    variantName: "250 g",
    unit: "g",
    mrp: 120,
    price: 89,
    discountPercentage: 25,
    availableStock: 90,
  },
  {
    id: "prod-fruit-combo-deluxe",
    name: "Deluxe Family Fruit Cutting Combo Box",
    tamilName: "பழ காம்போ பாக்ஸ்",
    slug: "fruit-combo-deluxe",
    emoji: "fruit",
    imageUrl: "/images/products/fruit-combo-deluxe.jpg",
    shortDescription: "4 assorted pre-cut fruit cups: Watermelon, Papaya, Pineapple & Pomegranate.",
    isOrganic: false,
    isBestSeller: true,
    isFeatured: true,
    isFreshToday: true,
    isCutVegetable: false,
    rating: 4.9,
    ratingCount: 420,
    soldCount: 3100,
    categoryName: "Fruits Cutting & Combo Pack",
    categorySlug: "fruits-cutting-combo",
    variantId: "var-fruit-combo-deluxe",
    variantName: "1 kg (4 Packs)",
    unit: "pack",
    mrp: 260,
    price: 199,
    discountPercentage: 23,
    availableStock: 100,
  },

  /* ---------------- Bottom Section: Dedicated Combo Packs ---------------- */
  {
    id: "prod-combo-pulav",
    name: "Pulav Special Veggie Combo Kit",
    tamilName: "புலாவ் காய்கறி கிட்",
    slug: "combo-pulav",
    emoji: "rice",
    imageUrl: "/images/products/combo-kit-pulav.jpg",
    shortDescription: "Carrot, beans, green peas, potato & whole spices pouch.",
    isOrganic: false,
    isBestSeller: true,
    isFeatured: true,
    isFreshToday: true,
    isCutVegetable: true,
    rating: 4.8,
    ratingCount: 410,
    soldCount: 3100,
    categoryName: "Vegetables Shopping",
    categorySlug: "vegetables-shopping",
    variantId: "var-combo-pulav",
    variantName: "Serves 4",
    unit: "pack",
    mrp: 180,
    price: 129,
    discountPercentage: 28,
    availableStock: 95,
  },
  {
    id: "prod-combo-biryani",
    name: "Vegetables Biryani Special Kit",
    tamilName: "காய்கறி பிரியாணி கிட்",
    slug: "combo-biryani",
    emoji: "rice",
    imageUrl: "/images/products/combo-kit-biryani.jpg",
    shortDescription: "Cut veggies, cauliflower florets, mint & aromatic biryani spices.",
    isOrganic: false,
    isBestSeller: true,
    isFeatured: true,
    isFreshToday: true,
    isCutVegetable: true,
    rating: 4.9,
    ratingCount: 720,
    soldCount: 5200,
    categoryName: "Vegetables Shopping",
    categorySlug: "vegetables-shopping",
    variantId: "var-combo-biryani",
    variantName: "Serves 4",
    unit: "pack",
    mrp: 240,
    price: 179,
    discountPercentage: 25,
    availableStock: 120,
  },
  {
    id: "prod-combo-aviyal",
    name: "Traditional Aviyal 7-Veggie Cut Mix",
    tamilName: "அவியல் காய்கறி கிட்",
    slug: "combo-aviyal",
    emoji: "soup",
    imageUrl: "/images/products/combo-kit-aviyal.jpg",
    shortDescription: "Drumstick, plantain, yam, beans, carrot, pumpkin & kovakai.",
    isOrganic: false,
    isBestSeller: true,
    isFeatured: true,
    isFreshToday: true,
    isCutVegetable: true,
    rating: 4.9,
    ratingCount: 580,
    soldCount: 4300,
    categoryName: "Vegetables Shopping",
    categorySlug: "vegetables-shopping",
    variantId: "var-combo-aviyal",
    variantName: "Serves 4",
    unit: "pack",
    mrp: 170,
    price: 125,
    discountPercentage: 26,
    availableStock: 110,
  },
  {
    id: "prod-combo-bisibele",
    name: "Bisi Bele Bath Kit (With / Without Onion)",
    tamilName: "பிசிபேள பாத் கிட்",
    slug: "combo-bisibele",
    emoji: "rice",
    imageUrl: "/images/products/combo-kit-bisibele.jpg",
    shortDescription: "Cut sambar veggies + stone-ground authentic spice blend.",
    isOrganic: false,
    isBestSeller: true,
    isFeatured: true,
    isFreshToday: true,
    isCutVegetable: true,
    rating: 4.8,
    ratingCount: 460,
    soldCount: 3400,
    categoryName: "Vegetables Shopping",
    categorySlug: "vegetables-shopping",
    variantId: "var-combo-bisibele",
    variantName: "Serves 4",
    unit: "pack",
    mrp: 190,
    price: 139,
    discountPercentage: 26,
    availableStock: 105,
  },
];

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
      const liveList = getLiveProductsList();
      const updatedItems = items.map((item) => {
        const live = liveList.find(
          (l) => l.id === item.id || l.slug === item.slug || l.name.toLowerCase() === item.name.toLowerCase()
        );
        if (live) {
          return {
            ...item,
            name: live.name,
            tamilName: live.tamilName ?? item.tamilName,
            price: Number(live.price),
            mrp: Number(live.mrp),
            discountPercentage: live.discountPercentage ?? item.discountPercentage,
            availableStock: Number(live.availableStock),
          };
        }
        return item;
      });
      return { items: updatedItems, total: Number(total) };
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
        emoji: p.emoji || "🥬",
        imageUrl: live?.imageUrl || p.imageUrl || (p.images && p.images[0]) || null,
        shortDescription: p.shortDescription ?? null,
        isOrganic: Boolean(live?.isOrganic ?? p.isOrganic),
        isBestSeller: Boolean(live?.isBestSeller ?? p.isBestSeller),
        isFeatured: Boolean(live?.isFeatured ?? p.isFeatured),
        isFreshToday: true,
        isCutVegetable: p.categoryName === "Vegetables Shopping",
        rating: 4.8,
        ratingCount: 350,
        soldCount: 2500,
        categoryName: p.categoryName || "Vegetables Shopping",
        categorySlug: (p.categoryName || "").toLowerCase().includes("salad") ? "salad" : "vegetables-shopping",
        variantId: `var-${p.id}`,
        variantName: p.weight || "250 g",
        unit: "g",
        mrp,
        price,
        discountPercentage: Math.round(((mrp - price) / (mrp || 1)) * 100) || 20,
        availableStock: stock,
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

      const finalName = liveMatch ? liveMatch.name : row.product.name;
      const finalTamilName = liveMatch?.tamilName ?? row.product.tamilName;
      const finalPrice = liveMatch ? Number(liveMatch.price) : undefined;
      const finalMrp = liveMatch ? Number(liveMatch.mrp) : undefined;
      const finalStock = liveMatch ? Number(liveMatch.availableStock) : undefined;
      const finalImage = liveMatch?.imageUrl || (images.length > 0 ? images[0].imageUrl : undefined);

      const formattedVariants = variants.map((v, idx) => {
        const isFirst = idx === 0 || v.isDefault;
        const sellingPrice = isFirst && finalPrice !== undefined ? finalPrice : toNumber(v.sellingPrice);
        const mrp = isFirst && finalMrp !== undefined ? finalMrp : toNumber(v.mrp);
        const stock = isFirst && finalStock !== undefined ? finalStock : (v.availableStock ?? 0);
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
        ? (finalImage ? [{ ...images[0], imageUrl: finalImage }, ...images.slice(1)] : images)
        : (finalImage ? [{ id: "img-live-1", productId: row.product.id, imageUrl: finalImage, thumbnailUrl: null, displayOrder: 0, isPrimary: true, createdAt: new Date() }] : []);

      return {
        ...row.product,
        name: finalName,
        tamilName: finalTamilName,
        emoji: liveMatch?.emoji || row.product.emoji,
        shortDescription: liveMatch?.shortDescription || row.product.shortDescription,
        isOrganic: liveMatch?.isOrganic !== undefined ? Boolean(liveMatch.isOrganic) : row.product.isOrganic,
        isBestSeller: liveMatch?.isBestSeller !== undefined ? Boolean(liveMatch.isBestSeller) : row.product.isBestSeller,
        isFeatured: liveMatch?.isFeatured !== undefined ? Boolean(liveMatch.isFeatured) : row.product.isFeatured,
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
      emoji: liveMatch.emoji || "🥬",
      shortDescription: liveMatch.shortDescription || "",
      categoryName: liveMatch.categoryName || "Vegetables Shopping",
      categorySlug: "vegetables-shopping",
      variantId: `var-${liveMatch.id}`,
      variantName: "500 g",
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
    return await db
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
  } catch (err) {
    console.warn("searchSuggestions db error:", err);
    return [];
  }
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
