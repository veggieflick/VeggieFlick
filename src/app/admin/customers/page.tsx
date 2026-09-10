"use client";

import { useState } from "react";
import { Users, Wallet, Search, Plus, ShieldCheck, ArrowUpRight, ArrowDownRight, Award } from "lucide-react";
import { formatINR } from "@/lib/utils";
import { useApp } from "@/components/providers";

type CustomerRow = {
  id: string;
  name: string;
  phone: string;
  email: string;
  area: string;
  ordersCount: number;
  totalSpent: number;
  walletBalance: number;
  loyaltyTier: "Bronze" | "Silver" | "Gold" | "Platinum";
  joinedDate: string;
};

const MOCK_CUSTOMERS: CustomerRow[] = [
  {
    id: "cust-1",
    name: "Lakshmi Subramanian",
    phone: "9840123456",
    email: "lakshmi.s@gmail.com",
    area: "Anna Nagar West",
    ordersCount: 24,
    totalSpent: 12450,
    walletBalance: 150,
    loyaltyTier: "Platinum",
    joinedDate: "2026-01-15",
  },
  {
    id: "cust-2",
    name: "Rahul Menon",
    phone: "9884567890",
    email: "rahul.m@outlook.com",
    area: "OMR Thoraipakkam",
    ordersCount: 18,
    totalSpent: 8900,
    walletBalance: 75,
    loyaltyTier: "Gold",
    joinedDate: "2026-02-02",
  },
  {
    id: "cust-3",
    name: "Fathima Noor",
    phone: "9790112233",
    email: "fathima.noor@yahoo.com",
    area: "T. Nagar",
    ordersCount: 12,
    totalSpent: 5400,
    walletBalance: 200,
    loyaltyTier: "Silver",
    joinedDate: "2026-03-10",
  },
  {
    id: "cust-4",
    name: "Sundararaman K",
    phone: "9444098765",
    email: "sundar.k@gmail.com",
    area: "Adyar",
    ordersCount: 31,
    totalSpent: 18200,
    walletBalance: 340,
    loyaltyTier: "Platinum",
    joinedDate: "2025-11-20",
  },
];

export default function AdminCustomersPage() {
  const { notify } = useApp();
  const [customers, setCustomers] = useState<CustomerRow[]>(MOCK_CUSTOMERS);
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRow | null>(null);
  const [walletAmount, setWalletAmount] = useState(100);
  const [walletNote, setWalletNote] = useState("Goodwill Refund for delayed slot");

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.area.toLowerCase().includes(search.toLowerCase())
  );

  const handleWalletAdjust = (type: "credit" | "debit") => {
    if (!selectedCustomer) return;
    const change = type === "credit" ? walletAmount : -walletAmount;
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === selectedCustomer.id
          ? { ...c, walletBalance: Math.max(0, c.walletBalance + change) }
          : c
      )
    );
    notify(
      `Successfully ${type === "credit" ? "credited" : "debited"} ${formatINR(
        walletAmount
      )} to ${selectedCustomer.name}'s wallet`
    );
    setSelectedCustomer(null);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customer Relationship Management (CRM)</h1>
          <p className="text-sm text-muted">
            Manage registered Chennai households, wallet refunds, cashback credits, and loyalty tier progress.
          </p>
        </div>
      </header>

      {/* Top Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-4">
          <p className="text-xs font-bold text-muted uppercase">Total Registered Customers</p>
          <p className="text-2xl font-extrabold text-ink mt-1">12,450 Households</p>
          <p className="text-xs text-emerald-700 font-semibold mt-0.5">+145 joined this week</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-bold text-muted uppercase">Total Outstanding Wallet Balance</p>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1">{formatINR(184200)}</p>
          <p className="text-xs text-muted mt-0.5">Available for customer checkout</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-bold text-muted uppercase">VIP Platinum Tier Members</p>
          <p className="text-2xl font-extrabold text-purple-700 mt-1">1,820 VIPs</p>
          <p className="text-xs text-purple-800 font-semibold mt-0.5">30%+ repeat purchase rate</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-bold text-muted uppercase">Average Customer LTV</p>
          <p className="text-2xl font-extrabold text-sky-900 mt-1">{formatINR(4250)}</p>
          <p className="text-xs text-sky-800 font-semibold mt-0.5">Over 90-day window</p>
        </div>
      </div>

      {/* Search & Customer Table */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-line flex flex-wrap items-center justify-between gap-3 bg-slate-50">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone or area..."
              className="input pl-9 w-full text-xs"
            />
          </div>
          <span className="text-xs font-bold text-slate-500">Showing {filtered.length} customers</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface text-muted uppercase tracking-wider font-semibold border-b border-line">
              <tr>
                <th className="px-4 py-3">Customer Name</th>
                <th className="px-4 py-3">Phone & Area</th>
                <th className="px-4 py-3">Total Orders</th>
                <th className="px-4 py-3">Lifetime Spend</th>
                <th className="px-4 py-3">Wallet Balance</th>
                <th className="px-4 py-3">Loyalty Tier</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-t border-line hover:bg-surface/50">
                  <td className="px-4 py-3 font-bold text-ink">
                    <p>{c.name}</p>
                    <p className="text-[10px] text-muted font-normal">{c.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-mono">+91 {c.phone}</p>
                    <p className="text-[11px] text-muted">{c.area}</p>
                  </td>
                  <td className="px-4 py-3 font-bold">{c.ordersCount} orders</td>
                  <td className="px-4 py-3 font-extrabold text-ink">{formatINR(c.totalSpent)}</td>
                  <td className="px-4 py-3">
                    <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      {formatINR(c.walletBalance)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`chip font-bold text-[10px] ${
                        c.loyaltyTier === "Platinum"
                          ? "bg-purple-100 text-purple-900 border-purple-200"
                          : c.loyaltyTier === "Gold"
                          ? "bg-amber-100 text-amber-900 border-amber-200"
                          : "bg-slate-100 text-slate-800"
                      }`}
                    >
                      <Award size={10} className="inline mr-1" /> {c.loyaltyTier}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedCustomer(c)}
                      className="btn btn-outline btn-sm text-xs font-bold bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-50"
                    >
                      <Wallet size={13} /> Adjust Wallet
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Wallet Credit/Debit Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="card w-full max-w-md bg-white p-5 shadow-2xl rounded-2xl">
            <h3 className="text-base font-bold text-ink flex items-center gap-2 border-b border-line pb-3">
              <Wallet className="text-emerald-600" size={18} /> Manage Customer Wallet Balance
            </h3>

            <div className="mt-4 space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <p className="font-bold text-ink">{selectedCustomer.name}</p>
                <p className="text-muted">+91 {selectedCustomer.phone} · {selectedCustomer.area}</p>
                <p className="mt-1 text-xs">Current Balance: <strong className="text-emerald-700">{formatINR(selectedCustomer.walletBalance)}</strong></p>
              </div>

              <div>
                <label className="block font-bold text-slate-700">Amount (₹)</label>
                <input
                  type="number"
                  min={1}
                  value={walletAmount}
                  onChange={(e) => setWalletAmount(Number(e.target.value))}
                  className="input mt-1 w-full text-xs font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700">Audit Note / Reason</label>
                <input
                  type="text"
                  value={walletNote}
                  onChange={(e) => setWalletNote(e.target.value)}
                  placeholder="e.g. Compensation for missing coriander"
                  className="input mt-1 w-full text-xs"
                />
              </div>

              <div className="mt-5 flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCustomer(null)}
                  className="btn btn-outline flex-1 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleWalletAdjust("debit")}
                  className="btn btn-outline flex-1 text-xs font-bold text-red-600 border-red-200 hover:bg-red-50"
                >
                  <ArrowDownRight size={14} /> Debit ₹{walletAmount}
                </button>
                <button
                  type="button"
                  onClick={() => handleWalletAdjust("credit")}
                  className="btn btn-primary flex-1 text-xs font-bold bg-emerald-700 text-white hover:bg-emerald-800"
                >
                  <ArrowUpRight size={14} /> Credit ₹{walletAmount}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
