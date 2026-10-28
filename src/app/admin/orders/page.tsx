"use client";

import { useCallback, useEffect, useState } from "react";
import { Clock, ExternalLink, Loader2, MessageCircle, RefreshCcw } from "lucide-react";
import { useApp } from "@/components/providers";
import { formatDateTimeIST, formatINR, ORDER_STATUS_LABEL } from "@/lib/utils";
import { StatusPill } from "@/components/ui/primitives";

type AdminOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  grandTotal: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod?: string;
  transactionId?: string;
  deliverySlot?: string;
  deliveryAddress?: string;
  createdAt: string;
};

const STATUS_FILTERS = [
  "all",
  "placed",
  "confirmed",
  "packed",
  "out_for_delivery",
  "delivered",
  "cancelled",
] as const;

const NEXT_STATUS: Record<string, string> = {
  placed: "confirmed",
  confirmed: "packed",
  packed: "out_for_delivery",
  out_for_delivery: "delivered",
};

export default function AdminOrdersPage() {
  const { notify } = useApp();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [filter, setFilter] = useState<(typeof STATUS_FILTERS)[number]>("all");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const query = filter === "all" ? "" : `?status=${filter}`;
      const response = await fetch(`/api/v1/admin/orders${query}`, { cache: "no-store" });
      if (response.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      const json = await response.json();
      if (json?.success) {
        setOrders(json.data as AdminOrder[]);
      } else {
        setErrorMsg(json?.error?.message || "Failed to load orders");
      }
    } catch (e: any) {
      setErrorMsg(e?.message || "Failed to connect to order server");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    const timer = setTimeout(() => void load(), 0);
    return () => clearTimeout(timer);
  }, [load]);

  async function advance(order: AdminOrder, status: string) {
    setBusyId(order.id);
    const response = await fetch("/api/v1/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id, orderStatus: status }),
    });
    const json = await response.json();
    setBusyId(null);
    if (json?.success) {
      notify(`${order.orderNumber} → ${ORDER_STATUS_LABEL[status] ?? status}`);
      void load();
    } else {
      notify(json?.error?.message ?? "Update failed", "error");
    }
  }

  return (
    <div className="grid gap-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Order management</h1>
          <p className="text-sm text-muted">
            Advance the fulfilment workflow — stock is reserved, released and restored automatically.
          </p>
        </div>
        <button type="button" onClick={() => void load()} className="btn btn-outline px-4 py-2 text-sm">
          <RefreshCcw className="h-4 w-4" aria-hidden /> Refresh
        </button>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {STATUS_FILTERS.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilter(status)}
            className={`chip border whitespace-nowrap capitalize ${
              filter === status ? "border-brand-600 bg-brand-50 text-brand-700" : "border-line text-muted"
            }`}
          >
            {status.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      <div className="card overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Loading orders…
          </div>
        ) : errorMsg ? (
          <div className="py-16 text-center text-sm text-red-600">
            <p className="font-semibold">{errorMsg}</p>
            <button
              type="button"
              onClick={() => void load()}
              className="mt-3 btn btn-outline px-4 py-1.5 text-xs inline-flex items-center gap-1"
            >
              <RefreshCcw className="h-3.5 w-3.5" /> Try again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted">No orders in this view.</p>
        ) : (
          <table className="w-full min-w-[52rem] text-sm">
            <thead className="bg-surface text-left text-xs text-muted uppercase">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Placed</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t border-line hover:bg-surface/50 transition-colors">
                  <td className="px-4 py-3 font-semibold">
                    <a
                      href={`/orders/${order.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-700 hover:underline inline-flex items-center gap-1 font-bold"
                    >
                      {order.orderNumber} <ExternalLink className="h-3 w-3 text-muted" />
                    </a>
                    {order.deliverySlot && (
                      <p className="text-[11px] font-normal text-muted mt-0.5 flex items-center gap-1">
                        <Clock size={11} className="shrink-0" /> {order.deliverySlot}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink">{order.customerName}</p>
                    <p className="text-xs text-muted">+91 {order.customerPhone}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <a
                        href={`https://wa.me/91${order.customerPhone.replace(/\D/g, "")}?text=${encodeURIComponent(
                          `வணக்கம் ${order.customerName}, உங்கள் VeggieFlick ஆர்டர் #${order.orderNumber} (₹${order.grandTotal}) பெறப்பட்டது. நாங்கள் விரைவில் டெலிவரிக்கு ஏற்பாடு செய்கிறோம்!`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
                        title="Chat on WhatsApp"
                      >
                        <MessageCircle className="h-3 w-3" /> WhatsApp
                      </a>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted">{formatDateTimeIST(order.createdAt)}</td>
                  <td className="px-4 py-3">
                    <StatusPill status={order.paymentStatus} />
                    {order.paymentMethod && (
                      <p className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">
                        {order.paymentMethod === "cod" ? "COD (Cash)" : `Razorpay (${order.paymentMethod})`}
                      </p>
                    )}
                    {order.transactionId && (
                      <p className="text-[10px] font-mono text-slate-400 truncate max-w-[110px]" title={order.transactionId}>
                        {order.transactionId}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={order.orderStatus} />
                  </td>
                  <td className="px-4 py-3 text-right font-bold">{formatINR(order.grandTotal)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {NEXT_STATUS[order.orderStatus] && (
                        <button
                          type="button"
                          disabled={busyId === order.id}
                          onClick={() => void advance(order, NEXT_STATUS[order.orderStatus])}
                          className="btn btn-primary px-3 py-1.5 text-xs disabled:opacity-50"
                        >
                          Mark {ORDER_STATUS_LABEL[NEXT_STATUS[order.orderStatus]]}
                        </button>
                      )}
                      {["placed", "confirmed", "packed"].includes(order.orderStatus) && (
                        <button
                          type="button"
                          disabled={busyId === order.id}
                          onClick={() => void advance(order, "cancelled")}
                          className="btn btn-outline px-3 py-1.5 text-xs text-red-600 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
