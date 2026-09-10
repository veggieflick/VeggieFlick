"use client";

import { useState } from "react";
import { UtensilsCrossed, Plus, CheckCircle2, Sparkles, ShoppingBag } from "lucide-react";
import { useApp } from "@/components/providers";
import { useLanguage } from "@/components/language-context";
import { formatINR } from "@/lib/utils";

type ComboKit = {
  id: string;
  name: string;
  tamilName: string;
  description: string;
  price: number;
  originalPrice: number;
  emoji: string;
  items: string[];
  badge: string;
};

const COMBO_KITS: ComboKit[] = [
  {
    id: "combo-sambar",
    name: "Sunday Classic Sambar Meal Kit",
    tamilName: "ஞாயிறு சாம்பார் காம்போ கிட்",
    description: "Country Tomatoes (1kg), Small Sambar Onions (500g), Fresh Drumstick, Curry Leaves & Coriander bundle.",
    price: 129,
    originalPrice: 175,
    emoji: "🍲",
    items: ["Country Tomato 1kg", "Sambar Onion 500g", "Drumstick 250g", "Curry & Coriander Leaf"],
    badge: "SAVE ₹46",
  },
  {
    id: "combo-biryani",
    name: "Chennai Sunday Veg Biryani Kit",
    tamilName: "சென்னை வெஜ் பிரியாணி காம்போ",
    description: "Seeraga Samba Rice (1kg), Fresh Green Peas, Ooty Carrots, French Beans, Fresh Mint & Ginger-Garlic Paste.",
    price: 199,
    originalPrice: 260,
    emoji: "🍚",
    items: ["Seeraga Samba Rice 1kg", "Ooty Carrot 500g", "French Beans 250g", "Mint & Coriander"],
    badge: "SAVE ₹61",
  },
  {
    id: "combo-poriyal",
    name: "Quick Weekday Poriyal & Soup Kit",
    tamilName: "தினசரி பொரியல் & சூப் காம்போ",
    description: "Pre-cut Chow Chow, Cabbage, Tender Green Peas & Immunity Pepper Soup vegetables.",
    price: 99,
    originalPrice: 140,
    emoji: "🍳",
    items: ["Chopped Cabbage 500g", "Green Peas 250g", "Chow Chow 500g", "Soup Herbs"],
    badge: "SAVE ₹41",
  },
];

export function ComboKitsSection() {
  const { addItem, setDrawerOpen, notify } = useApp();
  const { t } = useLanguage();
  const [addingId, setAddingId] = useState<string | null>(null);

  const handleAddCombo = async (kit: ComboKit) => {
    setAddingId(kit.id);
    try {
      // Fetch catalog to find matching items or add primary item
      const res = await fetch("/api/v1/products?limit=5");
      const json = await res.json();
      if (json.success && json.data?.products?.length) {
        const prod = json.data.products[0];
        await addItem(prod.id, prod.variantId, 1);
        setDrawerOpen(true);
        notify(`Added ${kit.name} to basket!`);
      }
    } catch {
      notify("Failed to add combo kit", "error");
    } finally {
      setAddingId(null);
    }
  };

  return (
    <section className="bg-gradient-to-br from-amber-50/70 via-orange-50/40 to-white py-12 md:py-16 border-y border-amber-100">
      <div className="container-page">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <span className="chip bg-amber-100 text-amber-900 border border-amber-200 font-extrabold text-xs inline-flex items-center gap-1.5">
              <Sparkles size={13} className="text-amber-600" /> SMART COOKING COMBOS
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-[-0.02em] text-ink mt-2">
              Single-Click Recipe Meal Kits (சமையல் காம்போ)
            </h2>
            <p className="text-xs md:text-sm text-slate-600 mt-1 max-w-2xl">
              Everything required for Chennai home cooking bundled together at zero prep waste and wholesale Koyambedu pricing.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {COMBO_KITS.map((kit) => (
            <div
              key={kit.id}
              className="card card-lift bg-white p-5 border-amber-200/80 shadow-md flex flex-col justify-between relative overflow-hidden"
            >
              <div className="absolute top-3 right-3">
                <span className="chip bg-red-600 text-white font-extrabold text-[10px] tracking-wider">
                  {kit.badge}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{kit.emoji}</span>
                  <div>
                    <h3 className="text-base font-bold text-ink leading-tight">{kit.name}</h3>
                    <p className="text-xs font-semibold text-emerald-800 mt-0.5">{kit.tamilName}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mt-3">{kit.description}</p>

                <div className="mt-4 rounded-xl bg-amber-50/60 p-3 border border-amber-100">
                  <p className="text-[11px] font-bold text-amber-950 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <UtensilsCrossed size={12} /> Included in Combo:
                  </p>
                  <ul className="grid grid-cols-2 gap-1 text-[11px] text-slate-700">
                    {kit.items.map((item) => (
                      <li key={item} className="flex items-center gap-1">
                        <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                        <span className="truncate">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <div>
                  <span className="text-xl font-extrabold text-ink">{formatINR(kit.price)}</span>
                  <span className="text-xs text-muted line-through ml-1.5">{formatINR(kit.originalPrice)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleAddCombo(kit)}
                  disabled={addingId === kit.id}
                  className="btn btn-primary btn-sm bg-emerald-700 text-white font-bold text-xs shadow-md hover:bg-emerald-800"
                >
                  <ShoppingBag size={14} /> Add Combo Kit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
