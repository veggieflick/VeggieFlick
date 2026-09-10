"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Calendar, Clock, RefreshCw, CheckCircle2, Sparkles, Truck } from "lucide-react";
import { useApp } from "@/components/providers";
import { Breadcrumb, EmptyState } from "@/components/ui/primitives";

type SubscriptionItem = {
  id: string;
  frequency: string;
  deliverySlot: string;
  status: string;
  createdAt: string;
};

const SUGGESTED_SUBSCRIPTIONS = [
  { name: "Organic Farm Fresh Milk (A2 Cow Milk)", unit: "500 ml", frequency: "Daily 6:00 AM", price: "₹38", emoji: "🥛" },
  { name: "Daily Keerai Bundle (Spinach / Sirukeerai)", unit: "1 Bunch", frequency: "Mon / Wed / Fri", price: "₹25", emoji: "🥬" },
  { name: "Country Tomatoes (Desi Thakkali)", unit: "1 kg", frequency: "Every 3 Days", price: "₹34", emoji: "🍅" },
  { name: "Tender Coconut Water (Sevvaneer)", unit: "1 Piece", frequency: "Daily Morning", price: "₹50", emoji: "🥥" },
];

export default function SubscriptionsPage() {
  const router = useRouter();
  const { user, userLoading, notify } = useApp();
  const [subs, setSubs] = useState<SubscriptionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userLoading && !user) router.replace("/login?redirect=/subscriptions");
  }, [user, userLoading, router]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/v1/subscriptions")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setSubs(json.data.subscriptions as SubscriptionItem[]);
      })
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="container-page py-6 md:py-10">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Subscriptions" }]} />

      <div className="mb-8">
        <span className="chip bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold mb-2 inline-flex items-center gap-1">
          <Sparkles size={12} /> Daily & Weekly Fresh Subscriptions
        </span>
        <h1 className="text-balance text-3xl font-bold tracking-[-0.02em] md:text-4xl">
          Auto-Deliveries to Your Doorstep
        </h1>
        <p className="mt-2 text-slate-600 max-w-2xl text-sm">
          Never run out of morning milk, fresh keerai, or daily thakkali. Flexible auto-debit from your VeggieFlick Wallet. Pause or cancel anytime!
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        <div>
          <h2 className="text-lg font-bold text-ink mb-4 flex items-center gap-2">
            <RefreshCw size={18} className="text-brand-700" /> Active Subscriptions
          </h2>

          {loading ? (
            <div className="card p-8 text-center text-xs text-muted">Loading your subscriptions…</div>
          ) : subs.length === 0 ? (
            <EmptyState
              title="No active subscriptions yet"
              description="Subscribe to essential produce below for hassle-free morning deliveries!"
            />
          ) : (
            <div className="grid gap-3">
              {subs.map((s) => (
                <div key={s.id} className="card p-4 flex items-center justify-between border-emerald-100 bg-emerald-50/40">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      <Truck size={18} />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-ink capitalize">{s.frequency} Produce Delivery</p>
                      <p className="text-xs text-muted flex items-center gap-1.5 mt-0.5">
                        <Clock size={12} /> Slot: {s.deliverySlot}
                      </p>
                    </div>
                  </div>
                  <span className="chip bg-emerald-600 text-white font-bold text-[11px]">ACTIVE</span>
                </div>
              ))}
            </div>
          )}

          <h2 className="text-lg font-bold text-ink mt-8 mb-4">Popular Daily Staples</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {SUGGESTED_SUBSCRIPTIONS.map((item) => (
              <div key={item.name} className="card p-4 flex flex-col justify-between border-slate-200 hover:border-emerald-300">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{item.emoji}</span>
                  <div>
                    <h3 className="text-sm font-bold text-ink">{item.name}</h3>
                    <p className="text-xs text-muted">{item.unit} · {item.price}</p>
                    <span className="chip bg-sky-100 text-sky-900 border border-sky-200 mt-2 inline-block font-semibold">
                      <Calendar size={11} className="inline mr-1" /> {item.frequency}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => notify(`Subscribed to ${item.name} (${item.frequency})!`)}
                  className="btn btn-primary btn-sm mt-4 font-bold text-xs shadow-sm"
                >
                  Subscribe Now
                </button>
              </div>
            ))}
          </div>
        </div>

        <aside>
          <div className="card p-5 bg-gradient-to-br from-emerald-50 via-white to-sky-50 border-emerald-200">
            <h3 className="text-base font-bold text-emerald-950 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-700" /> Subscription Benefits
            </h3>
            <ul className="mt-4 grid gap-3 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <strong>Zero Delivery Fee</strong> on all recurring subscription orders.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <strong>4 AM Priority Farm Harvest</strong> reserved specifically for you.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <strong>One-Tap Pause</strong> when traveling out of Chennai.
              </li>
            </ul>
            <Link href="/shop" className="btn btn-outline w-full mt-6 text-xs font-bold">
              Explore All Produce
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
