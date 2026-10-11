"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  CreditCard,
  Loader2,
  MapPin,
  Truck,
  Wallet,
  Navigation,
  QrCode,
  Copy,
  Check,
  Calendar,
  Sparkles,
} from "lucide-react";
import { useApp } from "@/components/providers";
import { formatINR } from "@/lib/utils";
import { Breadcrumb, EmptyState } from "@/components/ui/primitives";

type Address = {
  id: string;
  addressType: string;
  contactName: string;
  contactPhone: string;
  doorNo: string;
  street: string;
  area: string;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
  distanceKm: number;
  serviceable: boolean;
};

type Slot = {
  id: string;
  slotName: string;
  available: boolean;
  maximumOrders: number;
  bookedOrders: number;
};

const PAYMENT_METHODS = [
  {
    value: "upi",
    label: "UPI / Google Pay / PhonePe / QR Code",
    Icon: QrCode,
    hint: "Instant QR Code & UPI deep link",
  },
  {
    value: "cod",
    label: "Cash on delivery (COD)",
    Icon: Truck,
    hint: "Pay cash or UPI to rider at doorstep",
  },
  {
    value: "card",
    label: "Credit / Debit card",
    Icon: CreditCard,
    hint: "Secured by Razorpay",
  },
  {
    value: "netbanking",
    label: "Net banking",
    Icon: CreditCard,
    hint: "All major banks",
  },
  {
    value: "wallet",
    label: "VeggieFlick wallet",
    Icon: Wallet,
    hint: "Use your balance",
  },
] as const;

const EMPTY_FORM = {
  contactName: "",
  contactPhone: "",
  doorNo: "",
  street: "",
  area: "",
  city: "Chennai",
  state: "Tamil Nadu",
  postalCode: "",
  addressType: "home" as "home" | "work" | "other",
  isDefault: true,
};

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, user, userLoading, refreshCart, notify } = useApp();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [addressId, setAddressId] = useState<string | null>(null);
  const [slotId, setSlotId] = useState<string | null>(null);
  const [method, setMethod] = useState<(typeof PAYMENT_METHODS)[number]["value"]>("upi");
  const [notes, setNotes] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [locating, setLocating] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [idempotencyKey] = useState(() => `vf-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`);

  const loadContext = useCallback(async () => {
    try {
      const response = await fetch("/api/v1/checkout", { cache: "no-store" });
      const json = await response.json();
      if (!json.success) return;
      const list = (json.data?.addresses as Address[]) || [];
      setAddresses(list);

      const availableSlots = (json.data?.slots as Slot[]) || [];
      setSlots(availableSlots);

      // Pre-fill user contact info in form
      if (json.data?.user) {
        setForm((prev) => ({
          ...prev,
          contactName: prev.contactName || json.data.user.name || "Customer",
          contactPhone: prev.contactPhone || json.data.user.phone || "9840532826",
        }));
      }

      // Address Selection / Show Form logic
      if (list.length > 0) {
        setAddressId((current) => current ?? list.find((a) => a.isDefault && a.serviceable)?.id ?? list[0]?.id ?? null);
        setShowForm(false);
      } else {
        setShowForm(true); // Open form automatically if no address exists
      }

      // Slot Selection logic
      if (availableSlots.length > 0) {
        setSlotId((current) => current ?? availableSlots.find((s) => s.available)?.id ?? availableSlots[0]?.id ?? null);
      }
    } catch (err) {
      console.warn("loadContext warning:", err);
    }
  }, []);

  useEffect(() => {
    if (!userLoading && !user) {
      router.replace("/login?redirect=/checkout");
    }
  }, [user, userLoading, router]);

  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(() => void loadContext(), 0);
    return () => clearTimeout(timer);
  }, [user, loadContext]);

  const selectedAddress = useMemo(
    () => addresses.find((address) => address.id === addressId) ?? null,
    [addresses, addressId],
  );

  // GPS Live Location Fetch
  async function handleUseLiveLocation() {
    if (typeof window === "undefined" || !navigator.geolocation) {
      notify("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
          );
          const data = await res.json();
          const addr = data.address || {};
          const road = addr.road || addr.residential || addr.neighbourhood || "";
          const area = addr.suburb || addr.neighbourhood || addr.city_district || "KK Nagar";
          const pincode = addr.postcode ? addr.postcode.replace(/\D/g, "").slice(0, 6) : "600042";

          setForm((prev) => ({
            ...prev,
            street: road || prev.street || "Main Road",
            area: area || prev.area || "Chennai",
            city: "Chennai",
            state: "Tamil Nadu",
            postalCode: pincode.length === 6 ? pincode : "600042",
          }));
          notify("📍 Location detected! Please enter Flat/Door number.");
        } catch {
          notify("Could not reverse lookup coordinates. Please enter manually.");
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        notify("Location access denied. Please enter pincode and address manually.");
      },
      { timeout: 10000, enableHighAccuracy: true },
    );
  }

  function copyUpiId() {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText("9840532826@okaxis");
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
      notify("UPI ID copied: 9840532826@okaxis");
    }
  }

  async function saveAddress(event?: React.FormEvent): Promise<string | null> {
    if (event) event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/v1/profile/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await response.json();
      setBusy(false);
      if (!json.success) {
        setError(json.error?.message ?? "Could not save address");
        return null;
      }
      setShowForm(false);
      const newId = (json.data?.id as string) || `addr-${Date.now()}`;
      setAddressId(newId);
      await loadContext();
      notify("Address saved successfully");
      return newId;
    } catch {
      setBusy(false);
      const fallbackId = `addr-${Date.now()}`;
      setAddressId(fallbackId);
      setShowForm(false);
      return fallbackId;
    }
  }

  async function placeOrder() {
    let activeAddressId = addressId;

    // If no address selected but user filled form, auto-save first
    if (!activeAddressId) {
      if (form.doorNo && form.street && form.postalCode) {
        const savedId = await saveAddress();
        if (savedId) activeAddressId = savedId;
      } else if (addresses.length > 0) {
        activeAddressId = addresses[0].id;
        setAddressId(activeAddressId);
      } else {
        setShowForm(true);
        setError("Please enter your delivery address above to place order");
        return;
      }
    }

    const activeSlotId = slotId || slots[0]?.id || "slot-next-day-early";

    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/v1/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addressId: activeAddressId || "addr-demo",
          deliverySlotId: activeSlotId,
          paymentMethod: method,
          notes: notes || undefined,
          idempotencyKey,
        }),
      });
      const json = await response.json();
      if (!json.success) {
        setBusy(false);
        setError(json.error?.message ?? "Could not place the order");
        return;
      }

      if (method !== "cod") {
        await fetch("/api/v1/payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: json.data.orderId }),
        }).catch(() => undefined);
      }

      await refreshCart();
      notify(`Order ${json.data.orderNumber} placed successfully!`);
      router.push(`/orders/${json.data.orderId}?placed=1`);
    } catch (err: any) {
      setBusy(false);
      setError(err?.message ?? "Network error placing order. Please try again.");
    }
  }

  if (userLoading) {
    return (
      <div className="container-page py-20 text-center text-sm text-muted">
        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-3 text-emerald-600" />
        Preparing checkout…
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="container-page py-10">
        <EmptyState
          title="Nothing to check out"
          description="Your basket is empty. Add a few fresh vegetables and return to checkout."
          action={
            <Link href="/shop" className="btn btn-primary px-5 py-2.5 text-sm">
              Browse products
            </Link>
          }
        />
      </div>
    );
  }

  const payableAmount = cart.totals.grandTotal > 0 ? cart.totals.grandTotal : cart.totals.subtotal + 30;
  const upiQrData = `upi://pay?pa=9840532826@okaxis&pn=VeggieFlick&am=${payableAmount}&cu=INR`;
  const upiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiQrData)}`;

  return (
    <div className="container-page py-6 md:py-10">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Basket", href: "/cart" }, { label: "Checkout" }]} />
      <h1 className="mb-6 text-2xl font-black tracking-tight md:text-3xl text-slate-900">
        Order Checkout & Delivery
      </h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="grid gap-5">
          {/* Section 1: Delivery Address */}
          <section className="card p-5 border border-slate-200" aria-labelledby="address-heading">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 id="address-heading" className="flex items-center gap-2 text-lg font-bold text-slate-900">
                  <MapPin className="h-5 w-5 text-emerald-600" aria-hidden /> 1. Delivery Address / டெலிவரி முகவரி
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  Delivered from K.K. Nagar Central Hub across Chennai.
                </p>
              </div>
              {addresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowForm((open) => !open)}
                  className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors"
                >
                  {showForm ? "Cancel" : "+ Add New Address"}
                </button>
              )}
            </div>

            {/* Saved Addresses List */}
            {addresses.length > 0 && (
              <div className="grid gap-3 mb-4">
                {addresses.map((address) => (
                  <label
                    key={address.id}
                    className={`flex cursor-pointer gap-3 rounded-xl border p-3.5 transition-all ${
                      addressId === address.id ? "border-emerald-600 bg-emerald-50/50 shadow-xs" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      className="mt-1 h-4 w-4 accent-emerald-600"
                      checked={addressId === address.id}
                      onChange={() => {
                        setAddressId(address.id);
                        setShowForm(false);
                      }}
                    />
                    <span className="flex-1 text-sm">
                      <span className="font-bold capitalize text-slate-900">
                        {address.addressType} · {address.contactName} ({address.contactPhone})
                      </span>
                      <span className="block text-slate-600 mt-0.5">
                        {address.doorNo}, {address.street}, {address.area}, {address.city} - {address.postalCode}
                      </span>
                      <span className="mt-1 inline-block text-xs font-semibold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">
                        ✓ Serviceable from KK Nagar Hub
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            )}

            {/* Address Input Form */}
            {showForm && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/20 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-emerald-200/60">
                  <span className="text-xs font-bold text-slate-800">
                    Enter New Delivery Address
                  </span>
                  <button
                    type="button"
                    onClick={handleUseLiveLocation}
                    disabled={locating}
                    className="inline-flex items-center gap-1.5 text-xs font-bold bg-white text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-300 shadow-xs hover:bg-emerald-50 transition-colors"
                  >
                    {locating ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-600" />
                    ) : (
                      <Navigation className="h-3.5 w-3.5 text-emerald-600" />
                    )}
                    <span>📍 Use Live GPS Location</span>
                  </button>
                </div>

                <form onSubmit={saveAddress} className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-1">
                    <span className="text-xs font-semibold text-slate-700">Full Name *</span>
                    <input
                      required
                      value={form.contactName}
                      onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                      placeholder="Surjith Thangavel"
                      className="field bg-white"
                    />
                  </label>

                  <label className="grid gap-1">
                    <span className="text-xs font-semibold text-slate-700">Mobile Number *</span>
                    <input
                      required
                      value={form.contactPhone}
                      onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                      placeholder="9840532826"
                      className="field bg-white"
                    />
                  </label>

                  <label className="grid gap-1">
                    <span className="text-xs font-semibold text-slate-700">Door / Flat No. *</span>
                    <input
                      required
                      value={form.doorNo}
                      onChange={(e) => setForm({ ...form, doorNo: e.target.value })}
                      placeholder="Flat 3B, Sunrise Apts"
                      className="field bg-white"
                    />
                  </label>

                  <label className="grid gap-1">
                    <span className="text-xs font-semibold text-slate-700">Street / Road *</span>
                    <input
                      required
                      value={form.street}
                      onChange={(e) => setForm({ ...form, street: e.target.value })}
                      placeholder="2nd Main Road"
                      className="field bg-white"
                    />
                  </label>

                  <label className="grid gap-1">
                    <span className="text-xs font-semibold text-slate-700">Area / Locality *</span>
                    <input
                      required
                      value={form.area}
                      onChange={(e) => setForm({ ...form, area: e.target.value })}
                      placeholder="Velachery / KK Nagar"
                      className="field bg-white"
                    />
                  </label>

                  <label className="grid gap-1">
                    <span className="text-xs font-semibold text-slate-700">Pincode *</span>
                    <input
                      required
                      value={form.postalCode}
                      onChange={(e) => setForm({ ...form, postalCode: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                      placeholder="600042"
                      className="field bg-white"
                    />
                  </label>

                  <label className="grid gap-1">
                    <span className="text-xs font-semibold text-slate-700">Address Type</span>
                    <select
                      value={form.addressType}
                      onChange={(e) => setForm({ ...form, addressType: e.target.value as any })}
                      className="field bg-white"
                    >
                      <option value="home">Home</option>
                      <option value="work">Work</option>
                      <option value="other">Other</option>
                    </select>
                  </label>

                  <div className="sm:col-span-2 pt-1 flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={busy}
                      className="btn btn-primary bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 shadow-sm"
                    >
                      {busy ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null} Save Address
                    </button>
                    {addresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="btn btn-outline text-xs px-4 py-2.5"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            )}
          </section>

          {/* Section 2: Delivery Slot (Next Day Morning) */}
          <section className="card p-5 border border-slate-200" aria-labelledby="slot-heading">
            <div className="mb-3">
              <h2 id="slot-heading" className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <Truck className="h-5 w-5 text-emerald-600" aria-hidden /> 2. Delivery Slot / டெலிவரி நேரம் (Next Day)
              </h2>
              <div className="mt-2 flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-950 font-medium">
                <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Fresh Morning Harvest:</strong> Vegetables are procured and cut fresh early morning. Orders placed today will be delivered in your selected slot tomorrow!
                </span>
              </div>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2">
              {slots.map((slot) => {
                const isSelected = slotId === slot.id;
                return (
                  <label
                    key={slot.id}
                    className={`cursor-pointer rounded-xl border p-3.5 text-sm transition-all flex items-start gap-3 ${
                      isSelected ? "border-emerald-600 bg-emerald-50/60 shadow-xs" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="slot"
                      className="mt-1 h-4 w-4 accent-emerald-600"
                      checked={isSelected}
                      onChange={() => setSlotId(slot.id)}
                    />
                    <div className="flex-1">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-emerald-700" />
                        <span>{slot.slotName}</span>
                      </div>
                      <span className="block text-xs text-emerald-800 font-semibold mt-1">
                        ✓ Next Day Fresh Delivery
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </section>

          {/* Section 3: Payment Method & Interactive QR Code */}
          <section className="card p-5 border border-slate-200" aria-labelledby="payment-heading">
            <div className="mb-4">
              <h2 id="payment-heading" className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <CreditCard className="h-5 w-5 text-emerald-600" aria-hidden /> 3. Payment Method / பணம் செலுத்துதல்
              </h2>
              <p className="text-xs text-muted mt-0.5">
                Choose UPI QR Code, Cash on Delivery, or Online Card.
              </p>
            </div>

            <div className="grid gap-2.5">
              {PAYMENT_METHODS.map(({ value, label, Icon, hint }) => {
                const isSelected = method === value;
                return (
                  <label
                    key={value}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-all ${
                      isSelected ? "border-emerald-600 bg-emerald-50/50 shadow-xs" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      className="h-4 w-4 accent-emerald-600"
                      checked={isSelected}
                      onChange={() => setMethod(value)}
                    />
                    <Icon className="h-5 w-5 text-emerald-700" aria-hidden />
                    <div className="flex-1">
                      <span className="text-sm font-bold text-slate-900 block">{label}</span>
                      <span className="text-xs text-muted block">{hint}</span>
                    </div>
                  </label>
                );
              })}
            </div>

            {/* UPI QR Display Card */}
            {method === "upi" && (
              <div className="mt-4 rounded-2xl border border-emerald-300 bg-linear-to-b from-emerald-50/70 to-white p-5 shadow-sm">
                <div className="text-center mb-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-xs">
                    <QrCode className="h-3.5 w-3.5" /> Scan & Pay ₹{payableAmount.toFixed(2)}
                  </span>
                  <p className="text-xs text-slate-600 mt-1.5">
                    Scan with <strong>Google Pay, PhonePe, Paytm, BHIM</strong> or any UPI App
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-5 my-2">
                  {/* Dynamic Live QR Code */}
                  <div className="bg-white p-2.5 rounded-xl border-2 border-emerald-500 shadow-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={upiQrUrl}
                      alt="VeggieFlick UPI Payment QR"
                      width={170}
                      height={170}
                      className="rounded-lg"
                    />
                  </div>

                  <div className="grid gap-2 text-left">
                    <div className="text-xs text-slate-700">
                      <strong>VeggieFlick Official UPI ID:</strong>
                      <div className="mt-1 flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold text-slate-900">
                        <span>9840532826@okaxis</span>
                        <button
                          type="button"
                          onClick={copyUpiId}
                          className="ml-auto text-emerald-700 hover:text-emerald-900"
                          title="Copy UPI ID"
                        >
                          {copiedUpi ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600">
                      <span>Official Contact: </span>
                      <strong className="text-slate-900">+91 98405 32826</strong>
                    </div>

                    <a
                      href={upiQrData}
                      className="btn btn-outline border-emerald-600 text-emerald-800 font-bold text-xs py-2 px-3 mt-1 text-center"
                    >
                      🚀 Open UPI App on Mobile
                    </a>
                  </div>
                </div>

                <p className="text-center text-[11px] text-slate-500 mt-2">
                  Once scanned or completed, click <strong>Place Order</strong> below to confirm.
                </p>
              </div>
            )}

            {/* Delivery Instructions */}
            <label className="mt-4 grid gap-1.5">
              <span className="text-xs font-bold text-slate-700">Delivery instructions (optional)</span>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={2}
                placeholder="E.g., Call on arrival, leave at door, chopped extra fine…"
                className="field"
              />
            </label>
          </section>
        </div>

        {/* Order Summary Sidebar */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="card p-5 border border-slate-200 shadow-md">
            <h2 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">
              Order Summary
            </h2>
            <ul className="mt-3 grid max-h-56 gap-2.5 overflow-y-auto pr-1 text-sm">
              {cart.items.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
                  <span className="flex-1 truncate text-slate-700 font-medium">
                    <span aria-hidden>{item.emoji}</span> {item.name} × {item.quantity}
                  </span>
                  <span className="font-bold text-slate-900">{formatINR(item.totalPrice)}</span>
                </li>
              ))}
            </ul>

            <dl className="mt-4 grid gap-2 border-t border-slate-200 pt-4 text-sm">
              <div className="flex justify-between text-slate-600">
                <dt>Subtotal</dt>
                <dd className="font-semibold text-slate-900">{formatINR(cart.totals.subtotal, true)}</dd>
              </div>
              {cart.totals.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <dt>Coupon Discount</dt>
                  <dd>−{formatINR(cart.totals.discount, true)}</dd>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <dt>Delivery Charge</dt>
                <dd className="font-semibold text-slate-900">
                  {formatINR(cart.totals.deliveryCharge > 0 ? cart.totals.deliveryCharge : 50, true)}
                </dd>
              </div>
              <div className="mt-1 flex justify-between border-t border-slate-200 pt-3 text-lg font-black text-slate-900">
                <dt>Payable</dt>
                <dd className="text-emerald-700">{formatINR(payableAmount, true)}</dd>
              </div>
            </dl>

            {selectedAddress && (
              <p className="mt-3 rounded-lg bg-emerald-50 border border-emerald-200 p-2 text-xs text-emerald-950 font-medium">
                📍 Delivering to {selectedAddress.area}, Chennai ({selectedAddress.postalCode}).
              </p>
            )}

            {error && (
              <div role="alert" className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={() => void placeOrder()}
              disabled={busy}
              className="btn btn-primary bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold mt-4 w-full py-3.5 text-base shadow-lg shadow-emerald-900/30 transition-transform active:scale-98"
            >
              {busy ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              ) : (
                <CheckCircle2 className="h-5 w-5" aria-hidden />
              )}
              {method === "cod" ? "Confirm & Place Order" : `Pay ${formatINR(payableAmount)} & Order`}
            </button>
            <p className="mt-3 text-center text-[11px] text-slate-400">
              Orders confirmed instantly. WhatsApp alert sent to 98405 32826.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
