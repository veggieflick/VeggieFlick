"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useApp } from "@/components/providers";
import { useStoreStatus } from "@/components/store-status-context";
import { formatINR } from "@/lib/utils";
import { Badge, Rating } from "@/components/ui/primitives";
import { DynamicIcon } from "@/lib/icons";
import { CutSelectorModal } from "@/components/cut-selector-modal";
import { CustomIngredientModal } from "@/components/custom-ingredient-modal";
import { getStoredCatalogProducts } from "@/lib/catalog-store";

export type ProductCardData = {
  id: string;
  name: string;
  tamilName: string | null;
  slug: string;
  emoji: string;
  imageUrl?: string | null;
  shortDescription: string | null;
  isOrganic: boolean;
  isBestSeller: boolean;
  isFreshToday: boolean;
  isCutVegetable?: boolean;
  rating: number;
  ratingCount: number;
  categorySlug: string;
  subCategorySlug?: string;
  variantId: string;
  variantName: string;
  mrp: number;
  price: number;
  discountPercentage: number;
  availableStock: number;
};

export function ProductCard({ product, index = 0 }: { product: ProductCardData; index?: number }) {
  const { cart, addItem, setQuantity, user, notify } = useApp();
  const { isStoreOpen } = useStoreStatus();
  const [cutModalOpen, setCutModalOpen] = useState(false);
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [cardData, setCardData] = useState<ProductCardData>(product);

  useEffect(() => {
    const syncStored = () => {
      const storedList = getStoredCatalogProducts();
      if (!storedList.length) return;
      const match = storedList.find(
        (p) =>
          p.id === product.id ||
          (product.id && p.id && (p.id.includes(product.id) || product.id.includes(p.id))) ||
          (product.slug && p.slug === product.slug) ||
          (product.name && p.name && p.name.toLowerCase().trim() === product.name.toLowerCase().trim()) ||
          (p.sku && product.id && product.id.includes(p.sku))
      );
      if (match) {
        const mrpVal = Number(match.mrp) || product.mrp;
        const priceVal = Number(match.price) || product.price;
        const discountVal = mrpVal > priceVal ? Math.round(((mrpVal - priceVal) / mrpVal) * 100) : product.discountPercentage;
        setCardData({
          id: product.id,
          name: match.name || product.name,
          tamilName: match.tamilName ?? product.tamilName,
          slug: match.slug || product.slug,
          emoji: match.emoji || product.emoji,
          imageUrl: match.imageUrl || (match.images && match.images[0]) || product.imageUrl,
          shortDescription: match.shortDescription ?? product.shortDescription,
          isOrganic: match.isOrganic ?? product.isOrganic,
          isBestSeller: match.isBestSeller ?? product.isBestSeller,
          isFreshToday: product.isFreshToday,
          isCutVegetable: product.isCutVegetable,
          rating: product.rating,
          ratingCount: product.ratingCount,
          categorySlug: product.categorySlug,
          subCategorySlug: product.subCategorySlug,
          variantId: product.variantId,
          variantName: match.weight || product.variantName,
          mrp: mrpVal,
          price: priceVal,
          discountPercentage: discountVal,
          availableStock: match.stock ?? product.availableStock,
        });
      }
    };
    syncStored();
    window.addEventListener("vf_catalog_updated", syncStored);
    return () => window.removeEventListener("vf_catalog_updated", syncStored);
  }, [product]);

  const line = cart.items.find((item) => item.variantId === cardData.variantId);
  const outOfStock = cardData.availableStock <= 0;
  const imageSrc = cardData.imageUrl;
  const discountPct = Math.round(cardData.discountPercentage);

  const isCustomizable =
    cardData.categorySlug === "salad" ||
    cardData.categorySlug === "fruit-salads" ||
    cardData.categorySlug === "veg-salads" ||
    cardData.categorySlug === "recipe-meal-kits" ||
    !!cardData.subCategorySlug;

  const handleAddClick = () => {
    if (!isStoreOpen) {
      notify("🔴 கடையில் தற்போது ஆர்டர் எடுப்பது நிறுத்திவைக்கப்பட்டுள்ளது (Store is Offline)", "error");
      return;
    }
    if (cardData.categorySlug === "vegetables-shopping" && !cardData.isCutVegetable) {
      setCutModalOpen(true);
    } else if (isCustomizable) {
      setCustomModalOpen(true);
    } else {
      void addItem(cardData.id, cardData.variantId, 1);
    }
  };

  async function toggleWishlist() {
    if (!user) {
      notify("Sign in to save items to your wishlist", "error");
      return;
    }
    const res = await fetch("/api/v1/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: cardData.id, variantId: cardData.variantId }),
    });
    const json = await res.json();
    notify(json?.data?.saved ? "Saved to wishlist" : "Removed from wishlist");
  }

  return (
    <>
      <CutSelectorModal
        isOpen={cutModalOpen}
        onClose={() => setCutModalOpen(false)}
        productName={cardData.name}
        onSelectCut={(cutStyle) => {
          void addItem(cardData.id, cardData.variantId, 1);
          notify(`Added ${cardData.name} (${cutStyle.toUpperCase()} cut)`);
        }}
      />
      <CustomIngredientModal
        isOpen={customModalOpen}
        onClose={() => setCustomModalOpen(false)}
        productName={cardData.name}
        variantName={cardData.variantName}
        price={cardData.price}
        categorySlug={cardData.categorySlug}
        subCategorySlug={cardData.subCategorySlug}
        onConfirm={({ weight, ingredients }) => {
          void addItem(cardData.id, cardData.variantId, 1);
          notify(
            `Added ${cardData.name} (${weight}) with ${ingredients.slice(0, 3).join(", ")}${
              ingredients.length > 3 ? "..." : ""
            }`,
          );
        }}
      />
      <motion.article
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.3) }}
        whileHover={{ y: -4 }}
        className="card group relative flex h-full flex-col overflow-hidden bg-white border border-slate-200/90 shadow-xs hover:shadow-xl transition-all rounded-2xl"
      >
        {/* Image area */}
        <div className="relative block aspect-square overflow-hidden bg-surface">
          <Link href={`/product/${cardData.slug}`} aria-label={cardData.name} className="block h-full w-full">
            {imageSrc ? (
              <Image
                src={imageSrc}
                alt={cardData.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 220px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <span className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50/80 via-white to-surface text-brand-700 transition-transform duration-300 group-hover:scale-105">
                <DynamicIcon name={cardData.emoji} size={54} strokeWidth={1.3} />
              </span>
            )}
          </Link>

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 pointer-events-none z-10">
            {discountPct > 0 && (
              <span className="chip bg-emerald-800 text-white font-extrabold text-[10px] tracking-wider shadow-sm">{discountPct}% OFF</span>
            )}
            {cardData.isCutVegetable ? (
              <span className="chip bg-amber-700 text-white font-bold text-[10px] tracking-wide shadow-xs">Pre-Cut</span>
            ) : cardData.isFreshToday ? (
              <span className="chip bg-emerald-700 text-white font-bold text-[10px] tracking-wide shadow-xs">Fresh Daily</span>
            ) : null}
          </div>

          {/* Floating Quick Add (+) Button Overlay */}
          {!outOfStock && !line && (
            <motion.button
              whileHover={{ scale: 1.15, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              type="button"
              onClick={handleAddClick}
              aria-label={`Add ${cardData.name} to cart`}
              className="absolute bottom-2.5 right-2.5 z-10 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-800 text-white shadow-md hover:bg-emerald-900"
            >
              <Plus size={18} strokeWidth={2.5} />
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            type="button"
            onClick={() => void toggleWishlist()}
            aria-label={`Save ${cardData.name} to wishlist`}
            className="absolute top-2.5 right-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-muted shadow-sm backdrop-blur transition-colors hover:text-emerald-800"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
            </svg>
          </motion.button>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-3.5">
          <Rating value={cardData.rating} count={cardData.ratingCount} />

          <Link href={`/product/${cardData.slug}`}>
            <h3 className="mt-1 line-clamp-2 text-[14px] font-bold leading-snug tracking-[-0.01em] text-ink transition-colors group-hover:text-emerald-800">
              {cardData.name}
            </h3>
          </Link>

          {/* Unit Pill Tag */}
          <div className="mt-1.5">
            <span className="inline-block rounded-md border border-line bg-surface px-2 py-0.5 text-[11px] font-semibold text-muted">
              {cardData.variantName}
            </span>
          </div>

          <div className="mt-auto flex items-center justify-between gap-2 pt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[16px] font-extrabold tracking-[-0.01em] text-ink">
                {formatINR(cardData.price)}
              </span>
              {cardData.mrp > cardData.price && (
                <span className="text-[11px] font-medium text-muted line-through">
                  {formatINR(cardData.mrp)}
                </span>
              )}
            </div>

            {outOfStock ? (
              <span className="chip chip-muted">Out of stock</span>
            ) : !isStoreOpen ? (
              <button
                type="button"
                disabled
                onClick={handleAddClick}
                className="btn btn-sm bg-slate-200 text-slate-600 font-bold border border-slate-300 opacity-90 cursor-not-allowed text-[11px]"
              >
                Store Offline
              </button>
            ) : line ? (
              <div className="flex items-center gap-0.5 rounded-full border border-emerald-800 bg-emerald-800 text-white shadow-sm">
                <button
                  type="button"
                  aria-label={`Decrease ${product.name}`}
                  className="flex h-7 w-7 items-center justify-center transition-colors hover:bg-emerald-900"
                  onClick={() => void setQuantity(line.id, line.quantity - 1)}
                >
                  <Minus size={12} strokeWidth={2.5} />
                </button>
                <span className="min-w-5 text-center text-[12px] font-bold">{line.quantity}</span>
                <button
                  type="button"
                  aria-label={`Increase ${product.name}`}
                  className="flex h-7 w-7 items-center justify-center transition-colors hover:bg-emerald-900 disabled:opacity-40"
                  disabled={line.quantity >= product.availableStock}
                  onClick={() => void setQuantity(line.id, line.quantity + 1)}
                >
                  <Plus size={12} strokeWidth={2.5} />
                </button>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={handleAddClick}
                className="btn btn-outline btn-sm border-emerald-800 font-bold text-emerald-800 hover:bg-emerald-800 hover:text-white"
              >
                Add
              </motion.button>
            )}
          </div>
        </div>
      </motion.article>
    </>
  );
}

export function ProductCarousel({ products }: { products: ProductCardData[] }) {
  return (
    <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide md:mx-0 md:px-0">
      {products.map((product, i) => (
        <div key={product.id} className="w-[15rem] shrink-0 md:w-[16.5rem]">
          <ProductCard product={product} index={i} />
        </div>
      ))}
    </div>
  );
}
