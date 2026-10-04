"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Gift, Minus, Plus, ShoppingBag, Tag, Trash2, X } from "lucide-react";
import { useApp } from "@/components/providers";
import { formatINR } from "@/lib/utils";
import { CategoryIconTile } from "@/components/ui/primitives";

export function CartDrawer() {
  const { cart, drawerOpen, setDrawerOpen, setQuantity, removeItem } = useApp();
  const progress = Math.min(100, (cart.totals.subtotal / cart.totals.freeDeliveryThreshold) * 100);

  return (
    <AnimatePresence>
      {drawerOpen && (
        <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Shopping basket">
          <motion.button
            type="button"
            aria-label="Close basket"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 36 }}
            className="absolute top-0 right-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="flex items-center gap-2.5 text-[17px] font-semibold tracking-[-0.01em] text-ink">
                <ShoppingBag size={18} strokeWidth={1.6} className="text-brand-700" />
                Your basket
                {cart.itemCount > 0 && (
                  <span className="text-[13px] font-medium text-muted">
                    ({cart.itemCount} {cart.itemCount === 1 ? "item" : "items"})
                  </span>
                )}
              </h2>
              <button
                type="button"
                aria-label="Close basket"
                onClick={() => setDrawerOpen(false)}
                className="btn-ghost btn-icon"
              >
                <X size={18} />
              </button>
            </div>

            {/* Rate Transparency & Subscription Offer Banner */}
            {cart.items.length > 0 && (
              <div className="border-b border-line bg-gradient-to-r from-emerald-50 to-teal-50 px-5 py-3">
                <div className="flex items-center justify-between text-[11px] font-bold text-emerald-950">
                  <span className="flex items-center gap-1.5">
                    <Tag size={13} className="text-emerald-700" /> Transparent Market Pricing + Cutting Fee
                  </span>
                  <span className="rounded-md bg-emerald-800 px-2 py-0.5 text-white font-black text-[10px]">
                    K.K. Nagar Hub
                  </span>
                </div>
                <p className="mt-1 text-[11px] font-semibold text-emerald-800 flex items-center gap-1">
                  <Gift size={12} className="text-amber-600" />
                  <span><strong>Subscription Offer:</strong> Subscribe & save 15% extra on every daily box.</span>
                </p>
              </div>
            )}

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {cart.items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-surface text-emerald-800">
                    <ShoppingBag size={26} strokeWidth={1.5} />
                  </span>
                  <p className="text-[15px] font-bold">Your basket is empty</p>
                  <p className="max-w-xs text-[12px] text-muted">
                    Fresh cut vegetables, fruits and meal kits prepared daily for K K Nagar.
                  </p>
                  <Link
                    href="/shop"
                    onClick={() => setDrawerOpen(false)}
                    className="btn btn-primary btn-sm mt-2 font-bold"
                  >
                    Start shopping
                  </Link>
                </div>
              ) : (
                <ul className="grid gap-3">
                  {cart.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex gap-3 rounded-2xl border border-line p-3 bg-white shadow-xs"
                    >
                      <CategoryIconTile icon={item.slug.split("-")[0]} size={56} />
                      <div className="flex-1">
                        <Link
                          href={`/product/${item.slug}`}
                          onClick={() => setDrawerOpen(false)}
                          className="line-clamp-1 text-[13px] font-extrabold hover:text-emerald-800"
                        >
                          {item.name}
                        </Link>
                        <p className="text-[11px] font-semibold text-muted">{item.variantName}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-0.5 rounded-full border border-line bg-white">
                            <button
                              type="button"
                              aria-label={`Decrease ${item.name}`}
                              className="flex h-7 w-7 items-center justify-center text-emerald-800"
                              onClick={() => void setQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus size={12} strokeWidth={2.5} />
                            </button>
                            <span className="min-w-5 text-center text-[12px] font-extrabold">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              aria-label={`Increase ${item.name}`}
                              className="flex h-7 w-7 items-center justify-center text-emerald-800 disabled:opacity-40"
                              disabled={item.quantity >= item.availableStock}
                              onClick={() => void setQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus size={12} strokeWidth={2.5} />
                            </button>
                          </div>
                          <span className="text-[13px] font-black">
                            {formatINR(item.totalPrice)}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        aria-label={`Remove ${item.name}`}
                        onClick={() => void removeItem(item.id)}
                        className="self-start text-muted transition-colors hover:text-danger"
                      >
                        <Trash2 size={15} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer & Rates Breakdown */}
            {cart.items.length > 0 && (
              <div className="border-t border-line bg-slate-50 px-5 py-4">
                <dl className="mb-3 grid gap-1.5 text-[12px]">
                  <Row label="Vegetables (Market Price)" value={formatINR(cart.totals.subtotal, true)} />
                  <Row label="Cutting & Shredding Fee" value="₹15.00" />
                  <Row label="Hygienic Sealed Packing" value="₹10.00" />
                  <Row label="KK Nagar 10km Delivery" value="₹29.00" />
                  {cart.totals.discount > 0 && (
                    <Row
                      label={`Coupon Discount`}
                      value={`−${formatINR(cart.totals.discount, true)}`}
                      tone="brand"
                    />
                  )}
                  <div className="mt-2 flex justify-between border-t border-line pt-2 text-[15px] font-black">
                    <dt className="text-slate-900">Total Payable</dt>
                    <dd className="text-emerald-800">{formatINR(cart.totals.subtotal + 15 + 10 + 29 - cart.totals.discount, true)}</dd>
                  </div>
                </dl>
                <Link
                  href="/checkout"
                  onClick={() => setDrawerOpen(false)}
                  className="btn btn-primary w-full font-extrabold text-sm py-3"
                >
                  Proceed to Checkout →
                </Link>
                <Link
                  href="/cart"
                  onClick={() => setDrawerOpen(false)}
                  className="btn btn-outline w-full mt-2 font-bold text-xs"
                >
                  View Basket Details
                </Link>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: "brand" }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted">{label}</dt>
      <dd className={`font-medium ${tone === "brand" ? "text-brand-700" : "text-ink"}`}>{value}</dd>
    </div>
  );
}
