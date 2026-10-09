"use client";

import { useState, useEffect } from "react";
import { Check, X, Sparkles, AlertCircle, ShoppingBag, Scale } from "lucide-react";
import { formatINR } from "@/lib/utils";

export type CustomIngredient = {
  id: string;
  name: string;
  emoji: string;
};

// 1. Fruit Salad Ingredients (14 Items)
export const FRUIT_SALAD_INGREDIENTS: CustomIngredient[] = [
  { id: "raspberry", name: "Raspberry", emoji: "🍇" },
  { id: "blueberry", name: "Blueberry", emoji: "🫐" },
  { id: "cranberry", name: "Cranberry", emoji: "🍒" },
  { id: "strawberry", name: "Strawberry", emoji: "🍓" },
  { id: "plums", name: "Plums", emoji: "🍑" },
  { id: "guava", name: "Guava", emoji: "🍐" },
  { id: "watermelon", name: "Watermelon", emoji: "🍉" },
  { id: "yellow_banana", name: "Yellow Banana", emoji: "🍌" },
  { id: "pineapple", name: "Pineapple", emoji: "🍍" },
  { id: "brown_banana", name: "Brown Banana", emoji: "🍌" },
  { id: "green_grapes", name: "Green Grapes", emoji: "🍇" },
  { id: "black_grapes", name: "Black Grapes", emoji: "🍇" },
  { id: "apple", name: "Apple", emoji: "🍎" },
  { id: "green_apple", name: "Green Apple", emoji: "🍏" },
];

// 2. Sprouts Salad Ingredients (7 Items)
export const SPROUTS_SALAD_INGREDIENTS: CustomIngredient[] = [
  { id: "cucumber", name: "Cucumber", emoji: "🥒" },
  { id: "groundnut", name: "Groundnut", emoji: "🥜" },
  { id: "green_moong_dal", name: "Green Moong Dal", emoji: "🫘" },
  { id: "black_channa", name: "Black Channa", emoji: "🫘" },
  { id: "white_channa", name: "White Channa", emoji: "🫘" },
  { id: "soya_beans", name: "Soya Beans", emoji: "🫘" },
  { id: "green_peas", name: "Green Peas", emoji: "🫛" },
];

// 3. Vegetable Salad Ingredients (7 Items)
export const VEGETABLE_SALAD_INGREDIENTS: CustomIngredient[] = [
  { id: "cucumber", name: "Cucumber", emoji: "🥒" },
  { id: "cabbage", name: "Cabbage", emoji: "🥬" },
  { id: "corn", name: "Corn", emoji: "🌽" },
  { id: "carrot", name: "Carrot", emoji: "🥕" },
  { id: "sliced_beetroot", name: "Sliced Beetroot", emoji: "🍠" },
  { id: "broccoli", name: "Broccoli", emoji: "🥦" },
  { id: "mango", name: "Mango", emoji: "🥭" },
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

type SaladSubcategory = "fruit-salad" | "sprouts-salad" | "vegetable-salad" | "fruit-salads" | "veg-salads" | string;

type CustomIngredientModalProps = {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  variantName?: string;
  price: number;
  categorySlug?: string;
  subCategorySlug?: SaladSubcategory;
  customIngredientsList?: CustomIngredient[];
  onConfirm: (data: { weight: "250g" | "500g"; price: number; ingredients: string[] }) => void;
};

export function CustomIngredientModal({
  isOpen,
  onClose,
  productName,
  price,
  categorySlug = "salad",
  subCategorySlug,
  customIngredientsList,
  onConfirm,
}: CustomIngredientModalProps) {
  // Determine subcategory & ingredient pool
  const effectiveSubCat = (subCategorySlug || categorySlug || "").toLowerCase();
  
  let ingredients: CustomIngredient[] = FRUIT_SALAD_INGREDIENTS;
  let isFruitSalad = false;

  if (effectiveSubCat.includes("sprouts")) {
    ingredients = SPROUTS_SALAD_INGREDIENTS;
  } else if (effectiveSubCat.includes("veg")) {
    ingredients = VEGETABLE_SALAD_INGREDIENTS;
  } else if (effectiveSubCat.includes("fruit")) {
    ingredients = FRUIT_SALAD_INGREDIENTS;
    isFruitSalad = true;
  } else if (customIngredientsList) {
    ingredients = customIngredientsList;
  }

  // Weight Selection State: "250g" | "500g"
  const [selectedWeight, setSelectedWeight] = useState<"250g" | "500g">("250g");

  // Selection Limits calculation
  const minRequired = 5; // All salad types require minimum 5 ingredients
  const maxAllowed =
    selectedWeight === "250g"
      ? 5 // 250g: Exactly 5 items
      : isFruitSalad
      ? 8 // 500g Fruit Salad: Up to 8 items
      : 7; // 500g Sprouts/Veg Salad: Up to 7 items

  // Price Calculation (500g = 1.75x base 250g price rounded)
  const currentPrice = selectedWeight === "500g" ? Math.round(price * 1.75) : price;

  // Selected Item IDs state
  const defaultSelected = ingredients.slice(0, 5).map((i) => i.id);
  const [selectedIds, setSelectedIds] = useState<string[]>(defaultSelected);

  // Validate on weight change: if switching to 250g and currently selected > 5, trim to 5
  const handleWeightChange = (newWeight: "250g" | "500g") => {
    setSelectedWeight(newWeight);
    const newMax = newWeight === "250g" ? 5 : isFruitSalad ? 8 : 7;
    if (selectedIds.length > newMax) {
      setSelectedIds(selectedIds.slice(0, newMax));
    }
  };

  if (!isOpen) return null;

  const count = selectedIds.length;
  const isTooFew = count < minRequired;
  const isMaxReached = count >= maxAllowed;

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
    if (isTooFew || count > maxAllowed) return;

    const selectedNames = ingredients
      .filter((i) => selectedIds.includes(i.id))
      .map((i) => i.name);

    onConfirm({
      weight: selectedWeight,
      price: currentPrice,
      ingredients: selectedNames,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="card w-full max-w-lg overflow-hidden bg-white p-5 shadow-2xl rounded-3xl border border-slate-200">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-line pb-3.5">
          <div>
            <div className="flex items-center gap-2">
              <span className="chip bg-emerald-100 text-emerald-900 border border-emerald-300 font-extrabold text-[10px] tracking-wider uppercase">
                <Sparkles size={11} className="inline mr-1 text-emerald-700" />
                Custom Salad Mix
              </span>
              <span className="chip bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-[10px] tracking-wider">
                {effectiveSubCat.includes("sprouts")
                  ? "Sprouts Salad"
                  : effectiveSubCat.includes("veg")
                  ? "Vegetable Salad"
                  : "Fruit Salad"}
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

        {/* 1. Pack Quantity Selection Toggle (250g vs 500g) */}
        <div className="mt-4">
          <label className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
            <Scale size={13} className="text-emerald-700" /> Choose Pack Quantity:
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleWeightChange("250g")}
              className={`flex items-center justify-between rounded-xl border p-3 text-left transition-all ${
                selectedWeight === "250g"
                  ? "border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/20 font-bold text-emerald-950"
                  : "border-line bg-white hover:border-slate-300 text-slate-600"
              }`}
            >
              <div>
                <span className="block text-sm font-extrabold">250g Pack</span>
                <span className="block text-[11px] text-muted">Req: Exactly 5 items</span>
              </div>
              <span className="text-sm font-bold text-emerald-800">{formatINR(price)}</span>
            </button>

            <button
              type="button"
              onClick={() => handleWeightChange("500g")}
              className={`flex items-center justify-between rounded-xl border p-3 text-left transition-all ${
                selectedWeight === "500g"
                  ? "border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/20 font-bold text-emerald-950"
                  : "border-line bg-white hover:border-slate-300 text-slate-600"
              }`}
            >
              <div>
                <span className="block text-sm font-extrabold">500g Pack</span>
                <span className="block text-[11px] text-muted">
                  Req: 5 to {isFruitSalad ? 8 : 7} items
                </span>
              </div>
              <span className="text-sm font-bold text-emerald-800">
                {formatINR(Math.round(price * 1.75))}
              </span>
            </button>
          </div>
        </div>

        {/* 2. Counter & Dynamic Validation Banner */}
        <div className="mt-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50 p-3.5 border border-emerald-200/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">
              Selection Limit for <strong className="text-emerald-950 font-black">{selectedWeight}</strong>:
            </span>
            <span
              className={`chip font-extrabold text-[11px] tracking-wide transition-all ${
                isTooFew
                  ? "bg-amber-600 text-white"
                  : isMaxReached
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "bg-white text-emerald-900 border border-emerald-300"
              }`}
            >
              {count} / {maxAllowed} Ingredients Selected
            </span>
          </div>

          {/* Validation Status Messages */}
          {isTooFew ? (
            <p className="mt-2 text-[11px] font-bold text-amber-900 flex items-center gap-1">
              <AlertCircle size={13} className="text-amber-700 shrink-0" />
              Select at least {minRequired} ingredients ({minRequired - count} more required) for the {selectedWeight} pack.
            </p>
          ) : isMaxReached ? (
            <p className="mt-2 text-[11px] font-bold text-emerald-900 flex items-center gap-1">
              <Check size={13} className="text-emerald-700 shrink-0 stroke-[3]" />
              Maximum {maxAllowed} ingredients selected for {selectedWeight} pack! Other options are disabled.
            </p>
          ) : (
            <p className="mt-2 text-[11px] font-medium text-emerald-800">
              You can select up to {maxAllowed - count} more ingredient(s) for your {selectedWeight} salad.
            </p>
          )}
        </div>

        {/* 3. Ingredients Selection Grid */}
        <div className="mt-4 max-h-[44vh] overflow-y-auto pr-1 grid gap-2 sm:grid-cols-2">
          {ingredients.map((item) => {
            const isChecked = selectedIds.includes(item.id);
            const isDisabled = !isChecked && isMaxReached;

            return (
              <label
                key={item.id}
                className={`flex items-center gap-3 rounded-xl border p-2.5 cursor-pointer transition-all ${
                  isChecked
                    ? "border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-500/30 font-bold text-ink shadow-2xs"
                    : isDisabled
                    ? "border-slate-200 bg-slate-100/70 opacity-40 cursor-not-allowed text-slate-400"
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
        <div className="mt-4 flex items-center justify-between gap-3 pt-3 border-t border-line">
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-muted">
              {selectedWeight} Pack Total
            </span>
            <span className="text-xl font-black text-ink">{formatINR(currentPrice)}</span>
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
              disabled={isTooFew || count > maxAllowed}
              onClick={handleConfirm}
              className="btn btn-primary px-5 py-2.5 text-xs font-bold bg-emerald-800 hover:bg-emerald-900 text-white shadow-md disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              <ShoppingBag size={14} />
              Confirm & Add ({selectedWeight})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
