"use client";

export type AdminProductItem = {
  id: string;
  name: string;
  tamilName?: string;
  slug: string;
  sku: string;
  emoji: string;
  status: string;
  categoryName: string;
  isOrganic: boolean;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  price: string;
  mrp: string;
  weight?: string;
  unit?: string;
  stock: number | null;
  imageUrl?: string | null;
  images?: string[];
  shortDescription?: string;
};

const STORAGE_KEY = "vf_admin_catalog_v1";
const EVENT_NAME = "vf_catalog_updated";

/** Get manually saved admin catalog products from localStorage */
export function getStoredCatalogProducts(): AdminProductItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn("Failed to load catalog from localStorage:", err);
    return [];
  }
}

/** Save full admin catalog array to localStorage & notify listeners */
export function saveStoredCatalogProducts(products: AdminProductItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: products }));
  } catch (err) {
    console.warn("Failed to save catalog to localStorage:", err);
  }
}

/** Upsert a single product into localStorage admin store */
export function upsertStoredProduct(product: AdminProductItem): void {
  const current = getStoredCatalogProducts();
  const existingIdx = current.findIndex((p) => p.id === product.id);
  let updatedList: AdminProductItem[];

  if (existingIdx >= 0) {
    updatedList = [...current];
    updatedList[existingIdx] = product;
  } else {
    updatedList = [product, ...current];
  }

  saveStoredCatalogProducts(updatedList);
}

/** Delete a product from localStorage admin store */
export function deleteStoredProduct(productId: string): void {
  const current = getStoredCatalogProducts();
  const filtered = current.filter((p) => p.id !== productId);
  saveStoredCatalogProducts(filtered);
}

/** Merge base/fallback products with localStorage admin overrides */
export function getMergedCatalogProducts(baseProducts: AdminProductItem[]): AdminProductItem[] {
  const stored = getStoredCatalogProducts();
  if (!stored.length) return baseProducts;

  const storedMap = new Map(stored.map((p) => [p.id, p]));
  const mergedBase = baseProducts.map((p) => storedMap.get(p.id) ?? p);

  // Find newly added products in stored that are not in baseProducts
  const baseIds = new Set(baseProducts.map((p) => p.id));
  const newAdminProducts = stored.filter((p) => !baseIds.has(p.id));

  return [...newAdminProducts, ...mergedBase];
}
