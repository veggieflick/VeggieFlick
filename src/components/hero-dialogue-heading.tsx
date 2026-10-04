"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const HERO_QUOTES = [
  "Freshly Cut. Ready to Cook.",
  "No Chopping. No Stress. Just Fresh Cooking.",
  "From K.K. Nagar Hub to Your Hot Pan.",
  "Save 25 Minutes of Prep Every Single Day.",
];

export function HeroDialogueHeading() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % HERO_QUOTES.length);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative min-h-[6.5rem] md:min-h-[8.5rem] flex items-center overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.h1
          key={index}
          initial={{ opacity: 0, y: 18, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -18, filter: "blur(4px)" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-balance text-[32px] sm:text-[40px] md:text-[52px] font-black leading-[1.08] tracking-[-0.03em] text-slate-900"
        >
          &ldquo;<span className="bg-gradient-to-r from-emerald-950 via-emerald-800 to-teal-900 bg-clip-text text-transparent">{HERO_QUOTES[index]}</span>&rdquo;
        </motion.h1>
      </AnimatePresence>
    </div>
  );
}
