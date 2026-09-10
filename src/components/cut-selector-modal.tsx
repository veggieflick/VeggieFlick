"use client";

import { useState } from "react";
import { Scissors, Check, X } from "lucide-react";
import { useLanguage } from "@/components/language-context";

export type CutType = "whole" | "sambar" | "poriyal" | "curry";

export type CutOption = {
  id: CutType;
  labelKey: string;
  desc: string;
  iconEmoji: string;
};

const CUT_OPTIONS: CutOption[] = [
  { id: "whole", labelKey: "cut.whole", desc: "Original fresh uncut whole produce", iconEmoji: "🥦" },
  { id: "sambar", labelKey: "cut.sambar", desc: "Large even chunks ready for Sambar & Avial", iconEmoji: "🍲" },
  { id: "poriyal", labelKey: "cut.poriyal", desc: "Fine diced cubes ideal for Poriyal & Stir Fry", iconEmoji: "🍳" },
  { id: "curry", labelKey: "cut.curry", desc: "Medium sliced cubes for Kuzhambu & Curry", iconEmoji: "🥘" },
];

type CutSelectorModalProps = {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  onSelectCut: (cut: CutType) => void;
};

export function CutSelectorModal({ isOpen, onClose, productName, onSelectCut }: CutSelectorModalProps) {
  const { t } = useLanguage();
  const [selectedCut, setSelectedCut] = useState<CutType>("whole");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
      <div className="card w-full max-w-md bg-white p-5 shadow-2xl rounded-2xl">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
              <Scissors size={16} />
            </span>
            <h3 className="text-base font-bold text-ink">{t("product.select_cut")}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost btn-icon h-8 w-8 rounded-full"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <p className="mt-3 text-xs text-muted">
          Choose how you want <strong className="text-ink">{productName}</strong> prepared by our Koyambedu hub chefs:
        </p>

        <div className="mt-4 grid gap-2.5">
          {CUT_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setSelectedCut(opt.id)}
              className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                selectedCut === opt.id
                  ? "border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20"
                  : "border-line bg-white hover:border-slate-300 hover:bg-surface"
              }`}
            >
              <span className="text-2xl">{opt.iconEmoji}</span>
              <div className="flex-1">
                <p className="text-xs font-bold text-ink">{t(opt.labelKey)}</p>
                <p className="text-[11px] text-muted">{opt.desc}</p>
              </div>
              {selectedCut === opt.id && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white">
                  <Check size={12} strokeWidth={3} />
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline flex-1 text-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onSelectCut(selectedCut);
              onClose();
            }}
            className="btn btn-primary flex-1 text-xs font-bold shadow-md"
          >
            Confirm & Add to Basket
          </button>
        </div>
      </div>
    </div>
  );
}
