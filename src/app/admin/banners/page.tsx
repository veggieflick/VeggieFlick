"use client";

import { useState } from "react";
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Upload,
  Sparkles,
  Eye,
  Save,
  Megaphone,
  Layers,
  CheckCircle2,
  X,
  ArrowRight,
} from "lucide-react";
import { useApp } from "@/components/providers";

type HomepageBanner = {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  ctaText: string;
  ctaLink: string;
  imageUrl: string;
  bgGradient: string;
  isActive: boolean;
  order: number;
};

const INITIAL_BANNERS: HomepageBanner[] = [
  {
    id: "banner-1",
    title: "Fresh Ooty Cut Veggies & Gourmet Meal Kits",
    subtitle: "Cleaned, Ozonated & Chopped Daily at Koyambedu Hub. 18-Min Delivery to K.K. Nagar & Ashok Nagar.",
    badge: "⚡ FAST 10 KM DELIVERY",
    ctaText: "Shop Cut Veggies Now",
    ctaLink: "/shop?category=vegetables-shopping",
    imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1200&q=80",
    bgGradient: "from-emerald-900 via-emerald-800 to-teal-900",
    isActive: true,
    order: 1,
  },
  {
    id: "banner-2",
    title: "100% Organic Sprouts & Chilled Fruit Salads",
    subtitle: "Zero Preservatives. Packed in Food-Grade Ozonated Containers for Peak Freshness.",
    badge: "🌿 CERTIFIED ORGANIC",
    ctaText: "Explore Fruit Salads",
    ctaLink: "/shop?category=fruit-salads",
    imageUrl: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=1200&q=80",
    bgGradient: "from-amber-900 via-orange-800 to-rose-900",
    isActive: true,
    order: 2,
  },
  {
    id: "banner-3",
    title: "No-Tear Peeled Shallots & Garlic Preps",
    subtitle: "Save 30 Minutes Kitchen Time Every Single Day. Whole Small Onions Peeled with Zero Spoilage.",
    badge: "🔥 KITCHEN TIME SAVER",
    ctaText: "Get Peeled Mix (₹55)",
    ctaLink: "/product/cut-peeled-onion-garlic",
    imageUrl: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=1200&q=80",
    bgGradient: "from-slate-900 via-purple-900 to-slate-900",
    isActive: true,
    order: 3,
  },
];

export default function AdminBannersPage() {
  const { notify } = useApp();
  const [banners, setBanners] = useState<HomepageBanner[]>(INITIAL_BANNERS);
  const [announcementText, setAnnouncementText] = useState(
    "🚀 Fresh Harvest Special: Free Garlic Mix Pack on orders above ₹499! 18-min delivery across K.K. Nagar."
  );
  const [announcementActive, setAnnouncementActive] = useState(true);

  // Edit / Add Banner Modal State
  const [editingBanner, setEditingBanner] = useState<HomepageBanner | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const handleToggleBanner = (id: string) => {
    setBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, isActive: !b.isActive } : b))
    );
    notify("Banner display status updated!");
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result as string);
        notify("Banner image file uploaded successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveBanner = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const title = String(data.get("title"));
    const subtitle = String(data.get("subtitle"));
    const badge = String(data.get("badge"));
    const ctaText = String(data.get("ctaText"));
    const ctaLink = String(data.get("ctaLink"));
    const imageUrl = bannerPreview || String(data.get("imageUrl")) || INITIAL_BANNERS[0].imageUrl;

    if (editingBanner) {
      setBanners((prev) =>
        prev.map((b) =>
          b.id === editingBanner.id
            ? { ...b, title, subtitle, badge, ctaText, ctaLink, imageUrl }
            : b
        )
      );
      notify(`Banner "${title}" updated!`);
    } else {
      const newBanner: HomepageBanner = {
        id: `banner-${Date.now()}`,
        title,
        subtitle,
        badge,
        ctaText,
        ctaLink,
        imageUrl,
        bgGradient: "from-emerald-900 via-emerald-800 to-teal-900",
        isActive: true,
        order: banners.length + 1,
      };
      setBanners([...banners, newBanner]);
      notify(`New banner "${title}" added to homepage slider!`);
    }

    setEditingBanner(null);
    setIsAddingNew(false);
    setBannerPreview(null);
  };

  const handleDeleteBanner = (id: string) => {
    if (confirm("Are you sure you want to delete this homepage banner?")) {
      setBanners((prev) => prev.filter((b) => b.id !== id));
      notify("Banner removed from slider.");
    }
  };

  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    notify("Homepage Top Announcement Bar updated live!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Storefront Banners & Hero Content Manager
          </h1>
          <p className="text-sm text-slate-500">
            Upload custom homepage promotional banners, set CTA buttons, and edit live announcement ticker bars.
          </p>
        </div>
        <button
          onClick={() => {
            setBannerPreview(null);
            setEditingBanner(null);
            setIsAddingNew(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition"
        >
          <Plus size={18} /> Add New Homepage Banner
        </button>
      </div>

      {/* Top Announcement Bar Editor */}
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
          <div className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-emerald-800" />
            <h2 className="font-extrabold text-emerald-950 text-sm">
              Live Storefront Announcement Bar
            </h2>
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-emerald-900">
            <input
              type="checkbox"
              checked={announcementActive}
              onChange={(e) => setAnnouncementActive(e.target.checked)}
              className="h-4 w-4 rounded accent-emerald-700"
            />
            Display Announcement Ticker
          </label>
        </div>

        <form onSubmit={handleSaveAnnouncement} className="flex gap-3">
          <input
            type="text"
            value={announcementText}
            onChange={(e) => setAnnouncementText(e.target.value)}
            className="flex-1 rounded-xl border border-emerald-300 bg-white px-4 py-2 text-xs font-semibold text-slate-900 focus:border-emerald-600 focus:outline-none"
            required
          />
          <button
            type="submit"
            className="rounded-xl bg-emerald-800 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-900 transition"
          >
            Save Ticker Text
          </button>
        </form>
      </div>

      {/* Banners Grid List */}
      <div className="grid gap-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Layers className="text-brand-600" size={18} /> Homepage Hero Slider Banners ({banners.length})
          </h2>
          <span className="text-xs text-slate-500 font-medium">Drag or toggle to reorder</span>
        </div>

        <div className="grid gap-6">
          {banners.map((banner, idx) => (
            <div
              key={banner.id}
              className={`rounded-2xl border bg-white p-5 shadow-xs transition ${
                banner.isActive ? "border-slate-200" : "border-slate-200 opacity-60 bg-slate-50"
              }`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                {/* Banner Visual Preview */}
                <div className="relative h-44 rounded-xl overflow-hidden border border-slate-200 group bg-slate-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className="h-full w-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent p-4 flex flex-col justify-end text-white">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 bg-black/50 px-2 py-0.5 rounded w-fit mb-1">
                      {banner.badge}
                    </span>
                    <p className="text-xs font-black line-clamp-1">{banner.title}</p>
                    <p className="text-[10px] text-slate-300 line-clamp-1 mt-0.5">{banner.subtitle}</p>
                  </div>
                  <span className="absolute top-2 left-2 rounded-full bg-slate-900/80 px-2 py-0.5 text-[10px] font-extrabold text-white">
                    Slide #{idx + 1}
                  </span>
                </div>

                {/* Banner Content Details */}
                <div className="lg:col-span-2 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
                      {banner.badge}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleBanner(banner.id)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                          banner.isActive
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {banner.isActive ? "Published" : "Draft (Hidden)"}
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">{banner.title}</h3>
                    <p className="text-slate-600 mt-0.5 line-clamp-2">{banner.subtitle}</p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-slate-500">
                    <span className="font-semibold text-slate-700 flex items-center gap-1">
                      CTA Button: <strong className="text-slate-900">{banner.ctaText}</strong> ({banner.ctaLink})
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingBanner(banner);
                          setBannerPreview(banner.imageUrl);
                        }}
                        className="rounded-lg bg-slate-100 px-3 py-1.5 font-bold text-slate-700 hover:bg-slate-200 transition"
                      >
                        Edit Banner Details
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteBanner(banner.id)}
                        className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50 transition"
                        title="Delete Banner"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Add / Edit Banner */}
      {(isAddingNew || editingBanner) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ImageIcon className="text-brand-600" />
                {editingBanner ? `Edit Banner: ${editingBanner.title}` : "Add New Homepage Hero Banner"}
              </h2>
              <button
                onClick={() => {
                  setIsAddingNew(false);
                  setEditingBanner(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="space-y-4 text-xs">
              {/* Direct Banner Image Upload */}
              <div className="rounded-2xl border-2 border-dashed border-brand-200 bg-brand-50/40 p-4 text-center space-y-3">
                <p className="font-bold text-slate-800 flex items-center justify-center gap-2">
                  <Upload size={16} className="text-brand-600" /> Direct Banner Photo Upload
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <div className="relative h-28 w-48 rounded-xl overflow-hidden border-2 border-brand-500 shadow-md bg-slate-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={bannerPreview || editingBanner?.imageUrl || INITIAL_BANNERS[0].imageUrl}
                      alt="Banner Preview"
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
                    <p className="text-[11px] text-slate-500">High-resolution horizontal hero banner image (1200x400)</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Banner Headline Title</label>
                <input
                  type="text"
                  name="title"
                  defaultValue={editingBanner?.title || ""}
                  placeholder="e.g. Fresh Cut Veggies Delivered in 18 Mins"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Subtitle / Promotional Description</label>
                <textarea
                  name="subtitle"
                  rows={2}
                  defaultValue={editingBanner?.subtitle || ""}
                  placeholder="Ozonated washed, precision chopped produce from Koyambedu market."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Badge Tag</label>
                  <input
                    type="text"
                    name="badge"
                    defaultValue={editingBanner?.badge || "⚡ FAST 10 KM DELIVERY"}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">CTA Button Label</label>
                  <input
                    type="text"
                    name="ctaText"
                    defaultValue={editingBanner?.ctaText || "Shop Cut Veggies"}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Link URL</label>
                  <input
                    type="text"
                    name="ctaLink"
                    defaultValue={editingBanner?.ctaLink || "/shop"}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNew(false);
                    setEditingBanner(null);
                  }}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-600 px-5 py-2 font-bold text-white hover:bg-brand-700 shadow-sm"
                >
                  Save & Publish Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
