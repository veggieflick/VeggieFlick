"use client";

import { useState } from "react";
import { Gift, Sparkles, X, CheckCircle2, Copy } from "lucide-react";
import { useApp } from "@/components/providers";

type Reward = {
  title: string;
  code: string;
  description: string;
  emoji: string;
};

const REWARDS: Reward[] = [
  {
    title: "₹25 Instant Wallet Cashback",
    code: "SCRATCH25",
    description: "Credited to your VeggieFlick Wallet on your next fresh produce order!",
    emoji: "🎉",
  },
  {
    title: "FREE Organic Coriander & Curry Leaf Bundle",
    code: "FREECURRY",
    description: "Harvested fresh at 4 AM and added to your next morning delivery slot.",
    emoji: "🥬",
  },
  {
    title: "10% Extra Cashback Coupon",
    code: "VEGGIE10",
    description: "Valid on all cut vegetables and ready-to-cook meal kits.",
    emoji: "🎁",
  },
];

type ScratchCardModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function ScratchCardModal({ isOpen, onClose }: ScratchCardModalProps) {
  const { notify } = useApp();
  const [scratched, setScratched] = useState(false);
  const [reward] = useState<Reward>(() => REWARDS[Math.floor(Math.random() * REWARDS.length)]);

  if (!isOpen) return null;

  const handleScratch = () => {
    setScratched(true);
    notify(`Congratulations! You won: ${reward.title}`);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-fade-in">
      <div className="card w-full max-w-md bg-white p-6 shadow-2xl rounded-3xl text-center relative overflow-hidden">
        <button
          type="button"
          onClick={onClose}
          className="btn-ghost btn-icon absolute top-3 right-3 h-8 w-8 rounded-full z-10"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="flex justify-center mb-2">
          <span className="chip bg-amber-100 text-amber-900 border border-amber-200 font-extrabold text-xs inline-flex items-center gap-1.5">
            <Sparkles size={14} className="text-amber-600" /> ORDER REWARD UNLOCKED!
          </span>
        </div>

        <h3 className="text-xl font-extrabold text-ink">VeggieFlick Reward Scratch Card</h3>
        <p className="text-xs text-muted mt-1">Tap below to scratch and claim your exclusive gift!</p>

        <div className="my-6 relative flex justify-center">
          {!scratched ? (
            <button
              type="button"
              onClick={handleScratch}
              className="w-full h-44 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 text-white font-extrabold flex flex-col items-center justify-center gap-2 shadow-xl hover:scale-[1.02] active:scale-95 transition-transform border-4 border-amber-200 cursor-pointer"
            >
              <Gift size={48} className="animate-bounce" />
              <span className="text-base tracking-wider uppercase">✨ TAP TO SCRATCH CARD ✨</span>
            </button>
          ) : (
            <div className="w-full h-44 rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-emerald-100 border-2 border-emerald-400 p-4 flex flex-col items-center justify-center gap-2 shadow-inner animate-fade-in">
              <span className="text-4xl">{reward.emoji}</span>
              <h4 className="text-base font-bold text-emerald-950">{reward.title}</h4>
              <p className="text-xs text-slate-600 leading-tight">{reward.description}</p>
              <div className="flex items-center gap-2 mt-1 rounded-lg bg-emerald-200/80 px-3 py-1 text-xs font-mono font-bold text-emerald-900">
                <span>CODE: {reward.code}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(reward.code);
                    notify("Reward code copied!");
                  }}
                  className="text-emerald-950 hover:text-black"
                >
                  <Copy size={12} />
                </button>
              </div>
            </div>
          )}
        </div>

        {scratched ? (
          <button
            type="button"
            onClick={onClose}
            className="btn btn-primary w-full py-3 text-xs font-bold bg-emerald-700 text-white shadow-md hover:bg-emerald-800"
          >
            Claim & Continue Shopping
          </button>
        ) : (
          <p className="text-[11px] text-slate-400">Guaranteed reward on every order placed in Chennai!</p>
        )}
      </div>
    </div>
  );
}
