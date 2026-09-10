"use client";

import { useEffect, useState } from "react";
import { Bike, CheckCircle2, MapPin, Phone, ShieldCheck, Navigation, Clock } from "lucide-react";
import { formatINR } from "@/lib/utils";

type DeliveryOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  address: string;
  grandTotal: number;
  deliverySlot: string;
  deliveryStatus: "assigned" | "accepted" | "picked_up" | "on_the_way" | "delivered";
  paymentMethod: string;
  itemsCount: number;
};

const MOCK_DELIVERY_ORDERS: DeliveryOrder[] = [
  {
    id: "del-101",
    orderNumber: "VF-2026-8812",
    customerName: "Lakshmi Subramanian",
    customerPhone: "9840123456",
    address: "Door 42B, 3rd Main Road, Anna Nagar West, Chennai 600040",
    grandTotal: 485,
    deliverySlot: "06:00 - 08:00 AM",
    deliveryStatus: "on_the_way",
    paymentMethod: "UPI Paid",
    itemsCount: 6,
  },
  {
    id: "del-102",
    orderNumber: "VF-2026-8815",
    customerName: "Rahul Menon",
    customerPhone: "9884567890",
    address: "Plot 12, Perungudi Industrial Estate, OMR Thoraipakkam, Chennai 600097",
    grandTotal: 840,
    deliverySlot: "08:00 - 10:00 AM",
    deliveryStatus: "assigned",
    paymentMethod: "Cash on Delivery",
    itemsCount: 9,
  },
];

export default function DeliveryPartnerPortal() {
  const [orders, setOrders] = useState<DeliveryOrder[]>(MOCK_DELIVERY_ORDERS);
  const [otpInput, setOtpInput] = useState<{ [orderId: string]: string }>({});
  const [isOnline, setIsOnline] = useState(true);

  const updateStatus = (id: string, newStatus: DeliveryOrder["deliveryStatus"]) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, deliveryStatus: newStatus } : o))
    );
  };

  const handleVerifyOtp = (order: DeliveryOrder) => {
    const code = otpInput[order.id];
    if (!code || code.length < 4) {
      alert("Please enter the 4-digit Delivery OTP from customer");
      return;
    }
    updateStatus(order.id, "delivered");
    alert(`Order ${order.orderNumber} successfully delivered! Earnings credited.`);
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-12">
      {/* Driver Header */}
      <header className="sticky top-0 z-50 bg-[#004d38] text-white p-4 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-emerald-300 font-bold">
            <Bike size={22} />
          </span>
          <div>
            <h1 className="text-base font-bold leading-tight">VeggieFlick Driver Portal</h1>
            <p className="text-xs text-emerald-200">Koyambedu Hub · Chennai Delivery Fleet</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsOnline(!isOnline)}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
            isOnline ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
          }`}
        >
          {isOnline ? "● ONLINE" : "OFFLINE"}
        </button>
      </header>

      <main className="container max-w-xl mx-auto p-4 space-y-4">
        {/* Active Earnings Summary Card */}
        <div className="card bg-white p-4 shadow-sm border border-slate-200 flex justify-between items-center">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Today's Earnings</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">₹650.00</p>
            <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">8 Orders Delivered Today</p>
          </div>
          <div className="text-right">
            <span className="chip bg-emerald-100 text-emerald-900 font-bold text-xs">Rating 4.9 ★</span>
          </div>
        </div>

        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Assigned Deliveries ({orders.length})</h2>

        {orders.map((order) => (
          <article key={order.id} className="card bg-white p-4 shadow-md border border-slate-200 space-y-3 rounded-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-800">{order.orderNumber}</span>
                <p className="text-[11px] text-slate-500">{order.itemsCount} items · {order.paymentMethod}</p>
              </div>
              <span className="text-base font-extrabold text-slate-900">{formatINR(order.grandTotal)}</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-start gap-2">
                <MapPin size={16} className="text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-900">{order.customerName}</p>
                  <p className="text-xs text-slate-600 leading-snug">{order.address}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-600 pl-6">
                <Clock size={13} className="text-slate-400" />
                <span>Slot: <strong>{order.deliverySlot}</strong></span>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex gap-2 pt-1">
              <a
                href={`tel:${order.customerPhone}`}
                className="btn btn-outline flex-1 text-xs py-2 flex items-center justify-center gap-1.5 font-bold"
              >
                <Phone size={14} /> Call Customer
              </a>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline flex-1 text-xs py-2 flex items-center justify-center gap-1.5 font-bold bg-sky-50 text-sky-900 border-sky-200"
              >
                <Navigation size={14} className="text-sky-600" /> Navigate
              </a>
            </div>

            {/* Status Workflow Controls */}
            <div className="pt-2 border-t border-slate-100">
              {order.deliveryStatus === "assigned" && (
                <button
                  type="button"
                  onClick={() => updateStatus(order.id, "accepted")}
                  className="btn btn-primary w-full py-2.5 text-xs font-bold bg-emerald-700 text-white"
                >
                  Accept Delivery Task
                </button>
              )}

              {order.deliveryStatus === "accepted" && (
                <button
                  type="button"
                  onClick={() => updateStatus(order.id, "picked_up")}
                  className="btn btn-primary w-full py-2.5 text-xs font-bold bg-emerald-800 text-white"
                >
                  Picked Up from Koyambedu Hub
                </button>
              )}

              {order.deliveryStatus === "picked_up" && (
                <button
                  type="button"
                  onClick={() => updateStatus(order.id, "on_the_way")}
                  className="btn btn-primary w-full py-2.5 text-xs font-bold bg-sky-700 text-white"
                >
                  Start Route (Out for Delivery)
                </button>
              )}

              {order.deliveryStatus === "on_the_way" && (
                <div className="space-y-2 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                  <p className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <ShieldCheck size={16} className="text-emerald-700" /> Verify Customer OTP to Complete
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="4-Digit OTP"
                      value={otpInput[order.id] || ""}
                      onChange={(e) => setOtpInput({ ...otpInput, [order.id]: e.target.value })}
                      className="input text-center font-mono font-bold tracking-widest text-sm w-32 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => handleVerifyOtp(order)}
                      className="btn btn-primary flex-1 text-xs font-bold bg-emerald-600 text-white"
                    >
                      Confirm Delivered
                    </button>
                  </div>
                </div>
              )}

              {order.deliveryStatus === "delivered" && (
                <div className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-emerald-100 text-emerald-900 font-bold text-xs">
                  <CheckCircle2 size={16} /> Delivered & Verified
                </div>
              )}
            </div>
          </article>
        ))}
      </main>
    </div>
  );
}
