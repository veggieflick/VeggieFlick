"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChefHat, Clock, UtensilsCrossed, Sparkles } from "lucide-react";

const DIALOGUES = [
  {
    title: "No chopping. No stress. Just fresh cooking.",
    desc: "Pre-washed, freshly cut vegetables & ready-to-cook kits ready when you reach home from work.",
  },
  {
    title: "From our chop board to your hot pan.",
    desc: "Skip 30 minutes of tedious peeling and slicing. Just open the pack and sizzle!",
  },
  {
    title: "Save time on the prep. Spend time on the meal.",
    desc: "Ideal for busy office goers and families across Chennai.",
  },
  {
    title: "ஆபீஸ்ல இருந்து வர்றீங்களா? 10-Min Easy Cooking!",
    desc: "10 நிமிஷத்துல Ready to Cook Meal Kits & Pre-cut Veggies delivered fresh.",
  },
  {
    title: "Freshly cut. Easily cooked. Loved by all.",
    desc: "Harvested at dawn from partner farms in Tamil Nadu and delivered to your doorstep.",
  },
];

export function ChefDialogueSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % DIALOGUES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const current = DIALOGUES[index];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mt-6 rounded-3xl border border-emerald-200/80 bg-white/85 p-5 shadow-xl backdrop-blur-xl md:p-6"
    >
      <div className="flex items-start gap-4">
        <motion.div
          whileHover={{ rotate: 10, scale: 1.05 }}
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-800 via-emerald-900 to-teal-950 text-white shadow-lg shadow-emerald-900/20"
        >
          <ChefHat className="h-7 w-7 text-amber-300" />
        </motion.div>
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-100/90 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-900 uppercase tracking-widest border border-emerald-200">
              Chef&apos;s Special Solution
            </span>
            <span className="text-xs font-semibold text-muted flex items-center gap-1">
              <Clock size={12} className="text-emerald-700" /> 10-Min Kits
            </span>
          </div>

          {/* Animated Dynamic Text Overlay */}
          <div className="relative mt-2 min-h-[3.8rem] flex items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
              >
                <h3 className="text-base font-extrabold text-slate-900 md:text-lg">
                  &ldquo;{current.title}&rdquo;
                </h3>
                <p className="mt-0.5 text-xs text-slate-600 leading-relaxed md:text-sm">
                  {current.desc}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Link href="/shop?category=ready-to-cook">
              <motion.span
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="btn btn-primary bg-emerald-800 hover:bg-emerald-900 border-none py-2 text-xs font-bold shadow-md shadow-emerald-800/20"
              >
                <UtensilsCrossed size={14} /> Ready to Cook Kits
              </motion.span>
            </Link>
            <Link href="/shop?category=cut-vegetables">
              <motion.span
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="btn btn-outline border-emerald-300 text-emerald-950 hover:bg-emerald-50 py-2 text-xs font-bold"
              >
                Pre-Cut Veggies 🥗
              </motion.span>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
