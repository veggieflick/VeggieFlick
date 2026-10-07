import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { AppProviders } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CartDrawer } from "@/components/cart-drawer";
import { FloatingActions, HideOnAdmin, MobileBottomNav } from "@/components/mobile-nav";
import { OrderStatusToast } from "@/components/order-status-toast";

const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
const siteUrl = rawSiteUrl && rawSiteUrl.length > 0 ? rawSiteUrl : "https://veggieflick.in";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "VeggieFlick — Farm Fresh Vegetables & Fruits Delivered in Chennai",
    template: "%s | VeggieFlick",
  },
  description:
    "Order farm fresh vegetables, fruits, cut vegetables and ready-to-cook kits online in Chennai. Harvested at dawn, delivered in your chosen slot within 25 km. Free delivery above ₹499.",
  keywords: [
    "vegetables online Chennai",
    "fruits delivery Chennai",
    "cut vegetables Chennai",
    "organic vegetables Chennai",
    "grocery delivery Chennai",
    "VeggieFlick",
  ],
  authors: [{ name: "VeggieFlick Retail Private Limited" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "VeggieFlick",
    title: "VeggieFlick — Farm Fresh. Delivered Fast.",
    description:
      "Chennai's premium fresh produce delivery. Vegetables, fruits, cut veggies and recipe kits delivered within your slot.",
  },
  twitter: {
    card: "summary_large_image",
    title: "VeggieFlick — Farm Fresh. Delivered Fast.",
    description: "Fresh vegetables and fruits delivered across Chennai within 25 km.",
  },
  robots: { index: true, follow: true },
  manifest: "/manifest.webmanifest",
  applicationName: "VeggieFlick",
  appleWebApp: { capable: true, title: "VeggieFlick", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#16A34A",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "GroceryStore",
  name: "VeggieFlick",
  image: `${siteUrl}/images/hero-fresh.jpg`,
  description: "Farm fresh vegetables and fruits delivered across Chennai.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Koyambedu Market Complex",
    addressLocality: "Chennai",
    addressRegion: "Tamil Nadu",
    postalCode: "600026",
    addressCountry: "IN",
  },
  telephone: "+914440002200",
  priceRange: "₹₹",
  areaServed: "Chennai",
  currenciesAccepted: "INR",
  paymentAccepted: "UPI, Credit Card, Debit Card, Net Banking, Cash on Delivery",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-IN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className="relative min-h-screen bg-white font-sans text-ink antialiased selection:bg-emerald-100 selection:text-emerald-950">
        {/* Ambient Brand Theme Glows (Left Green / Right Orange overlay at 30% opacity) */}
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-60" aria-hidden="true">
          {/* Left Side Green Theme Glow */}
          <div className="absolute -top-32 -left-32 h-[750px] w-[550px] rounded-full bg-emerald-500/18 blur-[130px] md:bg-emerald-500/20 md:blur-[160px]" />
          <div className="absolute top-[40%] -left-40 h-[850px] w-[600px] rounded-full bg-emerald-600/14 blur-[140px] md:bg-emerald-600/15 md:blur-[180px]" />

          {/* Right Side Orange Theme Glow */}
          <div className="absolute top-[10%] -right-32 h-[750px] w-[550px] rounded-full bg-orange-500/18 blur-[130px] md:bg-orange-500/20 md:blur-[160px]" />
          <div className="absolute top-[60%] -right-40 h-[850px] w-[600px] rounded-full bg-orange-600/14 blur-[140px] md:bg-orange-600/15 md:blur-[180px]" />
        </div>

        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to main content
        </a>
        <AppProviders>
          <div className="relative z-10">
            <SiteHeader />
            <main id="main" className="min-h-[60vh] pb-20 md:pb-0">
              {children}
            </main>
            <HideOnAdmin>
              <SiteFooter />
            </HideOnAdmin>
            <CartDrawer />
            <MobileBottomNav />
            <FloatingActions />
            <OrderStatusToast />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
