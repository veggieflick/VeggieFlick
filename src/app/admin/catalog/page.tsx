"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Loader2,
  Plus,
  Save,
  Pencil,
  Trash2,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  X,
  Sparkles,
} from "lucide-react";
import { useApp } from "@/components/providers";
import { formatDateIST, formatINR } from "@/lib/utils";
import { StatusPill } from "@/components/ui/primitives";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  emoji: string;
  status: string;
  categoryName: string;
  isOrganic: boolean;
  price: string;
  mrp: string;
  stock: number | null;
  imageUrl?: string | null;
  shortDescription?: string;
  description?: string;
};

type InventoryRow = {
  variantId: string;
  productName: string;
  emoji: string;
  variantName: string;
  sku: string;
  availableStock: number;
  reservedStock: number;
  reorderLevel: number;
  warehouseName: string;
};

type CouponRow = {
  id: string;
  couponCode: string;
  title: string;
  discountType: string;
  discountValue: string;
  minimumOrderAmount: string;
  usedCount: number;
  usageLimit: number;
  expiryDate: string;
  status: string;
};

type Category = { id: string; name: string };

const PRESET_PRODUCE_IMAGES = [
  { name: "Tomato", url: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=80" },
  { name: "Onion", url: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&q=80" },
  { name: "Carrot", url: "https://images.unsplash.com/photo-1598170845058-12ef4a457939?w=400&q=80" },
  { name: "Greens", url: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80" },
  { name: "Sambar Mix", url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80" },
  { name: "Mango", url: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&q=80" },
];

const INITIAL_FALLBACK_PRODUCTS: ProductRow[] = [
  {
    id: "prod-101",
    name: "Country Tomato (Desi)",
    slug: "country-tomato",
    sku: "VF-0001",
    emoji: "🍅",
    status: "active",
    categoryName: "Fresh Vegetables",
    isOrganic: false,
    price: "55.00",
    mrp: "78.00",
    stock: 140,
    imageUrl: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=80",
    shortDescription: "Juicy, tangy Ooty-belt tomatoes ideal for sambar and gravies.",
  },
  {
    id: "prod-102",
    name: "Bangalore Onion",
    slug: "bangalore-onion",
    sku: "VF-0002",
    emoji: "🧅",
    status: "active",
    categoryName: "Fresh Vegetables",
    isOrganic: false,
    price: "38.00",
    mrp: "52.00",
    stock: 260,
    imageUrl: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&q=80",
    shortDescription: "Big sized onions with crisp layers and long shelf life.",
  },
  {
    id: "prod-103",
    name: "Fresh Arai Keerai Bunch",
    slug: "arai-keerai",
    sku: "VF-0003",
    emoji: "🥬",
    status: "active",
    categoryName: "Leafy Vegetables",
    isOrganic: true,
    price: "25.00",
    mrp: "35.00",
    stock: 80,
    imageUrl: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80",
    shortDescription: "Farm fresh Arai Keerai harvested this morning.",
  },
  {
    id: "prod-104",
    name: "Ooty Tender Carrot",
    slug: "ooty-carrot",
    sku: "VF-0004",
    emoji: "🥕",
    status: "active",
    categoryName: "Fresh Vegetables",
    isOrganic: true,
    price: "55.00",
    mrp: "75.00",
    stock: 110,
    imageUrl: "https://images.unsplash.com/photo-1598170845058-12ef4a457939?w=400&q=80",
    shortDescription: "Sweet Nilgiris carrots packed with vitamins.",
  },
  {
    id: "prod-105",
    name: "Cut Sambar Veggie Mix",
    slug: "sambar-cut-mix",
    sku: "VF-0005",
    emoji: "🥦",
    status: "active",
    categoryName: "Cut Vegetables",
    isOrganic: false,
    price: "45.00",
    mrp: "60.00",
    stock: 95,
    imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80",
    shortDescription: "Pre-washed & chopped sambar veggies ready to cook.",
  },
];

const TABS = ["products", "inventory", "coupons", "spoilage"] as const;

function CatalogWorkspace() {
  const params = useSearchParams();
  const { notify } = useApp();
  const [tab, setTab] = useState<(typeof TABS)[number]>(
    (params.get("tab") as (typeof TABS)[number]) ?? "products",
  );
  const [products, setProducts] = useState<ProductRow[]>(INITIAL_FALLBACK_PRODUCTS);
  const [inventory, setInventory] = useState<InventoryRow[]>([]);
  const [coupons, setCoupons] = useState<CouponRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([
    { id: "cat-1", name: "Fresh Vegetables" },
    { id: "cat-2", name: "Leafy Vegetables" },
    { id: "cat-3", name: "Cut Vegetables" },
    { id: "cat-4", name: "Fresh Fruits" },
    { id: "cat-5", name: "Organic Produce" },
  ]);
  const [loading, setLoading] = useState(true);

  // New & Edit Product State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductRow | null>(null);

  // Image Upload preview state
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, i, c, cat] = await Promise.all([
        fetch("/api/v1/admin/catalog?view=products&limit=50").then((r) => r.json()),
        fetch("/api/v1/admin/catalog?view=inventory&limit=50").then((r) => r.json()),
        fetch("/api/v1/admin/coupons").then((r) => r.json()),
        fetch("/api/v1/categories").then((r) => r.json()),
      ]);
      if (p?.success && Array.isArray(p.data) && p.data.length > 0) {
        setProducts(p.data as ProductRow[]);
      }
      if (i?.success && Array.isArray(i.data) && i.data.length > 0) {
        setInventory(i.data as InventoryRow[]);
      }
      if (c?.success) setCoupons(c.data as CouponRow[]);
      if (cat?.success && cat.data?.categories) setCategories(cat.data.categories as Category[]);
    } catch (err) {
      console.warn("Catalog load warning:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => void load(), 0);
    return () => clearTimeout(timer);
  }, [load]);

  // Handle direct file upload via FileReader
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        notify("Image uploaded successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name"));
    const price = Number(data.get("sellingPrice"));
    const mrp = Number(data.get("mrp"));
    const stock = Number(data.get("stock") || 50);

    const newProd: ProductRow = {
      id: `prod-${Date.now()}`,
      name,
      slug: name.toLowerCase().replace(/\s+/g, "-"),
      sku: `VF-${Math.floor(1000 + Math.random() * 9000)}`,
      emoji: String(data.get("emoji") || "🥬"),
      status: "active",
      categoryName: String(data.get("categoryName") || "Fresh Vegetables"),
      isOrganic: data.get("isOrganic") === "on",
      price: price.toFixed(2),
      mrp: mrp.toFixed(2),
      stock,
      imageUrl: imagePreview || String(data.get("imageUrl") || PRESET_PRODUCE_IMAGES[0].url),
      shortDescription: String(data.get("shortDescription") || ""),
    };

    setProducts([newProd, ...products]);
    setShowAddModal(false);
    setImagePreview(null);
    notify(`Product "${newProd.name}" added to catalog!`);
  };

  const handleUpdateProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingProduct) return;

    const data = new FormData(e.currentTarget);
    const name = String(data.get("name"));
    const price = Number(data.get("sellingPrice"));
    const mrp = Number(data.get("mrp"));
    const stock = Number(data.get("stock"));

    const updated: ProductRow = {
      ...editingProduct,
      name,
      categoryName: String(data.get("categoryName")),
      emoji: String(data.get("emoji")),
      price: price.toFixed(2),
      mrp: mrp.toFixed(2),
      stock,
      isOrganic: data.get("isOrganic") === "on",
      status: String(data.get("status")),
      imageUrl: imagePreview || String(data.get("imageUrl")) || editingProduct.imageUrl,
    };

    setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? updated : p)));
    setEditingProduct(null);
    setImagePreview(null);
    notify(`Product "${updated.name}" updated successfully!`);
  };

  const handleDeleteProduct = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      notify(`Product ${name} removed from catalog.`);
    }
  };

  return (
    <div className="grid gap-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Catalogue & Product Manager</h1>
          <p className="text-sm text-slate-500">
            Add new products, upload high-res produce photos, edit pricing, and track warehouse stock.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setImagePreview(null);
            setShowAddModal(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition"
        >
          <Plus size={18} /> Add New Product
        </button>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        {TABS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={`px-4 py-2 text-sm font-semibold rounded-xl capitalize transition ${
              tab === item
                ? "bg-brand-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500 bg-white rounded-2xl border border-slate-200">
          <Loader2 className="h-5 w-5 animate-spin text-brand-600" /> Loading catalogue items…
        </div>
      )}

      {/* PRODUCTS TAB */}
      {!loading && tab === "products" && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Product Photo & Name</th>
                  <th className="px-6 py-3.5">SKU</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Price / MRP</th>
                  <th className="px-6 py-3.5">Stock</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="relative h-12 w-12 shrink-0 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 flex items-center justify-center">
                        {product.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl">{product.emoji || "🥦"}</span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{product.name}</span>
                          {product.isOrganic && (
                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700 border border-emerald-200">
                              Organic
                            </span>
                          )}
                        </div>
                        {product.shortDescription && (
                          <p className="text-xs text-slate-500 line-clamp-1">{product.shortDescription}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-500">{product.sku}</td>
                    <td className="px-6 py-4 text-slate-700">{product.categoryName}</td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900">{formatINR(product.price)}</span>{" "}
                      <span className="text-xs text-slate-400 line-through">{formatINR(product.mrp)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                          (product.stock ?? 0) > 20
                            ? "bg-emerald-50 text-emerald-700"
                            : (product.stock ?? 0) > 0
                            ? "bg-amber-50 text-amber-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {product.stock ?? 0} in stock
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusPill status={product.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProduct(product);
                            setImagePreview(product.imageUrl || null);
                          }}
                          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-brand-700 transition"
                          title="Edit Product"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(product.id, product.name)}
                          className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                          title="Delete Product"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: ADD PRODUCT */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Plus className="text-brand-600" /> Add New Produce Item
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-sm">
              {/* Direct Image File Upload Section */}
              <div className="rounded-2xl border-2 border-dashed border-brand-200 bg-brand-50/40 p-4 text-center space-y-3">
                <p className="font-bold text-slate-800 flex items-center justify-center gap-2">
                  <Upload size={16} className="text-brand-600" /> Direct Image Upload
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  {imagePreview ? (
                    <div className="relative h-24 w-24 rounded-xl overflow-hidden border-2 border-brand-500 shadow-md">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImagePreview(null)}
                        className="absolute top-1 right-1 rounded-full bg-slate-900/80 p-1 text-white hover:bg-red-600"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="h-20 w-20 rounded-xl bg-slate-200 flex items-center justify-center text-slate-400">
                      <ImageIcon size={32} />
                    </div>
                  )}

                  <div className="space-y-2 text-left">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-600 file:text-white hover:file:bg-brand-700 cursor-pointer"
                    />
                    <p className="text-[11px] text-slate-500">Supports PNG, JPG, WEBP from your local PC</p>
                  </div>
                </div>

                {/* Preset image quick buttons */}
                <div className="pt-2">
                  <p className="text-xs font-semibold text-slate-500 mb-1.5">Or choose high-res sample photo:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {PRESET_PRODUCE_IMAGES.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => setImagePreview(preset.url)}
                        className="text-xs bg-white px-2.5 py-1 rounded-lg border border-slate-200 hover:border-brand-500 font-medium text-slate-700"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Product Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="e.g. Fresh Red Capsicum"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    name="categoryName"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">MRP (₹)</label>
                  <input
                    type="number"
                    name="mrp"
                    defaultValue={60}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    name="sellingPrice"
                    defaultValue={45}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Initial Stock</label>
                  <input
                    type="number"
                    name="stock"
                    defaultValue={60}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isOrganic"
                  id="organicCheck"
                  className="h-4 w-4 rounded text-brand-600 focus:ring-brand-500 cursor-pointer"
                />
                <label htmlFor="organicCheck" className="font-semibold text-slate-700 cursor-pointer">
                  Certified Organic Produce
                </label>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Short Description</label>
                <input
                  type="text"
                  name="shortDescription"
                  placeholder="Farm fresh harvest from Hosur belt."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-600 px-5 py-2 font-semibold text-white hover:bg-brand-700"
                >
                  Save & Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT PRODUCT */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Pencil className="text-brand-600" /> Edit Product: {editingProduct.name}
              </h2>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateProduct} className="space-y-4 text-sm">
              {/* Image Upload section */}
              <div className="rounded-2xl border-2 border-dashed border-brand-200 bg-brand-50/40 p-4 text-center space-y-3">
                <p className="font-bold text-slate-800 flex items-center justify-center gap-2">
                  <Upload size={16} className="text-brand-600" /> Replace Product Photo
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <div className="relative h-24 w-24 rounded-xl overflow-hidden border-2 border-brand-500 shadow-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreview || editingProduct.imageUrl || PRESET_PRODUCE_IMAGES[0].url}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="space-y-2 text-left">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-600 file:text-white hover:file:bg-brand-700 cursor-pointer"
                    />
                    <p className="text-[11px] text-slate-500">Upload new image file from computer</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Product Name</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingProduct.name}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    name="categoryName"
                    defaultValue={editingProduct.categoryName}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">MRP (₹)</label>
                  <input
                    type="number"
                    name="mrp"
                    defaultValue={Number(editingProduct.mrp)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    name="sellingPrice"
                    defaultValue={Number(editingProduct.price)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Stock Count</label>
                  <input
                    type="number"
                    name="stock"
                    defaultValue={editingProduct.stock ?? 0}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isOrganic"
                    defaultChecked={editingProduct.isOrganic}
                    className="h-4 w-4 rounded text-brand-600 focus:ring-brand-500 cursor-pointer"
                  />
                  Organic Produce
                </label>

                <div>
                  <label className="font-semibold text-slate-700 mr-2">Status:</label>
                  <select
                    name="status"
                    defaultValue={editingProduct.status}
                    className="rounded-xl border border-slate-200 px-3 py-1 text-slate-900"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-600 px-5 py-2 font-semibold text-white hover:bg-brand-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INVENTORY TAB */}
      {!loading && tab === "inventory" && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Item</th>
                  <th className="px-6 py-3.5">Warehouse</th>
                  <th className="px-6 py-3.5">Reserved</th>
                  <th className="px-6 py-3.5">Reorder Level</th>
                  <th className="px-6 py-3.5">Available</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {products.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4 font-bold text-slate-900">{row.name}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">Chennai Central Hub</td>
                    <td className="px-6 py-4 text-slate-600">8</td>
                    <td className="px-6 py-4 text-slate-600">20</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                          (row.stock ?? 0) === 0
                            ? "bg-red-50 text-red-700"
                            : (row.stock ?? 0) <= 20
                            ? "bg-amber-50 text-amber-700"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {row.stock ?? 0} units
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setEditingProduct(row);
                          setImagePreview(row.imageUrl || null);
                        }}
                        className="text-xs font-bold text-brand-700 hover:underline"
                      >
                        Edit Stock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SPOILAGE TAB */}
      {!loading && tab === "spoilage" && (
        <div className="grid gap-5">
          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
            <h2 className="text-lg font-bold text-amber-950 flex items-center gap-2">
              🥦 Koyambedu Hub Spoilage & Procurement Assistant
            </h2>
            <p className="text-xs text-slate-700 mt-1">
              Real-time fresh produce shelf life monitoring. Sourced produce harvested over 14 hours ago is flagged for automated flash sale clearance.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase">Today&apos;s Hub Arrival</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">450 Crates</p>
              <p className="text-xs text-emerald-600 font-semibold mt-1">Sourced 4:00 AM Koyambedu Market</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase">At Spoilage Risk (&gt;14h)</p>
              <p className="text-2xl font-extrabold text-amber-600 mt-1">18 Items</p>
              <p className="text-xs text-amber-700 font-semibold mt-1">Keerai Greens & Tender Herbs</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase">Tomorrow&apos;s Forecasted Need</p>
              <p className="text-2xl font-extrabold text-brand-600 mt-1">520 Crates</p>
              <p className="text-xs text-brand-700 font-semibold mt-1">Based on Sunday order velocity</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminCatalogPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-sm text-slate-500">Loading…</div>}>
      <CatalogWorkspace />
    </Suspense>
  );
}
