"use client";

import { useStoreStatus } from "@/components/store-status-context";
import { Power } from "lucide-react";

export function AdminStoreStatusToggle() {
  const { isStoreOpen, toggleStoreStatus } = useStoreStatus();

  return (
    <button
      type="button"
      onClick={toggleStoreStatus}
      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black transition-all shadow-md ${
        isStoreOpen
          ? "bg-emerald-600 text-white hover:bg-emerald-700 ring-2 ring-emerald-300"
          : "bg-rose-600 text-white hover:bg-rose-700 ring-2 ring-rose-300 animate-pulse"
      }`}
      title="Toggle Store Online (Live) or Store Offline (Grayscale & Ordering Paused)"
    >
      <Power size={14} strokeWidth={2.5} />
      <span>{isStoreOpen ? "STORE LIVE (ONLINE)" : "STORE OFFLINE (PAUSED)"}</span>
    </button>
  );
}
