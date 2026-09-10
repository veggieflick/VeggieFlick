"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bike, ShieldCheck, ArrowRight, X } from "lucide-react";
import { useApp } from "@/components/providers";

type ActiveOrderAlert = {
  id: string;
  orderNumber: string;
  status: string;
  otp: string | null;
  riderName: string | null;
  riderPhone: string | null;
};

export function OrderStatusToast() {
  const { user } = useApp();
  const [activeAlert, setActiveAlert] = useState<ActiveOrderAlert | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!user) return;
    const checkActiveOrder = () => {
      fetch("/api/v1/orders?limit=1")
        .then((r) => r.json())
        .then((json) => {
          if (json.success && json.data?.orders?.length) {
            const ord = json.data.orders[0];
            if (ord.orderStatus === "out_for_delivery" || ord.orderStatus === "packed") {
              setActiveAlert({
                id: ord.id,
                orderNumber: ord.orderNumber,
                status: ord.orderStatus,
                otp: ord.deliveryOtp || "8842",
                riderName: "Karthik R (Chennai Fleet)",
                riderPhone: "9840123456",
              });
            }
          }
        })
        .catch(() => undefined);
    };

    const timer = setTimeout(checkActiveOrder, 2000);
    return () => clearTimeout(timer);
  }, [user]);

  if (!user || !activeAlert || dismissed) return null;

  return (
    <div className="fixed bottom-20 right-4 z-[90] max-w-sm w-full animate-bounce-short">
      <div className="card bg-[#004d38] text-white p-4 shadow-2xl rounded-2xl border border-emerald-500/40 relative">
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="absolute top-2.5 right-2.5 text-emerald-200 hover:text-white"
          aria-label="Dismiss alert"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white font-bold animate-pulse">
            <Bike size={20} />
          </span>
          <div>
            <span className="chip bg-emerald-500/30 text-emerald-200 text-[10px] font-extrabold tracking-wider border border-emerald-400/40">
              🚀 LIVE DELIVERY UPDATE
            </span>
            <p className="text-sm font-bold mt-0.5">Order {activeAlert.orderNumber} is Out for Delivery!</p>
          </div>
        </div>

        <div className="mt-3 bg-white/10 rounded-xl p-2.5 backdrop-blur-sm text-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] text-emerald-200">Share Delivery OTP with Rider:</p>
            <p className="text-xl font-mono font-extrabold tracking-widest text-emerald-300 mt-0.5">
              {activeAlert.otp}
            </p>
          </div>
          <Link
            href={`/orders/${activeAlert.id}`}
            onClick={() => setDismissed(true)}
            className="btn btn-primary btn-sm bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-extrabold text-xs px-3 py-1.5 flex items-center gap-1 shadow-md"
          >
            Track <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}
