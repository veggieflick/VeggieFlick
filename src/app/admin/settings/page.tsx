"use client";

import { useState } from "react";
import {
  Settings,
  ShieldCheck,
  Building2,
  FileCheck2,
  CreditCard,
  Users,
  Lock,
  Plus,
  CheckCircle2,
  AlertCircle,
  Key,
  BadgeCheck,
  Mail,
  Phone,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { useApp } from "@/components/providers";

type StaffMember = {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "catalog_manager" | "delivery_dispatcher" | "finance_auditor";
  status: "Active" | "Pending";
  lastActive: string;
};

const INITIAL_STAFF: StaffMember[] = [
  {
    id: "stf-1",
    name: "Sujai (Admin)",
    email: "sujai@veggieflick.in",
    role: "super_admin",
    status: "Active",
    lastActive: "Just now",
  },
  {
    id: "stf-2",
    name: "Priya Sundaram",
    email: "priya@veggieflick.in",
    role: "catalog_manager",
    status: "Active",
    lastActive: "2 hours ago",
  },
  {
    id: "stf-3",
    name: "Kumar Dispatcher",
    email: "kumar.dispatch@veggieflick.in",
    role: "delivery_dispatcher",
    status: "Active",
    lastActive: "Yesterday",
  },
  {
    id: "stf-4",
    name: "Rajesh Auditor",
    email: "rajesh.finance@veggieflick.in",
    role: "finance_auditor",
    status: "Pending",
    lastActive: "Never",
  },
];

export default function AdminStoreSettingsPage() {
  const { notify } = useApp();
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);
  
  // Store Legal & Business Information State
  const [storeName, setStoreName] = useState("VeggieFlick Fresh Produce");
  const [fssaiNo, setFssaiNo] = useState("12423000001234");
  const [gstin, setGstin] = useState("33AAAAA0000A1Z5");
  const [supportPhone, setSupportPhone] = useState("+91 98400 12345");
  const [supportEmail, setSupportEmail] = useState("support@veggieflick.in");
  const [hubAddress, setHubAddress] = useState("Gate 3, Koyambedu Wholesale Market Complex, Chennai - 600092");

  // Gateway Toggles
  const [razorpayLive, setRazorpayLive] = useState(true);
  const [codEnabled, setCodEnabled] = useState(true);
  const [walletCashbackEnabled, setWalletCashbackEnabled] = useState(true);

  // Invite Modal State
  const [isInviting, setIsInviting] = useState(false);
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffEmail, setNewStaffEmail] = useState("");
  const [newStaffRole, setNewStaffRole] = useState<StaffMember["role"]>("catalog_manager");

  const handleSaveStoreInfo = (e: React.FormEvent) => {
    e.preventDefault();
    notify("Store legal parameters & FSSAI license saved!");
  };

  const handleInviteStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName || !newStaffEmail) return;

    const newMember: StaffMember = {
      id: `stf-${Date.now()}`,
      name: newStaffName,
      email: newStaffEmail,
      role: newStaffRole,
      status: "Pending",
      lastActive: "Invite Sent",
    };

    setStaff([...staff, newMember]);
    setIsInviting(false);
    setNewStaffName("");
    setNewStaffEmail("");
    notify(`Invitation sent to ${newStaffEmail}!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Store Settings & RBAC Permissions</h1>
          <p className="text-sm text-slate-500">
            Manage FSSAI license compliance, GSTIN details, payment gateway credentials, and staff access roles.
          </p>
        </div>
        <button
          onClick={() => setIsInviting(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
        >
          <Plus size={18} />
          Invite Staff Member
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* FSSAI & Business Legal Settings */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="text-brand-600" /> FSSAI Compliance & Business Info
            </h2>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <BadgeCheck size={14} /> FSSAI Verified
            </span>
          </div>

          <form onSubmit={handleSaveStoreInfo} className="space-y-4 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Store Brand Name</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 font-medium focus:border-brand-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  FSSAI License No. (Food Safety)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={fssaiNo}
                    onChange={(e) => setFssaiNo(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 font-mono font-bold focus:border-brand-500 focus:outline-none"
                    required
                  />
                  <FileCheck2 size={16} className="absolute right-3 top-3 text-emerald-600" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">GSTIN Number (Tamil Nadu)</label>
                <input
                  type="text"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 font-mono font-bold focus:border-brand-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Support Phone Helpline</label>
                <div className="relative">
                  <input
                    type="text"
                    value={supportPhone}
                    onChange={(e) => setSupportPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-slate-900 font-medium focus:border-brand-500 focus:outline-none"
                    required
                  />
                  <Phone size={15} className="absolute left-3 top-3 text-slate-400" />
                </div>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Central Wholesale Hub Address</label>
              <div className="relative">
                <input
                  type="text"
                  value={hubAddress}
                  onChange={(e) => setHubAddress(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-slate-900 font-medium focus:border-brand-500 focus:outline-none"
                  required
                />
                <MapPin size={15} className="absolute left-3 top-3 text-slate-400" />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition"
              >
                Save Business Profile
              </button>
            </div>
          </form>
        </div>

        {/* Payment Gateways & Cash Options */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              <CreditCard className="h-5 w-5 text-brand-600" />
              <h2 className="font-bold text-slate-900">Payment Gateways</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <p className="font-bold text-slate-900">Razorpay Unified UPI/Cards</p>
                  <p className="text-xs text-slate-500">Live API Key Active</p>
                </div>
                <input
                  type="checkbox"
                  checked={razorpayLive}
                  onChange={(e) => setRazorpayLive(e.target.checked)}
                  className="h-5 w-5 rounded text-brand-600 focus:ring-brand-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <p className="font-bold text-slate-900">Cash on Delivery (COD)</p>
                  <p className="text-xs text-slate-500">Max limit ₹1,000 per order</p>
                </div>
                <input
                  type="checkbox"
                  checked={codEnabled}
                  onChange={(e) => setCodEnabled(e.target.checked)}
                  className="h-5 w-5 rounded text-brand-600 focus:ring-brand-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <p className="font-bold text-slate-900">VeggieWallet Payments</p>
                  <p className="text-xs text-slate-500">5% cashback on wallet pay</p>
                </div>
                <input
                  type="checkbox"
                  checked={walletCashbackEnabled}
                  onChange={(e) => setWalletCashbackEnabled(e.target.checked)}
                  className="h-5 w-5 rounded text-brand-600 focus:ring-brand-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs text-slate-400">
            SSL Encryption Active & PCI-DSS Compliant.
          </div>
        </div>
      </div>

      {/* Staff Role-Based Access Control (RBAC) */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 flex items-center gap-2">
            <Users size={18} className="text-brand-600" /> Staff Role-Based Access Control (RBAC)
          </h2>
          <span className="text-xs text-slate-500 font-medium">{staff.length} Staff members</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-100">
              <tr>
                <th className="px-6 py-3">Staff Name</th>
                <th className="px-6 py-3">Email Address</th>
                <th className="px-6 py-3">Assigned Role</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {staff.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-6 py-4 font-bold text-slate-900">{member.name}</td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-600">{member.email}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 rounded-md bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-800 capitalize">
                      <Lock size={12} /> {member.role.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                        member.status === "Active"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-xs text-slate-500">{member.lastActive}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {isInviting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="text-brand-600" /> Invite Staff Member
            </h3>
            <form onSubmit={handleInviteStaff} className="space-y-3 text-sm">
              <div>
                <label className="block font-semibold text-slate-700">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Work Email</label>
                <input
                  type="email"
                  placeholder="e.g. ramesh@veggieflick.in"
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Role & Permission Scope</label>
                <select
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900"
                >
                  <option value="super_admin">Super Admin (Full Access)</option>
                  <option value="catalog_manager">Catalog & Stock Manager</option>
                  <option value="delivery_dispatcher">Delivery Dispatcher</option>
                  <option value="finance_auditor">Finance & Sales Auditor</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsInviting(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-600 px-4 py-2 text-white font-semibold hover:bg-brand-700"
                >
                  Send Invite Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
