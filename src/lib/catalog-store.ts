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

/** Save full admin catalog array to localStorage, trigger event & background sync to server API */
export function saveStoredCatalogProducts(products: AdminProductItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: products }));
    // Background sync to server API endpoint for server-side rendering
    void fetch("/api/v1/admin/catalog/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ products }),
    }).catch((e) => console.warn("Background catalog save warning:", e));
  } catch (err) {
    console.warn("Failed to save catalog to localStorage:", err);
  }
}

/** Upsert a single product into localStorage admin store */
export function upsertStoredProduct(product: AdminProductItem): void {
  const current = getStoredCatalogProducts();
  const existingIdx = current.findIndex(
    (p) => p.id === product.id || p.slug === product.slug || (p.sku && p.sku === product.sku)
  );
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
  const filtered = current.filter(
    (p) => p.id !== productId && p.slug !== productId && p.sku !== productId
  );
  saveStoredCatalogProducts(filtered);
}

/** Merge base/fallback products with localStorage admin overrides.
 * If user has stored products in localStorage, user's saved list is the master truth. */
export function getMergedCatalogProducts(baseProducts: AdminProductItem[]): AdminProductItem[] {
  const stored = getStoredCatalogProducts();
  if (stored && stored.length > 0) {
    return stored;
  }
  return baseProducts;
}
