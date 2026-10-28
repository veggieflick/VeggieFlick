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
  Navigation,
  QrCode,
  Copy,
  Check,
  Calendar,
  Sparkles,
  ShieldCheck,
  Smartphone,
  Building2,
  Lock,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { useApp } from "@/components/providers";
import { formatINR } from "@/lib/utils";
import { Breadcrumb, EmptyState } from "@/components/ui/primitives";

/* ------------------------------------------------------------------ */
/* Payment Brand Icons (SVG)                                          */
/* ------------------------------------------------------------------ */

function GooglePayIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

function PhonePeIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none">
      <rect width="100" height="100" rx="22" fill="#5f259f" />
      <path
        d="M68.5 35.5C68.5 27.5 62 21 54 21H32C30.3 21 29 22.3 29 24V40C29 41.7 30.3 43 32 43H43.5V75C43.5 77.2 45.3 79 47.5 79H54C55.7 79 57 77.7 57 76V51H61.2L70.5 76.5C71.2 78.4 73 79.5 75 79.5H80.5C82.8 79.5 84.3 77.2 83.3 75.1L74.8 52C79.8 48.5 83 42.6 83 36C83 35.8 83 35.7 83 35.5H68.5ZM54 43H43.5V29H54C57.6 29 60.5 31.9 60.5 35.5C60.5 39.1 57.6 42 54 42V43Z"
        fill="#ffffff"
      />
    </svg>
  );
}

function PaytmIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 40" fill="none">
      <rect width="120" height="40" rx="8" fill="#002970" />
      <text x="14" y="27" fontFamily="sans-serif" fontWeight="900" fontSize="22" fill="#ffffff" letterSpacing="0.5">
        Pay
      </text>
      <text x="60" y="27" fontFamily="sans-serif" fontWeight="900" fontSize="22" fill="#00BAF2" letterSpacing="0.5">
        tm
      </text>
    </svg>
  );
}

function BhimUpiIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 84 32" fill="none">
      <path d="M12 4L4 28H16L24 4H12Z" fill="#097939" />
      <path d="M22 4L14 28H26L34 4H22Z" fill="#ED7524" />
      <text x="36" y="23" fontFamily="sans-serif" fontWeight="900" fontSize="18" fill="#097939">
        UPI
      </text>
    </svg>
  );
}

function VisaIcon({ className = "h-5 w-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 32" fill="none">
      <rect width="48" height="32" rx="4" fill="#0d2b85" />
      <text x="8" y="22" fontFamily="sans-serif" fontWeight="900" fontStyle="italic" fontSize="16" fill="#ffffff">
        VISA
      </text>
    </svg>
  );
}

function MastercardIcon({ className = "h-5 w-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 32" fill="none">
      <rect width="48" height="32" rx="4" fill="#1e293b" />
      <circle cx="20" cy="16" r="10" fill="#EB001B" />
      <circle cx="28" cy="16" r="10" fill="#F79E1B" fillOpacity="0.85" />
    </svg>
  );
}

function RuPayIcon({ className = "h-5 w-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 52 32" fill="none">
      <rect width="52" height="32" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
      <path d="M8 8L16 24H11L3 8H8Z" fill="#005B9F" />
      <path d="M15 8L23 24H18L10 8H15Z" fill="#F15A24" />
      <text x="23" y="21" fontFamily="sans-serif" fontWeight="900" fontSize="11" fill="#005B9F">
        RuPay
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Types & Options                                                    */
/* ------------------------------------------------------------------ */

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

const POPULAR_BANKS = [
  { id: "HDFC", name: "HDFC Bank", code: "HDFC" },
  { id: "SBIN", name: "State Bank of India", code: "SBIN" },
  { id: "ICIC", name: "ICICI Bank", code: "ICIC" },
  { id: "UTIB", name: "Axis Bank", code: "UTIB" },
  { id: "KKBK", name: "Kotak Mahindra", code: "KKBK" },
  { id: "PUNB", name: "Punjab National Bank", code: "PUNB" },
];

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

  // Dedicated Payment State
  const [paymentMode, setPaymentMode] = useState<"razorpay" | "cod">("razorpay");
  const [razorpaySubMethod, setRazorpaySubMethod] = useState<"upi" | "card" | "qr" | "netbanking">("upi");
  const [selectedUpiApp, setSelectedUpiApp] = useState<"gpay" | "phonepe" | "paytm" | "any">("gpay");
  const [selectedBank, setSelectedBank] = useState<string>("HDFC");

  // Credit / Debit Card Interactive Form
  const [cardForm, setCardForm] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  });

  const [notes, setNotes] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [locating, setLocating] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [idempotencyKey] = useState(() => `vf-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`);

  const payableAmount = useMemo(() => {
    return cart.totals.grandTotal > 0 ? cart.totals.grandTotal : cart.totals.subtotal + 30;
  }, [cart.totals.grandTotal, cart.totals.subtotal]);

  // Deep Link URI for mobile UPI apps
  const upiDeepLink = useMemo(() => {
    return `upi://pay?pa=9840532826@okaxis&pn=VeggieFlick&am=${payableAmount.toFixed(2)}&cu=INR&tn=VeggieFlick-Order`;
  }, [payableAmount]);

  const upiQrUrl = useMemo(() => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiDeepLink)}`;
  }, [upiDeepLink]);

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
        setShowForm(true);
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

  // Card Format Helpers
  function handleCardNumberChange(val: string) {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    const formatted = digits.replace(/(\d{4})(?=\d)/g, "$1 ");
    setCardForm((prev) => ({ ...prev, number: formatted }));
  }

  function handleCardExpiryChange(val: string) {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    let formatted = digits;
    if (digits.length >= 3) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    setCardForm((prev) => ({ ...prev, expiry: formatted }));
  }

  function handleCardCvvChange(val: string) {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    setCardForm((prev) => ({ ...prev, cvv: digits }));
  }

  const detectedCardBrand = useMemo(() => {
    const clean = cardForm.number.replace(/\D/g, "");
    if (/^4/.test(clean)) return "visa";
    if (/^(5[1-5]|2[2-7])/.test(clean)) return "mastercard";
    if (/^(60|65|81|82|508)/.test(clean)) return "rupay";
    return "generic";
  }, [cardForm.number]);

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
          notify("Location detected! Please enter Flat/Door number.");
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

    // Determine final payment method for backend
    let activeMethod: "cod" | "upi" | "card" | "netbanking" = "upi";
    if (paymentMode === "cod") {
      activeMethod = "cod";
    } else if (razorpaySubMethod === "card") {
      activeMethod = "card";
    } else if (razorpaySubMethod === "netbanking") {
      activeMethod = "netbanking";
    } else {
      activeMethod = "upi";
    }

    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/v1/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addressId: activeAddressId || "addr-demo",
          deliverySlotId: activeSlotId,
          paymentMethod: activeMethod,
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

      // COD Flow
      if (activeMethod === "cod") {
        await refreshCart();
        notify(`Order ${json.data.orderNumber} placed successfully with Cash on Delivery!`);
        router.push(`/orders/${json.data.orderId}?placed=1`);
        return;
      }

      // Prepaid Razorpay Flow (UPI / Card / Netbanking / QR)
      const payRes = await fetch("/api/v1/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: json.data.orderId }),
      });
      const payJson = await payRes.json();

      if (payJson?.success && payJson.data?.keyId) {
        const loaded = await loadRazorpayScript();
        if (!loaded) {
          setBusy(false);
          setError("Could not load Razorpay payment gateway. Please check your internet connection.");
          return;
        }

        const options = {
          key: payJson.data.keyId,
          amount: payJson.data.amount,
          currency: payJson.data.currency || "INR",
          name: "VeggieFlick",
          description: `Order #${json.data.orderNumber} — Fresh Cut Veggies`,
          order_id: payJson.data.razorpayOrderId,
          prefill: {
            name: cardForm.name || form.contactName || user?.fullName || "Customer",
            contact: form.contactPhone || user?.phone || "9840532826",
            email: user?.email || "customer@veggieflick.in",
            method: activeMethod,
          },
          notes: {
            orderId: json.data.orderId,
            hub: "K.K. Nagar Central Hub",
            selectedSubMethod: razorpaySubMethod,
            selectedUpiApp: razorpaySubMethod === "upi" ? selectedUpiApp : undefined,
          },
          theme: {
            color: "#059669",
          },
          handler: async function (paymentResponse: any) {
            try {
              setBusy(true);
              const verifyRes = await fetch("/api/v1/payments", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  orderId: json.data.orderId,
                  razorpayOrderId: paymentResponse.razorpay_order_id,
                  razorpayPaymentId: paymentResponse.razorpay_payment_id,
                  razorpaySignature: paymentResponse.razorpay_signature,
                }),
              });
              const verifyJson = await verifyRes.json();
              if (verifyJson?.success) {
                await refreshCart();
                notify(`Payment received (${paymentResponse.razorpay_payment_id})! Order confirmed.`);
                router.push(`/orders/${json.data.orderId}?placed=1`);
              } else {
                setBusy(false);
                setError(verifyJson?.error?.message || "Payment signature verification failed. Please contact support.");
              }
            } catch (err: any) {
              setBusy(false);
              setError("Payment verification error: " + (err?.message || "Please check order details."));
            }
          },
          modal: {
            ondismiss: function () {
              setBusy(false);
              notify("Payment window closed. Order created — you can complete payment from your orders page.");
              router.push(`/orders/${json.data.orderId}`);
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on("payment.failed", function (failResponse: any) {
          setBusy(false);
          setError(failResponse.error?.description || "Payment failed. Please try a different payment method.");
        });
        rzp.open();
        return;
      }

      // Fallback if Razorpay API keys are not yet configured in admin panel
      await refreshCart();
      notify(`Order ${json.data.orderNumber} placed successfully!`);
      router.push(`/orders/${json.data.orderId}?placed=1`);
    } catch (err: any) {
      setBusy(false);
      setError(err?.message ?? "Network error placing order. Please try again.");
    }
  }

  // Get dynamic button label based on payment method chosen
  function getCtaButtonText() {
    if (busy) return "Processing Order…";
    if (paymentMode === "cod") return `Place Order (Cash on Delivery) • ${formatINR(payableAmount)}`;
    if (razorpaySubMethod === "upi") {
      if (selectedUpiApp === "gpay") return `Pay ${formatINR(payableAmount)} via Google Pay (Razorpay)`;
      if (selectedUpiApp === "phonepe") return `Pay ${formatINR(payableAmount)} via PhonePe (Razorpay)`;
      if (selectedUpiApp === "paytm") return `Pay ${formatINR(payableAmount)} via Paytm (Razorpay)`;
      return `Pay ${formatINR(payableAmount)} via UPI (Razorpay)`;
    }
    if (razorpaySubMethod === "card") {
      return `Pay ${formatINR(payableAmount)} via Card (Razorpay)`;
    }
    if (razorpaySubMethod === "qr") {
      return `Confirm & Pay ${formatINR(payableAmount)} with QR (Razorpay)`;
    }
    if (razorpaySubMethod === "netbanking") {
      return `Pay ${formatINR(payableAmount)} via Net Banking (Razorpay)`;
    }
    return `Pay ${formatINR(payableAmount)} with Razorpay`;
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
                      <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">
                        <Check size={12} strokeWidth={2.5} /> Serviceable from KK Nagar Hub
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
                    <span>Use Live GPS Location</span>
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
                      <span className="flex items-center gap-1 text-xs text-emerald-800 font-semibold mt-1">
                        <Check size={12} strokeWidth={2.5} /> Next Day Fresh Delivery
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </section>

          {/* Section 3: Dedicated Razorpay & COD Payment Architecture */}
          <section className="card p-5 border border-slate-200 shadow-sm" aria-labelledby="payment-heading">
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <h2 id="payment-heading" className="flex items-center gap-2 text-lg font-bold text-slate-900">
                  <CreditCard className="h-5 w-5 text-emerald-600" aria-hidden /> 3. Payment Method / பணம் செலுத்துதல்
                </h2>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>256-Bit Encrypted</span>
                </div>
              </div>
              <p className="text-xs text-muted mt-0.5">
                Razorpay நேரடி ஆன்லைன் கட்டணம்: UPI (Google Pay, PhonePe, Paytm), Debit/Credit Cards & Net Banking.
              </p>
            </div>

            {/* Primary Payment Selector (Razorpay 100% Verified) */}
            <div className="mb-5">
              <div className="rounded-2xl border-2 border-emerald-600 bg-emerald-50/40 p-4 shadow-sm ring-2 ring-emerald-500/20">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-600 animate-pulse" />
                    <span className="font-extrabold text-slate-900 text-sm">
                      Razorpay Verified Payment Gateway (Live Mode)
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[10px] tracking-wide uppercase">
                    100% Secure
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Razorpay அதிகாரப்பூர்வ நேரடி கட்டணம்: UPI, Google Pay, PhonePe, Cards, Net Banking & QR Code.
                </p>
                {/* Brand Logos preview */}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center bg-white border border-slate-200 rounded px-1.5 py-0.5 shadow-2xs">
                    <GooglePayIcon className="h-4 w-4 mr-1" />
                    <span className="text-[10px] font-bold text-slate-700">GPay</span>
                  </span>
                  <span className="inline-flex items-center bg-white border border-slate-200 rounded px-1.5 py-0.5 shadow-2xs">
                    <PhonePeIcon className="h-3.5 w-3.5 mr-1" />
                    <span className="text-[10px] font-bold text-slate-700">PhonePe</span>
                  </span>
                  <span className="inline-flex items-center bg-white border border-slate-200 rounded px-1.5 py-0.5 shadow-2xs">
                    <PaytmIcon className="h-3.5 w-10 mr-1" />
                  </span>
                  <span className="inline-flex items-center bg-white border border-slate-200 rounded px-1.5 py-0.5 shadow-2xs">
                    <VisaIcon className="h-3 w-6" />
                  </span>
                  <span className="inline-flex items-center bg-white border border-slate-200 rounded px-1.5 py-0.5 shadow-2xs">
                    <MastercardIcon className="h-3 w-6" />
                  </span>
                  <span className="inline-flex items-center bg-white border border-slate-200 rounded px-1.5 py-0.5 shadow-2xs">
                    <RuPayIcon className="h-3.5 w-8" />
                  </span>
                </div>
              </div>
            </div>

            {/* Sub-Methods Architecture when Razorpay is active */}
            {paymentMode === "razorpay" && (
              <div className="rounded-2xl border-2 border-emerald-500/30 bg-white p-4 shadow-sm animate-in fade-in duration-200">
                <div className="mb-3 flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Select Razorpay Payment Channel
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    Amount: {formatINR(payableAmount, true)}
                  </span>
                </div>

                {/* Sub-Tabs / Pills: UPI, Card, QR Code, Net Banking */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setRazorpaySubMethod("upi")}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-xs transition-all ${
                      razorpaySubMethod === "upi"
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-700/20"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <Smartphone className="h-4 w-4" />
                    <span>UPI & Apps</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRazorpaySubMethod("card")}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-xs transition-all ${
                      razorpaySubMethod === "card"
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-700/20"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <CreditCard className="h-4 w-4" />
                    <span>Debit / Credit Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRazorpaySubMethod("qr")}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-xs transition-all ${
                      razorpaySubMethod === "qr"
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-700/20"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <QrCode className="h-4 w-4" />
                    <span>Scan UPI QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRazorpaySubMethod("netbanking")}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-xs transition-all ${
                      razorpaySubMethod === "netbanking"
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-700/20"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <Building2 className="h-4 w-4" />
                    <span>Net Banking</span>
                  </button>
                </div>

                {/* TAB 1: UPI & Instant Apps (Google Pay, PhonePe, Paytm, BHIM) */}
                {razorpaySubMethod === "upi" && (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-600 font-medium">
                      Select your preferred UPI app below to pay directly or connect via Razorpay:
                    </p>

                    <div className="grid gap-2.5 sm:grid-cols-2">
                      {/* Google Pay */}
                      <div
                        onClick={() => setSelectedUpiApp("gpay")}
                        className={`cursor-pointer rounded-xl border-2 p-3.5 flex items-center justify-between transition-all ${
                          selectedUpiApp === "gpay"
                            ? "border-emerald-600 bg-emerald-50/50 shadow-sm"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded-lg bg-white shadow-xs border border-slate-200">
                            <GooglePayIcon className="h-7 w-7" />
                          </div>
                          <div>
                            <span className="font-extrabold text-sm text-slate-900 block">Google Pay (GPay)</span>
                            <span className="text-[11px] text-slate-500 block">Instant pay via Google Pay</span>
                          </div>
                        </div>
                        {selectedUpiApp === "gpay" && (
                          <span className="h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                            <Check size={12} strokeWidth={3} />
                          </span>
                        )}
                      </div>

                      {/* PhonePe */}
                      <div
                        onClick={() => setSelectedUpiApp("phonepe")}
                        className={`cursor-pointer rounded-xl border-2 p-3.5 flex items-center justify-between transition-all ${
                          selectedUpiApp === "phonepe"
                            ? "border-emerald-600 bg-emerald-50/50 shadow-sm"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-1 rounded-lg bg-white shadow-xs border border-slate-200">
                            <PhonePeIcon className="h-8 w-8" />
                          </div>
                          <div>
                            <span className="font-extrabold text-sm text-slate-900 block">PhonePe</span>
                            <span className="text-[11px] text-slate-500 block">Direct UPI Intent</span>
                          </div>
                        </div>
                        {selectedUpiApp === "phonepe" && (
                          <span className="h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                            <Check size={12} strokeWidth={3} />
                          </span>
                        )}
                      </div>

                      {/* Paytm */}
                      <div
                        onClick={() => setSelectedUpiApp("paytm")}
                        className={`cursor-pointer rounded-xl border-2 p-3.5 flex items-center justify-between transition-all ${
                          selectedUpiApp === "paytm"
                            ? "border-emerald-600 bg-emerald-50/50 shadow-sm"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-1 rounded-lg bg-white shadow-xs border border-slate-200">
                            <PaytmIcon className="h-6 w-14" />
                          </div>
                          <div>
                            <span className="font-extrabold text-sm text-slate-900 block">Paytm UPI</span>
                            <span className="text-[11px] text-slate-500 block">Paytm Wallet & UPI</span>
                          </div>
                        </div>
                        {selectedUpiApp === "paytm" && (
                          <span className="h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                            <Check size={12} strokeWidth={3} />
                          </span>
                        )}
                      </div>

                      {/* Other UPI / BHIM */}
                      <div
                        onClick={() => setSelectedUpiApp("any")}
                        className={`cursor-pointer rounded-xl border-2 p-3.5 flex items-center justify-between transition-all ${
                          selectedUpiApp === "any"
                            ? "border-emerald-600 bg-emerald-50/50 shadow-sm"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-1 rounded-lg bg-white shadow-xs border border-slate-200">
                            <BhimUpiIcon className="h-6 w-14" />
                          </div>
                          <div>
                            <span className="font-extrabold text-sm text-slate-900 block">BHIM / Any UPI</span>
                            <span className="text-[11px] text-slate-500 block">CRED, Amazon Pay, etc.</span>
                          </div>
                        </div>
                        {selectedUpiApp === "any" && (
                          <span className="h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                            <Check size={12} strokeWidth={3} />
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Direct Mobile Launch Action Pathway */}
                    <div className="rounded-xl border border-emerald-300 bg-emerald-50/50 p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                            <Sparkles className="h-4 w-4 text-emerald-600" />
                            Direct {selectedUpiApp === "gpay" ? "Google Pay" : selectedUpiApp === "phonepe" ? "PhonePe" : selectedUpiApp === "paytm" ? "Paytm" : "UPI"} Mobile Intent
                          </span>
                          <p className="text-[11px] text-slate-600 mt-0.5">
                            Clicking the button below on mobile opens your app with <strong>₹{payableAmount.toFixed(2)}</strong> prefilled automatically.
                          </p>
                        </div>

                        <a
                          href={upiDeepLink}
                          className="btn btn-primary bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2.5 inline-flex items-center justify-center gap-1.5 shrink-0 shadow-sm"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span>Open {selectedUpiApp === "gpay" ? "Google Pay" : selectedUpiApp === "phonepe" ? "PhonePe" : "UPI App"}</span>
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: Credit / Debit Card Interactive Form */}
                {razorpaySubMethod === "card" && (
                  <div className="space-y-4">
                    {/* Live Virtual Card Preview */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-tr from-slate-900 via-slate-800 to-emerald-900 p-5 text-white shadow-xl max-w-md mx-auto">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold tracking-widest text-emerald-400">
                          <Lock className="h-3.5 w-3.5" />
                          <span>VEGGIEFLICK SECURE</span>
                        </div>
                        <div>
                          {detectedCardBrand === "visa" && <VisaIcon className="h-6 w-10" />}
                          {detectedCardBrand === "mastercard" && <MastercardIcon className="h-6 w-10" />}
                          {detectedCardBrand === "rupay" && <RuPayIcon className="h-6 w-10" />}
                          {detectedCardBrand === "generic" && <CreditCard className="h-6 w-8 text-slate-400" />}
                        </div>
                      </div>

                      {/* EMV Chip */}
                      <div className="my-3 h-7 w-9 rounded-md bg-amber-300/80 border border-amber-200/50 shadow-inner flex items-center justify-center">
                        <div className="h-4 w-6 border border-amber-600/40 rounded-sm" />
                      </div>

                      {/* Card Number */}
                      <div className="font-mono text-lg tracking-wider text-slate-100 font-bold">
                        {cardForm.number || "•••• •••• •••• ••••"}
                      </div>

                      <div className="mt-4 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-semibold">
                            Card Holder
                          </span>
                          <span className="font-semibold text-slate-200 uppercase truncate max-w-[160px] block">
                            {cardForm.name || "CUSTOMER NAME"}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-semibold">
                            Expires
                          </span>
                          <span className="font-mono font-semibold text-slate-200">
                            {cardForm.expiry || "MM/YY"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Input Form */}
                    <div className="grid gap-3 sm:grid-cols-2 pt-2">
                      <label className="grid gap-1 sm:col-span-2">
                        <span className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                          <span>Card Number (கார்டு எண்) *</span>
                          <span className="text-[10px] text-slate-400">16 digits</span>
                        </span>
                        <div className="relative">
                          <input
                            type="text"
                            maxLength={19}
                            value={cardForm.number}
                            onChange={(e) => handleCardNumberChange(e.target.value)}
                            placeholder="4532 1234 5678 9012"
                            className="field bg-white font-mono pr-12 text-sm"
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {detectedCardBrand === "visa" && <VisaIcon className="h-4 w-7" />}
                            {detectedCardBrand === "mastercard" && <MastercardIcon className="h-4 w-7" />}
                            {detectedCardBrand === "rupay" && <RuPayIcon className="h-4 w-7" />}
                            {detectedCardBrand === "generic" && <CreditCard className="h-4 w-4 text-slate-400" />}
                          </div>
                        </div>
                      </label>

                      <label className="grid gap-1 sm:col-span-2">
                        <span className="text-xs font-semibold text-slate-700">Cardholder Name (கார்டு வைத்திருப்பவர் பெயர்) *</span>
                        <input
                          type="text"
                          value={cardForm.name}
                          onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
                          placeholder="SURJITH THANGAVEL"
                          className="field bg-white uppercase text-sm"
                        />
                      </label>

                      <label className="grid gap-1">
                        <span className="text-xs font-semibold text-slate-700">Expiry (MM/YY) *</span>
                        <input
                          type="text"
                          maxLength={5}
                          value={cardForm.expiry}
                          onChange={(e) => handleCardExpiryChange(e.target.value)}
                          placeholder="12/28"
                          className="field bg-white font-mono text-sm"
                        />
                      </label>

                      <label className="grid gap-1">
                        <span className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                          <span>CVV / CVC *</span>
                          <span className="text-[10px] text-slate-400">3 or 4 digits</span>
                        </span>
                        <input
                          type="password"
                          maxLength={4}
                          value={cardForm.cvv}
                          onChange={(e) => handleCardCvvChange(e.target.value)}
                          placeholder="•••"
                          className="field bg-white font-mono text-sm"
                        />
                      </label>
                    </div>

                    <div className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200 p-2.5 text-[11px] text-slate-600">
                      <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>
                        Card processed via Razorpay PCI-DSS Level 1 compliant gateway. You will enter your bank 3D-Secure OTP to authorize payment.
                      </span>
                    </div>
                  </div>
                )}

                {/* TAB 3: Scan UPI QR Code */}
                {razorpaySubMethod === "qr" && (
                  <div className="rounded-2xl border border-emerald-300 bg-linear-to-b from-emerald-50/70 to-white p-5 text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-xs">
                      <QrCode className="h-3.5 w-3.5" /> Scan & Pay {formatINR(payableAmount, true)}
                    </span>
                    <p className="text-xs text-slate-600 mt-1.5">
                      Scan using <strong>Google Pay, PhonePe, Paytm, BHIM</strong> or any banking app
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-5 my-4">
                      {/* Dynamic Live QR Code with exact Cart Amount */}
                      <div className="bg-white p-3 rounded-2xl border-2 border-emerald-500 shadow-md">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={upiQrUrl}
                          alt="VeggieFlick UPI Payment QR"
                          width={180}
                          height={180}
                          className="rounded-lg"
                        />
                        <span className="block text-[10px] font-bold text-slate-500 mt-1.5">
                          Amount: {formatINR(payableAmount, true)}
                        </span>
                      </div>

                      <div className="grid gap-2 text-left">
                        <div className="text-xs text-slate-700">
                          <strong>VeggieFlick Official UPI ID:</strong>
                          <div className="mt-1 flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold text-slate-900">
                            <span>9840532826@okaxis</span>
                            <button
                              type="button"
                              onClick={copyUpiId}
                              className="ml-auto text-emerald-700 hover:text-emerald-900 p-1"
                              title="Copy UPI ID"
                            >
                              {copiedUpi ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        <div className="text-xs text-slate-600">
                          <span>Merchant Name: </span>
                          <strong className="text-slate-900">VeggieFlick Chennai</strong>
                        </div>

                        <a
                          href={upiDeepLink}
                          className="btn btn-outline border-emerald-600 text-emerald-800 font-bold text-xs py-2 px-3 mt-1 text-center"
                        >
                          Open UPI App on Mobile
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: Net Banking */}
                {razorpaySubMethod === "netbanking" && (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-600 font-medium">
                      Select your bank from popular options or choose from list:
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {POPULAR_BANKS.map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => setSelectedBank(b.id)}
                          className={`p-3 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between ${
                            selectedBank === b.id
                              ? "border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs"
                              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                          }`}
                        >
                          <span>{b.name}</span>
                          {selectedBank === b.id && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
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
                    {item.name} × {item.quantity}
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
                Delivering to {selectedAddress.area}, Chennai ({selectedAddress.postalCode}).
              </p>
            )}

            {error && (
              <div role="alert" className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800">
                {error}
              </div>
            )}

            {/* Dynamic CTA Button */}
            <button
              type="button"
              onClick={() => void placeOrder()}
              disabled={busy}
              className="btn btn-primary bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold mt-4 w-full py-3.5 text-sm sm:text-base shadow-lg shadow-emerald-900/30 transition-transform active:scale-98 flex items-center justify-center gap-2"
            >
              {busy ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              ) : (
                <CheckCircle2 className="h-5 w-5" aria-hidden />
              )}
              <span>{getCtaButtonText()}</span>
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
