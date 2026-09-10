"use client";

import { useEffect, useState } from "react";
import { RotateCcw, ShoppingBag, CheckCircle2, ArrowRight } from "lucide-react";
import { useApp } from "@/components/providers";
import { useLanguage } from "@/components/language-context";
import { formatINR } from "@/lib/utils";

type PastOrderItem = {
  id: string;
  productName: string;
  variantName: string;
  emoji: string;
  productId: string;
  variantId: string;
  price: number;
};

type PastOrder = {
  id: string;
  orderNumber: string;
  createdAt: string;
  items: PastOrderItem[];
  grandTotal: number;
};

export function ReorderWidget() {
  const { user, addItem, setDrawerOpen, notify } = useApp();
  const { t } = useLanguage();
  const [lastOrder, setLastOrder] = useState<PastOrder | null>(null);
  const [reordering, setReordering] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetch("/api/v1/orders?limit=1")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data?.orders?.length) {
          const ord = json.data.orders[0];
          setLastOrder({
            id: ord.id,
            orderNumber: ord.orderNumber,
            createdAt: ord.createdAt,
            items: ord.items || [],
            grandTotal: Number(ord.grandTotal),
          });
        }
      })
      .catch(() => undefined);
  }, [user]);

  if (!user || !lastOrder) return null;

  const handleReorder = async () => {
    setReordering(true);
    try {
      // Re-add items from last order to cart
      let addedCount = 0;
      for (const item of lastOrder.items) {
        if (item.productId && item.variantId) {
          await addItem(item.productId, item.variantId, 1);
          addedCount++;
        }
      }
      if (addedCount > 0) {
        setDrawerOpen(true);
        notify("Your usual basket has been reloaded!");
      }
    } catch {
      notify("Failed to reorder usuals", "error");
    } finally {
      setReordering(false);
    }
  };

  return (
    <div className="card p-5 bg-gradient-to-br from-emerald-50 via-white to-sky-50 border-emerald-200 shadow-sm my-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-600 text-white font-bold shadow-md">
            <RotateCcw size={20} />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-ink">Reorder My Usual Basket (மீண்டும் வாங்க)</h3>
              <span className="chip bg-emerald-100 text-emerald-900 border border-emerald-200 font-extrabold text-[10px]">
                1-CLICK REORDER
              </span>
            </div>
            <p className="text-xs text-muted mt-0.5">
              Based on Order <strong>{lastOrder.orderNumber}</strong> · {lastOrder.items.length} produce items
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReorder}
          disabled={reordering}
          className="btn btn-primary btn-sm bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2.5 shadow-md flex items-center gap-1.5"
        >
          <ShoppingBag size={15} />
          {reordering ? "Reloading Basket..." : "Reorder Usual Basket"}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-emerald-100">
        {lastOrder.items.slice(0, 5).map((item, i) => (
          <span key={i} className="chip bg-white border border-slate-200 text-xs font-semibold text-slate-800">
            {item.emoji} {item.productName} ({item.variantName})
          </span>
        ))}
        {lastOrder.items.length > 5 && (
          <span className="chip bg-emerald-100 text-emerald-900 font-bold text-xs">
            +{lastOrder.items.length - 5} more
          </span>
        )}
      </div>
    </div>
  );
}
