"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const HERO_QUOTES = [
  "No chopping. No stress. Just fresh cooking.",
  "From our chop board to your hot pan.",
  "Freshly cut. Easily cooked. Loved by all.",
  "Save time on the prep. Spend time on the meal.",
  "ஆபீஸ்ல இருந்து வர்றீங்களா? 10-Min Easy Cooking!",
];

export function HeroDialogueHeading() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % HERO_QUOTES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative min-h-[7.5rem] md:min-h-[10rem] flex items-center overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.h1
          key={index}
          initial={{ opacity: 0, y: 18, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -18, filter: "blur(4px)" }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="text-balance text-[34px] sm:text-[42px] md:text-[56px] font-extrabold leading-[1.08] tracking-[-0.03em] text-slate-900"
        >
          &ldquo;<span className="bg-gradient-to-r from-emerald-950 via-emerald-800 to-teal-900 bg-clip-text text-transparent">{HERO_QUOTES[index]}</span>&rdquo;
        </motion.h1>
      </AnimatePresence>
    </div>
  );
}
