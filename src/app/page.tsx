import Image from "next/image";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { Bike, Leaf, ShieldCheck, Sparkles, Star, Truck, Zap, Scissors, Clock } from "lucide-react";
import { db } from "@/db";
import { blogs, recipes } from "@/db/schema";
import { catalogCounts, listCategories, listCollection } from "@/lib/services/catalog";
import { ProductCard, ProductCarousel } from "@/components/product-card";
import { NewsletterForm } from "@/components/newsletter-form";
import { CategoryIconTile, SectionHeading, Badge } from "@/components/ui/primitives";
import { AnimatedSection } from "@/components/ui/animated-section";
import { lookupIcon } from "@/lib/icons";
import { ComboKitsSection } from "@/components/combo-kits-section";
import { HeroDialogueHeading } from "@/components/hero-dialogue-heading";
import { ChefDialogueSlider } from "@/components/chef-dialogue-slider";

export const dynamic = "force-dynamic";

const INFOGRAPHIC_METRICS = [
  { stat: "04:00 AM", label: "Dawn Harvest", desc: "Picked daily from Tamil Nadu farms", icon: Leaf },
  { stat: "25 KM", label: "Cold Delivery", desc: "Insulated slots across Chennai", icon: Truck },
  { stat: "100%", label: "Quality Audit", desc: "Graded at farm & inspected at hub", icon: ShieldCheck },
  { stat: "INSTANT", label: "Wallet Refund", desc: "Zero-questions same-day credit", icon: Sparkles },
];

const TESTIMONIALS = [
  { name: "Lakshmi S.", area: "Anna Nagar", text: "The keerai is incredibly fresh. Sambar kit is a lifesaver on weeknights.", rating: 5 },
  { name: "Rahul M.", area: "OMR Thoraipakkam", text: "Got my slot at 6 AM. Fruits were 100% naturally ripened with zero chemical smell.", rating: 5 },
  { name: "Fathima N.", area: "T. Nagar", text: "Pre-cut veggies save 20 mins every morning. Clean packaging & farm prices.", rating: 5 },
];

export default async function HomePage() {
  const [categories, flashSale, bestSellers, freshToday, organic, exotic, counts] = await Promise.all([
    listCategories(),
    listCollection({ minDiscount: 20 }, 10, "discount"),
    listCollection({ bestSeller: "true" }, 10, "popularity"),
    listCollection({ freshToday: "true" }, 8, "newest"),
    listCollection({ organic: "true" }, 8, "popularity"),
    listCollection({ category: "exotic-vegetables" }, 8, "popularity"),
    catalogCounts(),
  ]);

  let recipeRows: any[] = [];
  try {
    recipeRows = await db.select().from(recipes).where(eq(recipes.status, "active")).orderBy(desc(recipes.createdAt)).limit(4);
  } catch (err) {
    console.warn("recipes fetch warning:", err);
  }

  let blogRows: any[] = [];
  try {
    blogRows = await db.select().from(blogs).where(eq(blogs.status, "active")).orderBy(desc(blogs.publishedAt)).limit(3);
  } catch (err) {
    console.warn("blogs fetch warning:", err);
  }

  if (recipeRows.length === 0) {
    recipeRows = [
      { id: "r-1", title: "Classic Arachuvitta Sambar", slug: "classic-arachuvitta-sambar", emoji: "soup", preparationTime: 15, cookingTime: 30, difficulty: "Easy" },
      { id: "r-2", title: "Keerai Masiyal With Garlic", slug: "keerai-masiyal-with-garlic-tempering", emoji: "leafy", preparationTime: 10, cookingTime: 15, difficulty: "Easy" },
      { id: "r-3", title: "Roasted Broccoli Toss", slug: "roasted-broccoli-and-bell-pepper-toss", emoji: "broccoli", preparationTime: 10, cookingTime: 10, difficulty: "Easy" },
      { id: "r-4", title: "Sunday Vegetable Biryani", slug: "chennai-sunday-vegetable-biryani", emoji: "rice", preparationTime: 30, cookingTime: 35, difficulty: "Medium" }
    ];
  }

  if (blogRows.length === 0) {
    blogRows = [
      { id: "b-1", title: "Inside Our 24-Hour Farm Cold Chain", slug: "how-veggieflick-keeps-vegetables-farm-fresh", emoji: "delivery" },
      { id: "b-2", title: "Seasonal Produce Guide", slug: "seasonal-eating-in-tamil-nadu", emoji: "calendar" },
      { id: "b-3", title: "3 Hacks To Keep Greens Fresh", slug: "storing-greens-so-they-last-three-days-longer", emoji: "leafy" }
    ];
  }

  return (
    <>
      {/* HERO SECTION - ULTRA MINIMAL & INFOGRAPHIC */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#e0f2fe] via-[#f0f9ff] to-white pb-8 pt-4 md:py-16">
        <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-emerald-200/35 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 top-40 h-96 w-96 rounded-full bg-sky-200/40 blur-3xl" />

        <div className="container-page grid items-center gap-8 py-4 md:py-6 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="brand" icon="fresh">
                {counts.productCount}+ Fresh Products
              </Badge>
              <span className="chip bg-emerald-100/90 font-extrabold text-emerald-950 border border-emerald-300/80 shadow-xs">
                ✨ 10-Min Meal Kits
              </span>
            </div>

            {/* Dynamic Rotating Quotes Title */}
            <div className="mt-3">
              <HeroDialogueHeading />
            </div>

            {/* Minimal Infographic Feature Strip - NO wordy body text */}
            <div className="mt-4 flex flex-wrap gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50/80 px-3 py-1.5 text-xs font-bold text-emerald-950">
                <Zap size={13} className="text-emerald-700" /> 10-Min Meal Kits
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50/80 px-3 py-1.5 text-xs font-bold text-teal-950">
                <Scissors size={13} className="text-teal-700" /> Pre-Cut Veggies
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50/80 px-3 py-1.5 text-xs font-bold text-amber-950">
                <Clock size={13} className="text-amber-700" /> 6 Delivery Slots
              </span>
            </div>

            {/* EMBOSSED INFOGRAPHIC PREP WIDGET */}
            <ChefDialogueSlider />

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/shop" className="btn btn-primary shadow-xl shadow-emerald-700/25 px-6 py-3.5 text-sm font-bold transition-transform hover:scale-[1.02] active:scale-[0.98]">
                Shop Harvest →
              </Link>
              <Link href="/shop?freshToday=true" className="btn btn-outline bg-white/95 backdrop-blur px-5 py-3.5 text-sm font-bold shadow-sm hover:bg-emerald-50/50">
                Fresh Today
              </Link>
            </div>

            {/* Infographic Stat Chips */}
            <dl className="mt-6 grid max-w-lg grid-cols-3 gap-2.5">
              {[
                { label: "Radius", value: "25 km" },
                { label: "Daily Slots", value: "6 Slots" },
                { label: "Organic SKUs", value: `${counts.organicCount}+` },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-sky-100 bg-white/90 px-3 py-2.5 shadow-xs text-center">
                  <dt className="text-[9px] font-black tracking-widest text-muted uppercase">
                    {stat.label}
                  </dt>
                  <dd className="mt-0.5 text-[18px] md:text-[20px] font-black tracking-tight text-ink">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border-4 border-white shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=80"
                alt="Fresh farm produce"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 620px"
                className="object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="rounded-full bg-emerald-500/90 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest backdrop-blur-sm shadow-sm">
                  Daily Harvest
                </span>
                <p className="mt-1 text-xs font-bold text-white/95">Farm Fresh Across Chennai Doorsteps</p>
              </div>
            </div>

            <div className="card absolute -bottom-4 left-4 flex items-center gap-3 border border-sky-100 bg-white/95 px-4 py-2.5 shadow-xl backdrop-blur-md md:left-8">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
                <Bike size={18} strokeWidth={2} />
              </span>
              <div>
                <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Next Available Slot</p>
                <p className="text-[12px] font-black text-ink">Tomorrow · 06:00 – 08:00 AM</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EXPRESS DELIVERY BANNER WITH TRANSPARENT RATES */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 py-3 text-center text-xs md:text-sm font-bold text-white border-y border-emerald-700/40">
        <span className="inline-flex items-center gap-2">
          <Truck size={15} className="text-emerald-400" />
          <span className="tracking-wide uppercase text-amber-400 font-extrabold">K K NAGAR HUB (10 KM RADIUS)</span>
          <span className="text-slate-300">· Transparent Market Pricing + ₹15 Cut & Prep Fee + ₹29 Express Delivery</span>
        </span>
      </div>

      {/* CATEGORIES */}
      <AnimatedSection className="container-page py-8 md:py-12">
        <SectionHeading
          eyebrow="Aisles"
          title="Fresh Categories"
          href="/shop"
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/shop?category=${category.slug}`}
              className="card card-lift flex flex-col items-center gap-2.5 p-3.5 text-center border-sky-100/70 hover:border-emerald-300 hover:shadow-lg transition-all bg-white/90"
            >
              <CategoryIconTile icon={category.icon} accent={category.accent} size={52} />
              <span className="text-[12px] font-black text-slate-800 leading-tight">{category.name}</span>
            </Link>
          ))}
        </div>
      </AnimatedSection>

      {/* HOW IT WORKS SECTION - 5 SIMPLE STEPS */}
      <AnimatedSection className="bg-slate-50 py-12 border-y border-slate-200/80">
        <div className="container-page">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-800">
              Simple & Hygienic Process
            </span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              How Veggie Flick Works
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { step: "01", title: "Choose Vegetables", desc: "Select from 30+ freshly chopped produce & fruit bowls", icon: ShoppingBag },
              { step: "02", title: "We Freshly Cut Them", desc: "Precision cut, diced or shredded after your order", icon: Scissors },
              { step: "03", title: "We Pack Hygienically", desc: "Ozonated wash & sealed food-grade eco trays", icon: ShieldCheck },
              { step: "04", title: "Choose Delivery", desc: "Select same-day express slot or subscription schedule", icon: Clock },
              { step: "05", title: "Receive at Doorstep", desc: "Delivered cold & fresh within 10 KM of K.K. Nagar", icon: Truck },
            ].map(({ step, title, desc, icon: Icon }) => (
              <div key={step} className="card p-5 bg-white border border-slate-200/90 flex flex-col justify-between text-center relative group hover:border-emerald-300 transition-all">
                <span className="absolute top-3 right-3 text-xs font-black text-slate-300 group-hover:text-emerald-700">
                  {step}
                </span>
                <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-100">
                  <Icon size={20} strokeWidth={2} />
                </span>
                <h3 className="text-sm font-bold text-slate-900">{title}</h3>
                <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* SMART COOKING MEAL KITS COMBOS */}
      <ComboKitsSection />

      {/* FLASH SALE */}
      {flashSale.length > 0 && (
        <AnimatedSection className="bg-surface py-12 md:py-14 border-y border-line/40">
          <div className="container-page">
            <SectionHeading
              eyebrow="Flash Sale"
              title="Today's Savings"
              href="/shop?sort=discount"
            />
            <ProductCarousel products={flashSale} />
          </div>
        </AnimatedSection>
      )}

      {/* BEST SELLERS */}
      <AnimatedSection className="container-page py-12 md:py-14">
        <SectionHeading
          eyebrow="Popular"
          title="Most Shopped"
          href="/shop?bestSeller=true"
        />
        <ProductCarousel products={bestSellers} />
      </AnimatedSection>

      {/* FRESH TODAY */}
      {freshToday.length > 0 && (
        <AnimatedSection className="container-page py-12 md:py-14">
          <SectionHeading
            eyebrow="Morning Pick"
            title="Fresh Today"
            href="/shop?freshToday=true"
          />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
            {freshToday.slice(0, 8).map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </AnimatedSection>
      )}

      {/* INFOGRAPHIC WHY US SECTION */}
      <AnimatedSection className="bg-emerald-950 py-14 md:py-18 text-white relative overflow-hidden">
        <div className="pointer-events-none absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="container-page relative z-10">
          <div className="mb-8 text-center max-w-xl mx-auto">
            <span className="chip bg-emerald-900/80 text-emerald-300 border border-emerald-700/60 font-black text-[10px] uppercase tracking-widest mb-2">
              VeggieFlick Standard
            </span>
            <h2 className="text-balance text-2xl font-black tracking-tight text-white md:text-3xl mt-1">
              KK Nagar Operations & Quality Audit
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { stat: "05:00 AM", label: "Morning Harvest", desc: "Fresh arrival at KK Nagar Hub (9th Sector)", icon: Leaf },
              { stat: "10 KM", label: "Delivery Radius", desc: "Serving KK Nagar, Ashok Nagar, Vadapalani, MGR Nagar", icon: Truck },
              { stat: "100%", label: "Ozonated Wash", desc: "Hygienic cutting & sealed eco tray packaging", icon: ShieldCheck },
              { stat: "INSTANT", label: "WhatsApp Support", desc: "Direct ordering & slot tracking via WhatsApp", icon: Sparkles },
            ].map(({ stat, label, desc, icon: Icon }) => (
              <div key={label} className="rounded-3xl border border-emerald-800/70 bg-emerald-900/50 p-5 text-center backdrop-blur transition-transform hover:-translate-y-1">
                <span className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-300">
                  <Icon size={20} strokeWidth={2} />
                </span>
                <p className="text-2xl font-black tracking-tight text-amber-300">{stat}</p>
                <h3 className="mt-1 text-sm font-extrabold text-white">{label}</h3>
                <p className="mt-1 text-xs font-medium text-emerald-200/70">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ORGANIC */}
      {organic.length > 0 && (
        <AnimatedSection className="container-page py-12 md:py-14">
          <SectionHeading
            eyebrow="Certified"
            title="Zero Pesticide Organic"
            href="/shop?organic=true"
          />
          <ProductCarousel products={organic} />
        </AnimatedSection>
      )}

      {/* EXOTIC */}
      {exotic.length > 0 && (
        <AnimatedSection className="container-page py-12 md:py-14">
          <SectionHeading
            eyebrow="Gourmet"
            title="Exotic & Continental"
            href="/shop?category=exotic-vegetables"
          />
          <ProductCarousel products={exotic} />
        </AnimatedSection>
      )}

      {/* FEEDBACK & RATINGS SECTION */}
      <AnimatedSection className="bg-slate-950 py-14 text-white md:py-18 relative overflow-hidden">
        <div className="pointer-events-none absolute -left-20 top-0 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="container-page relative z-10">
          <div className="mb-8 text-center max-w-xl mx-auto">
            <p className="eyebrow text-amber-400 font-black uppercase tracking-widest">Customer Reviews</p>
            <h2 className="mt-1 text-balance text-2xl font-black tracking-tight md:text-3xl text-white">
              Rated 4.9 by K K Nagar Households
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { name: "Lakshmi S.", area: "51st St, K K Nagar", text: "The pre-cut sambar veggies save 25 mins every morning. Clean packaging and reasonable rates!", rating: 5 },
              { name: "Rahul M.", area: "9th Sector, K K Nagar", text: "Subscription order arrives exactly at 6:30 AM slot. Keerai is super fresh with zero wilted leaves.", rating: 5 },
              { name: "Fathima N.", area: "Ashok Nagar (KK Nagar Hub)", text: "Peeled small onion and garlic pouch is an absolute gamechanger. Highly recommend VeggieFlick!", rating: 5 },
            ].map((item) => (
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
                      className={i < item.rating ? "fill-amber-400 text-amber-400" : "text-white/20"}
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

      {/* WHATSAPP CONTACT & CTA BANNER */}
      <AnimatedSection className="container-page pb-14 pt-8">
        <div className="card grid items-center gap-6 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 p-6 md:grid-cols-2 md:p-8 text-white rounded-3xl border border-emerald-800/80 shadow-2xl">
          <div>
            <span className="chip bg-emerald-800/80 text-emerald-200 border border-emerald-700/60 font-black text-[10px] uppercase tracking-widest">
              Direct Order Support
            </span>
            <h2 className="mt-2 text-balance text-xl font-black tracking-tight md:text-2xl text-white">
              Need Help or Custom Cutting Orders?
            </h2>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed max-w-md">
              Chat directly with our K K Nagar Hub team on WhatsApp for custom bulk prep, special subscription inquiries, or order updates.
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
