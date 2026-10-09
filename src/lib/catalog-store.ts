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
 * Preserves all base products, applying user's stored edits/overrides when matching by id, slug, or sku.
 * Newly created admin products are appended to the list. Deleted products are omitted.
 */
export function getMergedCatalogProducts(baseProducts: AdminProductItem[]): AdminProductItem[] {
  const stored = getStoredCatalogProducts();
  if (!stored || stored.length === 0) {
    return baseProducts;
  }

  // Build lookup maps for stored products by id, slug, sku
  const storedById = new Map<string, AdminProductItem>();
  const storedBySlug = new Map<string, AdminProductItem>();
  const storedBySku = new Map<string, AdminProductItem>();
  const usedStoredKeys = new Set<string>();

  for (const item of stored) {
    if (item.id) storedById.set(item.id, item);
    if (item.slug) storedBySlug.set(item.slug, item);
    if (item.sku) storedBySku.set(item.sku, item);
  }

  const merged: AdminProductItem[] = [];

  for (const base of baseProducts) {
    const matched =
      (base.id && storedById.get(base.id)) ||
      (base.slug && storedBySlug.get(base.slug)) ||
      (base.sku && storedBySku.get(base.sku));

    if (matched) {
      if (matched.id) usedStoredKeys.add(matched.id);
      if (matched.slug) usedStoredKeys.add(matched.slug);
      if (matched.sku) usedStoredKeys.add(matched.sku);

      // Only include if not explicitly marked deleted
      if (matched.status !== "deleted") {
        merged.push(matched);
      }
    } else {
      merged.push(base);
    }
  }

  // Append newly added admin products that are not in baseProducts
  for (const item of stored) {
    const isUsed =
      (item.id && usedStoredKeys.has(item.id)) ||
      (item.slug && usedStoredKeys.has(item.slug)) ||
      (item.sku && usedStoredKeys.has(item.sku));

    if (!isUsed && item.status !== "deleted") {
      merged.push(item);
      if (item.id) usedStoredKeys.add(item.id);
      if (item.slug) usedStoredKeys.add(item.slug);
      if (item.sku) usedStoredKeys.add(item.sku);
    }
  }

  return merged;
}
