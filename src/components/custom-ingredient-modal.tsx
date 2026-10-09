"use client";

import { useState, useEffect } from "react";
import { Check, X, Sparkles, AlertCircle, ShoppingBag } from "lucide-react";
import { formatINR } from "@/lib/utils";

export type CustomIngredient = {
  id: string;
  name: string;
  emoji: string;
  tag?: string;
};

// Available Seasonal Fruits for Fruit Salad Bowls
export const FRUIT_INGREDIENTS: CustomIngredient[] = [
  { id: "papaya", name: "Fresh Papaya Cubes", emoji: "🥭" },
  { id: "pomegranate", name: "Pomegranate Seeds", emoji: "🔴" },
  { id: "kiwi", name: "Green Kiwi Slices", emoji: "🥝" },
  { id: "watermelon", name: "Juicy Watermelon Chunks", emoji: "🍉" },
  { id: "apple", name: "Crisp Fuji Apple Slices", emoji: "🍎" },
  { id: "muskmelon", name: "Sweet Muskmelon Cubes", emoji: "🍈" },
  { id: "pineapple", name: "Queen Pineapple Chunks", emoji: "🍍" },
  { id: "grapes", name: "Seedless Black Grapes", emoji: "🍇" },
  { id: "orange", name: "Nagpur Orange Segments", emoji: "🍊" },
  { id: "dragonfruit", name: "Exotic Dragonfruit Chunks", emoji: "🐉" },
];

// Available Vegetables for Veg Salad Bowls
export const VEG_INGREDIENTS: CustomIngredient[] = [
  { id: "cucumber", name: "English Cucumber Slices", emoji: "🥒" },
  { id: "tomatoes", name: "Sweet Cherry Tomatoes", emoji: "🍅" },
  { id: "sweetcorn", name: "Steamed Sweet Corn", emoji: "🌽" },
  { id: "lettuce", name: "Crisp Iceberg Lettuce", emoji: "🥬" },
  { id: "purplecabbage", name: "Purple Cabbage Shreds", emoji: "🥗" },
  { id: "chickpeas", name: "Protein Chickpeas & Sprouts", emoji: "🫘" },
  { id: "avocado", name: "Fresh Avocado Cubes", emoji: "🥑" },
  { id: "carrots", name: "Shredded Ooty Carrots", emoji: "🥕" },
  { id: "broccoli", name: "Steamed Broccoli Florets", emoji: "🥦" },
  { id: "bellpeppers", name: "Tri-Color Bell Peppers", emoji: "🫑" },
];

export const COMBO_INGREDIENTS: Record<string, CustomIngredient[]> = {
  "combo-pulav": [
    { id: "carrots", name: "Chopped Ooty Carrots 250g", emoji: "🥕" },
    { id: "beans", name: "French Beans 250g", emoji: "🫛" },
    { id: "peas", name: "Tender Green Peas 200g", emoji: "🟢" },
    { id: "spices", name: "Whole Spices Pouch", emoji: "🧄" },
    { id: "potatoes", name: "Peeled Baby Potatoes 200g", emoji: "🥔" },
    { id: "mint", name: "Fresh Mint & Coriander Pack", emoji: "🌿" },
  ],
  "combo-biryani": [
    { id: "cauliflower", name: "Cauliflower Florets 300g", emoji: "🥦" },
    { id: "carrots", name: "Ooty Carrots 250g", emoji: "🥕" },
    { id: "beans", name: "French Beans 250g", emoji: "🫛" },
    { id: "onions", name: "Birista Fried Onions 100g", emoji: "🧅" },
    { id: "spices", name: "Biryani Spice Pack", emoji: "🧂" },
    { id: "mint", name: "Fresh Mint & Coriander", emoji: "🌿" },
  ],
  "combo-aviyal": [
    { id: "mix", name: "7-Veg Aviyal Cut Mix 500g", emoji: "🥗" },
    { id: "coconut", name: "Grated Fresh Coconut 100g", emoji: "🥥" },
    { id: "curryleaves", name: "Curry Leaves Bundle", emoji: "🍃" },
    { id: "chillies", name: "Green Chillies 50g", emoji: "🌶️" },
    { id: "yam", name: "Senai Yam Chunks 150g", emoji: "🥔" },
  ],
  "combo-bisibele": [
    { id: "sambar", name: "Cut Sambar Veggies 500g", emoji: "🍲" },
    { id: "shallots", name: "Peeled Small Onions 100g", emoji: "🧅" },
    { id: "masala", name: "Stone-ground Masala 50g", emoji: "🥘" },
    { id: "ghee", name: "Ghee Tempering Pack", emoji: "🧈" },
    { id: "toordal", name: "Cleaned Toor Dal 200g", emoji: "🫘" },
  ],
};

type CustomIngredientModalProps = {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  variantName: string;
  price: number;
  categorySlug?: string;
  customIngredientsList?: CustomIngredient[];
  maxSelectable?: number;
  onConfirm: (selectedNames: string[]) => void;
};

export function CustomIngredientModal({
  isOpen,
  onClose,
  productName,
  variantName,
  price,
  categorySlug = "fruit-salads",
  customIngredientsList,
  maxSelectable = 5,
  onConfirm,
}: CustomIngredientModalProps) {
  const ingredients =
    customIngredientsList ||
    (categorySlug === "veg-salads" ? VEG_INGREDIENTS : FRUIT_INGREDIENTS);

  const defaultSelected = ingredients.slice(0, Math.min(4, maxSelectable)).map((i) => i.id);
  const [selectedIds, setSelectedIds] = useState<string[]>(defaultSelected);

  if (!isOpen) return null;

  const isMaxReached = selectedIds.length >= maxSelectable;

  const toggleItem = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      if (!isMaxReached) {
        setSelectedIds([...selectedIds, id]);
      }
    }
  };

  const handleConfirm = () => {
    const selectedNames = ingredients
      .filter((i) => selectedIds.includes(i.id))
      .map((i) => i.name);
    onConfirm(selectedNames);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="card w-full max-w-lg overflow-hidden bg-white p-5 shadow-2xl rounded-3xl border border-slate-200">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-line pb-3.5">
          <div>
            <div className="flex items-center gap-2">
              <span className="chip bg-emerald-100 text-emerald-900 border border-emerald-300 font-extrabold text-[10px] tracking-wider uppercase">
                <Sparkles size={11} className="inline mr-1 text-emerald-700" />
                Customize Your Bowl
              </span>
              <span className="rounded-md border border-line bg-surface px-2 py-0.5 text-[11px] font-bold text-muted">
                {variantName}
              </span>
            </div>
            <h3 className="text-lg font-black text-ink mt-1 tracking-tight">{productName}</h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn-ghost btn-icon h-8 w-8 rounded-full text-slate-400 hover:text-ink hover:bg-slate-100"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Counter & Instruction Banner */}
        <div className="mt-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50 p-3.5 border border-emerald-200/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">
              Select up to <strong className="text-emerald-950 font-black">{maxSelectable} items</strong> ({variantName} Pack)
            </span>
            <span
              className={`chip font-extrabold text-[11px] tracking-wide transition-all ${
                isMaxReached
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "bg-white text-emerald-900 border border-emerald-300"
              }`}
            >
              {isMaxReached ? (
                <>✓ {selectedIds.length} / {maxSelectable} Max Reached</>
              ) : (
                <>{selectedIds.length} / {maxSelectable} Selected</>
              )}
            </span>
          </div>

          {isMaxReached && (
            <p className="mt-2 text-[11px] font-semibold text-emerald-900 flex items-center gap-1">
              <AlertCircle size={13} className="text-emerald-700 shrink-0" />
              Maximum {maxSelectable} items selected! Other options are disabled. Uncheck one to swap.
            </p>
          )}
        </div>

        {/* Ingredients Checkboxes */}
        <div className="mt-4 max-h-[52vh] overflow-y-auto pr-1 grid gap-2 sm:grid-cols-2">
          {ingredients.map((item) => {
            const isChecked = selectedIds.includes(item.id);
            const isDisabled = !isChecked && isMaxReached;

            return (
              <label
                key={item.id}
                className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-all ${
                  isChecked
                    ? "border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-500/30 font-bold text-ink shadow-2xs"
                    : isDisabled
                    ? "border-slate-200 bg-slate-100/70 opacity-45 cursor-not-allowed text-slate-400"
                    : "border-line bg-white hover:border-emerald-300 hover:bg-surface text-slate-700"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  disabled={isDisabled}
                  onChange={() => toggleItem(item.id)}
                  className="h-4 w-4 rounded accent-emerald-700 cursor-pointer disabled:cursor-not-allowed"
                />
                <span className="text-xl">{item.emoji}</span>
                <span className="text-xs flex-1 truncate">{item.name}</span>
                {isChecked && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-700 text-white shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </span>
                )}
              </label>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="mt-5 flex items-center justify-between gap-3 pt-3.5 border-t border-line">
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-muted">Total Price</span>
            <span className="text-xl font-black text-ink">{formatINR(price)}</span>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline px-4 py-2.5 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={selectedIds.length === 0}
              onClick={handleConfirm}
              className="btn btn-primary px-5 py-2.5 text-xs font-bold bg-emerald-800 hover:bg-emerald-900 text-white shadow-md disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              <ShoppingBag size={14} />
              Confirm & Add to Basket
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
