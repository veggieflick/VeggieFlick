"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Upload,
  Check,
  X,
  RefreshCw,
  Boxes,
  Save,
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
  "Vegetables Shopping",
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
  const [uploadingImageId, setUploadingImageId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedSuccessId, setSavedSuccessId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Form State for Add / Deep Edit Modal
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
      if (data.products && Array.isArray(data.products)) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error("Failed to load products:", err);
      showMessage("Notice: Syncing products with Supabase DB...", "error");
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

  // Inline edit handlers
  const handleInlineChange = (id: string, field: keyof Product, value: any) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  // Direct Per-Product Save Button Click
  const handleSaveProduct = async (product: Product) => {
    setSavingId(product.id);
    try {
      const res = await fetch(`/api/v1/admin/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: product.name,
          tamilName: product.tamilName,
          price: product.price,
          mrp: product.mrp,
          stock: product.availableStock,
          categoryName: product.categoryName,
          variantName: product.variantName,
          imageUrl: product.imageUrl,
          isOrganic: product.isOrganic,
          isBestSeller: product.isBestSeller,
          isFreshToday: product.isFreshToday,
          isCutVegetable: product.isCutVegetable,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSavedSuccessId(product.id);
        setTimeout(() => setSavedSuccessId(null), 3000);
        showMessage(`Saved "${product.name}" to Supabase DB & Server!`, "success");
      } else {
        throw new Error(data.error || "Save failed");
      }
    } catch (err) {
      console.error("Single save error:", err);
      showMessage(`Save failed: ${(err as Error).message}`, "error");
    } finally {
      setSavingId(null);
    }
  };

  // Single Image Upload for a specific product row
  const handleSingleImageUpload = async (productId: string, file: File) => {
    setUploadingImageId(productId);
    const body = new FormData();
    body.append("file", file);

    try {
      const res = await fetch("/api/v1/admin/upload", {
        method: "POST",
        body,
      });
      const data = await res.json();
      if (data.url) {
        handleInlineChange(productId, "imageUrl", data.url);
        showMessage("Photo uploaded! Click 'Save' to apply to Supabase DB.", "success");
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (err) {
      showMessage("Photo upload failed: " + (err as Error).message, "error");
    } finally {
      setUploadingImageId(null);
    }
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      tamilName: "",
      emoji: "🥬",
      categoryName: selectedCategory !== "All Categories" ? selectedCategory : "Fresh Vegetables",
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

  const handleSubmitModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.price <= 0) {
      showMessage("Please enter valid product name and price", "error");
      return;
    }

    setSubmitting(true);
    try {
      if (editingProduct) {
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
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } else {
        throw new Error(data.error || "Delete failed");
      }
    } catch (err) {
      showMessage("Delete failed: " + (err as Error).message, "error");
    }
  };

  // Filter products category-wise
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.tamilName && p.tamilName.includes(searchQuery)) ||
      (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === "All Categories" ||
      p.categoryName.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      (selectedCategory === "Fresh Vegetables" && p.categoryName === "Vegetables Shopping") ||
      (selectedCategory === "Vegetables Shopping" && p.categoryName === "Fresh Vegetables");

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      {/* Header Banner */}
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
              ⚡ Supabase DB Connected
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Total Products: {products.length}
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Product & Stock Catalog Manager
          </h1>
          <p className="text-sm text-slate-600">
            Edit price, stock, images & click <strong>Save</strong> per product for instant Supabase & Storefront sync.
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

      {/* Category Tabs Bar */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by product name, Tamil name (தமிழ்), or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {CATEGORIES.map((cat) => {
              const count =
                cat === "All Categories"
                  ? products.length
                  : products.filter(
                      (p) =>
                        p.categoryName.toLowerCase().includes(cat.toLowerCase()) ||
                        (cat === "Fresh Vegetables" && p.categoryName === "Vegetables Shopping") ||
                        (cat === "Vegetables Shopping" && p.categoryName === "Fresh Vegetables")
                    ).length;

              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-bold transition ${
                    selectedCategory === cat
                      ? "bg-emerald-700 text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] ${
                      selectedCategory === cat
                        ? "bg-emerald-800 text-emerald-100"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Category Header Title */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">
          {selectedCategory} <span className="text-sm font-normal text-slate-500">({filteredProducts.length} items)</span>
        </h2>
        <span className="text-xs text-slate-400">⚡ Direct inline edits with per-product Save button</span>
      </div>

      {/* Products Table with Per-Product Save Button */}
      {loading ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-slate-200 bg-white">
          <RefreshCw className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="mt-3 text-sm font-medium text-slate-600">Loading category products from Supabase DB...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center">
          <Boxes className="h-10 w-10 text-slate-300" />
          <h3 className="mt-2 text-base font-bold text-slate-800">No products found in "{selectedCategory}"</h3>
          <p className="text-sm text-slate-500">Click "Add New Product" to add items to this category.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase font-bold text-slate-500">
                <tr>
                  <th className="px-4 py-3.5">Image & Product</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Selling Price (₹)</th>
                  <th className="px-4 py-3.5">MRP (₹)</th>
                  <th className="px-4 py-3.5">Stock</th>
                  <th className="px-4 py-3.5">Flags</th>
                  <th className="px-4 py-3.5 text-right">Save & Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((p) => {
                  const isSaving = savingId === p.id;
                  const isSaved = savedSuccessId === p.id;
                  const isUploading = uploadingImageId === p.id;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/90 transition">
                      {/* Product Image & Name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative group flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                            {p.imageUrl ? (
                              <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                            ) : (
                              <span className="text-2xl">{p.emoji || "🥬"}</span>
                            )}
                            <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-slate-900/60 opacity-0 group-hover:opacity-100 transition text-white">
                              <Upload className="h-4 w-4" />
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={isUploading}
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (f) handleSingleImageUpload(p.id, f);
                                }}
                              />
                            </label>
                          </div>

                          <div className="space-y-1">
                            <input
                              type="text"
                              value={p.name}
                              onChange={(e) => handleInlineChange(p.id, "name", e.target.value)}
                              className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-sm font-bold text-slate-900 focus:border-emerald-500 focus:outline-none"
                            />
                            <input
                              type="text"
                              placeholder="Tamil Name (தமிழ்)"
                              value={p.tamilName || ""}
                              onChange={(e) => handleInlineChange(p.id, "tamilName", e.target.value)}
                              className="w-full rounded border border-slate-100 bg-slate-50 px-2 py-0.5 text-xs text-emerald-800 font-medium focus:bg-white focus:outline-none"
                            />
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3">
                        <select
                          value={p.categoryName}
                          onChange={(e) => handleInlineChange(p.id, "categoryName", e.target.value)}
                          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 focus:outline-none"
                        >
                          {CATEGORIES.filter((c) => c !== "All Categories").map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3">
                        <div className="relative w-24">
                          <span className="absolute left-2.5 top-1.5 text-xs font-bold text-slate-400">₹</span>
                          <input
                            type="number"
                            value={p.price}
                            onChange={(e) => handleInlineChange(p.id, "price", Number(e.target.value))}
                            className="w-full rounded border border-slate-200 bg-white pl-6 pr-2 py-1 text-sm font-bold text-emerald-800 focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                      </td>

                      {/* MRP */}
                      <td className="px-4 py-3">
                        <div className="relative w-24">
                          <span className="absolute left-2.5 top-1.5 text-xs text-slate-400">₹</span>
                          <input
                            type="number"
                            value={p.mrp}
                            onChange={(e) => handleInlineChange(p.id, "mrp", Number(e.target.value))}
                            className="w-full rounded border border-slate-200 bg-white pl-6 pr-2 py-1 text-sm text-slate-500 focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                      </td>

                      {/* Stock */}
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={p.availableStock}
                          onChange={(e) => handleInlineChange(p.id, "availableStock", Number(e.target.value))}
                          className={`w-20 rounded border px-2 py-1 text-xs font-bold focus:outline-none ${
                            p.availableStock > 20
                              ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                              : p.availableStock > 0
                              ? "border-amber-300 bg-amber-50 text-amber-900"
                              : "border-rose-300 bg-rose-50 text-rose-900"
                          }`}
                        />
                      </td>

                      {/* Badges / Flags */}
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          <button
                            type="button"
                            onClick={() => handleInlineChange(p.id, "isFreshToday", !p.isFreshToday)}
                            className={`rounded px-1.5 py-0.5 text-[10px] font-semibold transition ${
                              p.isFreshToday ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"
                            }`}
                          >
                            <Clock className="inline h-3 w-3" /> Fresh
                          </button>
                          <button
                            type="button"
                            onClick={() => handleInlineChange(p.id, "isOrganic", !p.isOrganic)}
                            className={`rounded px-1.5 py-0.5 text-[10px] font-semibold transition ${
                              p.isOrganic ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-400"
                            }`}
                          >
                            <Leaf className="inline h-3 w-3" /> Organic
                          </button>
                          <button
                            type="button"
                            onClick={() => handleInlineChange(p.id, "isBestSeller", !p.isBestSeller)}
                            className={`rounded px-1.5 py-0.5 text-[10px] font-semibold transition ${
                              p.isBestSeller ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-400"
                            }`}
                          >
                            <Flame className="inline h-3 w-3" /> Hot
                          </button>
                        </div>
                      </td>

                      {/* Per-Product Save Button & Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleSaveProduct(p)}
                            disabled={isSaving}
                            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold shadow-sm transition ${
                              isSaved
                                ? "bg-emerald-700 text-white"
                                : "bg-emerald-600 text-white hover:bg-emerald-700"
                            } disabled:opacity-50`}
                          >
                            {isSaving ? (
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            ) : isSaved ? (
                              <>
                                <Check className="h-3.5 w-3.5" /> Saved!
                              </>
                            ) : (
                              <>
                                <Save className="h-3.5 w-3.5" /> Save
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(p)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                            title="Advanced Edit Modal"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(p.id, p.name)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                            title="Delete Product"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Advanced Edit / Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingProduct ? "Edit Product Details" : "Add New Product"}
                </h2>
                <p className="text-xs text-slate-500">Changes save directly into Supabase PostgreSQL database.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitModal} className="mt-4 space-y-4">
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
                      Upload Photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) {
                            const body = new FormData();
                            body.append("file", f);
                            fetch("/api/v1/admin/upload", { method: "POST", body })
                              .then((r) => r.json())
                              .then((d) => d.url && setFormData((prev) => ({ ...prev, imageUrl: d.url })));
                          }
                        }}
                        className="hidden"
                      />
                    </label>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">or URL:</span>
                      <input
                        type="text"
                        placeholder="https://..."
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        className="flex-1 rounded-md border border-slate-200 px-2.5 py-1 text-xs focus:outline-none"
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
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Tamil Name (தமிழ்)</label>
                  <input
                    type="text"
                    value={formData.tamilName}
                    onChange={(e) => setFormData({ ...formData, tamilName: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none font-medium"
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
