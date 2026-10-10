"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Home, Leaf, MessageCircle, Search, ShoppingBag, User } from "lucide-react";
import { useApp } from "@/components/providers";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/shop", label: "Shop", Icon: Leaf },
  { href: "/shop?sort=newest", label: "Search", Icon: Search },
  { href: "/cart", label: "Basket", Icon: ShoppingBag },
  { href: "/account", label: "Account", Icon: User },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { cart } = useApp();
  if (pathname.startsWith("/admin")) return null;

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200/80 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden shadow-lg"
    >
      <ul className="grid grid-cols-5">
        {ITEMS.map(({ href, label, Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href.split("?")[0]);
          return (
            <li key={label}>
              <Link
                href={href}
                className={cn(
                  "relative flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-bold transition-colors",
                  active ? "text-emerald-900" : "text-slate-400 hover:text-slate-600",
                )}
              >
                {active && (
                  <motion.div
                    layoutId="mobileNavActive"
                    className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-emerald-800"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                <Icon size={19} strokeWidth={active ? 2.2 : 1.7} />
                {label}
                {label === "Basket" && cart.itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1.5 right-[20%] flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-800 px-1 text-[9px] font-extrabold text-white shadow-xs"
                  >
                    {cart.itemCount}
                  </motion.span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function FloatingActions() {
  const pathname = usePathname();
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname.startsWith("/admin")) return null;

  return (
    <div className="fixed right-4 bottom-20 z-50 flex flex-col gap-2.5 md:bottom-6">
      <AnimatePresence>
        {showTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.7, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 10 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            type="button"
            aria-label="Scroll to top"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-800 shadow-lg backdrop-blur-md transition-colors hover:bg-slate-50"
          >
            <ArrowUp size={18} strokeWidth={2} />
          </motion.button>
        )}
      </AnimatePresence>
      <motion.a
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        href="https://wa.me/919840532826?text=Hi%20VeggieFlick!%20I%20have%20a%20query%20about%20orders%20and%20deliveries."
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with VeggieFlick on WhatsApp"
        className="group relative flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xl hover:bg-emerald-500 shadow-emerald-700/30"
      >
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border border-white"></span>
        </span>
        <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
          <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.758.459 3.474 1.33 4.982l-1.413 5.163 5.285-1.386c1.455.794 3.09 1.213 4.784 1.214h.004c5.505 0 9.988-4.478 9.989-9.985 0-2.668-1.038-5.176-2.924-7.062-1.887-1.886-4.395-2.924-7.065-2.924zm0 18.232h-.003c-1.493 0-2.957-.401-4.233-1.157l-.304-.18-3.147.825.84-3.067-.197-.314c-.832-1.325-1.272-2.862-1.272-4.437 0-4.509 3.67-8.178 8.18-8.178 2.184 0 4.238.85 5.783 2.396 1.545 1.545 2.395 3.6 2.394 5.784 0 4.51-3.669 8.18-8.177 8.18z"/>
        </svg>
      </motion.a>
    </div>
  );
}

export function HideOnAdmin({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return <>{children}</>;
}
