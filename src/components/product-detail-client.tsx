"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Heart, Leaf, Minus, Plus, ShieldCheck, Truck } from "lucide-react";
import { useApp } from "@/components/providers";
import { formatINR } from "@/lib/utils";
import { Badge } from "@/components/ui/primitives";
import { DynamicIcon } from "@/lib/icons";
import { getStoredCatalogProducts } from "@/lib/catalog-store";

export type VariantOption = {
  id: string;
  variantName: string;
  unit: string;
  mrp: number;
  sellingPrice: number;
  discountPercentage: number;
  availableStock: number;
};

export function ProductPurchasePanel({
  productId,
  productName,
  emoji,
  categorySlug,
  variants,
  imageUrl,
}: {
  productId: string;
  productName: string;
  emoji: string;
  categorySlug: string;
  variants: VariantOption[];
  imageUrl?: string | null;
}) {
  const router = useRouter();
  const { addItem, user, notify } = useApp();
  const [selected, setSelected] = useState(variants[0]);
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState("");
  const [deliveryMessage, setDeliveryMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [activeImage, setActiveImage] = useState<string | null | undefined>(imageUrl);

  useEffect(() => {
    const syncStored = () => {
      const storedList = getStoredCatalogProducts();
      const match = storedList.find((p) => p.id === productId);
      if (match) {
        if (match.imageUrl || (match.images && match.images[0])) {
          setActiveImage(match.imageUrl || match.images?.[0]);
        }
      }
    };
    syncStored();
  }, [productId]);

  const outOfStock = !selected || selected.availableStock <= 0;

  async function handleAdd(buyNow = false) {
    if (!selected) return;
    setBusy(true);
    const done = await addItem(productId, selected.id, quantity);
    setBusy(false);
    if (done && buyNow) router.push("/checkout");
  }

  async function saveToWishlist() {
    if (!user) {
      notify("Sign in to save items to your wishlist", "error");
      return;
    }
    const res = await fetch("/api/v1/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, variantId: selected?.id }),
    });
    const json = await res.json();
    notify(json?.data?.saved ? "Saved to wishlist" : "Removed from wishlist");
  }

  function checkDelivery() {
    if (!/^\d{6}$/.test(pincode)) {
      setDeliveryMessage("Enter a valid 6-digit Chennai pincode.");
      return;
    }
    if (!pincode.startsWith("600078") && !pincode.startsWith("600083") && !pincode.startsWith("600092") && !pincode.startsWith("600024") && !pincode.startsWith("600033") && !pincode.startsWith("600095") && !pincode.startsWith("600089") && !pincode.startsWith("600042") && !pincode.startsWith("600015") && !pincode.startsWith("600094") && !pincode.startsWith("600087") && !pincode.startsWith("600116")) {
      setDeliveryMessage("Sorry, we currently deliver only within a 10 KM radius of K.K. Nagar, Chennai (600078).");
      return;
    }
    setDeliveryMessage("Deliverable from K.K. Nagar Hub — select your fresh delivery slot at checkout.");
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
      {/* Image */}
      <div>
        <div className="relative aspect-square overflow-hidden rounded-3xl bg-surface">
          {activeImage ? (
            <Image
              src={activeImage}
              alt={productName}
              fill
              sizes="(max-width: 1024px) 100vw, 560px"
              priority
              className="object-cover"
            />
          ) : (
            <span className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 text-brand-700/80 p-6 text-center">
              <DynamicIcon name={emoji} size={120} strokeWidth={1.2} />
              <span className="mt-4 rounded-full bg-emerald-100 px-4 py-1 text-xs font-bold text-emerald-800">
                Washed & Ready To Cook
              </span>
            </span>
          )}
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {["leaf", "shopping-bag", "leaf", "truck"].map((name, i) => (
            <span
              key={i}
              className="flex aspect-square items-center justify-center rounded-2xl border border-line bg-white text-brand-700/70"
            >
              <DynamicIcon name={name} size={24} strokeWidth={1.3} />
            </span>
          ))}
        </div>
      </div>

      {/* Purchase */}
      <div>
        <div className="mb-4 flex flex-wrap gap-2">
          {selected && selected.discountPercentage > 0 && (
            <Badge tone="offer">
              {Math.round(selected.discountPercentage)}% OFF
            </Badge>
          )}
          <Badge tone="fresh" icon="leafy">
            Harvested today
          </Badge>
          <Badge tone="brand" icon="delivery">
            Slot delivery
          </Badge>
        </div>

        <div className="mb-5 flex items-baseline gap-3">
          <span className="text-4xl font-bold tracking-[-0.02em] text-ink">
            {formatINR(selected?.sellingPrice ?? 0)}
          </span>
          {selected && selected.mrp > selected.sellingPrice && (
            <span className="text-lg text-muted line-through">{formatINR(selected.mrp)}</span>
          )}
        </div>
        <p className="text-[13px] text-muted">Inclusive of all taxes · {selected?.variantName}</p>

        <fieldset className="my-6">
          <legend className="mb-2.5 text-[13px] font-semibold text-ink">Choose pack size</legend>
          <div className="flex flex-wrap gap-2">
            {variants.map((variant) => (
              <button
                key={variant.id}
                type="button"
                onClick={() => {
                  setSelected(variant);
                  setQuantity(1);
                }}
                disabled={variant.availableStock <= 0}
                className={`rounded-2xl border px-4 py-3 text-left text-[13px] transition-colors disabled:opacity-40 ${
                  selected?.id === variant.id
                    ? "border-brand-700 bg-brand-50 text-brand-800"
                    : "border-line hover:border-brand-300"
                }`}
              >
                <span className="block font-semibold">{variant.variantName}</span>
                <span className="mt-0.5 block text-[12px] text-muted">
                  {formatINR(variant.sellingPrice)}
                </span>
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-full border border-line">
            <button
              type="button"
              aria-label="Decrease quantity"
              className="flex h-10 w-10 items-center justify-center text-brand-700 disabled:opacity-40"
              disabled={quantity <= 1}
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              <Minus size={14} strokeWidth={2} />
            </button>
            <span className="min-w-10 text-center text-[14px] font-semibold">{quantity}</span>
            <button
              type="button"
              aria-label="Increase quantity"
              className="flex h-10 w-10 items-center justify-center text-brand-700 disabled:opacity-40"
              disabled={!selected || quantity >= Math.min(10, selected.availableStock)}
              onClick={() => setQuantity((q) => q + 1)}
            >
              <Plus size={14} strokeWidth={2} />
            </button>
          </div>
          <p className="text-[12px] font-semibold text-brand-700">
            {outOfStock ? "Out of stock" : `${selected?.availableStock} in stock at Chennai hub`}
          </p>
        </div>

        <div className="mb-5 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            disabled={outOfStock || busy}
            onClick={() => void handleAdd(false)}
            className="btn btn-primary disabled:opacity-50"
          >
            {busy ? "Adding…" : "Add to basket"}
          </button>
          <button
            type="button"
            disabled={outOfStock || busy}
            onClick={() => void handleAdd(true)}
            className="btn btn-secondary disabled:opacity-50"
          >
            Buy now
          </button>
          <button
            type="button"
            onClick={() => void saveToWishlist()}
            className="btn btn-outline sm:col-span-2"
          >
            <Heart size={15} strokeWidth={1.6} aria-hidden /> Save to wishlist
          </button>
        </div>

        <div className="rounded-2xl border border-line p-4">
          <label className="text-[13px] font-semibold text-ink" htmlFor="pincode">
            Check delivery availability
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id="pincode"
              inputMode="numeric"
              maxLength={6}
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
              placeholder="600040"
              className="field"
            />
            <button type="button" onClick={checkDelivery} className="btn btn-outline">
              Check
            </button>
          </div>
          {deliveryMessage && (
            <p role="status" className="mt-2 text-[12px] font-medium text-brand-700">
              {deliveryMessage}
            </p>
          )}
        </div>

        <ul className="mt-5 grid gap-2 text-[12px] text-muted">
          <li className="flex items-center gap-2 font-semibold text-amber-900">
            <Truck size={14} className="text-amber-700" /> Per-order delivery charge applies (₹30–₹100 by distance · No free delivery)
          </li>
          <li className="flex items-center gap-2 font-semibold text-emerald-900">
            <ShieldCheck size={14} className="text-emerald-700" /> Freshness guaranteed · Ozonated triple water washed
          </li>
        </ul>

        <a
          href={`https://wa.me/919840012345?text=Hi%20VeggieFlick!%20I%20want%20to%20order%20${encodeURIComponent(productName)}.`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline border-emerald-600 text-emerald-800 font-bold text-xs mt-4 w-full flex items-center justify-center gap-2 hover:bg-emerald-50"
        >
          <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
            <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.758.459 3.474 1.33 4.982l-1.413 5.163 5.285-1.386c1.455.794 3.09 1.213 4.784 1.214h.004c5.505 0 9.988-4.478 9.989-9.985 0-2.668-1.038-5.176-2.924-7.062-1.887-1.886-4.395-2.924-7.065-2.924zm0 18.232h-.003c-1.493 0-2.957-.401-4.233-1.157l-.304-.18-3.147.825.84-3.067-.197-.314c-.832-1.325-1.272-2.862-1.272-4.437 0-4.509 3.67-8.178 8.18-8.178 2.184 0 4.238.85 5.783 2.396 1.545 1.545 2.395 3.6 2.394 5.784 0 4.51-3.669 8.18-8.177 8.18z"/>
          </svg>
          Order & Inquire via WhatsApp
        </a>
      </div>
    </div>
  );
}
