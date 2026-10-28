"use client";

import { useState } from "react";
import Image from "next/image";
import { UtensilsCrossed, CheckCircle2, Sparkles, ShoppingBag, MessageCircle, Scale } from "lucide-react";
import { useApp } from "@/components/providers";
import { formatINR } from "@/lib/utils";
import { motion } from "framer-motion";
import { CustomIngredientModal, COMBO_INGREDIENTS } from "@/components/custom-ingredient-modal";

type ComboKit = {
  id: string;
  productId: string;
  variantId: string;
  name: string;
  tamilName: string;
  description: string;
  price: number;
  originalPrice: number;
  emoji: string;
  imageUrl?: string;
  items: string[];
  badge: string;
  comboKey: "combo-biryani" | "combo-aviyal" | "combo-bisibele" | "combo-pulav";
};

const COMBO_KITS: ComboKit[] = [
  {
    id: "combo-biryani",
    comboKey: "combo-biryani",
    productId: "4a088110-5ba9-4ce2-915d-466ef4a46576",
    variantId: "a9d99e65-f0f0-48ea-b09d-3dd867b58b10",
    name: "Vegetable Biriyani Cutted Vegetable Combo",
    tamilName: "காய்கறி பிரியாணி கிட்",
    description: "Full Biriyani cut pack with Big Onion slices, Tomato, Chilli, Carrot, Beans, Peas, Potato, Ginger, Garlic.",
    price: 179,
    originalPrice: 240,
    emoji: "",
    imageUrl: "/images/products/vegetables-biryani-special-kit.png",
    items: [
      "Big Onion slices",
      "Tomato",
      "Chilli",
      "Carrot",
      "Beans",
      "Peas",
      "Potato",
      "Ginger",
      "Garlic",
    ],
    badge: "SELECT KG-WISE",
  },
  {
    id: "combo-aviyal",
    comboKey: "combo-aviyal",
    productId: "b0a06688-d930-4fdf-9aab-98cc89fc806f",
    variantId: "e07c2b17-802e-4db6-966f-67ce6b382d47",
    name: "Aviyal (Traditional Cut Mix)",
    tamilName: "அவியல் காய்கறி கிட்",
    description: "Authentic Kerala & Tamil aviyal vegetable mix sliced in traditional batons.",
    price: 125,
    originalPrice: 170,
    emoji: "",
    imageUrl: "/images/products/traditional-aviyal-7-veggie-cut-mix.png",
    items: [
      "Elephant Foot Yam",
      "Drumstick",
      "Carrot",
      "Beans",
      "Pusanikai",
      "Valaikai",
      "Avaraikai",
    ],
    badge: "SELECT KG-WISE",
  },
  {
    id: "combo-bisibele",
    comboKey: "combo-bisibele",
    productId: "3b478555-9b16-4f14-a92b-364d4858e8cc",
    variantId: "2f996fc0-6d23-4592-8c95-68d1728164df",
    name: "Bisibella Bath Kit",
    tamilName: "பிசிபேள பாத் கிட்",
    description: "Complete authentic Bisi Bele Bath veggie mix cut and ready to boil.",
    price: 139,
    originalPrice: 190,
    emoji: "",
    imageUrl: "/images/products/bisi-bele-bath-kit.png",
    items: [
      "Small Onion",
      "Drumstick",
      "Carrot",
      "Beans",
      "Capsicum",
      "Peas",
      "Pusanikai (White or Yellow)",
      "Tomato",
      "Potato",
      "Brinjal",
    ],
    badge: "SELECT KG-WISE",
  },
  {
    id: "combo-pulav",
    comboKey: "combo-pulav",
    productId: "4ca45f80-fa02-4eff-9c3b-d070c1182325",
    variantId: "4627cd7c-7cd7-4e56-a976-395e1a03693b",
    name: "White Pulav Cutted Vegetable Combo",
    tamilName: "புலாவ் காய்கறி கிட்",
    description: "Delicate white pulav cut veggie mix with grated coconut and whole aromatics.",
    price: 129,
    originalPrice: 180,
    emoji: "",
    imageUrl: "/images/products/pulav-special-veggie-combo-kit.png",
    items: [
      "Big Onion slices",
      "Tomato",
      "Chilli",
      "Grated Coconut",
      "Carrot",
      "Beans",
      "Peas",
      "Potato",
      "Ginger",
      "Garlic",
    ],
    badge: "SELECT KG-WISE",
  },
];

export function ComboKitsSection() {
  const { addItem, setDrawerOpen, notify } = useApp();
  const [activeKit, setActiveKit] = useState<ComboKit | null>(null);

  const handleConfirmCombo = async (kit: ComboKit, data: { weight: string; price: number; ingredients: string[] }) => {
    try {
      await addItem(kit.productId, kit.variantId, 1);
      setDrawerOpen(true);
      notify(`Added ${kit.name} (${data.weight}) with ${data.ingredients.slice(0, 3).join(", ")}`);
    } catch {
      notify("Failed to add combo kit", "error");
    } finally {
      setActiveKit(null);
    }
  };

  return (
    <section id="combo-kits" className="bg-gradient-to-br from-amber-50/70 via-orange-50/30 to-white py-12 md:py-16 border-y border-amber-100 scroll-mt-20">
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
              <Sparkles size={13} className="text-amber-600" /> RECIPE COMBO KITS (KG-WISE)
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-[-0.02em] text-ink mt-2">
              Vegetable Rice & Aviyal Combos
            </h2>
            <p className="text-xs md:text-sm text-slate-600 mt-1 max-w-2xl">
              Includes exact recipe ingredients freshly chopped. Select options kg-wise (500g, 1 kg, 2 kg) or request custom proportions via WhatsApp.
            </p>
          </div>

          <a
            href="https://wa.me/919840532826?text=Hi%20VeggieFlick!%20I%20would%20like%20to%20inquire%20about%20custom%20combo%20vegetable%20packs."
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline border-emerald-600 text-emerald-800 bg-white hover:bg-emerald-50 text-xs font-extrabold flex items-center gap-2 py-2 px-4 rounded-xl shadow-xs"
          >
            <MessageCircle size={15} className="text-emerald-700" />
            <span>Connect on WhatsApp for Custom Kg</span>
          </a>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {COMBO_KITS.map((kit, index) => (
            <motion.div
              key={kit.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              className="card group bg-white p-4 border-amber-200/90 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between relative overflow-hidden rounded-2xl"
            >
              <div>
                <div className="relative w-full h-36 rounded-xl overflow-hidden mb-3.5 bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center border border-amber-200/80">
                  {kit.imageUrl ? (
                    <Image
                      src={kit.imageUrl}
                      alt={kit.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                  ) : (
                    <span className="text-5xl transition-transform duration-300 group-hover:scale-110 drop-shadow-xs">
                      {kit.emoji}
                    </span>
                  )}
                  <div className="absolute top-2.5 right-2.5">
                    <span className="chip bg-gradient-to-r from-emerald-800 to-teal-800 text-white font-extrabold text-[10px] tracking-wider shadow-md">
                      {kit.badge}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-extrabold text-ink leading-tight line-clamp-1">{kit.name}</h3>
                </div>
                <p className="text-[11px] text-muted">{kit.tamilName}</p>

                <p className="text-xs text-slate-600 leading-relaxed mt-2 line-clamp-2">{kit.description}</p>

                <div className="mt-3 rounded-xl bg-amber-50/70 p-3 border border-amber-100/90">
                  <p className="text-[11px] font-bold text-amber-950 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <UtensilsCrossed size={12} /> Exact Ingredients Included:
                  </p>
                  <ul className="grid grid-cols-1 gap-1 text-[11px] text-slate-700 max-h-32 overflow-y-auto pr-1">
                    {kit.items.map((item) => (
                      <li key={item} className="flex items-center gap-1.5">
                        <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                        <span className="truncate">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-black text-ink">{formatINR(kit.price)}</span>
                    <span className="text-xs text-muted line-through ml-1.5">{formatINR(kit.originalPrice)}</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                    Options kg-wise
                  </span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setActiveKit(kit)}
                  className="btn btn-primary btn-sm bg-emerald-800 text-white font-extrabold text-xs shadow-md hover:bg-emerald-900 border-none w-full flex items-center justify-center gap-1.5 py-2.5"
                >
                  <Scale size={14} />
                  <span>Select kg & Customize</span>
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {activeKit && (
        <CustomIngredientModal
          isOpen={!!activeKit}
          onClose={() => setActiveKit(null)}
          productName={activeKit.name}
          price={activeKit.price}
          categorySlug="vegetable-rice-aviyal-combo"
          customIngredientsList={COMBO_INGREDIENTS[activeKit.comboKey]}
          onConfirm={(data) => handleConfirmCombo(activeKit, data)}
        />
      )}
    </section>
  );
}
