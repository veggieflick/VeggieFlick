import Image from "next/image";
import Link from "next/link";
import { Bike, Sparkles, Scissors, Truck, ShieldCheck, Star, UtensilsCrossed, ArrowRight } from "lucide-react";
import { catalogCounts, listCollection } from "@/lib/services/catalog";
import { ProductCard, ProductCarousel } from "@/components/product-card";
import { SectionHeading, Badge } from "@/components/ui/primitives";
import { AnimatedSection } from "@/components/ui/animated-section";
import { ComboKitsSection } from "@/components/combo-kits-section";
import { HeroDialogueHeading } from "@/components/hero-dialogue-heading";
import { FeedbackRatingSection } from "@/components/feedback-rating-section";

export const dynamic = "force-dynamic";

/** 4 Finalized Core Categories */
const CORE_CATEGORIES = [
  {
    id: "cat-veg-shopping",
    name: "Vegetables Shopping",
    slug: "vegetables-shopping",
    tagline: "Whole produce & precision-cut cooking packs",
    badge: "Whole & Pre-Cut",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
    gradient: "from-emerald-950/85 via-emerald-900/40 to-transparent",
    accent: "bg-emerald-700",
  },
  {
    id: "cat-fruit-salads",
    name: "Fruit Salads",
    slug: "fruit-salads",
    tagline: "Chilled, tossed fresh fruit bowls",
    badge: "Ready To Eat",
    image: "https://images.unsplash.com/photo-1519996529931-28324d5a630e?auto=format&fit=crop&w=800&q=80",
    gradient: "from-rose-950/85 via-rose-900/40 to-transparent",
    accent: "bg-rose-600",
  },
  {
    id: "cat-veg-salads",
    name: "Veg Salads",
    slug: "veg-salads",
    tagline: "Crisp greens & protein sprout mixes",
    badge: "Fresh & Crisp",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
    gradient: "from-teal-950/85 via-teal-900/40 to-transparent",
    accent: "bg-teal-700",
  },
  {
    id: "cat-fruits-cutting",
    name: "Fruits Cutting & Combo Pack",
    slug: "fruits-cutting-combo",
    tagline: "Pre-sliced fruit portions & family combo boxes",
    badge: "Zero Peeling",
    image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=800&q=80",
    gradient: "from-orange-950/85 via-orange-900/40 to-transparent",
    accent: "bg-orange-600",
  },
];

const PROCESS_STEPS = [
  { step: "01", title: "Select Produce", desc: "Choose whole vegetables, pre-cut packs, or tossed salads." },
  { step: "02", title: "Precision Cut", desc: "Freshly sliced, diced, or grated right after your order." },
  { step: "03", title: "Ozone Washed", desc: "Purified through ozonated water and sealed in eco trays." },
  { step: "04", title: "Flexible Slots", desc: "Convenient morning and evening delivery schedules." },
  { step: "05", title: "Cold Doorstep Drop", desc: "Delivered crisp within 10 km of our KK Nagar hub." },
];

const TESTIMONIALS = [
  {
    name: "Lakshmi S.",
    area: "51st St, KK Nagar",
    text: "The chopped sambar mix and peeled small onions save 25 minutes every single morning. Super fresh and clean!",
    rating: 5,
  },
  {
    name: "Rahul M.",
    area: "9th Sector, KK Nagar",
    text: "The chilled fruit salads arrive crisp and naturally sweet. No artificial additives, just pure fruit.",
    rating: 5,
  },
  {
    name: "Fathima N.",
    area: "Ashok Nagar",
    text: "The Sunday Biryani combo kit made cooking effortless. Everything was measured, clean, and delicious.",
    rating: 5,
  },
];

export default async function HomePage() {
  const [
    vegProducts,
    fruitSaladProducts,
    vegSaladProducts,
    fruitCuttingProducts,
    counts,
  ] = await Promise.all([
    listCollection({ category: "vegetables-shopping" }, 16, "popularity"),
    listCollection({ category: "fruit-salads" }, 8, "popularity"),
    listCollection({ category: "veg-salads" }, 8, "popularity"),
    listCollection({ category: "fruits-cutting-combo" }, 8, "popularity"),
    catalogCounts(),
  ]);

  // Separate Vegetables Shopping into Chopped/Cut and Fresh Whole
  const cutVegetables = vegProducts.filter((p) => p.isCutVegetable);
  const wholeVegetables = vegProducts.filter((p) => !p.isCutVegetable);

  return (
    <>
      {/* HERO SECTION - ELEGANT, SOFT TINT & CONCISE */}
      <section className="relative overflow-hidden pb-8 pt-4 md:py-14">
        {/* Subtle decorative glow accents with brand colors */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-emerald-200/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 top-32 h-96 w-96 rounded-full bg-orange-200/20 blur-3xl" />

        <div className="container-page grid items-center gap-8 py-4 md:py-6 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="brand" icon="fresh">
                {counts.productCount}+ Fresh Products
              </Badge>
              <span className="chip bg-emerald-100/90 font-extrabold text-emerald-950 border border-emerald-300/80 shadow-xs">
                ✨ Washed & Ready To Cook
              </span>
            </div>

            {/* Dynamic Rotating Quotes Title */}
            <div className="mt-3">
              <HeroDialogueHeading />
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
                <p className="text-[12px] font-black text-ink">Tomorrow · 06:00 – 08:00 AM</p>
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
            KK NAGAR HUB (10 KM RADIUS)
          </span>
          <span className="text-slate-300">
            · Transparent Market Rates · ₹15 Cut & Prep Fee · Express Cold Delivery
          </span>
        </span>
      </div>

      {/* CORE 4 CATEGORIES - PROMINENT LUXURY TILES */}
      <AnimatedSection className="container-page py-10 md:py-16">
        <SectionHeading
          eyebrow="Core Collections"
          title="Featured Categories"
          description="Select from our four dedicated fresh categories — precision-cut vegetables, chilled salads, and sliced fruit packs."
          href="/shop"
          linkLabel="Browse All"
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CORE_CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className="group relative flex h-72 flex-col justify-end overflow-hidden rounded-3xl border border-slate-200/90 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >
              {/* Background Image */}
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
                className="object-cover transition-transform duration-700 group-hover:scale-108"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${cat.gradient}`} />

              {/* Top Badge */}
              <div className="absolute top-3.5 left-3.5 z-10">
                <span className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-800 shadow-sm backdrop-blur">
                  {cat.badge}
                </span>
              </div>

              {/* Content */}
              <div className="relative z-10 p-5 text-white">
                <h3 className="text-xl font-extrabold tracking-tight text-white transition-colors group-hover:text-amber-300">
                  {cat.name}
                </h3>
                <p className="mt-1 text-xs text-white/85 line-clamp-2 leading-relaxed">
                  {cat.tagline}
                </p>

                <div className="mt-3.5 inline-flex items-center gap-1 text-xs font-bold text-amber-300 transition-transform group-hover:translate-x-1">
                  <span>Explore Aisle</span>
                  <ArrowRight size={13} strokeWidth={2.5} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </AnimatedSection>

      {/* 1. VEGETABLES SHOPPING SECTION */}
      <AnimatedSection id="vegetables-shopping" className="container-page py-10 md:py-16 scroll-mt-20">
        <SectionHeading
          eyebrow="Produce Aisle"
          title="Vegetables Shopping"
          description="Farm-fresh whole produce and precision-cut cooking packs washed in ozonated water and sealed for immediate cooking."
          href="/shop?category=vegetables-shopping"
          linkLabel="View All Vegetables"
        />

        {/* Sub-Showcase A: Chopped & Cut Vegetables (Highlighted) */}
        <div className="mb-10 rounded-3xl border border-amber-200/80 bg-gradient-to-br from-amber-50/50 via-white to-emerald-50/30 p-5 md:p-7 shadow-xs">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="chip bg-amber-100 text-amber-900 border border-amber-300/80 font-extrabold text-[10px] tracking-wider uppercase">
                <Scissors size={11} className="inline mr-1 text-amber-700" />
                Chopped & Cut Options
              </span>
              <h3 className="text-xl font-extrabold text-ink tracking-tight mt-1">
                Pre-Cut & Ready To Cook
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Precision diced, sliced, and peeled for instant cooking with zero prep waste.
              </p>
            </div>
            <Link
              href="/shop?category=vegetables-shopping&cut=true"
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1"
            >
              See all pre-cut options →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 md:gap-4">
            {cutVegetables.slice(0, 8).map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </div>

        {/* Sub-Showcase B: Fresh Whole Vegetables */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-ink">Daily Staples & Whole Produce</h3>
              <p className="text-xs text-slate-500">Graded farm vegetables for everyday meals.</p>
            </div>
            <Link
              href="/shop?category=vegetables-shopping"
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950"
            >
              All whole vegetables →
            </Link>
          </div>

          <ProductCarousel products={wholeVegetables.slice(0, 8)} />
        </div>
      </AnimatedSection>

      {/* 2. FRUIT SALADS SECTION */}
      <AnimatedSection id="fruit-salads" className="bg-surface/50 py-10 md:py-16 border-y border-line/60 scroll-mt-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="Tossed Bowls"
            title="Fruit Salads"
            description="Refreshing, nutrient-dense fruit bowls hand-tossed with fresh seasonal fruits. Chilled and ready to enjoy."
            href="/shop?category=fruit-salads"
            linkLabel="View All Fruit Salads"
          />
          <ProductCarousel products={fruitSaladProducts} />
        </div>
      </AnimatedSection>

      {/* 3. VEG SALADS SECTION */}
      <AnimatedSection id="veg-salads" className="container-page py-10 md:py-16 scroll-mt-20">
        <SectionHeading
          eyebrow="Crisp Greens"
          title="Veg Salads"
          description="Clean tossed vegetable mixes and protein-rich sprouts designed for light, nourishing daily meals."
          href="/shop?category=veg-salads"
          linkLabel="View All Veg Salads"
        />
        <ProductCarousel products={vegSaladProducts} />
      </AnimatedSection>

      {/* 4. FRUITS CUTTING & COMBO PACK SECTION */}
      <AnimatedSection id="fruits-cutting-combo" className="bg-surface/50 py-10 md:py-16 border-y border-line/60 scroll-mt-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="Freshly Sliced"
            title="Fruits Cutting & Combo Pack"
            description="Convenient pre-sliced fruit portions and family combo boxes with zero peeling, deseeding, or cleanup."
            href="/shop?category=fruits-cutting-combo"
            linkLabel="View All Fruit Packs"
          />
          <ProductCarousel products={fruitCuttingProducts} />
        </div>
      </AnimatedSection>

      {/* HOW IT WORKS SECTION - 5 CONCISE STEPS */}
      <AnimatedSection className="container-page py-12 md:py-16">
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-800">
            Simple & Hygienic Process
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            How VeggieFlick Works
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Zero mess in your kitchen. From cold prep hub to your doorstep in 5 quick steps.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {PROCESS_STEPS.map(({ step, title, desc }) => (
            <div
              key={step}
              className="card p-4.5 bg-white border border-slate-200/90 flex flex-col justify-between text-center relative group hover:border-emerald-300 hover:shadow-md transition-all rounded-2xl"
            >
              <span className="absolute top-3 right-3 text-xs font-black text-slate-300 group-hover:text-emerald-700">
                {step}
              </span>
              <span className="mx-auto mb-2.5 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100 font-extrabold text-sm">
                {step}
              </span>
              <h3 className="text-sm font-bold text-slate-900">{title}</h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </AnimatedSection>

      {/* 5. BOTTOM SECTION: DEDICATED RECIPE MEAL KITS COMBO */}
      <ComboKitsSection />

      {/* CUSTOMER REVIEWS */}
      <AnimatedSection className="bg-slate-950 py-12 text-white md:py-16 relative overflow-hidden">
        <div className="pointer-events-none absolute -left-20 top-0 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="container-page relative z-10">
          <div className="mb-8 text-center max-w-xl mx-auto">
            <p className="eyebrow text-amber-400 font-black uppercase tracking-widest">
              Verified Feedback
            </p>
            <h2 className="mt-1 text-2xl font-black tracking-tight md:text-3xl text-white">
              Loved by KK Nagar Households
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {TESTIMONIALS.map((item) => (
              <figure
                key={item.name}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur shadow-md"
              >
                <div className="mb-2 flex gap-1" aria-label={`${item.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={13}
                      strokeWidth={2}
                      className={
                        i < item.rating ? "fill-amber-400 text-amber-400" : "text-white/20"
                      }
                    />
                  ))}
                </div>
                <blockquote className="text-[13px] font-medium leading-relaxed text-slate-200">
                  &ldquo;{item.text}&rdquo;
                </blockquote>
                <figcaption className="mt-3 text-[11px] font-bold tracking-wider text-emerald-400 uppercase">
                  {item.name} · {item.area}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* FEEDBACK & RATINGS SECTION */}
      <FeedbackRatingSection />

      {/* WHATSAPP CONTACT & CTA BANNER */}
      <AnimatedSection className="container-page pb-14 pt-8">
        <div className="card grid items-center gap-6 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 p-6 md:grid-cols-2 md:p-8 text-white rounded-3xl border border-emerald-800/80 shadow-2xl">
          <div>
            <span className="chip bg-emerald-800/80 text-emerald-200 border border-emerald-700/60 font-black text-[10px] uppercase tracking-widest">
              Direct Order Support
            </span>
            <h2 className="mt-2 text-xl font-black tracking-tight md:text-2xl text-white">
              Need Custom Cutting or Subscriptions?
            </h2>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed max-w-md">
              Chat directly with our KK Nagar Hub team on WhatsApp for custom vegetable cutting styles, weekly subscriptions, or quick order assistance.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 md:justify-end">
            <a
              href="https://wa.me/919840012345?text=Hi%20VeggieFlick%20KK%20Nagar!%20I%20have%20an%20inquiry%20about%20my%20order."
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-6 py-3.5 text-sm w-full sm:w-auto shadow-lg shadow-emerald-900/50"
            >
              <svg className="h-4 w-4 fill-current mr-2" viewBox="0 0 24 24">
                <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.758.459 3.474 1.33 4.982l-1.413 5.163 5.285-1.386c1.455.794 3.09 1.213 4.784 1.214h.004c5.505 0 9.988-4.478 9.989-9.985 0-2.668-1.038-5.176-2.924-7.062-1.887-1.886-4.395-2.924-7.065-2.924zm0 18.232h-.003c-1.493 0-2.957-.401-4.233-1.157l-.304-.18-3.147.825.84-3.067-.197-.314c-.832-1.325-1.272-2.862-1.272-4.437 0-4.509 3.67-8.178 8.18-8.178 2.184 0 4.238.85 5.783 2.396 1.545 1.545 2.395 3.6 2.394 5.784 0 4.51-3.669 8.18-8.177 8.18z"/>
              </svg>
              Chat on WhatsApp
            </a>
            <Link
              href="/subscriptions"
              className="btn btn-outline border-slate-700 bg-white/10 text-white font-bold px-5 py-3.5 text-sm hover:bg-white/20 w-full sm:w-auto"
            >
              View Subscriptions
            </Link>
          </div>
        </div>
      </AnimatedSection>
    </>
  );
}
