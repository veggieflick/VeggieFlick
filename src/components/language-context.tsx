"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Language = "en" | "ta";

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
    "ui.tamil": "தமிழ்",
  },
  ta: {
    // Header & Nav
    "nav.search_placeholder": "காய்கறிகள், பழங்கள் & பொருட்கள் தேடுக...",
    "nav.delivery_to": "டெலிவரி இடம்",
    "nav.chennai": "சென்னை 600001",
    "nav.account": "என் கணக்கு",
    "nav.login": "உள்நுழைக",
    "nav.logout": "வெளியேறு",
    "nav.cart": "கூடை",
    "nav.recipes": "சமையல் குறிப்புகள்",
    "nav.shop": "அனைத்தும்",
    "nav.blog": "பதிவுகள்",
    "nav.about": "எங்களைப் பற்றி",
    "nav.admin": "பணியாளர் தளம்",

    // Banner & Hero
    "hero.free_delivery_banner": "🚀 சென்னை முழுவதும் ₹199-க்கு மேல் இலவச டெலிவரி!",
    "hero.cta_shop": "இன்றைய அறுவடை வாங்க",
    "hero.cta_fresh": "இன்றைய ஃப்ரெஷ் சலுகைகள்",
    "hero.fresh_badge": "காலை 4 மணி அறுவடை · சென்னை மட்டும்",
    "hero.easy_cooking": "✨ சுலபமான சமையல் & Meal Kits",
    "hero.next_slot": "அடுத்த டெலிவரி நேரம்",
    "hero.next_slot_time": "நாளை · காலை 06:00 – 08:00",

    // Product Cards & Shop
    "product.add": "சேர்",
    "product.out_of_stock": "கையிருப்பில் இல்லை",
    "product.organic": "இயற்கை",
    "product.fresh_today": "இன்றைய ஃப்ரெஷ்",
    "product.best_seller": "அதிகம் விற்பனை",
    "product.select_cut": "நறுக்கும் முறை",

    // Cut Types
    "cut.whole": "முழு காய்கறி",
    "cut.sambar": "சாம்பார் நறுக்கல்",
    "cut.poriyal": "பொரியல் பொடி நறுக்கல்",
    "cut.curry": "குழம்பு பெரிய நறுக்கல்",

    // Recipe Details
    "recipe.add_all_ingredients": "🛒 சமையல் பொருட்கள் அனைத்தும் கூடைக்குச் சேர்",
    "recipe.ingredients_added": "சமையல் பொருட்கள் அனைத்தும் கூடையில சேர்க்கப்பட்டது!",
    "recipe.prep_time": "ஆயத்த நேரம்",
    "recipe.cook_time": "சமையல் நேரம்",
    "recipe.servings": "நபர்கள்",

    // Cart & Checkout
    "cart.title": "உங்கள் ஃப்ரெஷ் கூடை",
    "cart.empty": "உங்கள் கூடை காலியாக உள்ளது",
    "cart.checkout": "செக்அவுட் செய்ய",
    "cart.subtotal": "மொத்தத் தொகை",
    "cart.delivery_fee": "டெலிவரி கட்டணம்",
    "cart.grand_total": "இறுதித் தொகை",
    "cart.free_delivery_needed": "இலவச டெலிவரிக்கு இன்னும் ₹{amount} பொருட்களுக்குச் சேர்க்கவும்!",

    // General UI
    "ui.language": "மொழி",
    "ui.english": "English",
    "ui.tamil": "தமிழ்",
  },
};

type LanguageContextValue = {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("veggie_lang") as Language;
    if (saved && (saved === "en" || saved === "ta")) {
      setLangState(saved);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("veggie_lang", newLang);
  };

  const t = (key: string, replacements?: Record<string, string | number>): string => {
    const dict = DICTIONARIES[lang] || DICTIONARIES.en;
    let text = dict[key] || DICTIONARIES.en[key] || key;
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
