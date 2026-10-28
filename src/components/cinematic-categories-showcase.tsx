"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type CinematicCategory = {
  id: string;
  name: string;
  slug: string;
  tamilName: string;
  badge: string;
  tagline: string;
  description: string;
  itemCount: string;
  featuredPills: string[];
  image: string;
  themeGradient: string;
  accentGlow: string;
  isPreOrder?: boolean;
};

export const CINEMATIC_CATEGORIES: CinematicCategory[] = [
  {
    id: "cat-1",
    name: "Chopped Vegetables (Instant/Ready to cook)",
    slug: "chopped-vegetables",
    tamilName: "நறுக்கிய காய்கறிகள் (Instant/Ready to cook)",
    badge: "100% Ready To Cook",
    tagline: "Washed in ozonated water, cleanly diced, sliced & peeled ready to cook with zero kitchen prep waste.",
    description: "Save 30 minutes of kitchen prep every day with fresh pan-ready vegetables.",
    itemCount: "32 Fresh Items",
    featuredPills: [
      "Beans",
      "Carrot",
      "Beetroot",
      "Lady's Finger",
      "Cauliflower",
      "Peeled Small Onion & Garlic",
      "Grated Coconut",
    ],
    image: "/images/chopped-veggies-platter.jpg",
    themeGradient: "from-emerald-950 via-emerald-900 to-teal-950",
    accentGlow: "bg-emerald-500",
  },
  {
    id: "cat-2",
    name: "Chopped Fruits",
    slug: "chopped-fruits",
    tamilName: "நறுக்கிய பழங்கள்",
    badge: "Chilled & Fresh Cut",
    tagline: "Cleanly cut, seedless & freshly diced seasonal and exotic fruits packed for instant snacking.",
    description: "Prepared fresh upon order with food-grade vacuum packaging to preserve natural juices.",
    itemCount: "15 Fruit Packs",
    featuredPills: [
      "Papaya",
      "Pineapple",
      "Seedless Watermelon",
      "Dragon Fruit",
      "Kiwi",
      "Guava",
      "Pomegranate Arils",
    ],
    image: "/images/products/fruit-salad-exotic.jpg",
    themeGradient: "from-amber-950 via-orange-950 to-rose-950",
    accentGlow: "bg-amber-500",
  },
  {
    id: "cat-3",
    name: "Sprouts (pre order only)",
    slug: "sprouts",
    tamilName: "முளைகட்டிய பயறுகள் (Pre-Order Only)",
    badge: "24-Hr Natural Germination",
    tagline: "Naturally sprouted organic pulses rich in live enzymes, bioavailable protein & digestive fiber.",
    description: "Order 1 day in advance. Germinated organically under strict hygiene standards.",
    itemCount: "8 Sprouts Varieties",
    featuredPills: [
      "Green Moong Dal",
      "Black Channa",
      "White Channa",
      "Soya Beans",
      "Groundnut",
      "Horse Gram (Kollu)",
    ],
    image: "/images/products/veg-salad-sprouts.jpg",
    themeGradient: "from-teal-950 via-emerald-950 to-slate-950",
    accentGlow: "bg-teal-400",
    isPreOrder: true,
  },
  {
    id: "cat-4",
    name: "Combo",
    slug: "combos",
    tamilName: "சமையல் காம்போ கிட்ஸ்",
    badge: "Complete Recipe Kits",
    tagline: "Pulav, Biriyani, Aviyal & Bisi Bele Bath complete recipe kits kg-wise with exact authentic ingredients.",
    description: "All veggies pre-portioned, peeled and baton/slice-cut for hassle-free festive meals.",
    itemCount: "4 Meal Kits",
    featuredPills: [
      "Pulav Special Combo",
      "Vegetables Biriyani Combo",
      "Traditional Aviyal 7-Veg Cut Mix",
      "Bisi Bele Bath Kit",
    ],
    image: "/images/products/vegetables-biryani-special-kit.png",
    themeGradient: "from-orange-950 via-amber-950 to-yellow-950",
    accentGlow: "bg-orange-500",
  },
  {
    id: "cat-5",
    name: "Fruit salad",
    slug: "fruit-salad",
    tamilName: "பழ சாலட் (Customizable)",
    badge: "Custom Tossed Bowls",
    tagline: "Fresh fruit & berry salad bowls — add fruits and berries based on your wish.",
    description: "Custom fruit blends and chef-curated citrus bowls with natural mint infusion.",
    itemCount: "5 Salad Bowls",
    featuredPills: [
      "Custom Wishlist Fruit Bowl",
      "Tropical Melon & Berry",
      "Watermelon Mint Refresher",
      "Strawberry Fruit Bowl",
      "Blueberry & Berry Bliss",
    ],
    image: "/images/products/fruit-salad-melon.jpg",
    themeGradient: "from-rose-950 via-pink-950 to-red-950",
    accentGlow: "bg-rose-500",
  },
  {
    id: "cat-6",
    name: "Sprouts salads",
    slug: "sprouts-salads",
    tamilName: "முளைகட்டிய பயறு சாலட் (Pre-Order Only)",
    badge: "Select Any 3 Items Diet Plan",
    tagline: "Diet-friendly sprouts salad bowls (Select any 3 items - Pre-order only).",
    description: "High-protein fitness bowls custom customized to your personalized nutrition plan.",
    itemCount: "3 Diet Bowls",
    featuredPills: [
      "Custom Sprouts Salad (Pick 3)",
      "Protein Sprouts Power Salad",
      "Sprouted Moong & Cucumber",
      "Pepper Lime Dressing",
    ],
    image: "/images/products/sprouts-salad-custom-bowl.jpg",
    themeGradient: "from-lime-950 via-emerald-950 to-teal-950",
    accentGlow: "bg-lime-500",
    isPreOrder: true,
  },
  {
    id: "cat-7",
    name: "Vegetables salads",
    slug: "vegetables-salads",
    tamilName: "காய்கறி சாலட் (Select Any 3 Items)",
    badge: "Select Any 3 Items Fresh Toss",
    tagline: "Fresh garden vegetable salad bowls (Select any 3 items fresh tossed with light dressing).",
    description: "Crunchy broccoli, sweet corn, cabbage, diced carrots & cooling cucumber.",
    itemCount: "3 Garden Bowls",
    featuredPills: [
      "Custom Vegetables Salad (Pick 3)",
      "Fresh Vegetables Salad Bowl",
      "Sweet Corn & Broccoli Crunch",
      "Coriander Mint Dressing",
    ],
    image: "/images/products/vegetable-salad-custom-bowl.jpg",
    themeGradient: "from-emerald-950 via-teal-950 to-cyan-950",
    accentGlow: "bg-emerald-400",
  },
];

const AUTO_PLAY_INTERVAL = 5000; // 5 seconds per slide

export function CinematicCategoriesShowcase() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const active = CINEMATIC_CATEGORIES[currentIndex];

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % CINEMATIC_CATEGORIES.length);
    setProgress(0);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + CINEMATIC_CATEGORIES.length) % CINEMATIC_CATEGORIES.length);
    setProgress(0);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setProgress(0);
  };

  // Timer loop with progress bar
  useEffect(() => {
    if (isPaused) return;

    const tickInterval = 50;
    const increment = (tickInterval / AUTO_PLAY_INTERVAL) * 100;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextSlide();
          return 0;
        }
        return prev + increment;
      });
    }, tickInterval);

    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  return (
    <section
      aria-label="Official 7 Fresh Produce Aisles Showcase"
      className="relative overflow-hidden py-6 md:py-10"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container-page">
        {/* Section Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/90 px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-widest text-emerald-900 border border-emerald-300 shadow-2xs">
              <Sparkles size={13} className="text-emerald-700" />
              <span>Official 7 Produce Aisles</span>
            </div>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-ink md:text-4xl">
              Featured Fresh Categories
            </h2>
            <p className="mt-1 text-sm text-slate-600 max-w-2xl leading-relaxed">
              Explore our 7 core categories with farm-to-table hygiene, zero kitchen waste, and rapid Chennai doorstep delivery.
            </p>
          </div>

          {/* Slider Controls */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Previous category"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-800 shadow-xs transition-all hover:bg-emerald-50 hover:border-emerald-600 hover:text-emerald-800 active:scale-95"
            >
              <ChevronLeft size={18} strokeWidth={2.5} />
            </button>
            <span className="min-w-16 text-center text-xs font-black tracking-wider text-slate-600">
              0{currentIndex + 1} / 0{CINEMATIC_CATEGORIES.length}
            </span>
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next category"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-800 shadow-xs transition-all hover:bg-emerald-50 hover:border-emerald-600 hover:text-emerald-800 active:scale-95"
            >
              <ChevronRight size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Cinematic Main Viewport */}
        <div className="relative min-h-[480px] md:min-h-[520px] lg:min-h-[560px] w-full overflow-hidden rounded-3xl border border-slate-800/40 bg-slate-950 shadow-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              {/* Background High-Res Image with Subtle Ken-Burns Effect */}
              <div className="absolute inset-0">
                <Image
                  src={active.image}
                  alt={active.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 1280px"
                  className="object-cover object-center transform transition-transform duration-7000 ease-out scale-105 hover:scale-110"
                />
                {/* Cinematic Vignette & Ambient Gradient Overlays */}
                <div className={`absolute inset-0 bg-gradient-to-r ${active.themeGradient} opacity-90 mix-blend-multiply`} />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
                <div className="absolute inset-0 bg-radial-gradient from-transparent via-slate-950/40 to-slate-950/80" />
              </div>

              {/* Foreground Content Grid */}
              <div className="relative z-10 flex h-full flex-col justify-between p-6 md:p-10 lg:p-14 text-white">
                {/* Top Badges & Category Counter */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-white backdrop-blur-md border border-white/20 shadow-xs">
                      <ShieldCheck size={14} className="text-emerald-400" />
                      {active.badge}
                    </span>
                    {active.isPreOrder && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/25 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-teal-200 backdrop-blur-md border border-teal-400/40">
                        <Clock size={13} />
                        Pre-Order 1 Day In Advance
                      </span>
                    )}
                  </div>

                  <span className="rounded-full bg-black/40 px-3 py-1 text-[11px] font-mono font-bold tracking-widest text-slate-300 backdrop-blur-md border border-white/10">
                    AISLE 0{currentIndex + 1}
                  </span>
                </div>

                {/* Center / Bottom Cinematic Copy */}
                <div className="my-auto max-w-2xl py-6 md:py-8">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-emerald-300/90">
                      {active.itemCount} · Chennai Fast Delivery
                    </span>
                    <h3 className="mt-1.5 text-2xl font-black tracking-tight text-white sm:text-3xl md:text-5xl lg:text-6xl leading-[1.08]">
                      {active.name}
                    </h3>
                    <p className="mt-2 text-base md:text-lg font-bold text-amber-300/95 tracking-wide">
                      {active.tamilName}
                    </p>
                    <p className="mt-3 text-xs md:text-sm text-slate-200/90 leading-relaxed max-w-xl">
                      {active.tagline}
                    </p>
                  </motion.div>

                  {/* Featured Item Tags */}
                  <motion.div
                    initial={{ y: 15, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.35, duration: 0.5 }}
                    className="mt-5 flex flex-wrap items-center gap-1.5 md:gap-2"
                  >
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-300 mr-1 flex items-center gap-1">
                      <Layers size={13} className="text-emerald-400" />
                      Popular:
                    </span>
                    {active.featuredPills.slice(0, 5).map((pill) => (
                      <span
                        key={pill}
                        className="rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/90 backdrop-blur-xs border border-white/10 transition-colors hover:bg-white/20"
                      >
                        {pill}
                      </span>
                    ))}
                    {active.featuredPills.length > 5 && (
                      <span className="rounded-lg bg-white/5 px-2 py-1 text-[10px] font-bold text-slate-300">
                        +{active.featuredPills.length - 5} more
                      </span>
                    )}
                  </motion.div>

                  {/* Call to Action Button */}
                  <motion.div
                    initial={{ y: 15, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.45, duration: 0.5 }}
                    className="mt-6 flex flex-wrap items-center gap-3"
                  >
                    <Link
                      href={`/shop?category=${active.slug}`}
                      className="btn btn-primary bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs md:text-sm px-6 py-3.5 rounded-xl shadow-lg shadow-emerald-950/80 inline-flex items-center gap-2 transform transition-transform hover:scale-105"
                    >
                      <span>Explore {active.name.split(" ")[0]} Aisle</span>
                      <ArrowRight size={16} strokeWidth={2.5} />
                    </Link>

                    <Link
                      href="/shop"
                      className="btn btn-outline border-white/30 text-white font-bold text-xs md:text-sm px-5 py-3.5 rounded-xl bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors"
                    >
                      Browse All Categories
                    </Link>
                  </motion.div>
                </div>

                {/* Bottom Active Category Indicator & Auto-Play Progress Bar */}
                <div className="w-full pt-4 border-t border-white/15">
                  <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
                    <span className="font-bold tracking-wide">
                      Aisle 0{currentIndex + 1} of 07: <strong className="text-white">{active.name}</strong>
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {isPaused ? "Paused on hover" : "Auto-transitioning..."}
                    </span>
                  </div>

                  {/* Smooth Progress Bar */}
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-amber-400 transition-all duration-75 ease-linear rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Interactive 7 Category Thumbnail Selector Strip */}
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7 md:gap-3">
          {CINEMATIC_CATEGORIES.map((cat, idx) => {
            const isSelected = idx === currentIndex;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => goToSlide(idx)}
                aria-label={`Switch to ${cat.name}`}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl p-3 text-left transition-all duration-300 ${
                  isSelected
                    ? "bg-slate-900 border-2 border-emerald-500 shadow-lg -translate-y-1"
                    : "bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 shadow-2xs"
                }`}
              >
                {/* Thumbnail Preview */}
                <div className="relative mb-2 h-16 w-full overflow-hidden rounded-xl bg-slate-100">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 180px"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className={`absolute inset-0 ${isSelected ? "bg-emerald-950/30" : "bg-black/15 group-hover:bg-transparent"} transition-colors`} />
                  <span className={`absolute top-1 left-1 rounded-md px-1.5 py-0.5 text-[9px] font-mono font-bold ${
                    isSelected ? "bg-emerald-500 text-white" : "bg-black/60 text-white"
                  }`}>
                    0{idx + 1}
                  </span>
                </div>

                <div>
                  <h4 className={`text-xs font-black line-clamp-1 tracking-tight ${
                    isSelected ? "text-white" : "text-slate-900 group-hover:text-emerald-900"
                  }`}>
                    {cat.name}
                  </h4>
                  <p className={`text-[10px] font-semibold line-clamp-1 ${
                    isSelected ? "text-emerald-300" : "text-slate-500"
                  }`}>
                    {cat.tamilName}
                  </p>
                </div>

                {/* Active Indicator Bar */}
                <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-slate-200">
                  {isSelected && (
                    <div
                      className="h-full bg-emerald-500 transition-all duration-75 ease-linear rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
