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
  imageUrl?: string | null;
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
    if (query.category === "vegetables-shopping") {
      filters.push(
        or(
          eq(categories.slug, "vegetables-shopping"),
          eq(categories.slug, "fresh-vegetables"),
          eq(categories.slug, "cut-vegetables")
        )!
      );
    } else if (query.category === "salad" || query.category === "salads") {
      filters.push(or(eq(categories.slug, "salad"), eq(categories.slug, "salads"))!);
    } else if (query.category === "recipe-combo-kits" || query.category === "ready-to-cook") {
      filters.push(or(eq(categories.slug, "recipe-combo-kits"), eq(categories.slug, "ready-to-cook"))!);
    } else if (query.category === "fruits-cutting-combo" || query.category === "fresh-fruits") {
      filters.push(or(eq(categories.slug, "fruits-cutting-combo"), eq(categories.slug, "fresh-fruits"))!);
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
  {
    "id": "978cd19e-8398-43ef-bf7c-867c0b116a25",
    "name": "Cauliflower Florets",
    "tamilName": "காலிஃபிளவர் நறுக்கியது",
    "slug": "cut-cauliflower",
    "emoji": "broccoli",
    "shortDescription": "Washed bite-sized florets, completely clean and ready to cook.",
    "isOrganic": false,
    "isBestSeller": true,
    "isFeatured": true,
    "isFreshToday": true,
    "isCutVegetable": true,
    "rating": 4.8,
    "ratingCount": 300,
    "soldCount": 2000,
    "categoryName": "Cut Vegetables",
    "categorySlug": "cut-vegetables",
    "variantId": "7af3cd96-f729-40fd-8077-a565b831a69f",
    "variantName": "300 g",
    "unit": "g",
    "mrp": 60,
    "price": 42,
    "discountPercentage": 30,
    "availableStock": 150,
    "imageUrl": "/images/products/cut-cauliflower.jpg"
  },
  {
    "id": "ce4b56be-1576-43fe-b439-1c9df8b9e2f0",
    "name": "Cut Beans (Chopped)",
    "tamilName": "நறுக்கிய பீன்ஸ்",
    "slug": "cut-beans-chopped",
    "emoji": "vegetables",
    "shortDescription": "Tender beans precision chopped, ready for poriyal or stir fry.",
    "isOrganic": false,
    "isBestSeller": true,
    "isFeatured": true,
    "isFreshToday": true,
    "isCutVegetable": true,
    "rating": 4.8,
    "ratingCount": 315,
    "soldCount": 2080,
    "categoryName": "Cut Vegetables",
    "categorySlug": "cut-vegetables",
    "variantId": "a609f800-a778-48d9-a20c-ce1dfc2c1e90",
    "variantName": "250 g",
    "unit": "g",
    "mrp": 45,
    "price": 35,
    "discountPercentage": 22,
    "availableStock": 180,
    "imageUrl": "/images/products/cut-beans.jpg"
  },
  {
    "id": "8b6cb8de-6e4c-47c8-ba58-4a9fa25d2d46",
    "name": "Cut Beetroot (Cubed)",
    "tamilName": "நறுக்கிய பீட்ரூட்",
    "slug": "cut-beetroot",
    "emoji": "beetroot",
    "shortDescription": "Peeled and cleanly cubed beetroot, zero mess preparation.",
    "isOrganic": false,
    "isBestSeller": false,
    "isFeatured": true,
    "isFreshToday": true,
    "isCutVegetable": true,
    "rating": 4.8,
    "ratingCount": 330,
    "soldCount": 2160,
    "categoryName": "Cut Vegetables",
    "categorySlug": "cut-vegetables",
    "variantId": "025dc021-35b3-4376-87c9-4f010323f690",
    "variantName": "250 g",
    "unit": "g",
    "mrp": 42,
    "price": 32,
    "discountPercentage": 24,
    "availableStock": 140,
    "imageUrl": "/images/products/cut-beetroot.jpg"
  },
  {
    "id": "4d075c8d-1a21-4988-81e2-f8490d40d6fa",
    "name": "Cut Carrot (Diced)",
    "tamilName": "நறுக்கிய கேரட்",
    "slug": "cut-carrot",
    "emoji": "carrot",
    "shortDescription": "Sweet carrots evenly diced for quick daily cooking.",
    "isOrganic": false,
    "isBestSeller": true,
    "isFeatured": true,
    "isFreshToday": true,
    "isCutVegetable": true,
    "rating": 4.8,
    "ratingCount": 345,
    "soldCount": 2240,
    "categoryName": "Cut Vegetables",
    "categorySlug": "cut-vegetables",
    "variantId": "66e8c782-3e98-4d1a-97b0-b503f7302579",
    "variantName": "250 g",
    "unit": "g",
    "mrp": 40,
    "price": 29,
    "discountPercentage": 28,
    "availableStock": 160,
    "imageUrl": "/images/products/cut-carrot.jpg"
  },
  {
    "id": "36964f1f-5228-4835-8a8b-786ba92149e6",
    "name": "Cut Sambar Veggie Mix",
    "tamilName": "சாம்பார் நறுக்கிய காய்கறி கலவை",
    "slug": "sambar-cut-mix",
    "emoji": "soup",
    "shortDescription": "Drumstick, carrot, pumpkin, shallots & beans cut for sambar.",
    "isOrganic": false,
    "isBestSeller": true,
    "isFeatured": true,
    "isFreshToday": true,
    "isCutVegetable": true,
    "rating": 4.8,
    "ratingCount": 360,
    "soldCount": 2320,
    "categoryName": "Cut Vegetables",
    "categorySlug": "cut-vegetables",
    "variantId": "8e3b43a2-6d0b-435a-8235-6be6fb47c200",
    "variantName": "500 g",
    "unit": "g",
    "mrp": 65,
    "price": 49,
    "discountPercentage": 25,
    "availableStock": 190,
    "imageUrl": "/images/products/sambar-cut-mix.jpg"
  },
  {
    "id": "d4f081a7-9d36-4024-9447-7212c765c8e4",
    "name": "Fresh Grated Coconut",
    "tamilName": "தேங்காய் துருவல்",
    "slug": "grated-coconut",
    "emoji": "coconut",
    "shortDescription": "Fine fresh coconut shavings for chutneys, gravies & poriyal.",
    "isOrganic": false,
    "isBestSeller": true,
    "isFeatured": false,
    "isFreshToday": true,
    "isCutVegetable": true,
    "rating": 4.8,
    "ratingCount": 375,
    "soldCount": 2400,
    "categoryName": "Cut Vegetables",
    "categorySlug": "cut-vegetables",
    "variantId": "c7b35b07-feb1-4787-8c8c-280e64e06244",
    "variantName": "200 g",
    "unit": "g",
    "mrp": 55,
    "price": 42,
    "discountPercentage": 24,
    "availableStock": 220,
    "imageUrl": "/images/products/grated-coconut.jpg"
  },
  {
    "id": "67dd2685-e938-4c89-a1f5-571d4aeb78a7",
    "name": "Lady's Finger (Ring Cut)",
    "tamilName": "வெண்டைக்காய் (நறுக்கியது)",
    "slug": "cut-lady-finger",
    "emoji": "capsicum",
    "shortDescription": "Crisp okra sliced into clean rings for fry or sambar.",
    "isOrganic": false,
    "isBestSeller": true,
    "isFeatured": false,
    "isFreshToday": true,
    "isCutVegetable": true,
    "rating": 4.8,
    "ratingCount": 390,
    "soldCount": 2480,
    "categoryName": "Cut Vegetables",
    "categorySlug": "cut-vegetables",
    "variantId": "b51571b2-16eb-4d5d-9762-b2d22cb63c8e",
    "variantName": "250 g",
    "unit": "g",
    "mrp": 40,
    "price": 28,
    "discountPercentage": 30,
    "availableStock": 120,
    "imageUrl": "/images/products/cut-lady-finger.jpg"
  },
  {
    "id": "f02868bb-c2c9-4665-85ce-c3d7b232c4c5",
    "name": "Peeled Shallots & Garlic Mix",
    "tamilName": "உரித்த சின்ன வெங்காயம் பூண்டு",
    "slug": "cut-peeled-onion-garlic",
    "emoji": "onion",
    "shortDescription": "Fresh peeled small onions and garlic cloves, ready to use.",
    "isOrganic": false,
    "isBestSeller": true,
    "isFeatured": true,
    "isFreshToday": true,
    "isCutVegetable": true,
    "rating": 4.8,
    "ratingCount": 405,
    "soldCount": 2560,
    "categoryName": "Cut Vegetables",
    "categorySlug": "cut-vegetables",
    "variantId": "c1c83663-412f-41eb-90fa-28856bd36a61",
    "variantName": "200 g",
    "unit": "g",
    "mrp": 75,
    "price": 55,
    "discountPercentage": 27,
    "availableStock": 200,
    "imageUrl": "/images/products/peeled-onion-garlic.jpg"
  },
  {
    "id": "210a328b-d897-441e-8a0c-35cd7aaaab30",
    "name": "Tomato Slices",
    "tamilName": "தக்காளி",
    "slug": "tomato-slices",
    "emoji": "tomato",
    "shortDescription": "Juicy, firm red tomatoes ideal for daily cooking.",
    "isOrganic": false,
    "isBestSeller": true,
    "isFeatured": true,
    "isFreshToday": true,
    "isCutVegetable": false,
    "rating": 4.8,
    "ratingCount": 420,
    "soldCount": 2640,
    "categoryName": "Cut Vegetables",
    "categorySlug": "cut-vegetables",
    "variantId": "f2ccf073-3507-4a00-b21c-7bad11e9875e",
    "variantName": "500 g",
    "unit": "g",
    "mrp": 40,
    "price": 29,
    "discountPercentage": 28,
    "availableStock": 180,
    "imageUrl": "/images/products/tomato-slices.jpg"
  },
  {
    "id": "e25f926d-ffa3-4ce8-abfb-9808d2a1aecb",
    "name": "Onion Slices",
    "tamilName": "வெங்காயம்",
    "slug": "onion-slices",
    "emoji": "onion",
    "shortDescription": "Crisp, tight-layered onions with great shelf life.",
    "isOrganic": false,
    "isBestSeller": true,
    "isFeatured": true,
    "isFreshToday": true,
    "isCutVegetable": false,
    "rating": 4.8,
    "ratingCount": 435,
    "soldCount": 2720,
    "categoryName": "Fresh Vegetables",
    "categorySlug": "fresh-vegetables",
    "variantId": "bf81deab-d1f0-4d3a-9f07-00ae72de21da",
    "variantName": "1 kg",
    "unit": "kg",
    "mrp": 52,
    "price": 38,
    "discountPercentage": 27,
    "availableStock": 260,
    "imageUrl": "/images/products/onion-slices.jpg"
  },
  {
    "id": "06903d13-fee5-4c43-954d-198ae7d4030d",
    "name": "Deluxe Family Fruit Cutting Combo Box",
    "tamilName": "பழ காம்போ பாக்ஸ்",
    "slug": "fruit-combo-deluxe",
    "emoji": "fruit",
    "shortDescription": "4 assorted pre-cut fruit cups: Watermelon, Papaya, Pineapple & Pomegranate.",
    "isOrganic": false,
    "isBestSeller": true,
    "isFeatured": true,
    "isFreshToday": true,
    "isCutVegetable": false,
    "rating": 4.8,
    "ratingCount": 450,
    "soldCount": 2800,
    "categoryName": "Fruits Cutting & Combo Pack",
    "categorySlug": "fruits-cutting-combo",
    "variantId": "81a569a2-bca9-48d8-ae75-3d59d9afc60b",
    "variantName": "1 kg (4 Packs)",
    "unit": "pack",
    "mrp": 260,
    "price": 199,
    "discountPercentage": 23,
    "availableStock": 100,
    "imageUrl": "/images/products/fruit-combo-deluxe.jpg"
  },
  {
    "id": "876c93f1-3899-421c-85b3-bb00ac5923a7",
    "name": "Dragon Fruit Cubes",
    "tamilName": "டிராகன் பழம் (நறுக்கியது)",
    "slug": "fruit-dragon",
    "emoji": "fruit",
    "shortDescription": "Fresh diced dragon fruit, packed with antioxidants.",
    "isOrganic": false,
    "isBestSeller": false,
    "isFeatured": true,
    "isFreshToday": true,
    "isCutVegetable": false,
    "rating": 4.8,
    "ratingCount": 465,
    "soldCount": 2880,
    "categoryName": "Fruits Cutting & Combo Pack",
    "categorySlug": "fruits-cutting-combo",
    "variantId": "be593386-764f-4524-a053-57400ce264b4",
    "variantName": "250 g",
    "unit": "g",
    "mrp": 120,
    "price": 89,
    "discountPercentage": 26,
    "availableStock": 90,
    "imageUrl": "/images/products/fruit-cut-dragon.jpg"
  },
  {
    "id": "ca8f5bef-a6cc-4d9e-a4cc-05a6acc4518d",
    "name": "Papaya Cubes (Ready-to-Eat)",
    "tamilName": "பப்பாளி (நறுக்கியது)",
    "slug": "papaya-cubes-ready-to-eat",
    "emoji": "papaya",
    "shortDescription": "Cleanly sliced sweet Red Lady papaya cubes.",
    "isOrganic": false,
    "isBestSeller": true,
    "isFeatured": true,
    "isFreshToday": true,
    "isCutVegetable": false,
    "rating": 4.8,
    "ratingCount": 480,
    "soldCount": 2960,
    "categoryName": "Fruits Cutting & Combo Pack",
    "categorySlug": "fruits-cutting-combo",
    "variantId": "367d8ce6-df3e-4ee3-bc3d-cb35f1ab4eb8",
    "variantName": "300 g",
    "unit": "g",
    "mrp": 65,
    "price": 48,
    "discountPercentage": 26,
    "availableStock": 140,
    "imageUrl": "/images/products/papaya-cubes-ready-to-eat.jpg"
  },
  {
    "id": "c295e6c5-c3bc-4878-be43-dd0580ea5977",
    "name": "Pineapple Slices / Diced",
    "tamilName": "அன்னாசிப்பழம் (நறுக்கியது)",
    "slug": "pineapple-slices-diced",
    "emoji": "pineapple",
    "shortDescription": "Peeled and de-eyed sweet pineapple slices.",
    "isOrganic": false,
    "isBestSeller": true,
    "isFeatured": true,
    "isFreshToday": true,
    "isCutVegetable": false,
    "rating": 4.8,
    "ratingCount": 495,
    "soldCount": 3040,
    "categoryName": "Fruits Cutting & Combo Pack",
    "categorySlug": "fruits-cutting-combo",
    "variantId": "b6cf7164-2a72-493f-ad2c-b1778666c7e4",
    "variantName": "300 g",
    "unit": "g",
    "mrp": 80,
    "price": 59,
    "discountPercentage": 26,
    "availableStock": 120,
    "imageUrl": "/images/products/pineapple-slices-diced.webp"
  },
  {
    "id": "fefe1350-cb2f-4d8a-8a0c-4ea392fa4a09",
    "name": "Pomegranate Arils (Seeded)",
    "tamilName": "மாதுளை விதைகள்",
    "slug": "pomegranate-arils-seeded",
    "emoji": "apple",
    "shortDescription": "Ruby red sweet pomegranate arils, ready to eat.",
    "isOrganic": false,
    "isBestSeller": true,
    "isFeatured": true,
    "isFreshToday": true,
    "isCutVegetable": false,
    "rating": 4.8,
    "ratingCount": 510,
    "soldCount": 3120,
    "categoryName": "Fruits Cutting & Combo Pack",
    "categorySlug": "fruits-cutting-combo",
    "variantId": "137881f7-cb25-4df8-961c-fc6da96f69a0",
    "variantName": "200 g",
    "unit": "g",
    "mrp": 110,
    "price": 79,
    "discountPercentage": 28,
    "availableStock": 160,
    "imageUrl": "/images/products/pomegranate-arils-seeded.jpg"
  },
  {
    "id": "b919d680-4f10-485d-9716-4829228444b5",
    "name": "Seedless Watermelon Cubes",
    "tamilName": "தர்பூசணி (நறுக்கியது)",
    "slug": "seedless-watermelon-cubes",
    "emoji": "watermelon",
    "shortDescription": "Sweet, cold, ready-to-eat watermelon cubes, deseeded.",
    "isOrganic": false,
    "isBestSeller": true,
    "isFeatured": true,
    "isFreshToday": true,
    "isCutVegetable": false,
    "rating": 4.8,
    "ratingCount": 525,
    "soldCount": 3200,
    "categoryName": "Fruits Cutting & Combo Pack",
    "categorySlug": "fruits-cutting-combo",
    "variantId": "216745d8-9373-40a5-9daf-a337694a89c6",
    "variantName": "400 g",
    "unit": "g",
    "mrp": 60,
    "price": 42,
    "discountPercentage": 30,
    "availableStock": 180,
    "imageUrl": "/images/products/seedless-watermelon-cubes.jpg"
  },
  {
    "id": "3b478555-9b16-4f14-a92b-364d4858e8cc",
    "name": "Bisi Bele Bath Kit",
    "tamilName": "பிசிபேள பாத் கிட்",
    "slug": "bisi-bele-bath-kit",
    "emoji": "rice",
    "shortDescription": "Cut sambar veggies + stone-ground authentic spice blend.",
    "isOrganic": false,
    "isBestSeller": true,
    "isFeatured": true,
    "isFreshToday": true,
    "isCutVegetable": true,
    "rating": 4.8,
    "ratingCount": 540,
    "soldCount": 3280,
    "categoryName": "Recipe Combo Kits",
    "categorySlug": "recipe-combo-kits",
    "variantId": "2f996fc0-6d23-4592-8c95-68d1728164df",
    "variantName": "Serves 4",
    "unit": "pack",
    "mrp": 190,
    "price": 139,
    "discountPercentage": 27,
    "availableStock": 105,
    "imageUrl": "/images/products/bisi-bele-bath-kit.png"
  },
  {
    "id": "f910a2c9-2d37-435e-a729-2d0da1c19b4c",
    "name": "Nonveg - Biryani Special Kit",
    "tamilName": "பிரியாணி கிட்",
    "slug": "nonveg-biryani-special-kit",
    "emoji": "🥬",
    "shortDescription": null,
    "isOrganic": false,
    "isBestSeller": false,
    "isFeatured": true,
    "isFreshToday": true,
    "isCutVegetable": true,
    "rating": 4.8,
    "ratingCount": 555,
    "soldCount": 3360,
    "categoryName": "Recipe Combo Kits",
    "categorySlug": "recipe-combo-kits",
    "variantId": "4254d53f-fae6-4bcb-8686-2521325b0d25",
    "variantName": "500 g",
    "unit": "g",
    "mrp": 45,
    "price": 150,
    "discountPercentage": 0,
    "availableStock": 100,
    "imageUrl": "/images/products/nonveg-biryani-special-kit.png"
  },
  {
    "id": "4ca45f80-fa02-4eff-9c3b-d070c1182325",
    "name": "Pulav Special Veggie Combo Kit",
    "tamilName": "புலாவ் காய்கறி கிட்",
    "slug": "pulav-special-veggie-combo-kit",
    "emoji": "rice",
    "shortDescription": "Carrot, beans, green peas, potato & whole spices pouch.",
    "isOrganic": false,
    "isBestSeller": true,
    "isFeatured": true,
    "isFreshToday": true,
    "isCutVegetable": true,
    "rating": 4.8,
    "ratingCount": 570,
    "soldCount": 3440,
    "categoryName": "Recipe Combo Kits",
    "categorySlug": "recipe-combo-kits",
    "variantId": "4627cd7c-7cd7-4e56-a976-395e1a03693b",
    "variantName": "Serves 4",
    "unit": "pack",
    "mrp": 180,
    "price": 129,
    "discountPercentage": 28,
    "availableStock": 95,
    "imageUrl": "/images/products/pulav-special-veggie-combo-kit.png"
  },
  {
    "id": "b0a06688-d930-4fdf-9aab-98cc89fc806f",
    "name": "Traditional Aviyal 7-Veggie Cut Mix",
    "tamilName": "அவியல் காய்கறி கிட்",
    "slug": "traditional-aviyal-7-veggie-cut-mix",
    "emoji": "soup",
    "shortDescription": "Drumstick, plantain, yam, beans, carrot, pumpkin & kovakai.",
    "isOrganic": false,
    "isBestSeller": true,
    "isFeatured": true,
    "isFreshToday": true,
    "isCutVegetable": true,
    "rating": 4.8,
    "ratingCount": 585,
    "soldCount": 3520,
    "categoryName": "Recipe Combo Kits",
    "categorySlug": "recipe-combo-kits",
    "variantId": "e07c2b17-802e-4db6-966f-67ce6b382d47",
    "variantName": "Serves 4",
    "unit": "pack",
    "mrp": 170,
    "price": 125,
    "discountPercentage": 26,
    "availableStock": 110,
    "imageUrl": "/images/products/traditional-aviyal-7-veggie-cut-mix.png"
  },
  {
    "id": "4a088110-5ba9-4ce2-915d-466ef4a46576",
    "name": "Vegetables Biryani Special Kit",
    "tamilName": "காய்கறி பிரியாணி கிட்",
    "slug": "vegetables-biryani-special-kit",
    "emoji": "rice",
    "shortDescription": "Cut veggies, cauliflower florets, mint & aromatic biryani spices.",
    "isOrganic": false,
    "isBestSeller": true,
    "isFeatured": true,
    "isFreshToday": true,
    "isCutVegetable": true,
    "rating": 4.8,
    "ratingCount": 600,
    "soldCount": 3600,
    "categoryName": "Recipe Combo Kits",
    "categorySlug": "recipe-combo-kits",
    "variantId": "a9d99e65-f0f0-48ea-b09d-3dd867b58b10",
    "variantName": "Serves 4",
    "unit": "pack",
    "mrp": 240,
    "price": 179,
    "discountPercentage": 25,
    "availableStock": 120,
    "imageUrl": "/images/products/vegetables-biryani-special-kit.png"
  },
  {
    "id": "c467ec89-2997-466b-be69-1fc97dbd4c88",
    "name": "Citrus Glow Fruit Bowl",
    "tamilName": "சிட்ரஸ் பழ சாலட்",
    "slug": "citrus-glow-fruit-bowl",
    "emoji": "orange",
    "shortDescription": "Sweet orange segments, sweet lime, and fresh pomegranate arils.",
    "isOrganic": false,
    "isBestSeller": true,
    "isFeatured": true,
    "isFreshToday": true,
    "isCutVegetable": false,
    "rating": 4.8,
    "ratingCount": 615,
    "soldCount": 3680,
    "categoryName": "Salad",
    "categorySlug": "salad",
    "variantId": "aa9aa41a-4909-4b6d-bd23-88ab38d0e76b",
    "variantName": "250 g",
    "unit": "g",
    "mrp": 150,
    "price": 109,
    "discountPercentage": 27,
    "availableStock": 110,
    "imageUrl": "/images/products/fruit-salad-citrus.jpg"
  },
  {
    "id": "9d081c2d-128a-434b-8baf-169d5c04bb93",
    "name": "Fruit Salad (Custom Bowl)",
    "tamilName": "பழ சாலட்",
    "slug": "fruit-salad-bowl",
    "emoji": "fruit",
    "shortDescription": "Custom bowl of fresh seasonal fruits (Raspberry, Blueberry, Strawberry, Watermelon, Apple, etc.).",
    "isOrganic": false,
    "isBestSeller": true,
    "isFeatured": true,
    "isFreshToday": true,
    "isCutVegetable": false,
    "rating": 4.8,
    "ratingCount": 630,
    "soldCount": 3760,
    "categoryName": "Salad",
    "categorySlug": "salad",
    "variantId": "0a650837-c2af-4a32-a421-2d45e4093890",
    "variantName": "250 g",
    "unit": "g",
    "mrp": 140,
    "price": 99,
    "discountPercentage": 29,
    "availableStock": 130,
    "imageUrl": "/images/products/fruit-salad-exotic.jpg"
  },
  {
    "id": "8c26753d-d4b1-4f38-bba9-33cdde770c31",
    "name": "Rainbow Crunch Veg Salad",
    "tamilName": "ரெயின்போ சாலட்",
    "slug": "rainbow-crunch-veg-salad",
    "emoji": "salad",
    "shortDescription": "Purple cabbage, carrot, cucumber & toasted seeds with dressing.",
    "isOrganic": false,
    "isBestSeller": false,
    "isFeatured": true,
    "isFreshToday": true,
    "isCutVegetable": true,
    "rating": 4.8,
    "ratingCount": 645,
    "soldCount": 3840,
    "categoryName": "Salad",
    "categorySlug": "salad",
    "variantId": "5c3bc774-2518-48c9-85d1-10d3362663ee",
    "variantName": "250 g",
    "unit": "g",
    "mrp": 130,
    "price": 89,
    "discountPercentage": 32,
    "availableStock": 100,
    "imageUrl": "/images/products/rainbow-crunch-veg-salad.jpg"
  },
  {
    "id": "b19b2230-8385-443e-a5c8-31d97b6179e7",
    "name": "Sprouts Salad (Custom Bowl)",
    "tamilName": "முளைகட்டிய பயறு சாலட்",
    "slug": "sprouts-salad-custom-bowl",
    "emoji": "sprout",
    "shortDescription": "Protein sprouts salad with Green Moong, Channa, Soya Beans, Cucumber & Groundnut.",
    "isOrganic": false,
    "isBestSeller": true,
    "isFeatured": true,
    "isFreshToday": true,
    "isCutVegetable": true,
    "rating": 4.8,
    "ratingCount": 660,
    "soldCount": 3920,
    "categoryName": "Salad",
    "categorySlug": "salad",
    "variantId": "f3abeddc-bb61-49ea-bf6a-9f6d76ec684f",
    "variantName": "250 g",
    "unit": "g",
    "mrp": 110,
    "price": 79,
    "discountPercentage": 28,
    "availableStock": 140,
    "imageUrl": "/images/products/sprouts-salad-custom-bowl.jpg"
  },
  {
    "id": "77133ce7-b04f-4521-8b08-a8ebb60a0115",
    "name": "Sweet Corn & Bell Pepper Toss",
    "tamilName": "சோளம் & குடைமிளகாய் சாலட்",
    "slug": "sweet-corn-bell-pepper-toss",
    "emoji": "salad",
    "shortDescription": "Tender sweet corn, tri-color bell peppers, and chat herb dressing.",
    "isOrganic": false,
    "isBestSeller": true,
    "isFeatured": true,
    "isFreshToday": true,
    "isCutVegetable": true,
    "rating": 4.8,
    "ratingCount": 675,
    "soldCount": 4000,
    "categoryName": "Salad",
    "categorySlug": "salad",
    "variantId": "fea28633-91d1-47ac-8e30-ed927abcd1ef",
    "variantName": "250 g",
    "unit": "g",
    "mrp": 120,
    "price": 85,
    "discountPercentage": 29,
    "availableStock": 120,
    "imageUrl": "/images/products/sweet-corn-bell-pepper-toss.jpg"
  },
  {
    "id": "892f9a1e-520f-4e7a-b222-a657f0a627de",
    "name": "Vegetable Salad (Custom Bowl)",
    "tamilName": "காய்கறி சாலட்",
    "slug": "vegetable-salad-custom-bowl",
    "emoji": "salad",
    "shortDescription": "Crisp vegetable salad with Cucumber, Cabbage, Corn, Carrot, Beetroot & Broccoli.",
    "isOrganic": false,
    "isBestSeller": true,
    "isFeatured": true,
    "isFreshToday": true,
    "isCutVegetable": true,
    "rating": 4.8,
    "ratingCount": 690,
    "soldCount": 4080,
    "categoryName": "Salad",
    "categorySlug": "salad",
    "variantId": "f4604ba6-05bb-40a4-9a68-d421afd025cb",
    "variantName": "250 g",
    "unit": "g",
    "mrp": 130,
    "price": 89,
    "discountPercentage": 32,
    "availableStock": 110,
    "imageUrl": "/images/products/vegetable-salad-custom-bowl.jpg"
  }
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

      const finalName = row.product.name;
      const finalTamilName = row.product.tamilName || liveMatch?.tamilName;
      const finalEmoji = row.product.emoji || liveMatch?.emoji || "🥬";
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
