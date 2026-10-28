"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  FileCheck2,
  CreditCard,
  Users,
  Lock,
  Plus,
  BadgeCheck,
  Phone,
  MapPin,
  MessageSquare,
  QrCode,
  Truck,
  CheckCircle2,
  XCircle,
  Trash2,
  Power,
  IndianRupee,
  Sliders,
  Eye,
  EyeOff,
  ShieldCheck,
  Key,
  Webhook,
  Copy,
  Check,
  ExternalLink,
  Loader2,
  HelpCircle,
  Info,
  Star,
} from "lucide-react";
import { useApp } from "@/components/providers";
import { formatINR } from "@/lib/utils";

type StaffMember = {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "catalog_manager" | "delivery_dispatcher" | "finance_auditor";
  status: "Active" | "Pending";
  lastActive: string;
};

type DeliveryPartner = {
  id: string;
  name: string;
  logoText: string;
  isEnabled: boolean;
  commissionPct: number;
};

type PendingReview = {
  id: string;
  authorName: string;
  productName: string;
  rating: number;
  comment: string;
  createdAt: string;
  status: "Approved" | "Pending" | "Rejected";
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
];

const INITIAL_PARTNERS: DeliveryPartner[] = [
  { id: "p1", name: "Swiggy Food", logoText: "Swiggy", isEnabled: true, commissionPct: 18 },
  { id: "p2", name: "Zomato", logoText: "Zomato", isEnabled: true, commissionPct: 18 },
  { id: "p3", name: "Swiggy Instamart", logoText: "Instamart", isEnabled: true, commissionPct: 15 },
  { id: "p4", name: "Blinkit", logoText: "Blinkit", isEnabled: true, commissionPct: 15 },
  { id: "p5", name: "BigBasket", logoText: "BigBasket", isEnabled: true, commissionPct: 12 },
  { id: "p6", name: "Zepto", logoText: "Zepto", isEnabled: true, commissionPct: 15 },
];

const INITIAL_REVIEWS: PendingReview[] = [
  {
    id: "rev-1",
    authorName: "Anand R. (K.K. Nagar)",
    productName: "Cut Beans (Chopped)",
    rating: 5,
    comment: "Extremely fresh! Cut uniform size, saved me 15 minutes of cooking time.",
    createdAt: "Today 10:30 AM",
    status: "Approved",
  },
  {
    id: "rev-2",
    authorName: "Kavitha S. (Ashok Nagar)",
    productName: "Peeled Shallots & Garlic Mix",
    rating: 5,
    comment: "No tears onion prep! Small onions were perfectly peeled and zero spoilage.",
    createdAt: "Yesterday 4:15 PM",
    status: "Approved",
  },
  {
    id: "rev-3",
    authorName: "Meenakshi K. (Vadapalani)",
    productName: "Bisi Bele Bath Kit",
    rating: 5,
    comment: "The Without Onion variant was perfect for Friday puja prep. Fresh cut veggies!",
    createdAt: "Yesterday 6:00 PM",
    status: "Approved",
  },
  {
    id: "rev-4",
    authorName: "Siddharth M. (K.K. Nagar)",
    productName: "Protein Sprouts Power Salad",
    rating: 4,
    comment: "Very crisp sprouts and clean packaging. Mint dressing was spot on.",
    createdAt: "Today 8:00 AM",
    status: "Pending",
  },
];

export default function AdminStoreSettingsPage() {
  const { notify } = useApp();
  const [activeTab, setActiveTab] = useState<
    "general" | "pricing" | "partners" | "payments" | "whatsapp" | "reviews"
  >("general");

  // Operational Store State
  const [isStoreOpen, setIsStoreOpen] = useState(true);

  // Store Legal & Business Information State
  const [storeName, setStoreName] = useState("VeggieFlick Fresh Cut Veggies & Foods");
  const [fssaiNo, setFssaiNo] = useState("12423000001234");
  const [gstin, setGstin] = useState("33AAAAA0000A1Z5");
  const [supportPhone, setSupportPhone] = useState("+91 98405 32826");
  const [supportEmail, setSupportEmail] = useState("support@veggieflick.in");
  const [hubAddress, setHubAddress] = useState("50, 51st Street, 9th Sector, K.K. Nagar, Chennai - 600078");

  // Fee Matrix State
  const [cuttingFee, setCuttingFee] = useState(15);
  const [packingFee, setPackingFee] = useState(10);
  const [deliveryFee, setDeliveryFee] = useState(29);

  // Delivery Partners State
  const [partners, setPartners] = useState<DeliveryPartner[]>(INITIAL_PARTNERS);

  // WhatsApp & QR State
  const [whatsappNumber, setWhatsappNumber] = useState("+91 98405 32826");
  const [upiId, setUpiId] = useState("veggieflick@upi");
  const [qrDestination, setQrDestination] = useState("https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=veggieflick@upi&pn=VeggieFlick");

  // Reviews State
  const [reviews, setReviews] = useState<PendingReview[]>(INITIAL_REVIEWS);

  // Gateway Toggles & Razorpay State
  const [razorpayLive, setRazorpayLive] = useState(true);
  const [codEnabled, setCodEnabled] = useState(true);

  const [razorpayKeyId, setRazorpayKeyId] = useState("");
  const [razorpayKeySecret, setRazorpayKeySecret] = useState("");
  const [razorpayWebhookSecret, setRazorpayWebhookSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [hasExistingSecret, setHasExistingSecret] = useState(false);
  const [hasExistingWebhook, setHasExistingWebhook] = useState(false);
  const [gatewayMode, setGatewayMode] = useState<"live" | "test">("test");
  const [gatewayConfigured, setGatewayConfigured] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("http://localhost:3000/api/webhooks/razorpay");
  const [testingConnection, setTestingConnection] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);
  const [testResult, setTestResult] = useState<{ connected: boolean; message: string } | null>(null);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  useEffect(() => {
    fetch("/api/v1/admin/settings/payment")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) {
          setRazorpayKeyId(res.data.keyId || "");
          setHasExistingSecret(Boolean(res.data.hasSecret));
          setHasExistingWebhook(Boolean(res.data.hasWebhookSecret));
          setGatewayMode(res.data.mode || "test");
          setGatewayConfigured(Boolean(res.data.isConfigured));
          setWebhookUrl(res.data.webhookUrl || "");
          setRazorpayLive(Boolean(res.data.isEnabled));
        }
      })
      .catch(() => undefined);
  }, []);

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/v1/admin/settings/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test",
          keyId: razorpayKeyId,
          keySecret: razorpayKeySecret,
        }),
      });
      const json = await res.json();
      setTestingConnection(false);
      if (json.success && json.data) {
        setTestResult({
          connected: json.data.connected,
          message: json.data.message,
        });
        notify(
          json.data.connected ? "Razorpay API Connection Successful!" : json.data.message,
          json.data.connected ? "success" : "error"
        );
      } else {
        setTestResult({
          connected: false,
          message: json.error?.message || "Failed to test connection",
        });
      }
    } catch (err: any) {
      setTestingConnection(false);
      setTestResult({ connected: false, message: err?.message || "Network error" });
    }
  };

  const handleSavePaymentSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPayment(true);
    try {
      const res = await fetch("/api/v1/admin/settings/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save",
          keyId: razorpayKeyId,
          keySecret: razorpayKeySecret || undefined,
          webhookSecret: razorpayWebhookSecret || undefined,
        }),
      });
      const json = await res.json();
      setSavingPayment(false);
      if (json.success) {
        setHasExistingSecret(true);
        if (razorpayWebhookSecret) setHasExistingWebhook(true);
        setGatewayConfigured(Boolean(razorpayKeyId));
        setGatewayMode(razorpayKeyId.startsWith("rzp_live_") ? "live" : "test");
        setRazorpayKeySecret(""); // Clear secret input from memory for security
        notify("Razorpay credentials saved and activated successfully on server!");
      } else {
        notify(json.error?.message || "Failed to save payment settings", "error");
      }
    } catch {
      setSavingPayment(false);
      notify("Failed to save credentials", "error");
    }
  };

  const copyWebhookUrl = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(webhookUrl);
      setCopiedWebhook(true);
      setTimeout(() => setCopiedWebhook(false), 2500);
      notify("Webhook URL copied to clipboard!");
    }
  };

  // Staff State & Modal
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);
  const [isInviting, setIsInviting] = useState(false);
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffEmail, setNewStaffEmail] = useState("");
  const [newStaffRole, setNewStaffRole] = useState<StaffMember["role"]>("catalog_manager");

  const handleToggleStoreStatus = () => {
    const next = !isStoreOpen;
    setIsStoreOpen(next);
    notify(next ? "Store is now LIVE and taking customer orders!" : "Store is now CLOSED. New orders paused.");
  };

  const handleTogglePartner = (id: string) => {
    setPartners((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isEnabled: !p.isEnabled } : p))
    );
    notify("Delivery Partner status updated!");
  };

  const handleSavePricing = (e: React.FormEvent) => {
    e.preventDefault();
    notify("Rate & Fee Breakdown (Cutting, Packing, Delivery) updated successfully!");
  };

  const handleSaveWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    notify("WhatsApp Business & UPI QR details updated!");
  };

  const handleReviewAction = (id: string, action: "approve" | "reject" | "delete") => {
    if (action === "delete") {
      setReviews((prev) => prev.filter((r) => r.id !== id));
      notify("Review deleted");
      return;
    }
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: action === "approve" ? "Approved" : "Rejected" } : r))
    );
    notify(`Review marked as ${action === "approve" ? "Approved" : "Rejected"}`);
  };

  const handleSaveStoreInfo = (e: React.FormEvent) => {
    e.preventDefault();
    notify("Store legal parameters & K.K. Nagar Hub profile saved!");
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
      {/* Top Banner: Store ON/OFF Operational Status */}
      <div className={`rounded-2xl border p-4 flex flex-wrap items-center justify-between gap-4 transition-colors ${
        isStoreOpen ? "bg-emerald-50 border-emerald-200 text-emerald-950" : "bg-rose-50 border-rose-200 text-rose-950"
      }`}>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleToggleStoreStatus}
            className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isStoreOpen ? "bg-emerald-600" : "bg-rose-600"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                isStoreOpen ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
          <div>
            <h2 className="text-base font-extrabold flex items-center gap-2">
              <Power size={18} className={isStoreOpen ? "text-emerald-700" : "text-rose-700"} />
              Store Status: {isStoreOpen ? "ONLINE (Accepting Orders)" : "OFFLINE (Orders Paused)"}
            </h2>
            <p className="text-xs opacity-80">
              K.K. Nagar Hub 10 KM Radius · {isStoreOpen ? "Customers can checkout normally." : "Checkout displays maintenance notice."}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleToggleStoreStatus}
          className={`btn btn-sm font-bold ${isStoreOpen ? "bg-emerald-700 text-white hover:bg-emerald-800" : "bg-rose-700 text-white hover:bg-rose-800"}`}
        >
          {isStoreOpen ? "Turn Store OFF" : "Turn Store ON"}
        </button>
      </div>

      {/* Header & Tabs */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">K.K. Nagar Hub Settings</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage 10 KM delivery fees, partner channels, WhatsApp business, and customer review moderation.
          </p>
        </div>
        <button
          onClick={() => setIsInviting(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-900"
        >
          <Plus size={16} />
          Invite Staff Member
        </button>
      </div>

      {/* Sleek Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2 text-xs font-extrabold">
        {[
          { id: "general", label: "Business & Legal Profile", icon: Building2 },
          { id: "payments", label: "Razorpay Gateway", icon: CreditCard },
          { id: "pricing", label: "Rate & Fee Structure", icon: IndianRupee },
          { id: "partners", label: "Delivery Partners", icon: Truck },
          { id: "whatsapp", label: "WhatsApp & Payment QR", icon: QrCode },
          { id: "reviews", label: "Review Moderation", icon: MessageSquare },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 transition ${
              activeTab === id
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* TAB 1: GENERAL & LEGAL */}
      {activeTab === "general" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-2 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-extrabold text-slate-900 flex items-center gap-2 text-sm">
                <Building2 className="text-emerald-700" size={18} /> Business Legal Profile & FSSAI
              </h2>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <BadgeCheck size={14} /> FSSAI Active
              </span>
            </div>

            <form onSubmit={handleSaveStoreInfo} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Store Brand Name</label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 font-semibold focus:border-emerald-600 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">FSSAI License No.</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={fssaiNo}
                      onChange={(e) => setFssaiNo(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 font-mono font-bold focus:border-emerald-600 focus:outline-none"
                      required
                    />
                    <FileCheck2 size={16} className="absolute right-3 top-2.5 text-emerald-600" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">GSTIN Number (TN)</label>
                  <input
                    type="text"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 font-mono font-bold focus:border-emerald-600 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Support Helpline</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={supportPhone}
                      onChange={(e) => setSupportPhone(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 pl-8 pr-3 py-2 text-slate-900 font-semibold focus:border-emerald-600 focus:outline-none"
                      required
                    />
                    <Phone size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Hub Physical Address</label>
                <div className="relative">
                  <input
                    type="text"
                    value={hubAddress}
                    onChange={(e) => setHubAddress(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 pl-8 pr-3 py-2 text-slate-900 font-semibold focus:border-emerald-600 focus:outline-none"
                    required
                  />
                  <MapPin size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition"
                >
                  Save Business Profile
                </button>
              </div>
            </form>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-emerald-700" />
                <h2 className="font-extrabold text-slate-900 text-sm">Payment Gateways</h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("payments")}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline"
              >
                Configure Keys →
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-extrabold text-slate-900">Razorpay Payment Gateway</p>
                    <p className="text-[11px] text-slate-500">
                      {gatewayConfigured
                        ? gatewayMode === "live"
                          ? "Live Production Account"
                          : "Test Sandbox Account"
                        : "Keys Pending Configuration"}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={razorpayLive}
                    onChange={(e) => setRazorpayLive(e.target.checked)}
                    className="h-4 w-4 rounded accent-emerald-600 cursor-pointer"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("payments")}
                  className="w-full text-center py-1.5 px-3 rounded-lg bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200 hover:bg-emerald-100 transition-colors"
                >
                  Manage API Keys & Webhook →
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <p className="font-extrabold text-slate-900">Cash on Delivery (COD)</p>
                  <p className="text-[11px] text-slate-500">Max limit ₹1,000 per order</p>
                </div>
                <input
                  type="checkbox"
                  checked={codEnabled}
                  onChange={(e) => setCodEnabled(e.target.checked)}
                  className="h-4 w-4 rounded accent-emerald-600 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: RAZORPAY GATEWAY & PAYMENTS */}
      {activeTab === "payments" && (
        <div className="space-y-6">
          {/* Top Status Cards */}
          <div className="grid gap-4 sm:grid-cols-3 text-xs">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Gateway Status</span>
              <div className="mt-2 flex items-center gap-2">
                <span
                  className={`inline-block h-3 w-3 rounded-full ${
                    gatewayConfigured
                      ? gatewayMode === "live"
                        ? "bg-emerald-500 animate-pulse"
                        : "bg-amber-500"
                      : "bg-slate-400"
                  }`}
                />
                <span className="text-sm font-black text-slate-900">
                  {gatewayConfigured
                    ? gatewayMode === "live"
                      ? "Live Production"
                      : "Test / Sandbox"
                    : "Not Configured"}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {gatewayConfigured
                  ? gatewayMode === "live"
                    ? "Real bank transactions active"
                    : "Test mode for simulated cards & UPI"
                  : "Add Key ID and Secret below"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Key Secret Status</span>
              <div className="mt-2 flex items-center gap-2">
                <ShieldCheck size={18} className={hasExistingSecret ? "text-emerald-600" : "text-amber-500"} />
                <span className="text-sm font-black text-slate-900">
                  {hasExistingSecret ? "Server Secret Active" : "Secret Missing"}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {hasExistingSecret ? "Encrypted on server (.env), hidden from F12" : "Required for signature verification"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Webhook Integration</span>
              <div className="mt-2 flex items-center gap-2">
                <Webhook size={18} className={hasExistingWebhook ? "text-emerald-600" : "text-slate-400"} />
                <span className="text-sm font-black text-slate-900">
                  {hasExistingWebhook ? "Webhook Verified" : "Webhook Ready"}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Auto-confirms order status when customer completes payment
              </p>
            </div>
          </div>

          {/* Credentials Form */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h2 className="font-extrabold text-slate-900 flex items-center gap-2 text-sm">
                  <Key className="text-emerald-700" size={18} /> Razorpay API Credentials
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter Key ID and Secret from Razorpay Dashboard → Settings → API Keys.
                </p>
              </div>
              <a
                href="https://dashboard.razorpay.com/app/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition-colors"
              >
                Open Razorpay Dashboard <ExternalLink size={13} />
              </a>
            </div>

            <form onSubmit={handleSavePaymentSettings} autoComplete="off" className="space-y-4 text-xs">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="razorpay_key_identifier" className="block font-bold text-slate-700 mb-1">
                    Razorpay Key ID *
                  </label>
                  <input
                    type="text"
                    id="razorpay_key_identifier"
                    name="razorpay_key_identifier"
                    autoComplete="off"
                    data-lpignore="true"
                    data-form-type="other"
                    placeholder="rzp_live_... or rzp_test_..."
                    value={razorpayKeyId}
                    onChange={(e) => setRazorpayKeyId(e.target.value.trim())}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-mono font-bold text-slate-900 focus:border-emerald-600 focus:outline-none"
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Prefix <code className="text-amber-700">rzp_test_</code> triggers Test Mode. Prefix <code className="text-emerald-700">rzp_live_</code> enables real customer payments.
                  </p>
                </div>

                <div>
                  <label htmlFor="razorpay_key_secret_code" className="block font-bold text-slate-700 mb-1">
                    Razorpay Key Secret *
                  </label>
                  <div className="relative">
                    <input
                      type={showSecret ? "text" : "password"}
                      id="razorpay_key_secret_code"
                      name="razorpay_key_secret_code"
                      autoComplete="new-password"
                      data-lpignore="true"
                      data-form-type="other"
                      placeholder={
                        hasExistingSecret
                          ? "•••••••••••••••• (Secret saved on server)"
                          : "Enter Razorpay Key Secret"
                      }
                      value={razorpayKeySecret}
                      onChange={(e) => setRazorpayKeySecret(e.target.value.trim())}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 pr-10 font-mono text-slate-900 focus:border-emerald-600 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecret((v) => !v)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                      title={showSecret ? "Hide secret" : "Show secret"}
                    >
                      {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Leave blank to keep existing secret. Stored strictly server-side.
                  </p>
                </div>
              </div>

              <div>
                <label htmlFor="razorpay_webhook_secret_code" className="block font-bold text-slate-700 mb-1">
                  Razorpay Webhook Secret (Optional)
                </label>
                <input
                  type="password"
                  id="razorpay_webhook_secret_code"
                  name="razorpay_webhook_secret_code"
                  autoComplete="new-password"
                  data-lpignore="true"
                  data-form-type="other"
                  placeholder={
                    hasExistingWebhook
                      ? "•••••••••••••••• (Webhook secret saved)"
                      : "Secret entered when creating webhook"
                  }
                  value={razorpayWebhookSecret}
                  onChange={(e) => setRazorpayWebhookSecret(e.target.value.trim())}
                  className="w-full sm:w-1/2 rounded-xl border border-slate-200 px-3 py-2 font-mono text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Used to verify signature on incoming webhook events from Razorpay.
                </p>
              </div>

              {/* Test Result Message Banner */}
              {testResult && (
                <div
                  className={`p-3.5 rounded-xl border text-xs font-semibold flex items-start gap-2.5 ${
                    testResult.connected
                      ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                      : "bg-rose-50 border-rose-200 text-rose-900"
                  }`}
                >
                  {testResult.connected ? (
                    <CheckCircle2 size={18} className="text-emerald-700 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle size={18} className="text-rose-700 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-extrabold">{testResult.connected ? "Connection Verified!" : "Connection Error"}</p>
                    <p className="mt-0.5 opacity-90">{testResult.message}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testingConnection}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-xs disabled:opacity-50"
                >
                  {testingConnection ? (
                    <Loader2 size={14} className="animate-spin text-emerald-600" />
                  ) : (
                    <ShieldCheck size={14} className="text-emerald-700" />
                  )}
                  <span>Test Razorpay Connection</span>
                </button>

                <button
                  type="submit"
                  disabled={savingPayment}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition shadow-xs disabled:opacity-50"
                >
                  {savingPayment ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  <span>Save Gateway Credentials</span>
                </button>
              </div>
            </form>
          </div>

          {/* Webhook Configuration Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="font-extrabold text-slate-900 flex items-center gap-2 text-sm">
                <Webhook className="text-emerald-700" size={18} /> Webhook Endpoint Configuration
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Razorpay uses this URL to notify VeggieFlick automatically when a customer completes their payment.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  VeggieFlick Webhook URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={webhookUrl}
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-slate-800 select-all"
                  />
                  <button
                    type="button"
                    onClick={copyWebhookUrl}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 font-bold text-emerald-800 hover:bg-emerald-100 transition-colors shrink-0"
                  >
                    {copiedWebhook ? <Check size={14} className="text-emerald-700" /> : <Copy size={14} />}
                    <span>{copiedWebhook ? "Copied!" : "Copy URL"}</span>
                  </button>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2">
                <p className="font-bold text-slate-800">Events to Select in Razorpay Dashboard:</p>
                <ul className="grid gap-1.5 text-slate-600">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                    <code className="font-mono font-bold text-slate-900">payment.captured</code>
                    <span>— Automatically updates order status to <span className="font-bold text-emerald-700">&quot;Paid&quot;</span></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
                    <code className="font-mono font-bold text-slate-900">payment.failed</code>
                    <span>— Marks failed payment and allows customer to retry</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                    <code className="font-mono font-bold text-slate-900">order.paid</code>
                    <span>— Confirms order payment capture</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Comprehensive Merchant Setup Guide in Tamil & English */}
          <div className="rounded-2xl border border-emerald-200 bg-linear-to-b from-emerald-50/50 to-white p-6 shadow-xs space-y-4">
            <div className="border-b border-emerald-200/60 pb-3">
              <h2 className="font-black text-slate-900 flex items-center gap-2 text-base">
                <HelpCircle className="text-emerald-700" size={20} /> Razorpay அமைவு வழிகாட்டி (Merchant Onboarding Guide)
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Razorpay அக்கவுண்ட் தொடங்கி, கீ (API Key) பெற்று வெப்சைட்டில் இணைக்கும் எளிய 5 படிகள்:
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 text-xs">
              <div className="card p-4 bg-white border border-slate-200 space-y-1.5">
                <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-black text-[10px]">
                  STEP 1 / படி 1
                </span>
                <h3 className="font-extrabold text-slate-900 text-sm">அக்கவுண்ட் உருவாக்குதல் (Signup)</h3>
                <p className="text-slate-600 leading-relaxed">
                  <strong>https://razorpay.com</strong> தளத்திற்குச் சென்று உங்கள் மொபைல் எண் / ஜிமெயில் மூலம் லாகின் செய்யவும். வணிக வகையை (Individual / Proprietorship / Pvt Ltd) தேர்ந்தெடுக்கவும்.
                </p>
              </div>

              <div className="card p-4 bg-white border border-slate-200 space-y-1.5">
                <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-black text-[10px]">
                  STEP 2 / படி 2
                </span>
                <h3 className="font-extrabold text-slate-900 text-sm">KYC விவரங்கள் சமர்ப்பித்தல்</h3>
                <p className="text-slate-600 leading-relaxed">
                  வணிக PAN அட்டை, ஆதார் அட்டை, வணிக முகவரி சான்று மற்றும் வாடிக்கையாளர் பணம் வந்து சேர வேண்டிய <strong>வங்கி கணக்கு எண் (Bank Account &amp; IFSC)</strong> பதிவேற்றவும்.
                </p>
              </div>

              <div className="card p-4 bg-white border border-slate-200 space-y-1.5">
                <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-black text-[10px]">
                  STEP 3 / படி 3
                </span>
                <h3 className="font-extrabold text-slate-900 text-sm">API Keys உருவாக்குதல் (Generate Key)</h3>
                <p className="text-slate-600 leading-relaxed">
                  Razorpay டாஷ்போர்டில் <strong>Settings → API Keys</strong> செல்லவும். <strong>Generate Key</strong> கிளிக் செய்து <strong>Key ID</strong> மற்றும் <strong>Key Secret</strong> இரண்டையும் காப்பி செய்யவும்.
                </p>
              </div>

              <div className="card p-4 bg-white border border-slate-200 space-y-1.5">
                <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-black text-[10px]">
                  STEP 4 / படி 4
                </span>
                <h3 className="font-extrabold text-slate-900 text-sm">வெப்ஹூக் செட்டப் (Webhook Setup)</h3>
                <p className="text-slate-600 leading-relaxed">
                  Razorpay டாஷ்போர்டில் <strong>Settings → Webhooks</strong> சென்று, மேலே உள்ள <strong>VeggieFlick Webhook URL</strong>-ஐ பேஸ்ட் செய்து, <code>payment.captured</code> நிகழ்வை ஆன் செய்யவும்.
                </p>
              </div>

              <div className="card p-4 bg-white border border-slate-200 space-y-1.5 sm:col-span-2">
                <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-black text-[10px]">
                  STEP 5 / படி 5
                </span>
                <h3 className="font-extrabold text-slate-900 text-sm">டெஸ்ட் மோடு &amp; லைவ் மோடு இயக்கம்</h3>
                <p className="text-slate-600 leading-relaxed">
                  முதலில் <code>rzp_test_...</code> கீ மூலம் சோதனை செய்து பார்க்கலாம். KYC முடிந்ததும், டாஷ்போர்டில் <strong>Test Mode</strong>-லிருந்து <strong>Live Mode</strong>-க்கு மாற்றி, லைவ் கீ <code>rzp_live_...</code>-ஐ இந்த அட்மின் பக்கத்தில் பதிவு செய்து &quot;Save Gateway Credentials&quot; கொடுத்தால், உடனடியாக நேரடி பேமெண்ட் இயங்கத் தொடங்கும்!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRICING & FEE BREAKDOWN */}
      {activeTab === "pricing" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="font-extrabold text-slate-900 flex items-center gap-2 text-sm">
                <IndianRupee className="text-emerald-700" size={18} /> Rate & Fee Calculation Matrix
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Customer Total = Market Price + Cutting Charge + Packing Fee + Delivery Fee.
              </p>
            </div>
            <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Formula Enforced
            </span>
          </div>

          <form onSubmit={handleSavePricing} className="grid gap-6 sm:grid-cols-3 text-xs">
            <div className="card p-4 border border-slate-200 bg-slate-50">
              <label className="block font-extrabold text-slate-800 mb-1">Cutting & Preparation Fee</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  value={cuttingFee}
                  onChange={(e) => setCuttingFee(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 pl-8 pr-3 py-2 font-black text-slate-900 text-sm focus:border-emerald-600"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-2">Applied per cut vegetable item</p>
            </div>

            <div className="card p-4 border border-slate-200 bg-slate-50">
              <label className="block font-extrabold text-slate-800 mb-1">Hygienic Packing Charge</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  value={packingFee}
                  onChange={(e) => setPackingFee(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 pl-8 pr-3 py-2 font-black text-slate-900 text-sm focus:border-emerald-600"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-2">Food-grade zip pouches & ozonated seal</p>
            </div>

            <div className="card p-4 border border-slate-200 bg-slate-50">
              <label className="block font-extrabold text-slate-800 mb-1">Standard Delivery Fee (Within 10 KM)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 pl-8 pr-3 py-2 font-black text-slate-900 text-sm focus:border-emerald-600"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-2">K.K. Nagar Hub flat dispatch charge</p>
            </div>

            <div className="sm:col-span-3 flex justify-end">
              <button
                type="submit"
                className="rounded-xl bg-emerald-800 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-900 transition shadow-xs"
              >
                Save Rate & Fee Matrix
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: DELIVERY PARTNER INTEGRATIONS */}
      {activeTab === "partners" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="font-extrabold text-slate-900 flex items-center gap-2 text-sm">
              <Truck className="text-emerald-700" size={18} /> Fast Delivery Partners & Quick Commerce Outlets
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enable or disable direct channel integrations for Swiggy, Zomato, Instamart, Blinkit, BigBasket, and Zepto.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {partners.map((partner) => (
              <div key={partner.id} className="card p-4 border border-slate-200 bg-white flex items-center justify-between">
                <div>
                  <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-800 uppercase tracking-wider">
                    {partner.logoText}
                  </span>
                  <h3 className="text-xs font-bold text-slate-900 mt-1">{partner.name}</h3>
                  <p className="text-[11px] text-slate-400">Commission rate: {partner.commissionPct}%</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleTogglePartner(partner.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    partner.isEnabled
                      ? "bg-emerald-100 text-emerald-900 hover:bg-emerald-200"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {partner.isEnabled ? "Active" : "Disabled"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: WHATSAPP BUSINESS & PAYMENTS */}
      {activeTab === "whatsapp" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="font-extrabold text-slate-900 flex items-center gap-2 text-sm">
              <QrCode className="text-emerald-700" size={18} /> WhatsApp Business & UPI Payment Destination
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure direct WhatsApp ordering phone number and UPI QR code destination.
            </p>
          </div>

          <form onSubmit={handleSaveWhatsApp} className="grid gap-6 sm:grid-cols-2 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">WhatsApp Business Ordering Number</label>
              <div className="relative">
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 pl-8 pr-3 py-2 font-semibold text-slate-900 focus:border-emerald-600"
                  required
                />
                <Phone size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Store UPI ID Destination</label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 font-mono font-bold text-slate-900 focus:border-emerald-600"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Payment QR Code Image Endpoint</label>
              <input
                type="text"
                value={qrDestination}
                onChange={(e) => setQrDestination(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-[11px] text-slate-700 focus:border-emerald-600"
                required
              />
            </div>

            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition"
              >
                Save WhatsApp & QR Details
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 5: CUSTOMER REVIEW MODERATION */}
      {activeTab === "reviews" && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-slate-900 flex items-center gap-2 text-sm">
                <MessageSquare className="text-emerald-700" size={18} /> Customer Review Approval Moderation
              </h2>
              <p className="text-xs text-slate-500">Approve or reject customer reviews before public display.</p>
            </div>
            <span className="text-xs font-bold text-slate-500">{reviews.length} total reviews</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 font-bold text-slate-500 uppercase border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3">Rating</th>
                  <th className="px-6 py-3">Review Comment</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {reviews.map((rev) => (
                  <tr key={rev.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-3.5 font-bold text-slate-900">{rev.authorName}</td>
                    <td className="px-6 py-3.5 font-semibold text-slate-800">{rev.productName}</td>
                    <td className="px-6 py-3.5 font-bold text-amber-600">
                      <span className="flex items-center gap-1">
                        <Star size={13} className="fill-amber-500 text-amber-500" />
                        <span>{rev.rating}/5</span>
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-600 max-w-xs truncate">{rev.comment}</td>
                    <td className="px-6 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                        rev.status === "Approved" ? "bg-emerald-100 text-emerald-800" :
                        rev.status === "Pending" ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"
                      }`}>
                        {rev.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleReviewAction(rev.id, "approve")}
                        className="text-emerald-700 hover:text-emerald-900 font-bold"
                        title="Approve"
                      >
                        <CheckCircle2 size={16} className="inline" />
                      </button>
                      <button
                        onClick={() => handleReviewAction(rev.id, "reject")}
                        className="text-amber-700 hover:text-amber-900 font-bold"
                        title="Reject"
                      >
                        <XCircle size={16} className="inline" />
                      </button>
                      <button
                        onClick={() => handleReviewAction(rev.id, "delete")}
                        className="text-rose-600 hover:text-rose-800 font-bold"
                        title="Delete"
                      >
                        <Trash2 size={16} className="inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Staff Access Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <h2 className="font-extrabold text-slate-900 flex items-center gap-2 text-sm">
            <Users size={16} className="text-emerald-700" /> Authorized Hub Staff ({staff.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 uppercase text-slate-500 font-bold border-b border-slate-100">
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
                  <td className="px-6 py-3 font-bold text-slate-900">{member.name}</td>
                  <td className="px-6 py-3 font-mono text-slate-600">{member.email}</td>
                  <td className="px-6 py-3">
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 font-bold text-emerald-800 capitalize">
                      <Lock size={10} /> {member.role.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right text-slate-400">{member.lastActive}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {isInviting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="text-emerald-700" size={18} /> Invite Staff Member
            </h3>
            <form onSubmit={handleInviteStaff} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700">Full Name</label>
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
                <label className="block font-bold text-slate-700">Work Email</label>
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
                <label className="block font-bold text-slate-700">Role & Permission Scope</label>
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
                  className="rounded-xl border border-slate-200 px-4 py-2 text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-800 px-4 py-2 text-white font-bold hover:bg-emerald-900"
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
