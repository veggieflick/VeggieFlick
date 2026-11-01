"use client";

import { useState } from "react";
import { Check, X, Sparkles, AlertCircle, ShoppingBag, Scale, MessageCircle } from "lucide-react";
import { formatINR } from "@/lib/utils";

export type CustomIngredient = {
  id: string;
  name: string;
  emoji?: string;
};

// 1. Fruit Salad Ingredients (14 Items - exact from user list)
export const FRUIT_SALAD_INGREDIENTS: CustomIngredient[] = [
  { id: "raspberry", name: "Raspberry" },
  { id: "blueberry", name: "Blueberry" },
  { id: "cranberry", name: "Cranberry" },
  { id: "strawberry", name: "Strawberry" },
  { id: "plums", name: "Plums" },
  { id: "guava", name: "Guava" },
  { id: "water_melon", name: "Water melon" },
  { id: "banana_yellow", name: "Banana (yellow)" },
  { id: "pine_apple", name: "Pine Apple" },
  { id: "banana_brown", name: "Banana (brown)" },
  { id: "grapes_green", name: "Grapes (green)" },
  { id: "grapes_black", name: "Grapes (black)" },
  { id: "apple", name: "Apple" },
  { id: "green_apple", name: "Green Apple" },
];

// 2. Sprouts Salad Ingredients (8 Items - exact from user list)
export const SPROUTS_SALAD_INGREDIENTS: CustomIngredient[] = [
  { id: "cucumber", name: "Cucumber" },
  { id: "groundnut", name: "Groundnut" },
  { id: "green_mong_dal", name: "Green Mong Dal" },
  { id: "black_channa", name: "Black channa" },
  { id: "white_channa", name: "White channa" },
  { id: "soya_beans", name: "Soya beans" },
  { id: "green_peas", name: "Green peas" },
  { id: "horse_gram", name: "Horse gram" },
];

// 3. Vegetable Salad Ingredients (10 Items - exact from user list)
export const VEGETABLE_SALAD_INGREDIENTS: CustomIngredient[] = [
  { id: "cucumber", name: "Cucumber" },
  { id: "cabbage", name: "Cabbage" },
  { id: "corn", name: "Corn" },
  { id: "carrot", name: "Carrot" },
  { id: "sliced_beet_root", name: "Sliced beet root" },
  { id: "brocoli", name: "Brocoli" },
  { id: "mango", name: "Mango" },
  { id: "tomato", name: "Tomato" },
  { id: "big_onion", name: "Big Onion" },
  { id: "coriander_leaves", name: "Coriander leaves" },
];

// 4. Exact Combo Pack Ingredients
export const COMBO_INGREDIENTS: Record<string, CustomIngredient[]> = {
  // Vegetable Biriyani Cutted Vegetable Combo
  "combo-biryani": [
    { id: "onion", name: "Big Onion slices" },
    { id: "tomato", name: "Tomato" },
    { id: "chilli", name: "Chilli" },
    { id: "carrot", name: "Carrot" },
    { id: "beans", name: "Beans" },
    { id: "peas", name: "Peas" },
    { id: "potato", name: "Potato" },
    { id: "ginger", name: "Ginger" },
    { id: "garlic", name: "Garlic" },
  ],
  // Aviyal
  "combo-aviyal": [
    { id: "yam", name: "Elephant Foot Yam" },
    { id: "drumstick", name: "Drumstick" },
    { id: "carrot", name: "Carrot" },
    { id: "beans", name: "Beans" },
    { id: "pusanikai", name: "Pusanikai" },
    { id: "valaikai", name: "Valaikai" },
    { id: "avaraikai", name: "Avaraikai" },
  ],
  // Bisibella Bath
  "combo-bisibele": [
    { id: "small_onion", name: "Small Onion" },
    { id: "drumstick", name: "Drumstick" },
    { id: "carrot", name: "Carrot" },
    { id: "beans", name: "Beans" },
    { id: "capsicum", name: "Capsicum" },
    { id: "peas", name: "Peas" },
    { id: "pusanikai", name: "Pusanikai (White or Yellow)" },
    { id: "tomato", name: "Tomato" },
    { id: "potato", name: "Potato" },
    { id: "brinjal", name: "Brinjal" },
  ],
  // White Pulav Cutted Vegetable Combo
  "combo-pulav": [
    { id: "onion", name: "Big Onion slices" },
    { id: "tomato", name: "Tomato" },
    { id: "chilli", name: "Chilli" },
    { id: "coconut", name: "Grated Coconut" },
    { id: "carrot", name: "Carrot" },
    { id: "beans", name: "Beans" },
    { id: "peas", name: "Peas" },
    { id: "potato", name: "Potato" },
    { id: "ginger", name: "Ginger" },
    { id: "garlic", name: "Garlic" },
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
  const effectiveSubCat = (subCategorySlug || categorySlug || "").toLowerCase();
  const isFruitSalad = !isComboKit && (effectiveSubCat.includes("fruit") || normName.includes("fruit"));
  const isSproutsSalad = !isComboKit && (effectiveSubCat.includes("sprouts") || normName.includes("sprout"));
  const isVegSalad = !isComboKit && (effectiveSubCat.includes("veg") || normName.includes("veg"));

  if (customIngredientsList && customIngredientsList.length > 0) {
    ingredients = customIngredientsList;
  } else if (isComboKit) {
    if (normName.includes("biriyani") || normName.includes("biryani")) {
      ingredients = COMBO_INGREDIENTS["combo-biryani"];
    } else if (normName.includes("aviyal")) {
      ingredients = COMBO_INGREDIENTS["combo-aviyal"];
    } else if (normName.includes("bisibele") || normName.includes("bath") || normName.includes("bisibella") || normName.includes("bisimila")) {
      ingredients = COMBO_INGREDIENTS["combo-bisibele"];
    } else if (normName.includes("pulav")) {
      ingredients = COMBO_INGREDIENTS["combo-pulav"];
    } else {
      ingredients = COMBO_INGREDIENTS["combo-pulav"];
    }
  } else {
    if (isSproutsSalad) {
      ingredients = SPROUTS_SALAD_INGREDIENTS;
    } else if (isVegSalad) {
      ingredients = VEGETABLE_SALAD_INGREDIENTS;
    } else if (isFruitSalad) {
      ingredients = FRUIT_SALAD_INGREDIENTS;
    }
  }

  // Weight Selection State
  // For Combos: "500g" | "1kg" | "2kg"
  // For Salads: "250g" | "500g" | "1kg"
  const [comboWeight, setComboWeight] = useState<"500g" | "1kg" | "2kg">("1kg");
  const [saladWeight, setSaladWeight] = useState<"250g" | "500g" | "1kg">("250g");

  // Selection Limits & Item Unit Name calculation
  // 1. Fruit salad:
  //    250g: 3 to 5 fruits
  //    500g: 5 to 8 fruits
  //    1kg: 7 to 12 fruits
  // 2. Vegetables salad:
  //    250g: 3 to 5 items
  //    500g: 5 to 8 items
  //    1kg: 7 to 10 items
  // 3. Sprouts salad:
  //    250g: 3 items
  //    500g: 5 to 7 items
  //    1kg: 7 to 8 items
  let minRequired = 1;
  let maxAllowed = ingredients.length;
  let itemUnitName = "items";

  if (isFruitSalad) {
    itemUnitName = "fruits";
    if (saladWeight === "250g") {
      minRequired = 3;
      maxAllowed = 5;
    } else if (saladWeight === "500g") {
      minRequired = 5;
      maxAllowed = 8;
    } else {
      minRequired = 7;
      maxAllowed = 12;
    }
  } else if (isVegSalad) {
    itemUnitName = "vegetables";
    if (saladWeight === "250g") {
      minRequired = 3;
      maxAllowed = 5;
    } else if (saladWeight === "500g") {
      minRequired = 5;
      maxAllowed = 8;
    } else {
      minRequired = 7;
      maxAllowed = Math.min(10, ingredients.length);
    }
  } else if (isSproutsSalad) {
    itemUnitName = "sprouts";
    if (saladWeight === "250g") {
      minRequired = 3;
      maxAllowed = 3;
    } else if (saladWeight === "500g") {
      minRequired = 5;
      maxAllowed = 7;
    } else {
      minRequired = 7;
      maxAllowed = Math.min(8, ingredients.length);
    }
  }

  // Selected Item IDs state (Default: all selected for combo, 3 selected for salad 250g)
  const defaultSelected = isComboKit
    ? ingredients.map((i) => i.id)
    : ingredients.slice(0, 3).map((i) => i.id);

  const [selectedIds, setSelectedIds] = useState<string[]>(defaultSelected);
  const [prevProductKey, setPrevProductKey] = useState(`${productName}-${isComboKit}`);

  if (prevProductKey !== `${productName}-${isComboKit}`) {
    setPrevProductKey(`${productName}-${isComboKit}`);
    setSelectedIds(isComboKit ? ingredients.map((i) => i.id) : ingredients.slice(0, 3).map((i) => i.id));
    setSaladWeight("250g");
  }

  if (!isOpen) return null;

  // Price Calculation for Salads:
  // 250g: base price
  // 500g: ₹149 for fruit / ₹129 for sprouts & veg
  // 1kg: ₹279 for fruit / ₹239 for sprouts & veg
  const price250 = price;
  const price500 = price >= 75 ? 149 : 129;
  const price1kg = price >= 75 ? 279 : 239;

  let currentPrice = price;
  let activeWeightLabel = "250g";

  if (isComboKit) {
    activeWeightLabel = comboWeight;
    if (comboWeight === "500g") currentPrice = Math.round(price * 0.6);
    else if (comboWeight === "1kg") currentPrice = price;
    else if (comboWeight === "2kg") currentPrice = Math.round(price * 1.95);
  } else {
    activeWeightLabel = saladWeight;
    if (saladWeight === "250g") currentPrice = price250;
    else if (saladWeight === "500g") currentPrice = price500;
    else if (saladWeight === "1kg") currentPrice = price1kg;
  }

  const count = selectedIds.length;
  const isTooFew = count < minRequired;
  const isMaxReached = !isComboKit && count >= maxAllowed;

  const handleSaladWeightChange = (newWeight: "250g" | "500g" | "1kg") => {
    setSaladWeight(newWeight);
    let targetMin = 3;
    let targetMax = 5;

    if (isFruitSalad) {
      if (newWeight === "250g") {
        targetMin = 3;
        targetMax = 5;
      } else if (newWeight === "500g") {
        targetMin = 5;
        targetMax = 8;
      } else {
        targetMin = 7;
        targetMax = 12;
      }
    } else if (isVegSalad) {
      if (newWeight === "250g") {
        targetMin = 3;
        targetMax = 5;
      } else if (newWeight === "500g") {
        targetMin = 5;
        targetMax = 8;
      } else {
        targetMin = 7;
        targetMax = Math.min(10, ingredients.length);
      }
    } else if (isSproutsSalad) {
      if (newWeight === "250g") {
        targetMin = 3;
        targetMax = 3;
      } else if (newWeight === "500g") {
        targetMin = 5;
        targetMax = 7;
      } else {
        targetMin = 7;
        targetMax = Math.min(8, ingredients.length);
      }
    }

    if (selectedIds.length < targetMin) {
      const extraNeeded = targetMin - selectedIds.length;
      const unselected = ingredients.filter((i) => !selectedIds.includes(i.id)).map((i) => i.id);
      setSelectedIds([...selectedIds, ...unselected.slice(0, extraNeeded)]);
    } else if (selectedIds.length > targetMax) {
      setSelectedIds(selectedIds.slice(0, targetMax));
    }
  };

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
    `Hi VeggieFlick! I would like to order / customize the "${productName}" (${activeWeightLabel}) with specific quantities:\nIncluded: ${ingredients
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
          {/* 1. Pack Quantity Selection Toggle (Kg-wise for Combos, 250g / 500g / 1kg for Salad) */}
          <div className="mb-3.5">
            <label className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              <Scale size={13} className="text-emerald-700" />
              {isComboKit ? "Please Select Option (kg-wise):" : "Choose Pack Weight:"}
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
              <div className="grid grid-cols-3 gap-2">
                {/* 250g Button */}
                <button
                  type="button"
                  onClick={() => handleSaladWeightChange("250g")}
                  className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-center transition-all ${
                    saladWeight === "250g"
                      ? "border-emerald-600 bg-emerald-50/90 ring-2 ring-emerald-500/20 font-bold text-emerald-950 shadow-xs"
                      : "border-line bg-white hover:border-slate-300 text-slate-600"
                  }`}
                >
                  <span className="block text-xs font-extrabold">250g Pack</span>
                  <span className="block text-[10px] text-muted">
                    {isFruitSalad || isVegSalad ? "Select 3 to 5" : "Select 3 items"}
                  </span>
                  <span className="mt-1 text-xs font-black text-emerald-800">{formatINR(price250)}</span>
                </button>

                {/* 500g Button */}
                <button
                  type="button"
                  onClick={() => handleSaladWeightChange("500g")}
                  className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-center transition-all ${
                    saladWeight === "500g"
                      ? "border-emerald-600 bg-emerald-50/90 ring-2 ring-emerald-500/20 font-bold text-emerald-950 shadow-xs"
                      : "border-line bg-white hover:border-slate-300 text-slate-600"
                  }`}
                >
                  <span className="block text-xs font-extrabold">500g Pack</span>
                  <span className="block text-[10px] text-muted">
                    {isFruitSalad || isVegSalad ? "Select 5 to 8" : "Select 5 to 7"}
                  </span>
                  <span className="mt-1 text-xs font-black text-emerald-800">{formatINR(price500)}</span>
                </button>

                {/* 1kg Button */}
                <button
                  type="button"
                  onClick={() => handleSaladWeightChange("1kg")}
                  className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-center transition-all ${
                    saladWeight === "1kg"
                      ? "border-emerald-600 bg-emerald-50/90 ring-2 ring-emerald-500/20 font-bold text-emerald-950 shadow-xs"
                      : "border-line bg-white hover:border-slate-300 text-slate-600"
                  }`}
                >
                  <span className="block text-xs font-extrabold">1 kg Pack</span>
                  <span className="block text-[10px] text-muted">
                    {isFruitSalad ? "Select 7 to 12" : isVegSalad ? "Select 7 to 10" : "Select 7 to 8"}
                  </span>
                  <span className="mt-1 text-xs font-black text-emerald-800">{formatINR(price1kg)}</span>
                </button>
              </div>
            )}
          </div>

          {/* 2. Ingredients Banner showing exact count & allowed range */}
          <div className="mb-3 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50 p-3 border border-emerald-200/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                {isComboKit ? (
                  <>Exact Combo Ingredients (<strong className="text-emerald-950 font-black">{activeWeightLabel}</strong>)</>
                ) : (
                  <>
                    Selection for <strong className="text-emerald-950 font-black">{activeWeightLabel}</strong>:{" "}
                    <span className="text-[11px] font-bold text-emerald-800">
                      ({minRequired === maxAllowed ? `${minRequired} ${itemUnitName}` : `${minRequired} to ${maxAllowed} ${itemUnitName}`})
                    </span>
                  </>
                )}
              </span>
              <span className="chip font-extrabold text-[11px] bg-white text-emerald-900 border border-emerald-300">
                {count} / {maxAllowed} {itemUnitName} Selected
              </span>
            </div>
            {isComboKit ? (
              <p className="mt-1.5 text-[11px] text-slate-600">
                All pre-measured ingredients are freshly chopped and washed. Click to uncheck any item you don&apos;t want.
              </p>
            ) : isTooFew ? (
              <p className="mt-1.5 text-[11px] font-bold text-amber-900 flex items-center gap-1">
                <AlertCircle size={13} className="text-amber-700 shrink-0" />
                Please select at least {minRequired} {itemUnitName} ({minRequired - count} more needed).
              </p>
            ) : (
              <p className="mt-1.5 text-[11px] font-medium text-emerald-800">
                {isMaxReached
                  ? `Maximum ${maxAllowed} ${itemUnitName} reached for ${activeWeightLabel}!`
                  : `Selected ${count} ${itemUnitName}. You can select up to ${maxAllowed - count} more.`}
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
                    <span className="h-2 w-2 rounded-full bg-emerald-600 shrink-0" />
                    <span className="truncate font-semibold">{item.name}</span>
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

          {/* 4. WhatsApp Customization Button */}
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
              <span>
                Add to Basket ({isComboKit ? activeWeightLabel : `${count} ${itemUnitName} • ${activeWeightLabel}`})
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
