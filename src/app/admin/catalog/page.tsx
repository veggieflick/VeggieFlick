"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Upload,
  Image as ImageIcon,
  Check,
  X,
  Sparkles,
  RefreshCw,
  Boxes,
  Tag,
  AlertTriangle,
  Leaf,
  Flame,
  Clock,
  Scissors,
} from "lucide-react";

type Product = {
  id: string;
  name: string;
  tamilName?: string;
  slug: string;
  emoji: string;
  shortDescription?: string;
  status: string;
  isOrganic: boolean;
  isBestSeller: boolean;
  isFeatured: boolean;
  isFreshToday: boolean;
  isCutVegetable: boolean;
  categoryId?: string;
  categoryName: string;
  variantId?: string;
  variantName: string;
  unit: string;
  mrp: number;
  price: number;
  sku: string;
  availableStock: number;
  imageUrl?: string | null;
};

const CATEGORIES = [
  "All Categories",
  "Fresh Vegetables",
  "Cut Vegetables",
  "Fresh Fruits",
  "Leafy Vegetables",
  "Organic",
  "Exotic Vegetables",
  "Salads",
  "Ready To Cook",
];

export default function AdminCatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    tamilName: "",
    emoji: "🥬",
    categoryName: "Fresh Vegetables",
    price: 30,
    mrp: 40,
    variantName: "500 g",
    unit: "g",
    stock: 100,
    imageUrl: "",
    shortDescription: "",
    isOrganic: false,
    isBestSeller: false,
    isFeatured: false,
    isFreshToday: false,
    isCutVegetable: false,
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/products");
      const data = await res.json();
      if (data.products) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error("Failed to load products:", err);
      showMessage("Failed to connect to Supabase DB", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const showMessage = (text: string, type: "success" | "error") => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      tamilName: "",
      emoji: "🥬",
      categoryName: "Fresh Vegetables",
      price: 35,
      mrp: 45,
      variantName: "500 g",
      unit: "g",
      stock: 100,
      imageUrl: "",
      shortDescription: "",
      isOrganic: false,
      isBestSeller: false,
      isFeatured: true,
      isFreshToday: true,
      isCutVegetable: false,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      tamilName: p.tamilName || "",
      emoji: p.emoji || "🥬",
      categoryName: p.categoryName || "Fresh Vegetables",
      price: p.price,
      mrp: p.mrp,
      variantName: p.variantName || "500 g",
      unit: p.unit || "g",
      stock: p.availableStock ?? 100,
      imageUrl: p.imageUrl || "",
      shortDescription: p.shortDescription || "",
      isOrganic: p.isOrganic,
      isBestSeller: p.isBestSeller,
      isFeatured: p.isFeatured,
      isFreshToday: p.isFreshToday,
      isCutVegetable: p.isCutVegetable,
    });
    setIsModalOpen(true);
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const body = new FormData();
    body.append("file", file);

    try {
      const res = await fetch("/api/v1/admin/upload", {
        method: "POST",
        body,
      });
      const data = await res.json();
      if (data.url) {
        setFormData((prev) => ({ ...prev, imageUrl: data.url }));
        showMessage("Image uploaded successfully to Supabase Storage!", "success");
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (err) {
      console.error("Image upload error:", err);
      showMessage("Image upload failed: " + (err as Error).message, "error");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.price <= 0) {
      showMessage("Please enter valid product name and price", "error");
      return;
    }

    setSubmitting(true);
    try {
      if (editingProduct) {
        // Update product in Supabase DB
        const res = await fetch(`/api/v1/admin/products/${editingProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.success) {
          showMessage("Product updated in Supabase DB!", "success");
          setIsModalOpen(false);
          fetchProducts();
        } else {
          throw new Error(data.error || "Update failed");
        }
      } else {
        // Create product in Supabase DB
        const res = await fetch("/api/v1/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.success) {
          showMessage("New product created in Supabase DB!", "success");
          setIsModalOpen(false);
          fetchProducts();
        } else {
          throw new Error(data.error || "Create failed");
        }
      }
    } catch (err) {
      console.error("Save error:", err);
      showMessage("Failed: " + (err as Error).message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}" from Supabase database?`)) return;

    try {
      const res = await fetch(`/api/v1/admin/products/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        showMessage(`Product "${name}" deleted!`, "success");
        fetchProducts();
      } else {
        throw new Error(data.error || "Delete failed");
      }
    } catch (err) {
      showMessage("Delete failed: " + (err as Error).message, "error");
    }
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.tamilName && p.tamilName.includes(searchQuery)) ||
      (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === "All Categories" || p.categoryName === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      {/* Header Banner */}
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
              ⚡ Supabase Cloud Connected
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Total Products: {products.length}
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Product & Stock Catalog Manager
          </h1>
          <p className="text-sm text-slate-600">
            Direct real-time product edits & Supabase Storage image uploader.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchProducts()}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-emerald-700 transition"
          >
            <Plus className="h-4 w-4" />
            Add New Product
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {statusMessage && (
        <div
          className={`mb-4 flex items-center justify-between rounded-lg p-4 text-sm font-semibold shadow-sm ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          <span>{statusMessage.text}</span>
          <button onClick={() => setStatusMessage(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Search & Category Filter Bar */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by product name, Tamil name, or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  selectedCategory === cat
                    ? "bg-emerald-700 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product List Table / Grid */}
      {loading ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-slate-200 bg-white">
          <RefreshCw className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="mt-3 text-sm font-medium text-slate-600">Syncing products from Supabase DB...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center">
          <Boxes className="h-10 w-10 text-slate-300" />
          <h3 className="mt-2 text-base font-bold text-slate-800">No products found</h3>
          <p className="text-sm text-slate-500">Try adjusting search or category filters.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase font-bold text-slate-500">
                <tr>
                  <th className="px-4 py-3.5">Product</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Price / MRP</th>
                  <th className="px-4 py-3.5">Variant</th>
                  <th className="px-4 py-3.5">Stock</th>
                  <th className="px-4 py-3.5">Badges</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-xl">{p.emoji || "🥬"}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{p.name}</p>
                          {p.tamilName && (
                            <p className="text-xs text-emerald-700 font-medium">{p.tamilName}</p>
                          )}
                          <p className="text-[10px] text-slate-400 font-mono">{p.sku}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 font-medium text-slate-600">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">
                        {p.categoryName}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="font-bold text-slate-900">₹{p.price}</span>
                      {p.mrp > p.price && (
                        <span className="ml-1.5 text-xs text-slate-400 line-through">₹{p.mrp}</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-slate-600 text-xs">
                      {p.variantName || "500 g"}
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          p.availableStock > 20
                            ? "bg-emerald-100 text-emerald-800"
                            : p.availableStock > 0
                            ? "bg-amber-100 text-amber-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {p.availableStock > 0 ? `${p.availableStock} in stock` : "Out of stock"}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {p.isFreshToday && (
                          <span className="inline-flex items-center gap-0.5 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">
                            <Clock className="h-3 w-3" /> Fresh
                          </span>
                        )}
                        {p.isOrganic && (
                          <span className="inline-flex items-center gap-0.5 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                            <Leaf className="h-3 w-3" /> Organic
                          </span>
                        )}
                        {p.isBestSeller && (
                          <span className="inline-flex items-center gap-0.5 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                            <Flame className="h-3 w-3" /> Hot
                          </span>
                        )}
                        {p.isCutVegetable && (
                          <span className="inline-flex items-center gap-0.5 rounded bg-purple-50 px-1.5 py-0.5 text-[10px] font-semibold text-purple-700">
                            <Scissors className="h-3 w-3" /> Cut
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-emerald-600"
                          title="Edit Product Details & Image"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="rounded-lg p-2 text-slate-600 hover:bg-rose-50 hover:text-rose-600"
                          title="Delete Product"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Edit / Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingProduct ? "Edit Product Details" : "Add New Product"}
                </h2>
                <p className="text-xs text-slate-500">Changes update directly in Supabase PostgreSQL.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {/* Product Image Uploader Section */}
              <div className="rounded-xl border border-dashed border-emerald-300 bg-emerald-50/50 p-4">
                <label className="block text-xs font-bold text-emerald-900 uppercase">
                  Product Image (Supabase Storage)
                </label>
                <div className="mt-3 flex items-center gap-4">
                  <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    {formData.imageUrl ? (
                      <img src={formData.imageUrl} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-3xl">{formData.emoji}</span>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow hover:bg-emerald-700 transition w-fit">
                      <Upload className="h-4 w-4" />
                      {uploadingImage ? "Uploading to Cloud..." : "Upload New Photo"}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileUpload}
                        disabled={uploadingImage}
                        className="hidden"
                      />
                    </label>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">or Image URL:</span>
                      <input
                        type="text"
                        placeholder="https://..."
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        className="flex-1 rounded-md border border-slate-200 px-2.5 py-1 text-xs focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Names & Category */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Product Name (English) *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                    placeholder="e.g. Country Tomato"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Tamil Name (தமிழ்)</label>
                  <input
                    type="text"
                    value={formData.tamilName}
                    onChange={(e) => setFormData({ ...formData, tamilName: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none font-medium"
                    placeholder="e.g. நாட்டு தக்காளி"
                  />
                </div>
              </div>

              {/* Category & Emoji */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Category</label>
                  <select
                    value={formData.categoryName}
                    onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                  >
                    {CATEGORIES.filter((c) => c !== "All Categories").map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Emoji Icon</label>
                  <input
                    type="text"
                    value={formData.emoji}
                    onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                    placeholder="e.g. 🍅"
                  />
                </div>
              </div>

              {/* Price, MRP, Stock & Variant */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">MRP (₹)</label>
                  <input
                    type="number"
                    value={formData.mrp}
                    onChange={(e) => setFormData({ ...formData, mrp: Number(e.target.value) })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Stock Quantity</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Unit / Pack Size</label>
                  <input
                    type="text"
                    value={formData.variantName}
                    onChange={(e) => setFormData({ ...formData, variantName: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                    placeholder="e.g. 500 g"
                  />
                </div>
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700">Short Description</label>
                <textarea
                  rows={2}
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                  placeholder="Fresh farm vegetables sourced daily..."
                />
              </div>

              {/* Badges & Toggles */}
              <div className="flex flex-wrap gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFreshToday}
                    onChange={(e) => setFormData({ ...formData, isFreshToday: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  Fresh Today
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isOrganic}
                    onChange={(e) => setFormData({ ...formData, isOrganic: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  Organic
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isBestSeller}
                    onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  Bestseller
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isCutVegetable}
                    onChange={(e) => setFormData({ ...formData, isCutVegetable: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  Cut Vegetable
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-md hover:bg-emerald-700 transition disabled:opacity-50"
                >
                  {submitting ? "Saving to Supabase..." : editingProduct ? "Save Changes" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
