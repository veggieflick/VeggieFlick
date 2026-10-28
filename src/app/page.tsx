import Image from "next/image";
import Link from "next/link";
import { Bike, Sparkles, Scissors, Truck, ArrowRight, MessageCircle } from "lucide-react";
import { listCollection, catalogCounts } from "@/lib/services/catalog";
import { ProductCard } from "@/components/product-card";
import { SectionHeading, Badge } from "@/components/ui/primitives";
import { AnimatedSection } from "@/components/ui/animated-section";
import { ComboKitsSection } from "@/components/combo-kits-section";
import { HeroDialogueHeading } from "@/components/hero-dialogue-heading";
import { CORE_CATEGORIES } from "@/lib/data/all-products";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [
    choppedVegProducts,
    fruitProducts,
    sproutsProducts,
    counts,
  ] = await Promise.all([
    listCollection({ category: "chopped-vegetables" }, 10, "popularity"),
    listCollection({ category: "chopped-fruits" }, 6, "popularity"),
    listCollection({ category: "sprouts" }, 4, "popularity"),
    catalogCounts(),
  ]);

  return (
    <>
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pb-8 pt-4 md:py-14">
        {/* Subtle decorative glow accents with brand colors */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-emerald-200/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 top-32 h-96 w-96 rounded-full bg-orange-200/20 blur-3xl" />

        <div className="container-page grid items-center gap-8 py-4 md:py-6 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="brand" icon="fresh">
                {counts.productCount || 26}+ Fresh Products
              </Badge>
              <span className="chip bg-emerald-100/90 font-extrabold text-emerald-950 border border-emerald-300/80 shadow-xs">
                ✨ Washed & Ready To Cook
              </span>
            </div>

            {/* Dynamic Rotating Quotes Title */}
            <div className="mt-3">
              <HeroDialogueHeading />
            </div>

            <p className="mt-3 text-sm text-slate-600 leading-relaxed max-w-xl">
              100% kitchen-ready produce delivered across KK Nagar and Chennai doorsteps. Save 25 minutes of peeling and cutting every morning.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link
                href="/shop?category=chopped-vegetables"
                className="btn btn-primary bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow-md inline-flex items-center gap-2"
              >
                <span>Shop Chopped Vegetables</span>
                <ArrowRight size={14} />
              </Link>
              <Link
                href="/offers"
                className="btn btn-outline border-slate-300 bg-white text-slate-800 hover:bg-emerald-50 text-xs font-bold px-4 py-3 rounded-xl shadow-xs"
              >
                View Offers & Deals
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border-4 border-white shadow-2xl">
              <Image
                src="/images/chopped-veggies-platter.jpg"
                alt="Freshly chopped vegetables platter"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 620px"
                className="object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="rounded-full bg-emerald-500/90 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest backdrop-blur-sm shadow-sm">
                  Daily Fresh
                </span>
                <p className="mt-1 text-xs font-bold text-white/95">
                  Cleaned, Cut & Delivered Across KK Nagar Doorsteps
                </p>
              </div>
            </div>

            <div className="card absolute -bottom-4 left-4 flex items-center gap-3 border border-emerald-100 bg-white/95 px-4 py-2.5 shadow-xl backdrop-blur-md md:left-8">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
                <Bike size={18} strokeWidth={2} />
              </span>
              <div>
                <p className="text-[10px] font-bold text-muted uppercase tracking-wider">
                  Next Available Slot
                </p>
                <p className="text-[12px] font-black text-ink">Today / Tomorrow · 06:00 – 08:00 AM</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EXPRESS DELIVERY BANNER */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 py-3 text-center text-xs md:text-sm font-bold text-white border-y border-emerald-700/40">
        <span className="inline-flex items-center gap-2">
          <Truck size={15} className="text-emerald-400" />
          <span className="tracking-wide uppercase text-amber-400 font-extrabold">
            KK NAGAR HUB (25 KM CHENNAI SERVICE RADIUS)
          </span>
          <span className="text-slate-300">
            · Transparent Market Rates · Pre-Cut Zero Prep Waste · Express Delivery
          </span>
        </span>
      </div>

      {/* 1. CORE 7 CATEGORIES SHOWCASE */}
      <AnimatedSection className="container-page py-10 md:py-14">
        <SectionHeading
          eyebrow="Produce Aisles"
          title="Featured Categories"
          description="Select from our 7 core fresh categories — from ready-to-cook vegetables and fresh cut fruits to natural germinated sprouts, recipe combo kits, and fresh salads."
          href="/shop"
          linkLabel="Browse All Categories"
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CORE_CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className={`group relative flex h-52 flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br ${cat.gradient} border border-emerald-800/40 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl`}
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white backdrop-blur">
                  {cat.badge}
                </span>
                <span className="text-3xl transition-transform duration-300 group-hover:scale-125">
                  {cat.emoji}
                </span>
              </div>

              {/* Content */}
              <div className="relative z-10 text-white">
                <h3 className="text-lg font-black tracking-tight text-white transition-colors group-hover:text-amber-300">
                  {cat.name}
                </h3>
                <p className="text-[11px] font-semibold text-emerald-200/90">{cat.tamilName}</p>
                <p className="mt-1 text-xs text-white/80 line-clamp-2 leading-relaxed">
                  {cat.tagline}
                </p>

                <div className="mt-2.5 inline-flex items-center gap-1 text-xs font-bold text-amber-300 transition-transform group-hover:translate-x-1">
                  <span>Explore Aisle</span>
                  <ArrowRight size={13} strokeWidth={2.5} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </AnimatedSection>

      {/* 2. CHOPPED VEGETABLE SECTION */}
      <AnimatedSection id="chopped-vegetables" className="container-page py-8 md:py-12 scroll-mt-20">
        <SectionHeading
          eyebrow="Ready-To-Cook Produce"
          title="Chopped Vegetables"
          description="Farm-fresh produce precision-cut, washed in ozonated water, and vacuum-sealed for immediate pan-ready cooking with zero prep waste."
          href="/shop?category=chopped-vegetables"
          linkLabel="View All Cut Veggies"
        />

        <div className="mb-8 rounded-3xl border border-amber-200/80 bg-gradient-to-br from-amber-50/50 via-white to-emerald-50/30 p-5 md:p-7 shadow-xs">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="chip bg-amber-100 text-amber-900 border border-amber-300/80 font-extrabold text-[10px] tracking-wider uppercase">
                <Scissors size={11} className="inline mr-1 text-amber-700" />
                Pre-Cut Ready To Cook
              </span>
              <h3 className="text-xl font-extrabold text-ink tracking-tight mt-1">
                Zero Kitchen Mess, Instant Cooking
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Cauliflower florets, diced carrots, chopped beans, peeled shallots & garlic.
              </p>
            </div>
            <Link
              href="/shop?category=chopped-vegetables"
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1"
            >
              See all chopped vegetables →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 md:gap-4">
            {choppedVegProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* 3. RECIPE MEAL KITS COMBO (KG-WISE SELECTOR & WHATSAPP) */}
      <ComboKitsSection />

      {/* 4. WHATSAPP DIRECT ORDER & SUPPORT BANNER */}
      <AnimatedSection className="container-page pb-14 pt-6">
        <div className="card grid items-center gap-6 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 p-6 md:grid-cols-2 md:p-8 text-white rounded-3xl border border-emerald-800/80 shadow-2xl">
          <div>
            <span className="chip bg-emerald-800/80 text-emerald-200 border border-emerald-700/60 font-black text-[10px] uppercase tracking-widest">
              Direct Order Support
            </span>
            <h2 className="mt-2 text-xl font-black tracking-tight md:text-2xl text-white">
              Need Custom Cutting Proportions or Special Combos?
            </h2>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed max-w-md">
              Chat directly with our KK Nagar Hub prep team on WhatsApp for custom cut styles, weekly recurring vegetable deliveries, or quick order assistance.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 md:justify-end">
            <a
              href="https://wa.me/919840532826?text=Hi%20VeggieFlick%20KK%20Nagar!%20I%20have%20an%20inquiry%20about%20custom%20vegetable%20cutting%20or%20combos."
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-6 py-3.5 text-sm w-full sm:w-auto shadow-lg shadow-emerald-900/50 inline-flex items-center justify-center gap-2"
            >
              <MessageCircle size={17} />
              <span>Chat on WhatsApp (+91 98405 32826)</span>
            </a>
            <Link
              href="/offers"
              className="btn btn-outline border-slate-700 bg-white/10 text-white font-bold px-5 py-3.5 text-sm hover:bg-white/20 w-full sm:w-auto text-center"
            >
              View Offers & Deals
            </Link>
          </div>
        </div>
      </AnimatedSection>
    </>
  );
}
