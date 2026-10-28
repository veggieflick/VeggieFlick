"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Circle, CreditCard, MapPin, MessageCircle, Phone, Star, Truck, XCircle } from "lucide-react";
import { useApp } from "@/components/providers";
import { ORDER_STATUS_FLOW, ORDER_STATUS_LABEL, formatDateTimeIST, formatINR } from "@/lib/utils";
import { Breadcrumb, StatusPill } from "@/components/ui/primitives";
import { ScratchCardModal } from "@/components/scratch-card-modal";

type OrderDetail = {
  id: string;
  orderNumber: string;
  orderStatus: string;
  paymentStatus: string;
  grandTotal: string;
  subtotal: string;
  discount: string;
  deliveryCharge: string;
  taxAmount: string;
  distanceKm: string;
  deliveryOtp: string | null;
  notes: string | null;
  createdAt: string;
  slotName: string | null;
  customerName: string;
  customerPhone: string;
  shippingSnapshot: Record<string, string | number | null> | null;
  items: {
    id: string;
    productName: string;
    variantName: string;
    emoji: string;
    quantity: number;
    unitPrice: string;
    totalPrice: string;
  }[];
  timeline: { id: string; status: string; note: string | null; createdAt: string }[];
  payment: { paymentMethod: string; paymentStatus: string; transactionId: string | null } | null;
  delivery: {
    partnerName: string | null;
    partnerPhone: string | null;
    vehicleNumber: string | null;
    rating: string | null;
  } | null;
};

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, userLoading, notify } = useApp();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [scratchOpen, setScratchOpen] = useState(searchParams.get("placed") === "1");

  const load = useCallback(async () => {
    const response = await fetch(`/api/v1/orders/${params.id}`, { cache: "no-store" });
    const json = await response.json();
    if (json?.success) setOrder(json.data as OrderDetail);
    setLoading(false);
  }, [params.id]);

  useEffect(() => {
    if (!userLoading && !user) router.replace(`/login?redirect=/orders/${params.id}`);
  }, [user, userLoading, router, params.id]);

  useEffect(() => {
    if (!user) return;
    // Near-real-time status polling while the order is in flight.
    const timer = setTimeout(() => void load(), 0);
    const interval = setInterval(() => void load(), 20000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [user, load]);

  function loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if (typeof window === "undefined") return resolve(false);
      if ((window as any).Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  async function payNow() {
    if (!order) return;
    setBusy(true);
    try {
      const res = await fetch("/api/v1/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      });
      const json = await res.json();
      if (!json?.success) {
        setBusy(false);
        notify(json?.error?.message || "Could not initiate payment", "error");
        return;
      }

      if (json.data?.keyId) {
        await loadRazorpayScript();
        const options = {
          key: json.data.keyId,
          amount: json.data.amount,
          currency: json.data.currency || "INR",
          name: "VeggieFlick",
          description: `Order #${order.orderNumber} Payment`,
          order_id: json.data.razorpayOrderId,
          prefill: {
            name: order.customerName,
            contact: order.customerPhone,
          },
          theme: { color: "#059669" },
          handler: async function (response: any) {
            const verifyRes = await fetch("/api/v1/payments", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: order.id,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });
            const verifyJson = await verifyRes.json();
            setBusy(false);
            if (verifyJson?.success) {
              notify("Payment verified successfully!");
              void load();
            } else {
              notify("Verification failed. Please contact support.", "error");
            }
          },
          modal: {
            ondismiss: function () {
              setBusy(false);
            },
          },
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        setBusy(false);
        notify("Demo mode: Order payment simulated!");
        void load();
      }
    } catch {
      setBusy(false);
      notify("Network error while starting payment", "error");
    }
  }

  async function cancelOrder() {
    setBusy(true);
    const response = await fetch(`/api/v1/orders/${params.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel", reason: "Changed my mind" }),
    });
    const json = await response.json();
    setBusy(false);
    if (json?.success) {
      notify("Order cancelled. Refunds reach your wallet instantly.");
      void load();
    } else {
      notify(json?.error?.message ?? "Could not cancel this order", "error");
    }
  }

  if (loading) return <div className="container-page py-20 text-center text-sm text-muted">Loading order…</div>;
  if (!order)
    return (
      <div className="container-page py-20 text-center">
        <p className="text-lg font-bold">Order not found</p>
        <Link href="/orders" className="mt-3 inline-block text-sm font-semibold text-brand-700 underline">
          Back to my orders
        </Link>
      </div>
    );

  const cancelled = order.orderStatus === "cancelled" || order.orderStatus === "returned";
  const currentIndex = ORDER_STATUS_FLOW.indexOf(order.orderStatus as (typeof ORDER_STATUS_FLOW)[number]);
  const canCancel = ["placed", "confirmed", "packed"].includes(order.orderStatus);

  const itemsText = (order.items || [])
    .map((i) => `• ${i.productName} (${i.variantName}) x ${i.quantity} = ${formatINR(i.totalPrice, true)}`)
    .join("\n");
  const addressText = order.shippingSnapshot
    ? `${order.shippingSnapshot.line || ""}, ${order.shippingSnapshot.city || ""}`
    : "Chennai";
  const waMessage =
    `*VeggieFlick Order Update*\n\n` +
    `*Order Number:* ${order.orderNumber}\n` +
    `*Customer:* ${order.shippingSnapshot?.contactName || order.customerName}\n` +
    `*Phone:* ${order.shippingSnapshot?.contactPhone || order.customerPhone}\n` +
    `*Delivery Slot:* ${order.slotName || "Morning Slot"}\n` +
    `*Address:* ${addressText}\n` +
    `*Payment:* ${(order.payment?.paymentMethod || "COD").toUpperCase()} (${order.paymentStatus})\n` +
    `*Total:* ${formatINR(order.grandTotal, true)}\n\n` +
    `*Items:*\n${itemsText || "• Veggie Mix"}\n\n` +
    `Please confirm my delivery!`;
  const whatsappUrl = `https://wa.me/919840532826?text=${encodeURIComponent(waMessage)}`;

  return (
    <div className="container-page py-6 md:py-10">
      <Breadcrumb
        items={[{ label: "Home", href: "/" }, { label: "My orders", href: "/orders" }, { label: order.orderNumber }]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Order {order.orderNumber}</h1>
          <p className="text-sm text-muted">Placed on {formatDateTimeIST(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusPill status={order.orderStatus} />
          <StatusPill status={order.paymentStatus} />
        </div>
      </div>

      {/* WhatsApp Notification Card */}
      <div className="mb-6 rounded-2xl border-2 border-emerald-500 bg-emerald-50/80 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 shrink-0 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow">
            <MessageCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-base font-bold text-emerald-950">
              Send Order to VeggieFlick WhatsApp
            </p>
            <p className="text-xs text-emerald-800">
              Official WhatsApp & Care: <span className="font-bold">+91 98405 32826</span>. Click to notify admin & get updates.
            </p>
          </div>
        </div>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3 text-sm shadow transition-all active:scale-95"
        >
          <MessageCircle className="h-4 w-4" />
          <span>Send to WhatsApp (+91 98405 32826)</span>
        </a>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_22rem]">
        <div className="grid gap-5">
          <section className="card p-5">
            <h2 className="mb-4 text-lg font-bold">Delivery status</h2>
            {cancelled ? (
              <div className="flex items-center gap-3 rounded-xl bg-red-50 p-4 text-red-700">
                <XCircle className="h-5 w-5" aria-hidden />
                <p className="text-sm font-semibold">
                  This order was {order.orderStatus}. Any payment has been refunded to your wallet.
                </p>
              </div>
            ) : (
              <ol className="grid gap-0">
                {ORDER_STATUS_FLOW.map((status, index) => {
                  const done = index <= currentIndex;
                  const entry = order.timeline.find((item) => item.status === status);
                  return (
                    <li key={status} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        {done ? (
                          <CheckCircle2 className="h-5 w-5 text-brand-600" aria-hidden />
                        ) : (
                          <Circle className="h-5 w-5 text-slate-300" aria-hidden />
                        )}
                        {index < ORDER_STATUS_FLOW.length - 1 && (
                          <span className={`h-10 w-0.5 ${done ? "bg-brand-500" : "bg-slate-200"}`} />
                        )}
                      </div>
                      <div className="pb-5">
                        <p className={`text-sm font-semibold ${done ? "text-ink" : "text-muted"}`}>
                          {ORDER_STATUS_LABEL[status]}
                        </p>
                        <p className="text-xs text-muted">
                          {entry ? `${formatDateTimeIST(entry.createdAt)} — ${entry.note}` : "Pending"}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}

            {order.orderStatus === "out_for_delivery" && order.deliveryOtp && (
              <div className="mt-3 rounded-xl bg-brand-50 p-4">
                <p className="text-xs font-semibold text-brand-800">Share this OTP with your rider</p>
                <p className="text-2xl font-extrabold tracking-[0.35em] text-brand-700">{order.deliveryOtp}</p>
              </div>
            )}

            {order.delivery?.partnerName && (
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-line p-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                  <Truck className="h-5 w-5" aria-hidden />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{order.delivery.partnerName}</p>
                  <p className="text-xs text-muted">
                    {order.delivery.vehicleNumber} · <Star size={12} className="fill-[#f97316] text-[#f97316]" strokeWidth={1.5} /> {order.delivery.rating}
                  </p>
                </div>
                {order.delivery.partnerPhone && (
                  <a
                    href={`tel:${order.delivery.partnerPhone}`}
                    className="btn btn-outline px-3 py-2 text-xs"
                    aria-label="Call delivery partner"
                  >
                    <Phone className="h-3.5 w-3.5" aria-hidden /> Call
                  </a>
                )}
              </div>
            )}
          </section>

          <section className="card p-5">
            <h2 className="mb-4 text-lg font-bold">Items in this order</h2>
            <ul className="grid gap-3">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-3 border-b border-line pb-3 last:border-0">
                  <span className="text-2xl" aria-hidden>
                    {item.emoji}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{item.productName}</p>
                    <p className="text-xs text-muted">
                      {item.variantName} · {item.quantity} × {formatINR(item.unitPrice)}
                    </p>
                  </div>
                  <p className="text-sm font-bold">{formatINR(item.totalPrice, true)}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="grid gap-5">
          <div className="card p-5">
            <h2 className="mb-3 text-lg font-bold">Bill details</h2>
            <dl className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Item total</dt>
                <dd className="font-semibold">{formatINR(order.subtotal, true)}</dd>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-brand-700">
                  <dt>Discount</dt>
                  <dd className="font-semibold">−{formatINR(order.discount, true)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted">Delivery ({order.distanceKm} km)</dt>
                <dd className="font-semibold">
                  {Number(order.deliveryCharge) === 0 ? "FREE" : formatINR(order.deliveryCharge, true)}
                </dd>
              </div>
              {Number(order.taxAmount) > 0 && (
                <div className="flex justify-between">
                  <dt className="text-muted">GST</dt>
                  <dd className="font-semibold">{formatINR(order.taxAmount, true)}</dd>
                </div>
              )}
              <div className="mt-1 flex justify-between border-t border-line pt-2 text-base">
                <dt className="font-bold">Total paid</dt>
                <dd className="font-bold">{formatINR(order.grandTotal, true)}</dd>
              </div>
            </dl>
            {order.payment && (
              <p className="mt-3 text-xs text-muted capitalize">
                Paid via {order.payment.paymentMethod} · {order.payment.paymentStatus}
              </p>
            )}
            {order.paymentStatus !== "paid" && !cancelled && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                  <span>Payment Pending:</span>
                  <span>{formatINR(order.grandTotal, true)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => void payNow()}
                  disabled={busy}
                  className="btn btn-primary w-full py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 shadow-sm"
                >
                  <CreditCard size={14} /> Pay Now with Razorpay
                </button>
              </div>
            )}
          </div>

          <div className="card p-5">
            <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
              <MapPin className="h-5 w-5 text-brand-600" aria-hidden /> Delivery details
            </h2>
            <p className="text-sm font-semibold">{order.shippingSnapshot?.contactName ?? order.customerName}</p>
            <p className="text-sm text-muted">
              {order.shippingSnapshot?.line}
              <br />
              {order.shippingSnapshot?.city} {order.shippingSnapshot?.postalCode}
            </p>
            <p className="mt-2 text-xs font-semibold text-brand-700">Slot: {order.slotName ?? "—"}</p>
            {order.notes && <p className="mt-2 text-xs text-muted">Note: {order.notes}</p>}
          </div>

          {canCancel && (
            <button
              type="button"
              onClick={() => void cancelOrder()}
              disabled={busy}
              className="btn btn-outline w-full py-3 text-sm text-red-600 disabled:opacity-50"
            >
              {busy ? "Cancelling…" : "Cancel this order"}
            </button>
          )}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn w-full py-3 text-sm bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 font-bold shadow transition-all"
          >
            <MessageCircle className="h-4 w-4" /> Send to WhatsApp (+91 98405 32826)
          </a>
          <Link href="/shop" className="btn btn-primary w-full py-3 text-sm">
            Shop again
          </Link>
        </aside>
      </div>
      <ScratchCardModal isOpen={scratchOpen} onClose={() => setScratchOpen(false)} />
    </div>
  );
}
