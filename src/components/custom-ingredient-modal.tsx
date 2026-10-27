"use client";

import { useState, useEffect } from "react";
import { Check, X, Sparkles, AlertCircle, ShoppingBag, Scale, MessageCircle } from "lucide-react";
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

// 4. Exact Combo Pack Ingredients
export const COMBO_INGREDIENTS: Record<string, CustomIngredient[]> = {
  // Vegetable Biriyani Cutted Vegetable Combo
  "combo-biryani": [
    { id: "onion", name: "Big Onion slices", emoji: "🧅" },
    { id: "tomato", name: "Tomato", emoji: "🍅" },
    { id: "chilli", name: "Chilli", emoji: "🌶️" },
    { id: "carrot", name: "Carrot", emoji: "🥕" },
    { id: "beans", name: "Beans", emoji: "🫛" },
    { id: "peas", name: "Peas", emoji: "🟢" },
    { id: "potato", name: "Potato", emoji: "🥔" },
    { id: "ginger", name: "Ginger", emoji: "🫚" },
    { id: "garlic", name: "Garlic", emoji: "🧄" },
  ],
  // Aviyal
  "combo-aviyal": [
    { id: "yam", name: "Elephant Foot Yam", emoji: "🥔" },
    { id: "drumstick", name: "Drumstick", emoji: "🥢" },
    { id: "carrot", name: "Carrot", emoji: "🥕" },
    { id: "beans", name: "Beans", emoji: "🫛" },
    { id: "pusanikai", name: "Pusanikai", emoji: "🎃" },
    { id: "valaikai", name: "Valaikai", emoji: "🍌" },
    { id: "avaraikai", name: "Avaraikai", emoji: "🫛" },
  ],
  // Bisibella Bath
  "combo-bisibele": [
    { id: "small_onion", name: "Small Onion", emoji: "🧅" },
    { id: "drumstick", name: "Drumstick", emoji: "🥢" },
    { id: "carrot", name: "Carrot", emoji: "🥕" },
    { id: "beans", name: "Beans", emoji: "🫛" },
    { id: "capsicum", name: "Capsicum", emoji: "🫑" },
    { id: "peas", name: "Peas", emoji: "🟢" },
    { id: "pusanikai", name: "Pusanikai (White or Yellow)", emoji: "🎃" },
    { id: "tomato", name: "Tomato", emoji: "🍅" },
    { id: "potato", name: "Potato", emoji: "🥔" },
    { id: "brinjal", name: "Brinjal", emoji: "🍆" },
  ],
  // White Pulav Cutted Vegetable Combo
  "combo-pulav": [
    { id: "onion", name: "Big Onion slices", emoji: "🧅" },
    { id: "tomato", name: "Tomato", emoji: "🍅" },
    { id: "chilli", name: "Chilli", emoji: "🌶️" },
    { id: "coconut", name: "Grated Coconut", emoji: "🥥" },
    { id: "carrot", name: "Carrot", emoji: "🥕" },
    { id: "beans", name: "Beans", emoji: "🫛" },
    { id: "peas", name: "Peas", emoji: "🟢" },
    { id: "potato", name: "Potato", emoji: "🥔" },
    { id: "ginger", name: "Ginger", emoji: "🫚" },
    { id: "garlic", name: "Garlic", emoji: "🧄" },
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
  onConfirm: (data: { weight: string; price: number; ingredients: string[] }) => void;
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
  const normName = productName.toLowerCase();
  const isComboKit =
    categorySlug.includes("combo") ||
    categorySlug.includes("rice-aviyal") ||
    normName.includes("biriyani") ||
    normName.includes("biryani") ||
    normName.includes("aviyal") ||
    normName.includes("pulav") ||
    normName.includes("bisibele") ||
    normName.includes("bath kit");

  // Determine subcategory & ingredient pool
  let ingredients: CustomIngredient[] = FRUIT_SALAD_INGREDIENTS;
  let isFruitSalad = false;

  if (isComboKit) {
    if (normName.includes("biriyani") || normName.includes("biryani")) {
      ingredients = COMBO_INGREDIENTS["combo-biryani"];
    } else if (normName.includes("aviyal")) {
      ingredients = COMBO_INGREDIENTS["combo-aviyal"];
    } else if (normName.includes("bisibele") || normName.includes("bath")) {
      ingredients = COMBO_INGREDIENTS["combo-bisibele"];
    } else if (normName.includes("pulav")) {
      ingredients = COMBO_INGREDIENTS["combo-pulav"];
    } else if (customIngredientsList && customIngredientsList.length > 0) {
      ingredients = customIngredientsList;
    } else {
      ingredients = COMBO_INGREDIENTS["combo-pulav"];
    }
  } else {
    const effectiveSubCat = (subCategorySlug || categorySlug || "").toLowerCase();
    if (effectiveSubCat.includes("sprouts")) {
      ingredients = SPROUTS_SALAD_INGREDIENTS;
    } else if (effectiveSubCat.includes("veg")) {
      ingredients = VEGETABLE_SALAD_INGREDIENTS;
    } else if (effectiveSubCat.includes("fruit")) {
      ingredients = FRUIT_SALAD_INGREDIENTS;
      isFruitSalad = true;
    } else if (customIngredientsList && customIngredientsList.length > 0) {
      ingredients = customIngredientsList;
    }
  }

  // Weight Selection State
  // For Combos: "500g" | "1kg" | "2kg"
  // For Salads: "250g" | "500g"
  const [comboWeight, setComboWeight] = useState<"500g" | "1kg" | "2kg">("1kg");
  const [saladWeight, setSaladWeight] = useState<"250g" | "500g">("250g");

  // Selected Item IDs state (Default: all selected for combo, 5 selected for salad)
  const defaultSelected = isComboKit ? ingredients.map((i) => i.id) : ingredients.slice(0, 5).map((i) => i.id);
  const [selectedIds, setSelectedIds] = useState<string[]>(defaultSelected);
  const [prevProductKey, setPrevProductKey] = useState(`${productName}-${isComboKit}`);

  if (prevProductKey !== `${productName}-${isComboKit}`) {
    setPrevProductKey(`${productName}-${isComboKit}`);
    setSelectedIds(isComboKit ? ingredients.map((i) => i.id) : ingredients.slice(0, 5).map((i) => i.id));
  }

  if (!isOpen) return null;

  // Price Calculation
  let currentPrice = price;
  let activeWeightLabel = "1kg";

  if (isComboKit) {
    activeWeightLabel = comboWeight;
    if (comboWeight === "500g") currentPrice = Math.round(price * 0.6);
    else if (comboWeight === "1kg") currentPrice = price;
    else if (comboWeight === "2kg") currentPrice = Math.round(price * 1.95);
  } else {
    activeWeightLabel = saladWeight;
    currentPrice = saladWeight === "500g" ? Math.round(price * 1.75) : price;
  }

  // Selection Limits calculation for salads
  const minRequired = isComboKit ? 1 : 5;
  const maxAllowed = isComboKit
    ? ingredients.length
    : saladWeight === "250g"
    ? 5
    : isFruitSalad
    ? 8
    : 7;

  const count = selectedIds.length;
  const isTooFew = count < minRequired;
  const isMaxReached = !isComboKit && count >= maxAllowed;

  const toggleItem = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 1) {
        setSelectedIds(selectedIds.filter((item) => item !== id));
      }
    } else {
      if (!isMaxReached) {
        setSelectedIds([...selectedIds, id]);
      }
    }
  };

  const handleConfirm = () => {
    if (isTooFew) return;

    const selectedNames = ingredients
      .filter((i) => selectedIds.includes(i.id))
      .map((i) => i.name);

    onConfirm({
      weight: activeWeightLabel,
      price: currentPrice,
      ingredients: selectedNames,
    });
    onClose();
  };

  const whatsAppMessage = encodeURIComponent(
    `Hi VeggieFlick! I would like to order / customize the "${productName}" (${activeWeightLabel}) with specific vegetable quantities:\nIncluded: ${ingredients
      .filter((i) => selectedIds.includes(i.id))
      .map((i) => i.name)
      .join(", ")}`
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="card w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden bg-white p-5 shadow-2xl rounded-3xl border border-slate-200">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-line pb-3.5 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="chip bg-emerald-100 text-emerald-900 border border-emerald-300 font-extrabold text-[10px] tracking-wider uppercase">
                <Sparkles size={11} className="inline mr-1 text-emerald-700" />
                {isComboKit ? "Recipe Combo Pack" : "Custom Salad Mix"}
              </span>
              <span className="chip bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-[10px] tracking-wider">
                {isComboKit ? "Select Option kg-wise" : "Custom Pack"}
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

        <div className="overflow-y-auto flex-1 pr-1 mt-3">
          {/* 1. Pack Quantity Selection Toggle (Kg-wise for Combos, 250g/500g for Salad) */}
          <div className="mb-3.5">
            <label className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              <Scale size={13} className="text-emerald-700" />
              {isComboKit ? "Please Select Option (kg-wise):" : "Choose Pack Quantity:"}
            </label>

            {isComboKit ? (
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: "500g", label: "500 g Pack", desc: "Small (Half kg)", p: Math.round(price * 0.6) },
                  { key: "1kg", label: "1 kg Pack", desc: "Standard Family", p: price },
                  { key: "2kg", label: "2 kg Pack", desc: "Feast / Double", p: Math.round(price * 1.95) },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setComboWeight(opt.key as any)}
                    className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-center transition-all ${
                      comboWeight === opt.key
                        ? "border-emerald-600 bg-emerald-50/90 ring-2 ring-emerald-500/20 font-bold text-emerald-950"
                        : "border-line bg-white hover:border-slate-300 text-slate-600"
                    }`}
                  >
                    <span className="block text-xs font-black">{opt.label}</span>
                    <span className="block text-[10px] text-muted">{opt.desc}</span>
                    <span className="mt-1 text-xs font-bold text-emerald-800">{formatINR(opt.p)}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSaladWeight("250g")}
                  className={`flex items-center justify-between rounded-xl border p-3 text-left transition-all ${
                    saladWeight === "250g"
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
                  onClick={() => setSaladWeight("500g")}
                  className={`flex items-center justify-between rounded-xl border p-3 text-left transition-all ${
                    saladWeight === "500g"
                      ? "border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/20 font-bold text-emerald-950"
                      : "border-line bg-white hover:border-slate-300 text-slate-600"
                  }`}
                >
                  <div>
                    <span className="block text-sm font-extrabold">500g Pack</span>
                    <span className="block text-[11px] text-muted">Req: 5 to {isFruitSalad ? 8 : 7} items</span>
                  </div>
                  <span className="text-sm font-bold text-emerald-800">{formatINR(Math.round(price * 1.75))}</span>
                </button>
              </div>
            )}
          </div>

          {/* 2. Ingredients Banner */}
          <div className="mb-3 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50 p-3 border border-emerald-200/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                {isComboKit ? (
                  <>Exact Combo Ingredients (<strong className="text-emerald-950 font-black">{activeWeightLabel}</strong>)</>
                ) : (
                  <>Selection for <strong className="text-emerald-950 font-black">{activeWeightLabel}</strong>:</>
                )}
              </span>
              <span className="chip font-extrabold text-[11px] bg-white text-emerald-900 border border-emerald-300">
                {count} / {ingredients.length} Included
              </span>
            </div>
            {isComboKit ? (
              <p className="mt-1.5 text-[11px] text-slate-600">
                All pre-measured ingredients are freshly chopped and washed. Click to uncheck any item you don&apos;t want.
              </p>
            ) : isTooFew ? (
              <p className="mt-1.5 text-[11px] font-bold text-amber-900 flex items-center gap-1">
                <AlertCircle size={13} className="text-amber-700 shrink-0" />
                Select at least {minRequired} ingredients ({minRequired - count} more needed).
              </p>
            ) : (
              <p className="mt-1.5 text-[11px] font-medium text-emerald-800">
                {isMaxReached ? "Maximum ingredients reached!" : `You can select up to ${maxAllowed - count} more.`}
              </p>
            )}
          </div>

          {/* 3. Ingredients Selection Grid */}
          <div className="grid gap-2 sm:grid-cols-2">
            {ingredients.map((item) => {
              const selected = selectedIds.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-left text-xs transition-all ${
                    selected
                      ? "border-emerald-600 bg-emerald-50/70 font-bold text-emerald-950 shadow-xs"
                      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <span className="text-base">{item.emoji}</span>
                    <span className="truncate">{item.name}</span>
                  </span>
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all ${
                      selected
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {selected && <Check size={12} strokeWidth={3} />}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 4. WhatsApp Customization Button Requirement 4 */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <a
              href={`https://wa.me/919840532826?text=${whatsAppMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/80 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-900 hover:bg-emerald-100 transition-colors shadow-xs"
            >
              <MessageCircle size={15} className="text-emerald-700" />
              <span>Please connect with WhatsApp for custom proportions</span>
            </a>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-4 flex items-center justify-between gap-3 pt-3 border-t border-line shrink-0">
          <div>
            <span className="block text-[10px] uppercase font-bold text-muted">Total Price</span>
            <span className="text-xl font-black text-ink">{formatINR(currentPrice)}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline btn-sm text-slate-600 border-slate-300 text-xs px-3"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isTooFew}
              onClick={handleConfirm}
              className="btn btn-primary btn-sm bg-emerald-800 text-white font-extrabold text-xs px-4 shadow-md hover:bg-emerald-900 disabled:opacity-50 flex items-center gap-1.5"
            >
              <ShoppingBag size={14} />
              <span>Add to Basket ({activeWeightLabel})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
