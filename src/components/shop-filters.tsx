"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { SlidersHorizontal, Star, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Category = { id: string; name: string; slug: string; icon: string };

const SORTS = [
  { value: "popularity", label: "Popularity" },
  { value: "newest", label: "Newest first" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "discount", label: "Highest discount" },
  { value: "rating", label: "Customer rating" },
];

const TOGGLES = [
  { key: "organic", label: "Organic only" },
  { key: "bestSeller", label: "Best sellers" },
  { key: "freshToday", label: "Fresh today" },
  { key: "cut", label: "Cut & ready" },
  { key: "inStock", label: "In stock only" },
];

const PRICE_BANDS = [
  { label: "Under ₹50", min: 0, max: 50 },
  { label: "₹50 – ₹100", min: 50, max: 100 },
  { label: "₹100 – ₹200", min: 100, max: 200 },
  { label: "₹200 & above", min: 200, max: 5000 },
];

const DISCOUNTS = [10, 20, 30];
const RATINGS = [4, 4.5];

export function ShopFilters({ categories, total }: { categories: Category[]; total: number }) {
  const router = useRouter();
  const params = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  const update = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(params.toString());
      Object.entries(patch).forEach(([key, value]) => {
        if (value === null || value === "") next.delete(key);
        else next.set(key, value);
      });
      next.delete("page");
      router.push(`/shop?${next.toString()}`, { scroll: false });
    },
    [params, router],
  );

  const activeCategory = params.get("category");
  const activeSort = params.get("sort") ?? "popularity";
  const activeCount = Array.from(params.keys()).filter((key) => key !== "sort" && key !== "page").length;

  const panel = (
    <div className="grid gap-6">
      <div>
        <h3 className="mb-2.5 text-xs font-black uppercase tracking-wider text-muted">Category</h3>
        <div className="grid gap-1">
          <button
            type="button"
            onClick={() => update({ category: null })}
            className={`rounded-xl px-3 py-2 text-left text-sm font-semibold transition-all ${
              !activeCategory
                ? "bg-emerald-800 text-white shadow-sm"
                : "hover:bg-slate-100 text-slate-700"
            }`}
          >
            All categories
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => update({ category: category.slug })}
              className={`block w-full rounded-xl px-3 py-2 text-left text-sm font-medium transition-all ${
                activeCategory === category.slug
                  ? "bg-emerald-800 text-white font-bold shadow-sm"
                  : "hover:bg-slate-100 text-slate-700"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2.5 text-xs font-black uppercase tracking-wider text-muted">Price Range</h3>
        <div className="grid gap-1.5">
          {PRICE_BANDS.map((band) => {
            const active = params.get("minPrice") === String(band.min) && params.get("maxPrice") === String(band.max);
            return (
              <button
                key={band.label}
                type="button"
                onClick={() =>
                  update(
                    active
                      ? { minPrice: null, maxPrice: null }
                      : { minPrice: String(band.min), maxPrice: String(band.max) },
                  )
                }
                className={`rounded-xl px-3 py-2 text-left text-sm font-medium transition-all ${
                  active
                    ? "bg-emerald-100 text-emerald-950 font-bold border border-emerald-300"
                    : "bg-surface hover:bg-slate-100 text-slate-700 border border-line/60"
                }`}
              >
                {band.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="mb-2.5 text-xs font-black uppercase tracking-wider text-muted">Quick Filters</h3>
        <div className="grid gap-2">
          {TOGGLES.map((toggle) => {
            const active = params.get(toggle.key) === "true";
            return (
              <label
                key={toggle.key}
                className={`flex cursor-pointer items-center justify-between rounded-xl p-2.5 text-sm font-medium transition-all ${
                  active
                    ? "bg-emerald-50 text-emerald-950 font-bold border border-emerald-300"
                    : "hover:bg-surface text-slate-700 border border-transparent"
                }`}
              >
                <span>{toggle.label}</span>
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => update({ [toggle.key]: active ? null : "true" })}
                  className="h-4 w-4 rounded border-line accent-emerald-800 cursor-pointer"
                />
              </label>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="mb-2.5 text-xs font-black uppercase tracking-wider text-muted">Discount</h3>
        <div className="flex flex-wrap gap-2">
          {DISCOUNTS.map((value) => {
            const active = params.get("minDiscount") === String(value);
            return (
              <button
                key={value}
                type="button"
                onClick={() => update({ minDiscount: active ? null : String(value) })}
                className={`chip border transition-all ${
                  active
                    ? "border-emerald-700 bg-emerald-800 text-white font-bold"
                    : "border-line text-slate-700 hover:border-slate-400"
                }`}
              >
                {value}%+ off
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="mb-2.5 text-xs font-black uppercase tracking-wider text-muted">Rating</h3>
        <div className="flex flex-wrap gap-2">
          {RATINGS.map((value) => {
            const active = params.get("minRating") === String(value);
            return (
              <button
                key={value}
                type="button"
                onClick={() => update({ minRating: active ? null : String(value) })}
                className={`chip border transition-all ${
                  active
                    ? "border-emerald-700 bg-emerald-800 text-white font-bold"
                    : "border-line text-slate-700 hover:border-slate-400"
                }`}
              >
                <Star size={12} className="fill-amber-400 text-amber-400" strokeWidth={1.5} aria-hidden /> {value}+
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={() => router.push("/shop")}
        className="btn btn-outline w-full py-2.5 text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-100"
      >
        Clear all filters
      </button>
    </div>
  );

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">
          Showing <span className="font-extrabold text-slate-900">{total}</span> fresh items
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="btn btn-outline px-3.5 py-2 text-sm font-bold lg:hidden shadow-xs border-emerald-200 text-emerald-900 bg-emerald-50/50"
          >
            <SlidersHorizontal className="h-4 w-4 text-emerald-800" aria-hidden />
            Filters
            {activeCount > 0 && (
              <span className="ml-1 rounded-full bg-emerald-800 px-1.5 py-0.5 text-[10px] font-bold text-white">
                {activeCount}
              </span>
            )}
          </button>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <span className="hidden sm:inline">Sort by:</span>
            <select
              value={activeSort}
              onChange={(event) => update({ sort: event.target.value })}
              className="field w-auto py-1.5 px-3 text-sm font-bold border-slate-200 rounded-xl"
              aria-label="Sort products"
            >
              {SORTS.map((sort) => (
                <option key={sort.value} value={sort.value}>
                  {sort.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <aside className="hidden lg:block">
        <div className="card sticky top-32 max-h-[calc(100vh-10rem)] overflow-y-auto p-5 border-slate-200/80 shadow-xs bg-white/90 backdrop-blur">
          {panel}
        </div>
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-[70] lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute right-0 bottom-0 left-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl"
            >
              <div className="mb-4 flex items-center justify-between pb-3 border-b border-line">
                <h2 className="text-lg font-extrabold text-slate-900">Filter Produce</h2>
                <button
                  type="button"
                  aria-label="Close filters"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-5 w-5" aria-hidden />
                </button>
              </div>
              {panel}
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="btn btn-primary mt-6 w-full py-3.5 text-sm font-bold shadow-lg shadow-emerald-800/20"
              >
                Show {total} items
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
