import Link from "next/link";
import { Bike, Leaf, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import { NewsletterForm } from "@/components/newsletter-form";

const SHOP_LINKS = [
  { label: "Cut Vegetables (Ready to Cook)", href: "/shop?category=cut-vegetables" },
  { label: "Fresh Fruits", href: "/shop?category=fresh-fruits" },
  { label: "Leafy Vegetables (Keerai Mix)", href: "/shop?category=leafy-vegetables" },
  { label: "Diet Combos & Salads", href: "/shop?category=salads" },
  { label: "Meal Kits & Combos", href: "/shop?category=ready-to-cook" },
  { label: "Organic Produce", href: "/shop?category=organic" },
];

const COMPANY_LINKS = [
  { label: "About Us", href: "/about" },
  { label: "KK Nagar Hub Process", href: "/about" },
  { label: "Quality & Prep Promise", href: "/about" },
  { label: "Subscription Offers", href: "/subscriptions" },
  { label: "Journal & Tips", href: "/blog" },
  { label: "Recipes", href: "/recipes" },
];

const HELP_LINKS = [
  { label: "FAQ", href: "/help" },
  { label: "Contact KK Nagar Hub", href: "/help#contact" },
  { label: "Track Order", href: "/orders" },
  { label: "Privacy Policy", href: "/legal/privacy" },
  { label: "Terms & Conditions", href: "/legal/terms" },
];

const PARTNERS = ["Swiggy", "Zomato", "Instamart", "Blinkit", "BigBasket", "Zepto"];

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-line bg-white">
      <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-5">
        {/* Brand */}
        <div className="lg:col-span-2">
          <Link href="/" className="inline-block">
            <img src="/logo.png" alt="VeggieFlick - Easy Cook" className="h-14 w-auto object-contain" />
          </Link>
          <p className="mt-3 max-w-sm text-[13px] leading-relaxed text-muted">
            Fresh cut vegetables & fruits delivered fast across K K Nagar and nearby 10 km radius.
            Washed in ozonated water, chopped as per market rates with zero preservative policy.
          </p>
          <div className="mt-5 grid gap-2 text-[13px] text-muted">
            <p className="flex items-start gap-2">
              <MapPin size={16} strokeWidth={1.6} className="text-emerald-700 shrink-0 mt-0.5" />
              <span><strong>Hub Address:</strong> No. 50, 51st Street, 9th Sector, K K Nagar, Chennai - 600078</span>
            </p>
            <p className="flex items-center gap-2">
              <Phone size={14} strokeWidth={1.6} className="text-emerald-700 shrink-0" /> +91 98400 12345 / +91 44 4000 2200
            </p>
            <p className="flex items-center gap-2">
              <Mail size={14} strokeWidth={1.6} className="text-emerald-700 shrink-0" /> hello@veggieflick.in
            </p>
          </div>

          {/* Social Icons & WhatsApp Quick Link */}
          <div className="mt-5 flex items-center gap-3">
            <a
              href="https://wa.me/919840012345"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-white transition-transform hover:scale-110 shadow-xs"
              title="Chat on WhatsApp"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.758.459 3.474 1.33 4.982l-1.413 5.163 5.285-1.386c1.455.794 3.09 1.213 4.784 1.214h.004c5.505 0 9.988-4.478 9.989-9.985 0-2.668-1.038-5.176-2.924-7.062-1.887-1.886-4.395-2.924-7.065-2.924zm0 18.232h-.003c-1.493 0-2.957-.401-4.233-1.157l-.304-.18-3.147.825.84-3.067-.197-.314c-.832-1.325-1.272-2.862-1.272-4.437 0-4.509 3.67-8.178 8.18-8.178 2.184 0 4.238.85 5.783 2.396 1.545 1.545 2.395 3.6 2.394 5.784 0 4.51-3.669 8.18-8.177 8.18z"/>
              </svg>
            </a>
            <span className="text-[12px] font-bold text-slate-700">Follow VeggieFlick</span>
          </div>
        </div>

        {/* Links */}
        <nav aria-label="Shop">
          <h2 className="mb-4 text-[12px] font-bold tracking-widest text-emerald-800 uppercase">Aisles</h2>
          <ul className="grid gap-2.5 text-[13px]">
            {SHOP_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-ink transition-colors hover:text-emerald-700">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Company">
          <h2 className="mb-4 text-[12px] font-bold tracking-widest text-emerald-800 uppercase">Hub & Offers</h2>
          <ul className="grid gap-2.5 text-[13px]">
            {COMPANY_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-ink transition-colors hover:text-emerald-700">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* QR Code Pay & Rate Transparency Card */}
        <div className="flex flex-col gap-4">
          <nav aria-label="Help">
            <h2 className="mb-4 text-[12px] font-bold tracking-widest text-emerald-800 uppercase">Help & Support</h2>
            <ul className="grid gap-2.5 text-[13px]">
              {HELP_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-ink transition-colors hover:text-emerald-700">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* QR Code pay box */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-3.5 text-center">
            <p className="text-[11px] font-extrabold text-emerald-950 uppercase tracking-wider">Instant UPI QR Pay</p>
            <div className="my-2 mx-auto flex h-24 w-24 items-center justify-center rounded-xl bg-white p-2 border border-emerald-300 shadow-xs">
              {/* QR Code SVG */}
              <svg className="h-full w-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 3h6v6H3V3zm12 0h6v6h-6V3zM3 15h6v6H3v-6zm12 6v-3h3v3h-3zm3-6h3v3h-3v-3zm-3-3h3v3h-3v-3zm3 0h3v3h-3v-3zm-6 3h3v3h-3v-3zm0-6h3v3h-3V9zm-3 3h3v3h-3v-3zm0 3h3v3h-3v-3z" fill="#064e3b" />
              </svg>
            </div>
            <p className="text-[10px] font-medium text-emerald-800">Scan via GPay / PhonePe / Paytm</p>
          </div>
        </div>
      </div>

      {/* Delivery Partners Strip */}
      <div className="border-t border-line bg-slate-900 py-3 text-white">
        <div className="container-page flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-amber-400">Hyperlocal Delivery Partners:</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {PARTNERS.map((p) => (
                <span key={p} className="rounded-lg bg-white/10 px-2 py-0.5 text-[11px] font-extrabold text-slate-200">
                  {p}
                </span>
              ))}
            </div>
          </div>
          <span className="text-[11px] font-bold text-emerald-400">
            📍 K K Nagar 10 KM Radius Express Slots
          </span>
        </div>
      </div>

      <div className="border-t border-line bg-surface">
        <div className="container-page flex flex-wrap items-center justify-center gap-x-8 gap-y-3 py-4 text-[12px] font-medium text-muted">
          <span className="flex items-center gap-1.5">
            <Bike size={13} strokeWidth={1.6} className="text-emerald-700" /> Standard Delivery Fee + Cutting & Packing Fee
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={13} strokeWidth={1.6} className="text-emerald-700" /> Transparent Market Rate Produce
          </span>
          <span className="flex items-center gap-1.5">
            <Leaf size={13} strokeWidth={1.6} className="text-emerald-700" /> FSSAI Licensed · 100% Hygienic Seal
          </span>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-4 text-[11px] text-muted md:flex-row">
          <p>© {new Date().getFullYear()} VeggieFlick KK Nagar Retail Pvt Ltd. All rights reserved.</p>
          <p>Address: 50, 51st St, 9th Sector, K K Nagar, Ch 600078 · GSTIN 33AABCV1234F1Z5</p>
        </div>
      </div>
    </footer>
  );
}

