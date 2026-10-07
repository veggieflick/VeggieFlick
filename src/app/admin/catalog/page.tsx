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
  Search,
  Check,
  Star,
  Tag,
  Boxes,
} from "lucide-react";
import { useApp } from "@/components/providers";
import { formatDateIST, formatINR } from "@/lib/utils";
import { StatusPill } from "@/components/ui/primitives";
import { FALLBACK_PRODUCTS } from "@/lib/services/catalog";

type ProductRow = {
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
  { name: "Fruit Salad", url: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&q=80" },
];

const INITIAL_ALL_PRODUCTS: ProductRow[] = FALLBACK_PRODUCTS.map((p, idx) => ({
  id: p.id,
  name: p.name,
  tamilName: p.tamilName ?? "",
  slug: p.slug,
  sku: `VF-${String(idx + 1001).padStart(4, "0")}`,
  emoji: p.emoji,
  status: "active",
  categoryName: p.categoryName,
  isOrganic: p.isOrganic,
  isFeatured: p.isFeatured,
  isBestSeller: p.isBestSeller,
  price: String(p.price.toFixed(2)),
  mrp: String(p.mrp.toFixed(2)),
  weight: p.variantName,
  unit: p.unit,
  stock: p.availableStock,
  imageUrl: p.imageUrl ?? PRESET_PRODUCE_IMAGES[0].url,
  images: [
    p.imageUrl ?? PRESET_PRODUCE_IMAGES[0].url,
    "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80",
    "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&q=80",
  ],
  shortDescription: p.shortDescription ?? "",
}));

const TABS = ["products", "inventory", "coupons", "spoilage"] as const;

function CatalogWorkspace() {
  const params = useSearchParams();
  const { notify } = useApp();
  const [tab, setTab] = useState<(typeof TABS)[number]>(
    (params.get("tab") as (typeof TABS)[number]) ?? "products"
  );

  const [products, setProducts] = useState<ProductRow[]>(INITIAL_ALL_PRODUCTS);
  const [search, setSearch] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All");

  const [inventory, setInventory] = useState<InventoryRow[]>([]);
  const [coupons, setCoupons] = useState<CouponRow[]>([]);
  const [categories] = useState<Category[]>([
    { id: "cat-1", name: "Vegetables Shopping" },
    { id: "cat-2", name: "Fruit Salads" },
    { id: "cat-3", name: "Veg Salads" },
    { id: "cat-4", name: "Fruits Cutting & Combo Pack" },
    { id: "cat-5", name: "Fresh Vegetables" },
    { id: "cat-6", name: "Leafy Vegetables" },
  ]);
  const [loading, setLoading] = useState(true);

  // New & Edit Product State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductRow | null>(null);

  // Multi-image list for product modal (supports 2-3 images)
  const [modalImages, setModalImages] = useState<string[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, i, c] = await Promise.all([
        fetch("/api/v1/admin/catalog?view=products&limit=50").then((r) => r.json()),
        fetch("/api/v1/admin/catalog?view=inventory&limit=50").then((r) => r.json()),
        fetch("/api/v1/admin/coupons").then((r) => r.json()),
      ]);
      if (p?.success && Array.isArray(p.data) && p.data.length > 0) {
        setProducts(p.data as ProductRow[]);
      }
      if (i?.success && Array.isArray(i.data) && i.data.length > 0) {
        setInventory(i.data as InventoryRow[]);
      }
      if (c?.success) setCoupons(c.data as CouponRow[]);
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

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.tamilName && p.tamilName.includes(search)) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategoryFilter === "All" || p.categoryName === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Handle direct file upload via FileReader for multi-images
  const handleImageFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            setModalImages((prev) => [...prev, reader.result as string].slice(0, 5));
            notify("Product image added!");
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleAddPresetImage = (url: string) => {
    if (!modalImages.includes(url)) {
      setModalImages((prev) => [...prev, url].slice(0, 5));
      notify("Sample image added!");
    }
  };

  const handleRemoveImage = (index: number) => {
    setModalImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSetPrimaryImage = (index: number) => {
    setModalImages((prev) => {
      const copy = [...prev];
      const selected = copy.splice(index, 1)[0];
      return [selected, ...copy];
    });
    notify("Primary product cover image set!");
  };

  const handleCreateProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name"));
    const tamilName = String(data.get("tamilName") || "");
    const price = Number(data.get("sellingPrice"));
    const mrp = Number(data.get("mrp"));
    const stock = Number(data.get("stock") || 50);
    const weight = String(data.get("weight") || "250 g");

    const finalImages = modalImages.length > 0 ? modalImages : [PRESET_PRODUCE_IMAGES[0].url];

    const newProd: ProductRow = {
      id: `prod-${Date.now()}`,
      name,
      tamilName,
      slug: name.toLowerCase().replace(/\s+/g, "-"),
      sku: `VF-${Math.floor(1000 + Math.random() * 9000)}`,
      emoji: String(data.get("emoji") || "🥬"),
      status: "active",
      categoryName: String(data.get("categoryName") || "Vegetables Shopping"),
      isOrganic: data.get("isOrganic") === "on",
      isFeatured: data.get("isFeatured") === "on",
      isBestSeller: data.get("isBestSeller") === "on",
      price: price.toFixed(2),
      mrp: mrp.toFixed(2),
      weight,
      unit: "g",
      stock,
      imageUrl: finalImages[0],
      images: finalImages,
      shortDescription: String(data.get("shortDescription") || ""),
    };

    setProducts([newProd, ...products]);
    setShowAddModal(false);
    setModalImages([]);
    notify(`Product "${newProd.name}" published to catalog!`);
  };

  const handleUpdateProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingProduct) return;

    const data = new FormData(e.currentTarget);
    const name = String(data.get("name"));
    const tamilName = String(data.get("tamilName") || "");
    const price = Number(data.get("sellingPrice"));
    const mrp = Number(data.get("mrp"));
    const stock = Number(data.get("stock"));
    const weight = String(data.get("weight") || editingProduct.weight || "250 g");

    const finalImages = modalImages.length > 0 ? modalImages : [editingProduct.imageUrl || PRESET_PRODUCE_IMAGES[0].url];

    const updated: ProductRow = {
      ...editingProduct,
      name,
      tamilName,
      categoryName: String(data.get("categoryName")),
      emoji: String(data.get("emoji")),
      price: price.toFixed(2),
      mrp: mrp.toFixed(2),
      weight,
      stock,
      isOrganic: data.get("isOrganic") === "on",
      isFeatured: data.get("isFeatured") === "on",
      isBestSeller: data.get("isBestSeller") === "on",
      status: String(data.get("status")),
      imageUrl: finalImages[0],
      images: finalImages,
      shortDescription: String(data.get("shortDescription")),
    };

    setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? updated : p)));
    setEditingProduct(null);
    setModalImages([]);
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Boxes className="text-brand-600" /> Catalogue & Product Inventory Manager ({products.length} Products)
          </h1>
          <p className="text-sm text-slate-500">
            Edit product names, pricing (MRP/Selling), weights & grams (250g, 500g, 1kg), attach 2-3 product images, and manage category stocks.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setModalImages([]);
            setShowAddModal(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition"
        >
          <Plus size={18} /> Add New Produce Item
        </button>
      </header>

      {/* Workspace Tabs & Search/Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex gap-2">
          {TABS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              className={`px-4 py-2 text-xs font-bold rounded-xl capitalize transition ${
                tab === item
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {tab === "products" && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, Tamil or SKU..."
                className="rounded-xl border border-slate-200 pl-8 pr-3 py-1.5 text-xs text-slate-900 w-64 focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-800 focus:border-emerald-600 focus:outline-none"
            >
              <option value="All">All Categories ({products.length})</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500 bg-white rounded-2xl border border-slate-200">
          <Loader2 className="h-5 w-5 animate-spin text-brand-600" /> Loading all produce items…
        </div>
      )}

      {/* PRODUCTS TAB */}
      {!loading && tab === "products" && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Produce Photos & Name</th>
                  <th className="px-6 py-3.5">Weight / Unit</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Price / MRP</th>
                  <th className="px-6 py-3.5">Stock</th>
                  <th className="px-6 py-3.5">Flags & Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4 flex items-center gap-3">
                      {/* Photo Thumbnail Strip */}
                      <div className="flex items-center -space-x-2">
                        {(product.images && product.images.length > 0
                          ? product.images.slice(0, 3)
                          : [product.imageUrl || PRESET_PRODUCE_IMAGES[0].url]
                        ).map((img, i) => (
                          <div
                            key={i}
                            className="relative h-10 w-10 shrink-0 rounded-lg bg-slate-100 overflow-hidden border-2 border-white shadow-xs"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={img} alt={product.name} className="h-full w-full object-cover" />
                          </div>
                        ))}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 text-xs">{product.name}</span>
                          {product.tamilName && (
                            <span className="text-[11px] text-slate-400">({product.tamilName})</span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono">SKU: {product.sku}</p>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-bold text-slate-800">
                      <span className="inline-flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-md text-xs">
                        {product.weight || "250 g"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-700 font-semibold">{product.categoryName}</td>

                    <td className="px-6 py-4">
                      <span className="font-extrabold text-slate-900 text-xs">
                        {formatINR(product.price)}
                      </span>{" "}
                      <span className="text-[10px] text-slate-400 line-through">
                        {formatINR(product.mrp)}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          (product.stock ?? 0) > 20
                            ? "bg-emerald-50 text-emerald-800"
                            : (product.stock ?? 0) > 0
                            ? "bg-amber-50 text-amber-800"
                            : "bg-red-50 text-red-800"
                        }`}
                      >
                        {product.stock ?? 0} in stock
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {product.isOrganic && (
                          <span className="bg-emerald-100 text-emerald-900 text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                            Organic
                          </span>
                        )}
                        {product.isBestSeller && (
                          <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                            Best Seller
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProduct(product);
                            setModalImages(
                              product.images && product.images.length > 0
                                ? product.images
                                : [product.imageUrl || PRESET_PRODUCE_IMAGES[0].url]
                            );
                          }}
                          className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-brand-700 transition"
                          title="Edit Product Details & Images"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(product.id, product.name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                          title="Delete Product"
                        >
                          <Trash2 size={15} />
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
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl space-y-4 my-8 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="text-brand-600" size={18} /> Add New Produce Item
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              {/* Multi-Image Upload Section (2-3 Images) */}
              <div className="rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/40 p-4 text-center space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Upload size={14} className="text-emerald-700" /> Multi-Image Upload (Attach 2-3 Photos)
                  </p>
                  <span className="text-[10px] text-slate-500 font-semibold">{modalImages.length} attached</span>
                </div>

                {/* Thumbnails list */}
                <div className="flex flex-wrap items-center justify-center gap-3 min-h-[5rem]">
                  {modalImages.map((img, idx) => (
                    <div key={idx} className="relative h-20 w-20 rounded-xl overflow-hidden border-2 border-emerald-600 shadow-sm bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt={`Preview ${idx}`} className="h-full w-full object-cover" />
                      {idx === 0 && (
                        <span className="absolute top-1 left-1 bg-emerald-700 text-white text-[9px] font-black px-1 rounded">
                          Cover
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 rounded-full bg-slate-900/80 p-0.5 text-white hover:bg-rose-600"
                      >
                        <X size={10} />
                      </button>
                      {idx !== 0 && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimaryImage(idx)}
                          className="absolute bottom-1 left-1 right-1 bg-slate-900/90 text-white text-[8px] font-bold py-0.5 rounded text-center"
                        >
                          Make Cover
                        </button>
                      )}
                    </div>
                  ))}

                  <label className="h-20 w-20 rounded-xl border-2 border-dashed border-emerald-400 bg-white flex flex-col items-center justify-center cursor-pointer hover:bg-emerald-50 text-emerald-800 font-bold">
                    <Plus size={20} />
                    <span className="text-[10px]">Add Photo</span>
                    <input type="file" accept="image/*" multiple onChange={handleImageFileAdd} className="hidden" />
                  </label>
                </div>

                {/* Quick preset images */}
                <div className="pt-1">
                  <p className="text-[11px] font-semibold text-slate-500 mb-1">Quick Add Sample Produce Photos:</p>
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {PRESET_PRODUCE_IMAGES.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => handleAddPresetImage(preset.url)}
                        className="text-[11px] bg-white px-2 py-0.5 rounded-lg border border-slate-200 hover:border-emerald-600 font-semibold text-slate-700"
                      >
                        + {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Product Info Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Product Name (English)</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="e.g. Cut Green Beans"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tamil Name (தமிழ்)</label>
                  <input
                    type="text"
                    name="tamilName"
                    placeholder="e.g. நறுக்கிய பீன்ஸ்"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select name="categoryName" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 font-semibold">
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Weight / Grams (e.g. 250 g, 500 g, 1 kg)</label>
                  <input
                    type="text"
                    name="weight"
                    defaultValue="250 g"
                    placeholder="e.g. 250 g, 500 g, 1 kg, 1 bunch"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">MRP (₹)</label>
                  <input
                    type="number"
                    name="mrp"
                    defaultValue={45}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-bold text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    name="sellingPrice"
                    defaultValue={34}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-bold text-slate-900 text-emerald-800"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stock Count</label>
                  <input
                    type="number"
                    name="stock"
                    defaultValue={100}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-bold text-slate-900"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-1">
                <label className="flex items-center gap-1.5 font-bold text-slate-700 cursor-pointer">
                  <input type="checkbox" name="isOrganic" className="h-4 w-4 rounded accent-emerald-600" />
                  Certified Organic
                </label>
                <label className="flex items-center gap-1.5 font-bold text-slate-700 cursor-pointer">
                  <input type="checkbox" name="isBestSeller" className="h-4 w-4 rounded accent-amber-600" />
                  Best Seller
                </label>
                <label className="flex items-center gap-1.5 font-bold text-slate-700 cursor-pointer">
                  <input type="checkbox" name="isFeatured" className="h-4 w-4 rounded accent-blue-600" />
                  Featured Item
                </label>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Short Description</label>
                <input
                  type="text"
                  name="shortDescription"
                  placeholder="Tender beans precision chopped, ready for poriyal or stir fry."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-600 px-5 py-2 font-bold text-white hover:bg-brand-700 shadow-sm"
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
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl space-y-4 my-8 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Pencil className="text-brand-600" size={18} /> Edit Product: {editingProduct.name}
              </h2>
              <button onClick={() => setEditingProduct(null)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateProduct} className="space-y-4">
              {/* Multi-Image Upload Section */}
              <div className="rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/40 p-4 text-center space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Upload size={14} className="text-emerald-700" /> Multi-Image Upload (Attach 2-3 Photos)
                  </p>
                  <span className="text-[10px] text-slate-500 font-semibold">{modalImages.length} photos attached</span>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 min-h-[5rem]">
                  {modalImages.map((img, idx) => (
                    <div key={idx} className="relative h-20 w-20 rounded-xl overflow-hidden border-2 border-emerald-600 shadow-sm bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt={`Preview ${idx}`} className="h-full w-full object-cover" />
                      {idx === 0 && (
                        <span className="absolute top-1 left-1 bg-emerald-700 text-white text-[9px] font-black px-1 rounded">
                          Cover
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 rounded-full bg-slate-900/80 p-0.5 text-white hover:bg-rose-600"
                      >
                        <X size={10} />
                      </button>
                      {idx !== 0 && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimaryImage(idx)}
                          className="absolute bottom-1 left-1 right-1 bg-slate-900/90 text-white text-[8px] font-bold py-0.5 rounded text-center"
                        >
                          Make Cover
                        </button>
                      )}
                    </div>
                  ))}

                  <label className="h-20 w-20 rounded-xl border-2 border-dashed border-emerald-400 bg-white flex flex-col items-center justify-center cursor-pointer hover:bg-emerald-50 text-emerald-800 font-bold">
                    <Plus size={20} />
                    <span className="text-[10px]">Add Photo</span>
                    <input type="file" accept="image/*" multiple onChange={handleImageFileAdd} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Product Info Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Product Name (English)</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingProduct.name}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tamil Name (தமிழ்)</label>
                  <input
                    type="text"
                    name="tamilName"
                    defaultValue={editingProduct.tamilName || ""}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    name="categoryName"
                    defaultValue={editingProduct.categoryName}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 font-semibold"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Weight / Grams (e.g. 250 g, 500 g, 1 kg)</label>
                  <input
                    type="text"
                    name="weight"
                    defaultValue={editingProduct.weight || "250 g"}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">MRP (₹)</label>
                  <input
                    type="number"
                    name="mrp"
                    defaultValue={Number(editingProduct.mrp)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-bold text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    name="sellingPrice"
                    defaultValue={Number(editingProduct.price)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-bold text-slate-900 text-emerald-800"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stock Count</label>
                  <input
                    type="number"
                    name="stock"
                    defaultValue={editingProduct.stock ?? 0}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-bold text-slate-900"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 font-bold text-slate-700 cursor-pointer">
                    <input type="checkbox" name="isOrganic" defaultChecked={editingProduct.isOrganic} className="h-4 w-4 rounded accent-emerald-600" />
                    Organic
                  </label>
                  <label className="flex items-center gap-1.5 font-bold text-slate-700 cursor-pointer">
                    <input type="checkbox" name="isBestSeller" defaultChecked={editingProduct.isBestSeller} className="h-4 w-4 rounded accent-amber-600" />
                    Best Seller
                  </label>
                  <label className="flex items-center gap-1.5 font-bold text-slate-700 cursor-pointer">
                    <input type="checkbox" name="isFeatured" defaultChecked={editingProduct.isFeatured} className="h-4 w-4 rounded accent-blue-600" />
                    Featured
                  </label>
                </div>

                <div>
                  <label className="font-bold text-slate-700 mr-2">Status:</label>
                  <select name="status" defaultValue={editingProduct.status} className="rounded-xl border border-slate-200 px-3 py-1 font-bold text-slate-900">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Short Description</label>
                <input
                  type="text"
                  name="shortDescription"
                  defaultValue={editingProduct.shortDescription || ""}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-600 px-5 py-2 font-bold text-white hover:bg-brand-700 shadow-sm"
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
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Produce Item</th>
                  <th className="px-6 py-3.5">Warehouse Hub</th>
                  <th className="px-6 py-3.5">Reserved</th>
                  <th className="px-6 py-3.5">Reorder Threshold</th>
                  <th className="px-6 py-3.5">Available Stock</th>
                  <th className="px-6 py-3.5 text-right">Quick Stock Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {products.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4 font-bold text-slate-900">{row.name}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">Chennai Central Hub (KK Nagar)</td>
                    <td className="px-6 py-4 text-slate-600 font-bold">8 units</td>
                    <td className="px-6 py-4 text-slate-600 font-bold">20 units</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          (row.stock ?? 0) === 0
                            ? "bg-red-100 text-red-800"
                            : (row.stock ?? 0) <= 20
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {row.stock ?? 0} units
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setEditingProduct(row);
                          setModalImages([row.imageUrl || PRESET_PRODUCE_IMAGES[0].url]);
                        }}
                        className="text-xs font-bold text-brand-700 hover:underline"
                      >
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminCatalogPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-sm text-slate-500">Loading produce catalogue…</div>}>
      <CatalogWorkspace />
    </Suspense>
  );
}
