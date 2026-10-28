import type { Metadata } from "next";
import Link from "next/link";
import { Tag, Sparkles, Percent, Gift, ArrowRight, CheckCircle2, ShieldCheck, Clock, Bike, Leaf } from "lucide-react";
import { Breadcrumb } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Special Offers & Coupons — VeggieFlick Chennai",
  description: "Save on fresh cut vegetables, recipe meal kits, pre-cut fruit bowls and healthy sprouts across KK Nagar and Chennai.",
  alternates: { canonical: "/offers" },
};

const OFFERS = [
  {
    code: "FRESH10",
    discount: "10% FLAT OFF",
    title: "Welcome To VeggieFlick",
    desc: "Get 10% instant discount on your first order of farm-fresh cut vegetables and salads.",
    minOrder: "₹199",
    validity: "Valid for new customers",
    badge: "WELCOME DEAL",
    color: "from-emerald-700 to-teal-800",
  },
  {
    code: "COMBO20",
    discount: "₹50 INSTANT OFF",
    title: "Recipe Meal Combo Offer",
    desc: "Save ₹50 on any 2 or more Vegetable Rice & Aviyal Combo kits (Biriyani, Aviyal, Pulav, Bisibele).",
    minOrder: "₹299",
    validity: "Valid on all Combo Kits",
    badge: "POPULAR",
    color: "from-amber-600 to-orange-700",
  },
  {
    code: "SPROUTS15",
    discount: "15% OFF SPROUTS",
    title: "Healthy Germinated Sprouts Deal",
    desc: "Special discount on all 1-Day Pre-Order Sprouts & Sprouts Combo Bowls.",
    minOrder: "₹149",
    validity: "Valid on Sprouts & Sprouts Combos",
    badge: "HEALTH SAVER",
    color: "from-teal-700 to-green-800",
  },
  {
    code: "VEGGIE50",
    discount: "₹50 CASHBACK",
    title: "Weekend Family Basket",
    desc: "Flat ₹50 off on weekly family produce baskets containing cut veggies and fruits above ₹499.",
    minOrder: "₹499",
    validity: "Valid across all items",
    badge: "WEEKEND SPECIAL",
    color: "from-blue-700 to-indigo-800",
  },
];

const PERKS = [
  {
    icon: Leaf,
    title: "Zero Waste Cooking",
    desc: "Save 20-30 minutes of prep every morning with 100% usable washed and cut produce.",
  },
  {
    icon: Bike,
    title: "Distance-Based Delivery",
    desc: "Fair per-order delivery charges (₹30 to ₹100) across a 25 km radius around KK Nagar.",
  },
  {
    icon: Gift,
    title: "Surprise Scratch Card",
    desc: "Win discount coupons or cashback on every completed order with our digital scratch card.",
  },
  {
    icon: Clock,
    title: "Convenient Delivery Slots",
    desc: "Early morning 6:00 AM slots and evening slots tailored to your cooking schedule.",
  },
];

export default function OffersPage() {
  return (
    <div className="container-page py-6 md:py-10">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Offers & Coupons" },
        ]}
      />

      {/* Header */}
      <div className="mb-8">
        <span className="chip bg-emerald-100 text-emerald-900 border border-emerald-300 font-extrabold text-xs inline-flex items-center gap-1.5 shadow-xs mb-2">
          <Sparkles size={13} className="text-emerald-700" />
          ACTIVE PROMOTIONS & DEALS
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl text-ink">
          VeggieFlick Offers & Coupons
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Apply any of these coupon codes at checkout or enjoy automatic volume discounts on our fresh cut vegetables, combo packs, and salads.
        </p>
      </div>

      {/* Coupon Grid */}
      <div className="grid gap-5 md:grid-cols-2 mb-12">
        {OFFERS.map((offer) => (
          <div
            key={offer.code}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between relative overflow-hidden"
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="chip bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-[10px] tracking-wider uppercase">
                  {offer.badge}
                </span>
                <span className="text-xs font-bold text-slate-500">Min Order: {offer.minOrder}</span>
              </div>

              <h2 className="text-xl font-black text-ink tracking-tight">{offer.title}</h2>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">{offer.desc}</p>
            </div>

            <div className="mt-5 pt-4 border-t border-dashed border-slate-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="rounded-xl border-2 border-dashed border-emerald-700 bg-emerald-50 px-3.5 py-1.5 font-mono font-black text-sm text-emerald-900 tracking-wider">
                  {offer.code}
                </span>
                <span className="text-[11px] font-bold text-slate-500 hidden sm:inline">
                  {offer.validity}
                </span>
              </div>

              <Link
                href="/shop"
                className="btn btn-primary btn-sm bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-xs px-4 rounded-xl shadow-xs inline-flex items-center gap-1.5"
              >
                <span>Shop Now</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Why Shop With Us Perks */}
      <div className="rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/50 via-teal-50/30 to-amber-50/40 p-6 md:p-8">
        <h2 className="text-xl font-extrabold text-ink tracking-tight mb-5 flex items-center gap-2">
          <Tag className="text-emerald-700" size={20} />
          More Ways To Save Every Day
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PERKS.map((perk) => (
            <div key={perk.title} className="rounded-2xl bg-white p-4.5 border border-slate-200/90 shadow-xs">
              <perk.icon className="text-emerald-700 mb-2.5" size={24} />
              <h3 className="text-sm font-bold text-ink">{perk.title}</h3>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">{perk.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
