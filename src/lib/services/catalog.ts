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

  if (query.category) filters.push(eq(categories.slug, query.category));
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

const FALLBACK_CATEGORIES = [
  { id: "cat-1", name: "Fresh Vegetables", slug: "fresh-vegetables", tamilName: null, icon: "vegetables", accent: "#15803d", description: "Handpicked daily from Koyambedu and nearby farms.", sortOrder: 1 },
  { id: "cat-2", name: "Fresh Fruits", slug: "fresh-fruits", tamilName: null, icon: "fruits", accent: "#15803d", description: "Naturally ripened seasonal fruits, sweetness guaranteed.", sortOrder: 2 },
  { id: "cat-3", name: "Cut Vegetables", slug: "cut-vegetables", tamilName: null, icon: "cut", accent: "#15803d", description: "Washed, peeled and chopped — cooking made effortless.", sortOrder: 3 },
  { id: "cat-4", name: "Leafy Vegetables", slug: "leafy-vegetables", tamilName: null, icon: "leafy", accent: "#15803d", description: "Farm-fresh keerai bunches sorted every morning.", sortOrder: 4 },
  { id: "cat-5", name: "Organic", slug: "organic", tamilName: null, icon: "organic", accent: "#15803d", description: "Certified organic, zero pesticide residue produce.", sortOrder: 5 },
  { id: "cat-6", name: "Exotic Vegetables", slug: "exotic-vegetables", tamilName: null, icon: "exotic", accent: "#15803d", description: "Continental favourites for your gourmet kitchen.", sortOrder: 6 },
  { id: "cat-7", name: "Salads", slug: "salads", tamilName: null, icon: "salad", accent: "#15803d", description: "Ready-to-toss salad bowls and healthy mixes.", sortOrder: 7 },
  { id: "cat-8", name: "Ready To Cook", slug: "ready-to-cook", tamilName: null, icon: "ready", accent: "#15803d", description: "Recipe kits with pre-cut veggies and spice packs.", sortOrder: 8 },
];

export const FALLBACK_PRODUCTS: (ProductCard & { imageUrl?: string })[] = [
  /* ---------------- Cutted Vegetables (Ready to Cook) ---------------- */
  {
    id: "prod-cut-beans", name: "Cut Beans (Chopped)", tamilName: "நறுக்கிய பீன்ஸ்", slug: "cut-beans", emoji: "vegetables",
    imageUrl: "https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?auto=format&fit=crop&w=600&q=80",
    shortDescription: "Tender green beans finely chopped, 100% ready to cook.", isOrganic: false, isBestSeller: true, isFeatured: true,
    isFreshToday: true, isCutVegetable: true, rating: 4.8, ratingCount: 420, soldCount: 3100,
    categoryName: "Cut Vegetables", categorySlug: "cut-vegetables", variantId: "var-cut-beans", variantName: "250 g", unit: "g", mrp: 45, price: 34, discountPercentage: 24, availableStock: 180
  },
  {
    id: "prod-cut-carrot", name: "Cut Carrot (Diced / Julienne)", tamilName: "நறுக்கிய கேரட்", slug: "cut-carrot", emoji: "carrot",
    imageUrl: "https://images.unsplash.com/photo-1598170845058-12ef4a457939?auto=format&fit=crop&w=600&q=80",
    shortDescription: "Ooty sweet carrots diced for poriyal or biryani.", isOrganic: false, isBestSeller: true, isFeatured: true,
    isFreshToday: true, isCutVegetable: true, rating: 4.7, ratingCount: 380, soldCount: 2900,
    categoryName: "Cut Vegetables", categorySlug: "cut-vegetables", variantId: "var-cut-carrot", variantName: "250 g", unit: "g", mrp: 40, price: 29, discountPercentage: 28, availableStock: 160
  },
  {
    id: "prod-cut-beetroot", name: "Cut Beetroot (Cubed / Shredded)", tamilName: "நறுக்கிய பீட்ரூட்", slug: "cut-beetroot", emoji: "beetroot",
    imageUrl: "https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=600&q=80",
    shortDescription: "Deep red beetroots, peeled and cubed.", isOrganic: false, isBestSeller: false, isFeatured: true,
    isFreshToday: true, isCutVegetable: true, rating: 4.6, ratingCount: 210, soldCount: 1850,
    categoryName: "Cut Vegetables", categorySlug: "cut-vegetables", variantId: "var-cut-beetroot", variantName: "250 g", unit: "g", mrp: 42, price: 32, discountPercentage: 24, availableStock: 140
  },
  {
    id: "prod-cut-lady-finger", name: "Lady's Finger (Ring Cut)", tamilName: "வெண்டைக்காய் (நறுக்கியது)", slug: "cut-lady-finger", emoji: "capsicum",
    imageUrl: "https://images.unsplash.com/photo-1425543103986-22abb7d7e8d2?auto=format&fit=crop&w=600&q=80",
    shortDescription: "Tender okra sliced into crisp rings.", isOrganic: false, isBestSeller: true, isFeatured: false,
    isFreshToday: true, isCutVegetable: true, rating: 4.7, ratingCount: 310, soldCount: 2400,
    categoryName: "Cut Vegetables", categorySlug: "cut-vegetables", variantId: "var-cut-lady-finger", variantName: "250 g", unit: "g", mrp: 40, price: 28, discountPercentage: 30, availableStock: 120
  },
  {
    id: "prod-cut-cluster-beans", name: "Cluster Beans (Kothavaranga Cut)", tamilName: "கொத்தவரங்காய்", slug: "cut-cluster-beans", emoji: "vegetables",
    imageUrl: "https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?auto=format&fit=crop&w=600&q=80",
    shortDescription: "Cleaned and snipped cluster beans for paruppu usili.", isOrganic: false, isBestSeller: false, isFeatured: false,
    isFreshToday: true, isCutVegetable: true, rating: 4.5, ratingCount: 190, soldCount: 1200,
    categoryName: "Cut Vegetables", categorySlug: "cut-vegetables", variantId: "var-cut-cluster-beans", variantName: "250 g", unit: "g", mrp: 38, price: 28, discountPercentage: 26, availableStock: 100
  },
  {
    id: "prod-cut-avarakai", name: "Hyacinth Bean (Avarakai Cut)", tamilName: "அவரைக்காய்", slug: "cut-avarakai", emoji: "vegetables",
    imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
    shortDescription: "Destringed and chopped flat beans.", isOrganic: false, isBestSeller: true, isFeatured: false,
    isFreshToday: true, isCutVegetable: true, rating: 4.6, ratingCount: 280, soldCount: 2100,
    categoryName: "Cut Vegetables", categorySlug: "cut-vegetables", variantId: "var-cut-avarakai", variantName: "250 g", unit: "g", mrp: 45, price: 32, discountPercentage: 28, availableStock: 130
  },
  {
    id: "prod-cut-yam", name: "Elephant Foot Yam (Senai Cubes)", tamilName: "சேனைக்கிழங்கு", slug: "cut-yam", emoji: "potato",
    imageUrl: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80",
    shortDescription: "Peeled and cubed yam ready for fry or roast.", isOrganic: false, isBestSeller: false, isFeatured: false,
    isFreshToday: false, isCutVegetable: true, rating: 4.4, ratingCount: 160, soldCount: 980,
    categoryName: "Cut Vegetables", categorySlug: "cut-vegetables", variantId: "var-cut-yam", variantName: "250 g", unit: "g", mrp: 50, price: 36, discountPercentage: 28, availableStock: 90
  },
  {
    id: "prod-cut-kovakai", name: "Ivy Gourd (Kovakkai Sliced)", tamilName: "கோவக்காய்", slug: "cut-kovakai", emoji: "cucumber",
    imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
    shortDescription: "Thinly sliced kovakkai for spicy fry.", isOrganic: false, isBestSeller: true, isFeatured: false,
    isFreshToday: true, isCutVegetable: true, rating: 4.7, ratingCount: 340, soldCount: 2500,
    categoryName: "Cut Vegetables", categorySlug: "cut-vegetables", variantId: "var-cut-kovakai", variantName: "250 g", unit: "g", mrp: 45, price: 32, discountPercentage: 28, availableStock: 110
  },
  {
    id: "prod-cut-bitter-gourd", name: "Bitter Gourd (Pavakkai Rings)", tamilName: "பாகற்காய்", slug: "cut-bitter-gourd", emoji: "cucumber",
    imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
    shortDescription: "Deseeded ring slices of bitter gourd.", isOrganic: false, isBestSeller: false, isFeatured: false,
    isFreshToday: true, isCutVegetable: true, rating: 4.3, ratingCount: 150, soldCount: 1100,
    categoryName: "Cut Vegetables", categorySlug: "cut-vegetables", variantId: "var-cut-bitter-gourd", variantName: "250 g", unit: "g", mrp: 40, price: 29, discountPercentage: 28, availableStock: 95
  },
  {
    id: "prod-cut-cauliflower", name: "Cauliflower Florets", tamilName: "காலிஃபிளவர் நறுக்கியது", slug: "cut-cauliflower", emoji: "broccoli",
    imageUrl: "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=600&q=80",
    shortDescription: "Ozonated clean florets, 100% insect free.", isOrganic: false, isBestSeller: true, isFeatured: true,
    isFreshToday: true, isCutVegetable: true, rating: 4.8, ratingCount: 490, soldCount: 3800,
    categoryName: "Cut Vegetables", categorySlug: "cut-vegetables", variantId: "var-cut-cauliflower", variantName: "300 g", unit: "g", mrp: 60, price: 42, discountPercentage: 30, availableStock: 150
  },
  {
    id: "prod-cut-peeled-onion-garlic", name: "Peeled Shallots & Garlic Mix", tamilName: "உரித்த சின்ன வெங்காயம் பூண்டு", slug: "cut-peeled-onion-garlic", emoji: "onion",
    imageUrl: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80",
    shortDescription: "Peeled small onion (chinna vengayam) & garlic cloves.", isOrganic: false, isBestSeller: true, isFeatured: true,
    isFreshToday: true, isCutVegetable: true, rating: 4.9, ratingCount: 610, soldCount: 4900,
    categoryName: "Cut Vegetables", categorySlug: "cut-vegetables", variantId: "var-cut-peeled-onion-garlic", variantName: "200 g", unit: "g", mrp: 75, price: 55, discountPercentage: 26, availableStock: 200
  },
  {
    id: "prod-grated-coconut", name: "Fresh Grated Coconut", tamilName: "தேங்காய் துருவல்", slug: "grated-coconut", emoji: "coconut",
    imageUrl: "https://images.unsplash.com/photo-1543362906-acfc16c67564?auto=format&fit=crop&w=600&q=80",
    shortDescription: "Same-day coconut scrapings for chutney & poriyal.", isOrganic: false, isBestSeller: true, isFeatured: true,
    isFreshToday: true, isCutVegetable: true, rating: 4.9, ratingCount: 780, soldCount: 5600,
    categoryName: "Cut Vegetables", categorySlug: "cut-vegetables", variantId: "var-grated-coconut", variantName: "200 g", unit: "g", mrp: 55, price: 42, discountPercentage: 24, availableStock: 220
  },

  /* ---------------- Fresh Fruits ---------------- */
  {
    id: "prod-fruit-papaya", name: "Papaya Cubes (Ready-to-Eat)", tamilName: "பப்பாளி (நறுக்கியது)", slug: "fruit-papaya", emoji: "papaya",
    imageUrl: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=600&q=80",
    shortDescription: "Sweet Red Lady papaya chilled cubes.", isOrganic: false, isBestSeller: true, isFeatured: true,
    isFreshToday: true, isCutVegetable: false, rating: 4.7, ratingCount: 390, soldCount: 2800,
    categoryName: "Fresh Fruits", categorySlug: "fresh-fruits", variantId: "var-fruit-papaya", variantName: "300 g", unit: "g", mrp: 65, price: 48, discountPercentage: 26, availableStock: 140
  },
  {
    id: "prod-fruit-pineapple", name: "Pineapple Slices / Diced", tamilName: "அன்னாசிப்பழம்", slug: "fruit-pineapple", emoji: "pineapple",
    imageUrl: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=600&q=80",
    shortDescription: "Juicy peeled pineapple wedges.", isOrganic: false, isBestSeller: true, isFeatured: true,
    isFreshToday: true, isCutVegetable: false, rating: 4.8, ratingCount: 450, soldCount: 3200,
    categoryName: "Fresh Fruits", categorySlug: "fresh-fruits", variantId: "var-fruit-pineapple", variantName: "300 g", unit: "g", mrp: 80, price: 59, discountPercentage: 26, availableStock: 120
  },
  {
    id: "prod-fruit-watermelon", name: "Seedless Watermelon Cubes", tamilName: "தர்பூசணி", slug: "fruit-watermelon", emoji: "watermelon",
    imageUrl: "https://images.unsplash.com/photo-1589984662646-e7b2e4962f18?auto=format&fit=crop&w=600&q=80",
    shortDescription: "Crisp red chilled watermelon cubes.", isOrganic: false, isBestSeller: true, isFeatured: true,
    isFreshToday: true, isCutVegetable: false, rating: 4.8, ratingCount: 510, soldCount: 4100,
    categoryName: "Fresh Fruits", categorySlug: "fresh-fruits", variantId: "var-fruit-watermelon", variantName: "400 g", unit: "g", mrp: 60, price: 42, discountPercentage: 30, availableStock: 180
  },
  {
    id: "prod-fruit-dragon", name: "Dragon Fruit Cubes", tamilName: "டிராகன் பழம்", slug: "fruit-dragon", emoji: "fruit",
    imageUrl: "https://images.unsplash.com/photo-1527325678964-549216468488?auto=format&fit=crop&w=600&q=80",
    shortDescription: "Fresh pink/white dragon fruit cubes.", isOrganic: false, isBestSeller: false, isFeatured: true,
    isFreshToday: true, isCutVegetable: false, rating: 4.6, ratingCount: 220, soldCount: 1500,
    categoryName: "Fresh Fruits", categorySlug: "fresh-fruits", variantId: "var-fruit-dragon", variantName: "250 g", unit: "g", mrp: 120, price: 89, discountPercentage: 25, availableStock: 90
  },
  {
    id: "prod-fruit-pomegranate", name: "Pomegranate Arils (Seeded)", tamilName: "மாதுளை விதைகள்", slug: "fruit-pomegranate", emoji: "apple",
    imageUrl: "https://images.unsplash.com/photo-1541344999736-83eca272f6fc?auto=format&fit=crop&w=600&q=80",
    shortDescription: "Ruby red Bhagwa pomegranate seeds.", isOrganic: false, isBestSeller: true, isFeatured: true,
    isFreshToday: true, isCutVegetable: false, rating: 4.9, ratingCount: 680, soldCount: 4800,
    categoryName: "Fresh Fruits", categorySlug: "fresh-fruits", variantId: "var-fruit-pomegranate", variantName: "200 g", unit: "g", mrp: 110, price: 79, discountPercentage: 28, availableStock: 160
  },

  /* ---------------- Diet Combos & Salads ---------------- */
  {
    id: "prod-diet-veg-salad", name: "Fresh Vegetables Salad Bowl", tamilName: "காய்கறி சாலட்", slug: "diet-veg-salad", emoji: "salad",
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80",
    shortDescription: "Cucumber, carrot, cherry tomato, bell pepper & olive oil dressing.", isOrganic: false, isBestSeller: true, isFeatured: true,
    isFreshToday: true, isCutVegetable: true, rating: 4.8, ratingCount: 340, soldCount: 2600,
    categoryName: "Salads", categorySlug: "salads", variantId: "var-diet-veg-salad", variantName: "250 g", unit: "g", mrp: 140, price: 99, discountPercentage: 29, availableStock: 110
  },
  {
    id: "prod-diet-sprouts-salad", name: "Protein Sprouts Power Salad", tamilName: "புரதச்சத்து முளைகட்டிய பயறு", slug: "diet-sprouts-salad", emoji: "sprout",
    imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
    shortDescription: "Moong & kala chana sprouts with lemon-mint dressing.", isOrganic: false, isBestSeller: true, isFeatured: true,
    isFreshToday: true, isCutVegetable: true, rating: 4.9, ratingCount: 520, soldCount: 3900,
    categoryName: "Salads", categorySlug: "salads", variantId: "var-diet-sprouts-salad", variantName: "250 g", unit: "g", mrp: 110, price: 79, discountPercentage: 28, availableStock: 140
  },
  {
    id: "prod-diet-fruit-salad", name: "Exotic Fruit Salad Bowl", tamilName: "பழ சாலட்", slug: "diet-fruit-salad", emoji: "fruit",
    imageUrl: "https://images.unsplash.com/photo-1568721769073-40e57fc61c28?auto=format&fit=crop&w=600&q=80",
    shortDescription: "Papaya, watermelon, pineapple, kiwi & pomegranate mix.", isOrganic: false, isBestSeller: true, isFeatured: true,
    isFreshToday: true, isCutVegetable: false, rating: 4.9, ratingCount: 610, soldCount: 4400,
    categoryName: "Salads", categorySlug: "salads", variantId: "var-diet-fruit-salad", variantName: "300 g", unit: "g", mrp: 160, price: 119, discountPercentage: 25, availableStock: 130
  },

  /* ---------------- Meal Combos ---------------- */
  {
    id: "prod-combo-pulav", name: "Pulav Special Veggie Combo Kit", tamilName: "புலாவ் காய்கறி கிட்", slug: "combo-pulav", emoji: "rice",
    imageUrl: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=600&q=80",
    shortDescription: "Carrot, beans, green peas, potato & whole spices pouch.", isOrganic: false, isBestSeller: true, isFeatured: true,
    isFreshToday: true, isCutVegetable: true, rating: 4.8, ratingCount: 410, soldCount: 3100,
    categoryName: "Ready To Cook", categorySlug: "ready-to-cook", variantId: "var-combo-pulav", variantName: "Serves 4", unit: "pack", mrp: 180, price: 129, discountPercentage: 28, availableStock: 95
  },
  {
    id: "prod-combo-biryani", name: "Vegetables Biryani Special Kit", tamilName: "காய்கறி பிரியாணி கிட்", slug: "combo-biryani", emoji: "rice",
    imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80",
    shortDescription: "Cut veggies, cauliflower, mint, fried onion & biryani masalas.", isOrganic: false, isBestSeller: true, isFeatured: true,
    isFreshToday: true, isCutVegetable: true, rating: 4.9, ratingCount: 720, soldCount: 5200,
    categoryName: "Ready To Cook", categorySlug: "ready-to-cook", variantId: "var-combo-biryani", variantName: "Serves 4", unit: "pack", mrp: 240, price: 179, discountPercentage: 25, availableStock: 120
  },
  {
    id: "prod-combo-aviyal", name: "Traditional Aviyal 7-Veggie Cut Mix", tamilName: "அவியல் காய்கறி கிட்", slug: "combo-aviyal", emoji: "soup",
    imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
    shortDescription: "Drumstick, plantain, yam, beans, carrot, pumpkin & kovakai.", isOrganic: false, isBestSeller: true, isFeatured: true,
    isFreshToday: true, isCutVegetable: true, rating: 4.9, ratingCount: 580, soldCount: 4300,
    categoryName: "Ready To Cook", categorySlug: "ready-to-cook", variantId: "var-combo-aviyal", variantName: "Serves 4", unit: "pack", mrp: 170, price: 125, discountPercentage: 26, availableStock: 110
  },
  {
    id: "prod-combo-bisibele", name: "Bisi Bele Bath Kit (With / Without Onion)", tamilName: "பிசிபேள பாத் கிட்", slug: "combo-bisibele", emoji: "rice",
    imageUrl: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=600&q=80",
    shortDescription: "Special cut veggies + authentic stone-ground spice mix.", isOrganic: false, isBestSeller: true, isFeatured: true,
    isFreshToday: true, isCutVegetable: true, rating: 4.8, ratingCount: 460, soldCount: 3400,
    categoryName: "Ready To Cook", categorySlug: "ready-to-cook", variantId: "var-combo-bisibele", variantName: "Serves 4", unit: "pack", mrp: 190, price: 139, discountPercentage: 26, availableStock: 105
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
      .innerJoin(
        productVariants,
        and(eq(productVariants.productId, products.id), eq(productVariants.isDefault, true)),
      )
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
      .innerJoin(
        productVariants,
        and(eq(productVariants.productId, products.id), eq(productVariants.isDefault, true)),
      )
      .leftJoin(inventory, eq(inventory.variantId, productVariants.id))
      .where(where);

    if (rows && rows.length > 0) {
      return { items: rows.map(mapCard), total: Number(total) };
    }
  } catch (err) {
    console.warn("listProducts query error:", err);
  }

  // Filter fallback products dynamically
  let filtered = FALLBACK_PRODUCTS;
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
  const [row] = await db
    .select()
    .from(categories)
    .where(and(eq(categories.slug, slug), eq(categories.status, "active")))
    .limit(1);
  return row ?? null;
}

export async function getProductBySlug(slug: string) {
  try {
    const [row] = await db
      .select({
        product: products,
        categoryName: categories.name,
        categorySlug: categories.slug,
        categoryIcon: categories.icon,
      })
      .from(products)
      .innerJoin(categories, eq(categories.id, products.categoryId))
      .where(and(eq(products.slug, slug), eq(products.status, "active")))
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
        .orderBy(asc(productVariants.sellingPrice));

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

      return {
        ...row.product,
        ratingAverageNumber: toNumber(row.product.ratingAverage, 4.5),
        categoryName: row.categoryName,
        categorySlug: row.categorySlug,
        categoryIcon: row.categoryIcon,
        variants: variants.map((v) => ({
          id: v.id,
          variantName: v.variantName,
          weight: toNumber(v.weight),
          unit: v.unit,
          mrp: toNumber(v.mrp),
          sellingPrice: toNumber(v.sellingPrice),
          discountPercentage: toNumber(v.discountPercentage),
          taxPercentage: toNumber(v.taxPercentage),
          isDefault: v.isDefault,
          availableStock: v.availableStock ?? 0,
        })),
        images,
        reviews: productReviews,
      };
    }
  } catch (err) {
    console.warn("getProductBySlug db error:", err);
  }

  const fb = FALLBACK_PRODUCTS.find((p) => p.slug === slug);
  if (!fb) return null;

  return {
    id: fb.id,
    categoryId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380c01",
    subCategoryId: null,
    brandId: null,
    name: fb.name,
    tamilName: fb.tamilName,
    slug: fb.slug,
    sku: `VF-${fb.slug}`,
    barcode: "8901000001",
    emoji: fb.emoji,
    shortDescription: fb.shortDescription,
    description: `${fb.shortDescription} Sourced daily from Kovambedu & hill partner farms in Tamil Nadu.`,
    nutrition: [
      { label: "Energy", value: "35 kcal / 100 g" },
      { label: "Protein", value: "1.2 g" },
      { label: "Carbohydrates", value: "6.5 g" },
      { label: "Dietary Fibre", value: "2.1 g" },
    ],
    origin: "Ooty & Hosur, Tamil Nadu",
    shelfLife: "4-5 days refrigerated",
    isFeatured: fb.isFeatured,
    isBestSeller: fb.isBestSeller,
    isOrganic: fb.isOrganic,
    isCutVegetable: fb.isCutVegetable,
    isFreshToday: fb.isFreshToday,
    ratingAverage: fb.rating.toFixed(2),
    ratingAverageNumber: fb.rating,
    ratingCount: fb.ratingCount,
    soldCount: fb.soldCount,
    status: "active" as const,
    seoTitle: `Buy ${fb.name} Online in Chennai`,
    seoDescription: fb.shortDescription ?? "",
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    categoryName: fb.categoryName,
    categorySlug: fb.categorySlug,
    categoryIcon: "vegetables",
    variants: [
      {
        id: fb.variantId,
        variantName: fb.variantName,
        weight: 0.5,
        unit: fb.unit,
        mrp: fb.mrp,
        sellingPrice: fb.price,
        discountPercentage: fb.discountPercentage,
        taxPercentage: 0,
        isDefault: true,
        availableStock: fb.availableStock,
      },
    ],
    images: [{ id: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380d01", productId: fb.id, imageUrl: fb.imageUrl ?? "", thumbnailUrl: null, displayOrder: 0, isPrimary: true, createdAt: new Date() }],
    reviews: [
      { id: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380e01", rating: 5, reviewTitle: "Genuinely fresh", review: "Delivered fast and looks harvest fresh!", isVerifiedPurchase: true, createdAt: new Date(), authorName: "Priya N." },
    ],
  };
}

export type ProductDetail = NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>;

export async function getRelatedProducts(categorySlug: string, excludeId: string, limit = 6) {
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
  return rows.map(mapCard);
}

export async function searchSuggestions(term: string, limit = 8) {
  if (!term.trim()) return [];
  const like = `%${term.trim()}%`;
  return db
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
