"use client";

import { useState } from "react";
import {
  AppWindow,
  CheckCircle2,
  ExternalLink,
  Flame,
  Globe,
  Layers,
  MessageSquare,
  QrCode,
  Search,
  ShieldCheck,
  Sliders,
  Sparkles,
  Truck,
  Zap,
} from "lucide-react";
import { useApp } from "@/components/providers";

type AppIntegration = {
  id: string;
  name: string;
  category: "Advertising" | "Payments" | "Logistics" | "Messaging" | "Analytics";
  description: string;
  iconBg: string;
  status: "Connected" | "Configure" | "Available";
  fields: { label: string; key: string; value: string; placeholder: string; isSecret?: boolean }[];
};

const INITIAL_APPS: AppIntegration[] = [
  {
    id: "app-meta-ads",
    name: "Meta Ads & Instagram Pixel",
    category: "Advertising",
    description: "Track sales conversions, retarget Chennai shoppers, and sync catalogue with Meta Facebook & Instagram Ads.",
    iconBg: "bg-blue-600 text-white",
    status: "Connected",
    fields: [
      { label: "Meta Pixel ID", key: "pixelId", value: "9812409823014", placeholder: "e.g. 9812409823014" },
      { label: "Conversions API Token", key: "apiToken", value: "EAABxxxxxx...", placeholder: "Paste Access Token", isSecret: true },
    ],
  },
  {
    id: "app-google-ads",
    name: "Google Ads & Analytics 4",
    category: "Advertising",
    description: "Connect Google Performance Max, Shopping Ads, and GA4 revenue attribution directly to VeggieFlick checkout.",
    iconBg: "bg-amber-500 text-white",
    status: "Connected",
    fields: [
      { label: "Google Ads Conversion ID", key: "conversionId", value: "AW-109283746", placeholder: "e.g. AW-109283746" },
      { label: "Google Tag Manager ID", key: "gtmId", value: "GTM-VF8812", placeholder: "e.g. GTM-XXXXXX" },
    ],
  },
  {
    id: "app-whatsapp-api",
    name: "WhatsApp Business Cloud API",
    category: "Messaging",
    description: "Automated order confirmation alerts, live delivery tracking updates, and direct WhatsApp 1-click reordering.",
    iconBg: "bg-emerald-600 text-white",
    status: "Connected",
    fields: [
      { label: "WhatsApp Phone Number ID", key: "phoneId", value: "1092837465019", placeholder: "e.g. 1092837465019" },
      { label: "Meta System User Token", key: "waToken", value: "EAAGyyyyyy...", placeholder: "Paste Permanent Access Token", isSecret: true },
    ],
  },
  {
    id: "app-razorpay",
    name: "Razorpay Payment Gateway",
    category: "Payments",
    description: "Direct UPI, GPay, PhonePe, Paytm, credit/debit cards, and netbanking processing with instant settlement.",
    iconBg: "bg-sky-600 text-white",
    status: "Connected",
    fields: [
      { label: "Razorpay Key ID", key: "razorpayKeyId", value: "rzp_live_VF88129034", placeholder: "e.g. rzp_live_xxx" },
      { label: "Razorpay Key Secret", key: "razorpaySecret", value: "••••••••••••••••", placeholder: "Secret key", isSecret: true },
    ],
  },
  {
    id: "app-uber-direct",
    name: "Uber Direct On-Demand Delivery API",
    category: "Logistics",
    description: "Instant auto-dispatch of electric scooter riders within K.K. Nagar, Vadapalani, and Ashok Nagar 10 km hub radius.",
    iconBg: "bg-slate-900 text-white",
    status: "Connected",
    fields: [
      { label: "Uber Direct Customer ID", key: "uberCustId", value: "ub_cust_kk_nagar_01", placeholder: "Customer ID" },
      { label: "Client Secret Token", key: "uberSecret", value: "••••••••••••••••", placeholder: "Client secret", isSecret: true },
    ],
  },
  {
    id: "app-swiggy-zomato",
    name: "Swiggy & Zomato Quick Commerce Outlets",
    category: "Logistics",
    description: "Publish cut veggie inventory to Swiggy Instamart and Zomato Everyday channels with automated stock sync.",
    iconBg: "bg-orange-600 text-white",
    status: "Connected",
    fields: [
      { label: "Swiggy Merchant Store Code", key: "swiggyCode", value: "SWG-MAIY-019", placeholder: "Store Code" },
      { label: "Zomato Partner ID", key: "zomatoId", value: "ZOM-CHE-8812", placeholder: "Partner ID" },
    ],
  },
];

export default function AdminAppStorePage() {
  const { notify } = useApp();
  const [apps, setApps] = useState<AppIntegration[]>(INITIAL_APPS);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [selectedApp, setSelectedApp] = useState<AppIntegration | null>(null);

  const categories = ["All", "Advertising", "Payments", "Logistics", "Messaging"];

  const filteredApps = apps.filter(
    (app) => activeCategory === "All" || app.category === activeCategory
  );

  const handleSaveAppConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    setApps((prev) =>
      prev.map((a) => (a.id === selectedApp.id ? { ...a, status: "Connected" } : a))
    );
    notify(`${selectedApp.name} configuration saved & channel connected live!`);
    setSelectedApp(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 text-white shadow-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-800">
            <Sparkles size={12} /> Shopify-Grade Ecosystem
          </span>
          <h1 className="text-2xl font-black tracking-tight mt-2">
            App Store & Sales Channel Integrations
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Directly connect Google Ads, Meta Facebook/Instagram Pixel, WhatsApp Business API, Razorpay, and Uber Direct delivery channels to your VeggieFlick back-office.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-xl bg-emerald-500/20 border border-emerald-500/40 px-3.5 py-1.5 text-xs font-bold text-emerald-300 flex items-center gap-1.5">
            <CheckCircle2 size={16} className="text-emerald-400" /> All 6 Core Apps Active
          </span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-xl px-4 py-2 transition ${
              activeCategory === cat
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* App Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredApps.map((app) => (
          <div
            key={app.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-black text-sm ${app.iconBg}`}>
                  {app.name.slice(0, 2).toUpperCase()}
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 size={12} /> {app.status}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900">{app.name}</h3>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  {app.category}
                </span>
                <p className="text-xs text-slate-600 mt-1.5 line-clamp-3 leading-relaxed">
                  {app.description}
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedApp(app)}
                className="w-full rounded-xl bg-slate-100 py-2 text-xs font-bold text-slate-800 hover:bg-slate-900 hover:text-white transition"
              >
                Configure Settings & Keys →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Integration Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center font-black text-xs ${selectedApp.iconBg}`}>
                  {selectedApp.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedApp.name}</h3>
                  <p className="text-xs text-slate-400">{selectedApp.category} Integration</p>
                </div>
              </div>
              <button onClick={() => setSelectedApp(null)} className="text-slate-400 hover:text-slate-600 font-bold text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAppConfig} className="space-y-3 text-xs">
              <p className="text-slate-600">{selectedApp.description}</p>

              {selectedApp.fields.map((field) => (
                <div key={field.key}>
                  <label className="block font-bold text-slate-700 mb-1">{field.label}</label>
                  <input
                    type={field.isSecret ? "password" : "text"}
                    defaultValue={field.value}
                    placeholder={field.placeholder}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-mono font-semibold text-slate-900 focus:border-emerald-600 focus:outline-none"
                    required
                  />
                </div>
              ))}

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 px-5 py-2 font-bold text-white hover:bg-slate-800 shadow-sm"
                >
                  Save & Connect Channel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
