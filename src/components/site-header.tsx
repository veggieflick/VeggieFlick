"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bell,
  Bike,
  Heart,
  Leaf,
  MapPin,
  Menu,
  Search,
  ShoppingBag,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { useApp } from "@/components/providers";
import { useLanguage } from "@/components/language-context";
import { formatINR } from "@/lib/utils";
import { CategoryIconTile } from "@/components/ui/primitives";
import { lookupIcon } from "@/lib/icons";

type Category = { id: string; name: string; slug: string; icon: string };
type Suggestion = { name: string; slug: string; emoji: string; categoryName: string; price: string };

const DELIVERY_AREAS = [
  "K K Nagar (10 km Radius)",
  "Anna Nagar",
  "T. Nagar",
  "Adyar",
  "Velachery",
  "Porur",
  "OMR Thoraipakkam",
  "Mylapore",
];

const DELIVERY_PARTNERS = [
  { name: "Swiggy", color: "bg-orange-500" },
  { name: "Zomato", color: "bg-red-500" },
  { name: "Instamart", color: "bg-amber-500" },
  { name: "Blinkit", color: "bg-yellow-500" },
  { name: "BigBasket", color: "bg-green-600" },
  { name: "Zepto", color: "bg-purple-600" },
];

export function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { cart, user, logout, setDrawerOpen } = useApp();
  const { lang, setLang, t } = useLanguage();

  const [categories, setCategories] = useState<Category[]>([]);
  const [term, setTerm] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [area, setArea] = useState(DELIVERY_AREAS[0]);
  const [unread, setUnread] = useState(0);
  const [storeOpen, setStoreOpen] = useState(true);

  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/v1/categories")
      .then((r) => r.json())
      .then((json) => {
        if (json?.success) setCategories(json.data.categories as Category[]);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!user) return;
    fetch("/api/v1/notifications")
      .then((r) => r.json())
      .then((json) => {
        if (json?.success) setUnread(json.data.unread as number);
      })
      .catch(() => undefined);
  }, [user]);

  useEffect(() => {
    if (term.trim().length < 2) return;
    const t = setTimeout(() => {
      fetch(`/api/v1/products/search?q=${encodeURIComponent(term)}`)
        .then((r) => r.json())
        .then((json) => {
          if (json?.success) setSuggestions(json.data as Suggestion[]);
        })
        .catch(() => undefined);
    }, 220);
    return () => clearTimeout(t);
  }, [term]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggest(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const submitSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const q = term.trim();
      setShowSuggest(false);
      router.push(`/shop?search=${encodeURIComponent(q)}`);
      setTerm("");
    },
    [term, router],
  );

  if (pathname.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-line bg-white/95 backdrop-blur-xl">
      {/* Top Bar with Store Status Toggle, Location & Partners */}
      <div className="border-b border-line/60 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white">
        <div className="container-page flex h-9 items-center justify-between gap-3 text-xs overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-3 shrink-0">
            {/* Store Operational Status Toggle Button */}
            <button
              type="button"
              onClick={() => setStoreOpen((prev) => !prev)}
              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all shadow-xs ${
                storeOpen
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
                  : "bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30"
              }`}
              title="Click to toggle store operational hours"
            >
              <span className={`h-2 w-2 rounded-full ${storeOpen ? "bg-emerald-400 animate-pulse" : "bg-rose-400"}`} />
              {storeOpen ? "STORE OPEN • Accepting KK Nagar Orders" : "STORE CLOSED • Pre-orders Only"}
            </button>

            {/* Location Pill */}
            <div className="flex items-center gap-1 bg-white/10 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-emerald-200">
              <MapPin size={12} className="text-emerald-400" />
              <span>K K Nagar Hub (10 km Radius)</span>
            </div>
          </div>

          {/* Delivery Partners Badge Strip */}
          <div className="hidden lg:flex items-center gap-2 shrink-0 text-[11px] text-slate-300">
            <span className="font-semibold text-slate-400">Delivery via:</span>
            <div className="flex items-center gap-1.5">
              {DELIVERY_PARTNERS.map((partner) => (
                <span key={partner.name} className="px-1.5 py-0.5 rounded-md bg-white/10 text-white font-extrabold text-[10px] tracking-tight">
                  {partner.name}
                </span>
              ))}
            </div>
          </div>

          {/* WhatsApp Direct Order Button */}
          <a
            href="https://wa.me/919840012345?text=Hi%20VeggieFlick%20KK%20Nagar!%20I%20want%20to%20place%20an%20order."
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 px-2.5 py-0.5 rounded-full font-bold text-white text-[11px] shadow-xs transition-colors shrink-0"
          >
            <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.758.459 3.474 1.33 4.982l-1.413 5.163 5.285-1.386c1.455.794 3.09 1.213 4.784 1.214h.004c5.505 0 9.988-4.478 9.989-9.985 0-2.668-1.038-5.176-2.924-7.062-1.887-1.886-4.395-2.924-7.065-2.924zm0 18.232h-.003c-1.493 0-2.957-.401-4.233-1.157l-.304-.18-3.147.825.84-3.067-.197-.314c-.832-1.325-1.272-2.862-1.272-4.437 0-4.509 3.67-8.178 8.18-8.178 2.184 0 4.238.85 5.783 2.396 1.545 1.545 2.395 3.6 2.394 5.784 0 4.51-3.669 8.18-8.177 8.18z"/>
            </svg>
            WhatsApp Order
          </a>
        </div>
      </div>

      {/* Main header — 72px */}
      <div className="container-page flex h-[72px] items-center gap-4">
        <button
          type="button"
          className="btn-ghost btn-icon rounded-lg lg:hidden"
          aria-label="Open menu"
          onClick={() => setMenuOpen(true)}
        >
          <Menu size={20} strokeWidth={1.6} />
        </button>

        <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="VeggieFlick home">
          <img src="/logo.png" alt="VeggieFlick - Easy Cook" className="h-10 sm:h-12 w-auto object-contain drop-shadow-sm" />
        </Link>

        {/* Search */}
        <div ref={searchRef} className="relative flex-1 max-w-2xl mx-auto">
          <form onSubmit={submitSearch} role="search">
            <label className="input-shell">
              <Search size={18} strokeWidth={1.6} className="text-muted" aria-hidden />
              <input
                value={term}
                onFocus={() => setShowSuggest(true)}
                onChange={(e) => {
                  setTerm(e.target.value);
                  setShowSuggest(true);
                }}
                placeholder={t("nav.search_placeholder")}
                className="w-full bg-transparent text-[15px] outline-none placeholder:text-muted"
                aria-label="Search products"
              />
            </label>
          </form>
          {showSuggest && suggestions.length > 0 && (
            <div className="card absolute top-full z-50 mt-2 w-full overflow-hidden p-1 shadow-lg">
              {suggestions.map((item) => (
                <Link
                  key={item.slug}
                  href={`/product/${item.slug}`}
                  onClick={() => setShowSuggest(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-surface"
                >
                  <span className="text-brand-700">
                    <CategoryIconTile icon={item.slug.split("-")[0]} size={36} />
                  </span>
                  <span className="flex-1 text-sm font-medium text-ink">{item.name}</span>
                  <span className="text-xs text-muted">{item.categoryName}</span>
                  <span className="text-sm font-semibold text-ink">
                    {formatINR(item.price)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Link
            href="/account?tab=wishlist"
            className="btn-ghost btn-icon hidden md:inline-flex"
            aria-label="Wishlist"
          >
            <Heart size={18} strokeWidth={1.6} />
          </Link>
          <Link
            href="/account?tab=notifications"
            className="btn-ghost btn-icon relative hidden md:inline-flex"
            aria-label="Notifications"
          >
            <Bell size={18} strokeWidth={1.6} />
            {unread > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-700 px-1 text-[10px] font-semibold text-white">
                {unread}
              </span>
            )}
          </Link>

          <div className="relative">
            <button
              type="button"
              onClick={() => setAccountOpen((o) => !o)}
              className="btn-ghost btn-icon"
              aria-haspopup="menu"
              aria-expanded={accountOpen}
              aria-label="Account"
            >
              <User size={18} strokeWidth={1.6} />
            </button>
            {accountOpen && (
              <div
                className="card absolute right-0 z-50 mt-2 w-60 p-2 shadow-lg"
                role="menu"
                onMouseLeave={() => setAccountOpen(false)}
              >
                {user ? (
                  <>
                    <div className="px-3 py-2">
                      <p className="text-sm font-semibold text-ink">{user.fullName}</p>
                      <p className="text-xs text-muted">+91 {user.phone}</p>
                    </div>
                    <Link href="/account" className="block rounded-lg px-3 py-2 text-sm hover:bg-surface">
                      My account
                    </Link>
                    <Link href="/orders" className="block rounded-lg px-3 py-2 text-sm hover:bg-surface">
                      My orders
                    </Link>
                    {["admin", "super_admin", "manager", "warehouse_staff"].includes(user.role) && (
                      <Link href="/admin" className="block rounded-lg px-3 py-2 text-sm hover:bg-surface">
                        Admin dashboard
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setAccountOpen(false);
                        void logout();
                      }}
                      className="block w-full rounded-lg px-3 py-2 text-left text-sm text-danger hover:bg-red-50"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="block rounded-lg px-3 py-2 text-sm hover:bg-surface">
                      Sign in with OTP
                    </Link>
                    <Link href="/orders" className="block rounded-lg px-3 py-2 text-sm hover:bg-surface">
                      Track an order
                    </Link>
                    <Link href="/admin/login" className="block rounded-lg px-3 py-2 text-sm hover:bg-surface">
                      Staff portal
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="btn btn-primary btn-sm relative hidden sm:inline-flex"
            aria-label={`Open basket with ${cart.itemCount} items`}
          >
            <ShoppingBag size={15} strokeWidth={1.8} />
            <span>
              {cart.itemCount > 0
                ? `${cart.itemCount} · ${formatINR(cart.totals.subtotal)}`
                : "Basket"}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="btn-ghost btn-icon relative sm:hidden"
            aria-label={`Basket: ${cart.itemCount} items`}
          >
            <ShoppingBag size={18} strokeWidth={1.6} />
            {cart.itemCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-700 px-1 text-[10px] font-semibold text-white">
                {cart.itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav aria-label="Main Navigation" className="hidden border-t border-line/70 lg:block bg-surface/40">
        <div className="container-page flex items-center gap-1 py-2 overflow-x-auto scrollbar-hide text-[13px] font-semibold">
          <Link href="/" className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-slate-800 transition-colors hover:bg-emerald-50 hover:text-emerald-800">
            Home
          </Link>
          <Link href="/shop?category=vegetables-shopping" className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-emerald-900 font-bold transition-colors hover:bg-emerald-50 hover:text-emerald-800">
            Vegetables Shopping
          </Link>
          <Link href="/shop?category=fruit-salads" className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-slate-800 transition-colors hover:bg-emerald-50 hover:text-emerald-800">
            Fruit Salads
          </Link>
          <Link href="/shop?category=veg-salads" className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-slate-800 transition-colors hover:bg-emerald-50 hover:text-emerald-800">
            Veg Salads
          </Link>
          <Link href="/shop?category=fruits-cutting-combo" className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-slate-800 transition-colors hover:bg-emerald-50 hover:text-emerald-800">
            Fruits Cutting & Combo Pack
          </Link>
          <Link href="/#combo-kits" className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-amber-900 bg-amber-50/80 border border-amber-200/60 font-bold hover:bg-amber-100">
            Recipe Combo Kits
          </Link>
          <Link href="/subscriptions" className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-slate-800 hover:bg-emerald-50">
            Subscriptions
          </Link>
          <Link href="/shop?sort=discount" className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-emerald-800 font-bold hover:bg-emerald-50">
            Offers
          </Link>
          <Link href="/about" className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-slate-800 transition-colors hover:bg-emerald-50 hover:text-emerald-800">
            About
          </Link>
          <Link href="/help#contact" className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-slate-800 transition-colors hover:bg-emerald-50 hover:text-emerald-800">
            Contact
          </Link>
        </div>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute top-0 left-0 h-full w-[84%] max-w-sm overflow-y-auto bg-white p-5 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-base font-extrabold text-slate-900">VeggieFlick Navigation</span>
              <button
                type="button"
                aria-label="Close menu"
                className="btn-ghost btn-icon"
                onClick={() => setMenuOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="grid gap-1 text-sm font-semibold text-slate-800">
              <Link href="/" onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-2.5 hover:bg-emerald-50">Home</Link>
              <Link href="/shop?category=vegetables-shopping" onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-2.5 text-emerald-800 font-extrabold hover:bg-emerald-50">Vegetables Shopping</Link>
              <Link href="/shop?category=vegetables-shopping&cut=true" onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-2 text-xs text-amber-800 bg-amber-50 font-bold ml-2">↳ Chopped & Cut Vegetables</Link>
              <Link href="/shop?category=fruit-salads" onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-2.5 hover:bg-emerald-50">Fruit Salads</Link>
              <Link href="/shop?category=veg-salads" onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-2.5 hover:bg-emerald-50">Veg Salads</Link>
              <Link href="/shop?category=fruits-cutting-combo" onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-2.5 hover:bg-emerald-50">Fruits Cutting & Combo Pack</Link>
              <Link href="/#combo-kits" onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-2.5 text-amber-900 bg-amber-50 font-bold">Recipe Meal Kits</Link>
              <Link href="/subscriptions" onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-2.5 hover:bg-emerald-50">Subscriptions</Link>
              <Link href="/shop?sort=discount" onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-2.5 text-emerald-800 font-bold">Special Offers</Link>
              <Link href="/about" onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-2.5 hover:bg-emerald-50">About Us</Link>
              <Link href="/help#contact" onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-2.5 hover:bg-emerald-50">Contact KK Nagar Hub</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

const iconMap: Record<string, string> = {
  vegetables: "Carrot",
  fruits: "Apple",
  leafy: "Leaf",
  cut: "Salad",
  organic: "Sprout",
  exotic: "Sparkles",
  salad: "Salad",
  ready: "Soup",
  fresh: "Sparkles",
};
