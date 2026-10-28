const fs = require("fs");

// Load original backed up DB products (containing user's uploaded Base64 images)
const BACKED_UP_PRODS = JSON.parse(
  fs.readFileSync("./scripts/current-db-products.json", "utf8")
);

function getBackedUpImage(keywords, fallback) {
  for (const kw of keywords) {
    const found = BACKED_UP_PRODS.find(
      (p) => p.name.toLowerCase().includes(kw.toLowerCase()) && p.image_url
    );
    if (found && found.image_url) {
      return found.image_url;
    }
  }
  return fallback;
}

// Require USER_PRODUCTS from apply-official-catalog.js
const { USER_PRODUCTS } = require("./apply-official-catalog");

const OFFICIAL_CATEGORIES = [
  {
    id: "cat-chopped-veg",
    name: "Chopped Vegetables (Instant/Ready to cook)",
    slug: "chopped-vegetables",
    tamilName: "நறுக்கிய காய்கறிகள் (Instant/Ready to cook)",
    emoji: "🥦",
    icon: "vegetables",
    tagline: "Washed, peeled & precision-cut cooking packs",
    description: "Daily fresh vegetables diced, sliced & peeled ready to cook with zero kitchen prep waste.",
    badge: "100% Ready To Cook",
    gradient: "from-emerald-900 via-emerald-800 to-teal-900",
    accent: "bg-emerald-700",
  },
  {
    id: "cat-fruits",
    name: "Chopped Fruits",
    slug: "chopped-fruits",
    tamilName: "நறுக்கிய பழங்கள்",
    emoji: "🍎",
    icon: "fruit",
    tagline: "Cleanly cut, seedless & freshly diced fruits",
    description: "Freshly sliced exotic and seasonal fruits deseeded and packed for instant eating.",
    badge: "Chilled & Fresh",
    gradient: "from-amber-900 via-orange-800 to-rose-900",
    accent: "bg-amber-700",
  },
  {
    id: "cat-sprouts",
    name: "Sprouts (pre order only)",
    slug: "sprouts",
    tamilName: "முளைகட்டிய பயறுகள் (Pre-Order Only)",
    emoji: "🌱",
    icon: "sprout",
    tagline: "Pre-Order: Naturally sprouted with 24-hr germination",
    description: "Naturally sprouted organic pulses with 24-hr germination rich in live enzymes & protein. Pre-order only.",
    badge: "Pre-Order Only",
    gradient: "from-teal-950 via-emerald-900 to-green-900",
    accent: "bg-teal-700",
    isPreOrder: true,
  },
  {
    id: "cat-combos",
    name: "Combo",
    slug: "combos",
    tamilName: "சமையல் காம்போ கிட்ஸ்",
    emoji: "🍲",
    icon: "soup",
    tagline: "Pulav, Biriyani, Aviyal & Bisi Bele recipe kits",
    description: "Pulav, Biriyani, Aviyal & Bisi Bele Bath complete recipe kits with exact ingredients kg-wise.",
    badge: "Complete Recipe Kits",
    gradient: "from-amber-950 via-orange-900 to-yellow-900",
    accent: "bg-amber-800",
  },
  {
    id: "cat-fruit-salad",
    name: "Fruit salad",
    slug: "fruit-salad",
    tamilName: "பழ சாலட் (Customizable)",
    emoji: "🍓",
    icon: "fruit",
    tagline: "Add fruits and berries based on your wish",
    description: "Fresh fruit & berry salad bowls (add fruits and berries based on your wish).",
    badge: "Custom Tossed",
    gradient: "from-rose-900 via-pink-800 to-red-900",
    accent: "bg-rose-700",
  },
  {
    id: "cat-sprouts-salads",
    name: "Sprouts salads",
    slug: "sprouts-salads",
    tamilName: "முளைகட்டிய பயறு சாலட் (Pre-Order Only)",
    emoji: "🫘",
    icon: "sprout",
    tagline: "Diet-friendly sprouts salad bowls (Select any 3 items)",
    description: "Based on your diet plan select any 3 items - Pre-order only.",
    badge: "Select Any 3 Items",
    gradient: "from-lime-950 via-emerald-900 to-teal-900",
    accent: "bg-lime-700",
    isPreOrder: true,
  },
  {
    id: "cat-vegetables-salads",
    name: "Vegetables salads",
    slug: "vegetables-salads",
    tamilName: "காய்கறி சாலட் (Select Any 3 Items)",
    emoji: "🥗",
    icon: "salad",
    tagline: "Fresh garden vegetable salad bowls (Select any 3 items)",
    description: "Based on your diet plan select any 3 items fresh tossed with light dressing.",
    badge: "Select Any 3 Items",
    gradient: "from-teal-900 via-teal-800 to-emerald-900",
    accent: "bg-teal-700",
  },
];

const catNameMap = new Map();
OFFICIAL_CATEGORIES.forEach((c) => catNameMap.set(c.slug, c.name));

const allProducts = USER_PRODUCTS.map((p, idx) => {
  const resolvedImg = getBackedUpImage(p.imgKw, p.fallbackImg);
  const mrpNum = Number(p.mrp);
  const priceNum = Number(p.sellingPrice);
  const discount = Math.round(((mrpNum - priceNum) / mrpNum) * 100);

  // Preserve soya sprout id
  let prodId = `prod-${p.slug}`;
  let varId = `var-${p.slug}`;
  if (p.name.toLowerCase().includes("soya")) {
    prodId = "b19b2230-8385-443e-a5c8-31d97b6179e7";
    varId = "f3abeddc-bb61-49ea-bf6a-9f6d76ec684f";
  }

  let emoji = "🥬";
  if (p.catSlug === "chopped-fruits" || p.catSlug === "fruit-salad") emoji = "🍎";
  if (p.catSlug === "sprouts" || p.catSlug === "sprouts-salads") emoji = "🌱";
  if (p.catSlug === "combos") emoji = "🍲";
  if (p.catSlug === "vegetables-salads") emoji = "🥗";

  return {
    id: prodId,
    name: p.name,
    tamilName: p.tamilName,
    slug: p.slug,
    emoji,
    shortDescription: p.desc,
    isOrganic: false,
    isBestSeller: idx % 3 === 0,
    isFeatured: idx % 2 === 0,
    isFreshToday: true,
    isCutVegetable: true,
    isPreOrder: Boolean(p.isPreOrder),
    rating: 4.8,
    ratingCount: 120 + (idx * 7) % 250,
    soldCount: 450 + (idx * 31) % 1500,
    categoryName: catNameMap.get(p.catSlug) || "Chopped Vegetables (Instant/Ready to cook)",
    categorySlug: p.catSlug,
    subCategorySlug: null,
    variantId: varId,
    variantName: p.variantName,
    unit: p.variantName.includes("kg") ? "kg" : p.variantName.includes("g") ? "g" : "pack",
    mrp: mrpNum,
    price: priceNum,
    discountPercentage: discount > 0 ? discount : 15,
    availableStock: 100,
    imageUrl: resolvedImg,
  };
});

const fileContent = `export type ProductItem = {
  id: string;
  name: string;
  tamilName?: string | null;
  slug: string;
  emoji: string;
  shortDescription?: string | null;
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
  subCategorySlug?: string | null;
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

export type CategoryMeta = {
  id: string;
  name: string;
  slug: string;
  tamilName: string;
  emoji: string;
  icon: string;
  tagline: string;
  description: string;
  badge: string;
  gradient: string;
  accent: string;
  isPreOrder?: boolean;
};

export const CORE_CATEGORIES: CategoryMeta[] = ${JSON.stringify(OFFICIAL_CATEGORIES, null, 2)};

export const ALL_PRODUCTS: ProductItem[] = ${JSON.stringify(allProducts, null, 2)};

const globalForCatalog = globalThis as unknown as {
  __VF_LIVE_PRODUCTS_MAP__?: Map<string, ProductItem>;
};

export function getLiveProductsList(): ProductItem[] {
  const map = globalForCatalog.__VF_LIVE_PRODUCTS_MAP__;
  if (map && map.size > 0) {
    return Array.from(map.values());
  }
  return ALL_PRODUCTS;
}

export function updateLiveProduct(id: string, updates: Partial<ProductItem>): ProductItem | null {
  const map = globalForCatalog.__VF_LIVE_PRODUCTS_MAP__ || new Map<string, ProductItem>();
  if (!globalForCatalog.__VF_LIVE_PRODUCTS_MAP__) {
    ALL_PRODUCTS.forEach((p) => map.set(p.id, { ...p }));
    globalForCatalog.__VF_LIVE_PRODUCTS_MAP__ = map;
  }

  // Find by ID or slug or variant ID
  let target = map.get(id);
  if (!target) {
    for (const p of map.values()) {
      if (
        p.id === id ||
        p.slug === id ||
        (updates.slug && p.slug === updates.slug) ||
        p.id.includes(id) ||
        id.includes(p.id)
      ) {
        target = p;
        break;
      }
    }
  }

  if (target) {
    const updated: ProductItem = {
      ...target,
      ...updates,
      name: updates.name !== undefined ? updates.name : target.name,
      tamilName: updates.tamilName !== undefined ? updates.tamilName : target.tamilName,
      price: updates.price !== undefined ? Number(updates.price) : target.price,
      mrp: updates.mrp !== undefined ? Number(updates.mrp) : target.mrp,
      availableStock: updates.availableStock !== undefined ? Number(updates.availableStock) : target.availableStock,
      categoryName: updates.categoryName !== undefined ? updates.categoryName : target.categoryName,
      categorySlug: updates.categorySlug !== undefined ? updates.categorySlug : target.categorySlug,
      imageUrl: updates.imageUrl !== undefined ? updates.imageUrl : target.imageUrl,
    };
    if (updated.mrp > updated.price) {
      updated.discountPercentage = Math.round(((updated.mrp - updated.price) / updated.mrp) * 100);
    }
    map.set(target.id, updated);
    return updated;
  }
  return null;
}
`;

fs.writeFileSync("./src/lib/data/all-products.ts", fileContent, "utf8");
console.log("Successfully generated src/lib/data/all-products.ts with", allProducts.length, "official products across 7 categories!");
