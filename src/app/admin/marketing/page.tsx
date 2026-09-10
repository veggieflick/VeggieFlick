"use client";

import { useState } from "react";
import {
  Megaphone,
  Ticket,
  Plus,
  Send,
  Sparkles,
  Percent,
  TrendingUp,
  Users,
  CheckCircle2,
  AlertCircle,
  Copy,
  ToggleLeft,
  ToggleRight,
  Gift,
} from "lucide-react";
import { formatINR } from "@/lib/utils";
import { useApp } from "@/components/providers";

type PromoCode = {
  id: string;
  code: string;
  type: "flat" | "percentage" | "bogo";
  discountValue: number; // Flat ₹ or %
  minOrderValue: number;
  maxDiscount?: number;
  usesCount: number;
  maxUses: number;
  expiresAt: string;
  isActive: boolean;
};

type Campaign = {
  id: string;
  title: string;
  targetAudience: string;
  sentAt: string;
  deliveredCount: number;
  convertedCount: number;
};

const INITIAL_PROMOS: PromoCode[] = [
  {
    id: "promo-1",
    code: "VEGGIE100",
    type: "flat",
    discountValue: 100,
    minOrderValue: 499,
    usesCount: 412,
    maxUses: 1000,
    expiresAt: "2026-10-31",
    isActive: true,
  },
  {
    id: "promo-2",
    code: "FRESH20",
    type: "percentage",
    discountValue: 20,
    minOrderValue: 299,
    maxDiscount: 150,
    usesCount: 890,
    maxUses: 2000,
    expiresAt: "2026-12-31",
    isActive: true,
  },
  {
    id: "promo-3",
    code: "BUY1GET1SPINACH",
    type: "bogo",
    discountValue: 100,
    minOrderValue: 199,
    usesCount: 154,
    maxUses: 500,
    expiresAt: "2026-09-30",
    isActive: true,
  },
];

const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: "camp-1",
    title: "Fresh Harvest Arrival - Koyambedu Morning Special!",
    targetAudience: "All Registered Customers (Chennai)",
    sentAt: "Today, 06:30 AM",
    deliveredCount: 4250,
    convertedCount: 680,
  },
  {
    id: "camp-2",
    title: "15% Off Your Organic Meal Kit - Code: MEAL15",
    targetAudience: "Active Produce Subscribers",
    sentAt: "Yesterday, 05:00 PM",
    deliveredCount: 1120,
    convertedCount: 310,
  },
];

export default function AdminMarketingPage() {
  const { notify } = useApp();
  const [promos, setPromos] = useState<PromoCode[]>(INITIAL_PROMOS);
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);

  // New Promo Modal State
  const [isAddingPromo, setIsAddingPromo] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newType, setNewType] = useState<"flat" | "percentage" | "bogo">("flat");
  const [newValue, setNewValue] = useState(50);
  const [newMinOrder, setNewMinOrder] = useState(299);
  const [newMaxUses, setNewMaxUses] = useState(500);

  // Broadcast Notification State
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastBody, setBroadcastBody] = useState("");
  const [broadcastTarget, setBroadcastTarget] = useState("All Active Customers");

  const handleTogglePromo = (id: string) => {
    setPromos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p))
    );
    notify("Promo status updated!");
  };

  const handleCreatePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;

    const promo: PromoCode = {
      id: `promo-${Date.now()}`,
      code: newCode.toUpperCase().trim(),
      type: newType,
      discountValue: Number(newValue),
      minOrderValue: Number(newMinOrder),
      usesCount: 0,
      maxUses: Number(newMaxUses),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      isActive: true,
    };

    setPromos([promo, ...promos]);
    setIsAddingPromo(false);
    setNewCode("");
    notify(`Promo Code ${promo.code} created successfully!`);
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastBody) return;

    const newCamp: Campaign = {
      id: `camp-${Date.now()}`,
      title: broadcastTitle,
      targetAudience: broadcastTarget,
      sentAt: "Just now",
      deliveredCount: 3840,
      convertedCount: 0,
    };

    setCampaigns([newCamp, ...campaigns]);
    setBroadcastTitle("");
    setBroadcastBody("");
    notify("In-App Push Broadcast sent to " + broadcastTarget + "!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Marketing & Coupon Manager</h1>
          <p className="text-sm text-slate-500">
            Create Shopify-style discounts, referral rewards, and in-app broadcast alerts.
          </p>
        </div>
        <button
          onClick={() => setIsAddingPromo(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
        >
          <Plus size={18} />
          Create Discount Code
        </button>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Promos</span>
            <Ticket className="h-5 w-5 text-brand-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {promos.filter((p) => p.isActive).length} Active
          </p>
          <p className="mt-1 text-xs text-emerald-600 font-medium">High conversion coupons</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Redemptions</span>
            <Sparkles className="h-5 w-5 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {promos.reduce((acc, p) => acc + p.usesCount, 0).toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-slate-500 font-medium">Orders with discounts</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Campaign Revenue</span>
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{formatINR(142800)}</p>
          <p className="mt-1 text-xs text-emerald-600 font-medium">+18.4% from push promo</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Referral Reward</span>
            <Gift className="h-5 w-5 text-purple-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">₹50 Cashback</p>
          <p className="mt-1 text-xs text-slate-500 font-medium">Per successful Chennai refer</p>
        </div>
      </div>

      {/* Grid Section: Coupon Table & Push Broadcast Engine */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Active Promos List */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2 overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <Ticket size={18} className="text-brand-600" /> Active Coupons & Discounts
            </h2>
            <span className="text-xs font-medium text-slate-500">{promos.length} Codes total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3">Code</th>
                  <th className="px-6 py-3">Type / Value</th>
                  <th className="px-6 py-3">Min Order</th>
                  <th className="px-6 py-3">Usage</th>
                  <th className="px-6 py-3">Expires</th>
                  <th className="px-6 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {promos.map((promo) => (
                  <tr key={promo.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4 font-mono font-bold text-brand-700 flex items-center gap-2">
                      <span>{promo.code}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(promo.code);
                          notify(`Copied ${promo.code}`);
                        }}
                        className="text-slate-400 hover:text-slate-600"
                        title="Copy code"
                      >
                        <Copy size={13} />
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      {promo.type === "flat" && <span className="font-bold text-slate-900">{formatINR(promo.discountValue)} OFF</span>}
                      {promo.type === "percentage" && <span className="font-bold text-slate-900">{promo.discountValue}% OFF</span>}
                      {promo.type === "bogo" && <span className="font-bold text-purple-700">Buy 1 Get 1 Free</span>}
                    </td>
                    <td className="px-6 py-4">{formatINR(promo.minOrderValue)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-brand-600 h-full"
                            style={{ width: `${Math.min(100, (promo.usesCount / promo.maxUses) * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500">{promo.usesCount}/{promo.maxUses}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">{promo.expiresAt}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleTogglePromo(promo.id)}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                          promo.isActive
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        }`}
                      >
                        {promo.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                        {promo.isActive ? "Active" : "Disabled"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Push Broadcast Engine */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              <Megaphone className="h-5 w-5 text-brand-600" />
              <h2 className="font-bold text-slate-900">Broadcast Push Alert</h2>
            </div>
            <form onSubmit={handleSendBroadcast} className="space-y-4 text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Segment</label>
                <select
                  value={broadcastTarget}
                  onChange={(e) => setBroadcastTarget(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800 font-medium focus:border-brand-500 focus:outline-none"
                >
                  <option value="All Active Customers">All Active Customers (Chennai)</option>
                  <option value="Anna Nagar & Adyar Hubs">Anna Nagar & Adyar Hubs</option>
                  <option value="Produce Subscribers">Produce Subscribers</option>
                  <option value="Inactive > 14 Days">Inactive Customers (&gt;14 days)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notification Title</label>
                <input
                  type="text"
                  placeholder="e.g. Fresh Cut Veggies Available!"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800 font-medium focus:border-brand-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Message Content</label>
                <textarea
                  rows={3}
                  placeholder="Get 20% off on Koyambedu morning arrivals. Use code KOYAM20 before 12 PM!"
                  value={broadcastBody}
                  onChange={(e) => setBroadcastBody(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800 focus:border-brand-500 focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-600 py-2.5 font-bold text-white shadow-sm hover:bg-brand-700 transition"
              >
                <Send size={16} /> Broadcast Now
              </button>
            </form>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Recent Sent Broadcasts</p>
            <div className="space-y-2">
              {campaigns.slice(0, 2).map((c) => (
                <div key={c.id} className="text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <p className="font-semibold text-slate-800 line-clamp-1">{c.title}</p>
                  <div className="flex justify-between text-slate-400 mt-1">
                    <span>{c.sentAt}</span>
                    <span className="text-emerald-600 font-medium">{c.convertedCount} conversions</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Create Discount Code */}
      {isAddingPromo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Ticket className="text-brand-600" /> Create New Promo Code
            </h3>
            <form onSubmit={handleCreatePromo} className="space-y-3 text-sm">
              <div>
                <label className="block font-semibold text-slate-700">Coupon Code</label>
                <input
                  type="text"
                  placeholder="e.g. MONSOON30"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 uppercase font-mono font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700">Discount Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2"
                  >
                    <option value="flat">Flat ₹ Discount</option>
                    <option value="percentage">Percentage % OFF</option>
                    <option value="bogo">BOGO Offer</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">Value (₹ or %)</label>
                  <input
                    type="number"
                    value={newValue}
                    onChange={(e) => setNewValue(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700">Min Order (₹)</label>
                  <input
                    type="number"
                    value={newMinOrder}
                    onChange={(e) => setNewMinOrder(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">Max Usage Cap</label>
                  <input
                    type="number"
                    value={newMaxUses}
                    onChange={(e) => setNewMaxUses(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddingPromo(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-600 px-4 py-2 text-white font-semibold hover:bg-brand-700"
                >
                  Publish Promo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
