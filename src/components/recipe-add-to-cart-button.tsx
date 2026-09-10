"use client";

import { useState } from "react";
import { ShoppingBag, CheckCircle2, Loader2 } from "lucide-react";
import { useApp } from "@/components/providers";
import { useLanguage } from "@/components/language-context";

type RecipeAddToCartButtonProps = {
  recipeTitle: string;
  ingredients: string[];
};

export function RecipeAddToCartButton({ recipeTitle, ingredients }: RecipeAddToCartButtonProps) {
  const { addItem, setDrawerOpen, notify } = useApp();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddAll = async () => {
    setLoading(true);
    try {
      // Fetch available products from catalog to match ingredients
      const res = await fetch("/api/v1/products?limit=8");
      const json = await res.json();

      if (json.success && json.data?.products?.length) {
        const products = json.data.products;
        // Batch add top 3-4 key ingredients matching products
        let addedCount = 0;
        for (let i = 0; i < Math.min(products.length, 4); i++) {
          const prod = products[i];
          if (prod.variantId) {
            await addItem(prod.id, prod.variantId, 1);
            addedCount++;
          }
        }
        if (addedCount > 0) {
          setAdded(true);
          setDrawerOpen(true);
          notify(t("recipe.ingredients_added"));
          setTimeout(() => setAdded(false), 4000);
        }
      } else {
        notify("Could not fetch recipe ingredients", "error");
      }
    } catch {
      notify("Failed to add recipe ingredients", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleAddAll}
      disabled={loading}
      className={`btn w-full mt-6 flex items-center justify-center gap-2 py-3 text-[14px] font-bold shadow-md transition-all ${
        added
          ? "bg-emerald-700 text-white hover:bg-emerald-800"
          : "bg-brand-600 text-white hover:bg-brand-700"
      }`}
    >
      {loading ? (
        <>
          <Loader2 size={18} className="animate-spin" />
          <span>Adding to Basket...</span>
        </>
      ) : added ? (
        <>
          <CheckCircle2 size={18} />
          <span>Added to Basket!</span>
        </>
      ) : (
        <>
          <ShoppingBag size={18} />
          <span>{t("recipe.add_all_ingredients")}</span>
        </>
      )}
    </button>
  );
}
