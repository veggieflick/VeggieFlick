"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Language = "en";

type Dictionary = Record<string, string>;

const DICTIONARIES: Record<Language, Dictionary> = {
  en: {
    // Header & Nav
    "nav.search_placeholder": "Search fresh vegetables, fruits & grocery...",
    "nav.delivery_to": "Delivering to",
    "nav.chennai": "Chennai 600001",
    "nav.account": "Account",
    "nav.login": "Sign In",
    "nav.logout": "Sign Out",
    "nav.cart": "Cart",
    "nav.recipes": "Recipes",
    "nav.shop": "Shop All",
    "nav.blog": "Journal",
    "nav.about": "About",
    "nav.admin": "Staff Portal",

    // Banner & Hero
    "hero.free_delivery_banner": "🚀 FREE DELIVERY on all orders above ₹199 across Chennai!",
    "hero.cta_shop": "Shop today's harvest",
    "hero.cta_fresh": "Fresh today collection",
    "hero.fresh_badge": "Harvested at 4 AM · Chennai only",
    "hero.easy_cooking": "✨ Easy Cooking & Ready to Meal",
    "hero.next_slot": "Next available slot",
    "hero.next_slot_time": "Tomorrow · 06:00 – 08:00 AM",

    // Product Cards & Shop
    "product.add": "ADD",
    "product.out_of_stock": "Out of Stock",
    "product.organic": "Organic",
    "product.fresh_today": "Fresh Today",
    "product.best_seller": "Best Seller",
    "product.select_cut": "Select Cut Type",

    // Cut Types
    "cut.whole": "Whole / Intact",
    "cut.sambar": "Sambar Big Cut",
    "cut.poriyal": "Poriyal Fine Dice",
    "cut.curry": "Curry Cubes",

    // Recipe Details
    "recipe.add_all_ingredients": "🛒 Add All Recipe Ingredients to Cart",
    "recipe.ingredients_added": "All recipe ingredients added to your basket!",
    "recipe.prep_time": "Prep Time",
    "recipe.cook_time": "Cook Time",
    "recipe.servings": "Servings",

    // Cart & Checkout
    "cart.title": "Your Fresh Basket",
    "cart.empty": "Your basket is empty",
    "cart.checkout": "Proceed to Checkout",
    "cart.subtotal": "Subtotal",
    "cart.delivery_fee": "Delivery Charge",
    "cart.grand_total": "Grand Total",
    "cart.free_delivery_needed": "Add ₹{amount} more for FREE Delivery!",

    // General UI
    "ui.language": "Language",
    "ui.english": "English",
  },
};

type LanguageContextValue = {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang] = useState<Language>("en");

  useEffect(() => {
    localStorage.setItem("veggie_lang", "en");
  }, []);

  const setLang = () => {
    localStorage.setItem("veggie_lang", "en");
  };

  const t = (key: string, replacements?: Record<string, string | number>): string => {
    let text = DICTIONARIES.en[key] || key;
    if (replacements) {
      Object.entries(replacements).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    return {
      lang: "en",
      setLang: () => {},
      t: (key: string, replacements?: Record<string, string | number>) => {
        let text = DICTIONARIES.en[key] || key;
        if (replacements) {
          Object.entries(replacements).forEach(([k, v]) => {
            text = text.replace(`{${k}}`, String(v));
          });
        }
        return text;
      },
    };
  }
  return ctx;
}
