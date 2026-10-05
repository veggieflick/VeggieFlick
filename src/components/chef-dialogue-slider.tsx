"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, Scissors, Sparkles, Utensils } from "lucide-react";

export function ChefDialogueSlider() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="mt-6 rounded-3xl border border-emerald-200/80 bg-white/90 p-4 shadow-xl backdrop-blur-xl md:p-5"
    >
      <div className="flex flex-col gap-4">
        {/* Infographic 3-Column Visual Badges */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl bg-emerald-50/80 border border-emerald-100 p-2.5 flex flex-col items-center justify-center">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-800 text-white mb-1.5 shadow-xs">
              <Clock size={16} strokeWidth={2.2} />
            </span>
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-950">10-Min Prep</span>
            <span className="text-[10px] font-bold text-slate-500">Zero Chopping</span>
          </div>

          <div className="rounded-2xl bg-teal-50/80 border border-teal-100 p-2.5 flex flex-col items-center justify-center">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-800 text-white mb-1.5 shadow-xs">
              <Scissors size={16} strokeWidth={2.2} />
            </span>
            <span className="text-[11px] font-black uppercase tracking-wider text-teal-950">Pre-Cut & Washed</span>
            <span className="text-[10px] font-bold text-slate-500">Ozone Cleaned</span>
          </div>

          <div className="rounded-2xl bg-amber-50/80 border border-amber-100 p-2.5 flex flex-col items-center justify-center">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-600 text-white mb-1.5 shadow-xs">
              <Sparkles size={16} strokeWidth={2.2} />
            </span>
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-950">Dawn Picked</span>
            <span className="text-[10px] font-bold text-slate-500">4 AM Harvest</span>
          </div>
        </div>

        {/* Quick Action Shortcuts */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-900">
              <Utensils size={14} />
            </span>
            <span className="text-xs font-extrabold text-slate-800">Ready To Cook Shortcuts</span>
          </div>

          <div className="flex items-center gap-2">
            <Link href="#combo-kits">
              <motion.span
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="btn btn-primary bg-emerald-800 hover:bg-emerald-900 border-none py-2 px-3.5 text-xs font-bold shadow-md shadow-emerald-800/20"
              >
                Combo Kits →
              </motion.span>
            </Link>
            <Link href="/shop?category=vegetables-shopping&cut=true">
              <motion.span
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="btn btn-outline border-emerald-300 text-emerald-950 hover:bg-emerald-50 py-2 px-3.5 text-xs font-bold"
              >
                Pre-Cut Veggies
              </motion.span>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
