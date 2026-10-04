"use client";

import { useState } from "react";
import { UtensilsCrossed, CheckCircle2, Sparkles, ShoppingBag } from "lucide-react";
import { useApp } from "@/components/providers";
import { formatINR } from "@/lib/utils";
import { motion } from "framer-motion";

type ComboKit = {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  emoji: string;
  items: string[];
  badge: string;
};

const COMBO_KITS: ComboKit[] = [
  {
    id: "combo-pulav",
    name: "Pulav Special Veggie Combo Kit",
    description: "Chopped Ooty Carrots, French Beans, Tender Green Peas, Potatoes & aromatic whole spices pouch.",
    price: 129,
    originalPrice: 180,
    emoji: "🍲",
    items: ["Chopped Carrot 250g", "French Beans 250g", "Green Peas 200g", "Whole Spices Pouch"],
    badge: "SAVE ₹51",
  },
  {
    id: "combo-biryani",
    name: "Vegetables Biriyani Special Kit",
    description: "Cleaned Cauliflower florets, Ooty Carrots, French Beans, Fresh Mint, Coriander & Birista fried onions.",
    price: 179,
    originalPrice: 240,
    emoji: "🍚",
    items: ["Cauliflower Florets 300g", "Cut Veggies 500g", "Fresh Mint & Coriander", "Biryani Spice Pack"],
    badge: "SAVE ₹61",
  },
  {
    id: "combo-aviyal",
    name: "Aviyal Combo (Traditional 7-Veg Cut Mix)",
    description: "Plantain, Drumstick, Senai Yam, Beans, Carrot, Yellow Pumpkin & Kovakkai cut mix with Grated Coconut.",
    price: 125,
    originalPrice: 170,
    emoji: "🥗",
    items: ["7-Veg Aviyal Cut Mix 500g", "Grated Coconut 100g", "Curry Leaves Bundle", "Green Chillies"],
    badge: "SAVE ₹45",
  },
  {
    id: "combo-bisibele",
    name: "Bisi Bele Bath Combo (With / Without Onion)",
    description: "Sambar-style cubed vegetables, toor dal, and stone-ground authentic Bisi Bele Bath masala powder.",
    price: 139,
    originalPrice: 190,
    emoji: "🍛",
    items: ["Cut Sambar Veggies 500g", "Shallots (Optional)", "Stone-ground Masala 50g", "Ghee Tempering Pack"],
    badge: "SAVE ₹51",
  },
];

export function ComboKitsSection() {
  const { addItem, setDrawerOpen, notify } = useApp();
  const [addingId, setAddingId] = useState<string | null>(null);

  const handleAddCombo = async (kit: ComboKit) => {
    setAddingId(kit.id);
    try {
      const res = await fetch("/api/v1/products?limit=5");
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        const prod = json.data[0];
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
    <section className="bg-gradient-to-br from-amber-50/70 via-orange-50/30 to-white py-12 md:py-16 border-y border-amber-100">
      <div className="container-page">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap items-center justify-between gap-4 mb-8"
        >
          <div>
            <span className="chip bg-amber-100 text-amber-900 border border-amber-200/90 font-extrabold text-xs inline-flex items-center gap-1.5 shadow-xs">
              <Sparkles size={13} className="text-amber-600" /> SMART COOKING COMBOS
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-[-0.02em] text-ink mt-2">
              Single-Click Recipe Meal Kits
            </h2>
            <p className="text-xs md:text-sm text-slate-600 mt-1 max-w-2xl">
              Everything required for home cooking bundled together at zero prep waste and wholesale pricing.
            </p>
          </div>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {COMBO_KITS.map((kit, index) => (
            <motion.div
              key={kit.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              className="card bg-white p-5 border-amber-200/90 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between relative overflow-hidden rounded-2xl"
            >
              <div className="absolute top-3 right-3">
                <span className="chip bg-gradient-to-r from-red-600 to-rose-600 text-white font-extrabold text-[10px] tracking-wider shadow-sm">
                  {kit.badge}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{kit.emoji}</span>
                  <div>
                    <h3 className="text-base font-bold text-ink leading-tight">{kit.name}</h3>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mt-3">{kit.description}</p>

                <div className="mt-4 rounded-xl bg-amber-50/60 p-3 border border-amber-100/80">
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
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={() => handleAddCombo(kit)}
                  disabled={addingId === kit.id}
                  className="btn btn-primary btn-sm bg-emerald-800 text-white font-bold text-xs shadow-md hover:bg-emerald-900 border-none"
                >
                  <ShoppingBag size={14} /> Add Combo Kit
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
