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
    (p) =>
      p.id === product.id ||
      (product.id && p.id && (p.id.includes(product.id) || product.id.includes(p.id))) ||
      (product.slug && p.slug === product.slug) ||
      (product.sku && p.sku && p.sku === product.sku) ||
      (product.name && p.name && p.name.toLowerCase().trim() === product.name.toLowerCase().trim())
  );
  let updatedList: AdminProductItem[];

  if (existingIdx >= 0) {
    updatedList = [...current];
    updatedList[existingIdx] = {
      ...current[existingIdx],
      ...product,
      id: current[existingIdx].id || product.id,
      sku: current[existingIdx].sku || product.sku,
    };
  } else {
    updatedList = [product, ...current];
  }

  saveStoredCatalogProducts(updatedList);
}

/** Mark a product as deleted in localStorage admin store so it is permanently excluded across refreshes */
export function deleteStoredProduct(productId: string): void {
  const current = getStoredCatalogProducts();
  const existingIdx = current.findIndex(
    (p) =>
      p.id === productId ||
      p.slug === productId ||
      p.sku === productId ||
      (p.id && productId && (p.id.includes(productId) || productId.includes(p.id)))
  );

  let updatedList: AdminProductItem[];

  if (existingIdx >= 0) {
    updatedList = [...current];
    updatedList[existingIdx] = {
      ...current[existingIdx],
      status: "deleted",
    };
  } else {
    updatedList = [
      {
        id: productId,
        name: productId,
        slug: productId,
        sku: productId,
        emoji: "🥬",
        status: "deleted",
        categoryName: "General",
        price: "0",
        mrp: "0",
        stock: 0,
        isOrganic: false,
      },
      ...current,
    ];
  }

  saveStoredCatalogProducts(updatedList);
}

/** Merge base/fallback products with localStorage admin overrides.
 * Preserves all base products, applying user's stored edits/overrides when matching by id, slug, sku, or name.
 * Newly created admin products are appended to the list. Deleted products are omitted.
 */
export function getMergedCatalogProducts(baseProducts: AdminProductItem[]): AdminProductItem[] {
  const stored = getStoredCatalogProducts();
  if (!stored || stored.length === 0) {
    return baseProducts;
  }

  // Build lookup maps for stored products by id, slug, sku, name
  const storedById = new Map<string, AdminProductItem>();
  const storedBySlug = new Map<string, AdminProductItem>();
  const storedBySku = new Map<string, AdminProductItem>();
  const storedByName = new Map<string, AdminProductItem>();
  const usedStoredKeys = new Set<string>();

  for (const item of stored) {
    if (item.id) storedById.set(item.id, item);
    if (item.slug) storedBySlug.set(item.slug, item);
    if (item.sku) storedBySku.set(item.sku, item);
    if (item.name) storedByName.set(item.name.toLowerCase().trim(), item);
  }

  const merged: AdminProductItem[] = [];

  for (const base of baseProducts) {
    const matched =
      (base.id && storedById.get(base.id)) ||
      (base.slug && storedBySlug.get(base.slug)) ||
      (base.sku && storedBySku.get(base.sku)) ||
      (base.name && storedByName.get(base.name.toLowerCase().trim()));

    if (matched) {
      if (matched.id) usedStoredKeys.add(matched.id);
      if (matched.slug) usedStoredKeys.add(matched.slug);
      if (matched.sku) usedStoredKeys.add(matched.sku);
      if (matched.name) usedStoredKeys.add(matched.name.toLowerCase().trim());

      // Only include if not explicitly marked deleted
      if (matched.status !== "deleted") {
        merged.push({
          ...base,
          ...matched,
          id: base.id || matched.id,
          sku: base.sku || matched.sku,
        });
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
      (item.sku && usedStoredKeys.has(item.sku)) ||
      (item.name && usedStoredKeys.has(item.name.toLowerCase().trim()));

    if (!isUsed && item.status !== "deleted") {
      merged.push(item);
      if (item.id) usedStoredKeys.add(item.id);
      if (item.slug) usedStoredKeys.add(item.slug);
      if (item.sku) usedStoredKeys.add(item.sku);
      if (item.name) usedStoredKeys.add(item.name.toLowerCase().trim());
    }
  }

  return merged;
}
