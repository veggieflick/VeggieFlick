import Image from "next/image";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { Bike, Leaf, ShieldCheck, Sparkles, Star, Truck } from "lucide-react";
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

const WHY_US = [
  { Icon: Leaf, title: "Harvested at 4 AM", body: "Sourced daily from Koyambedu and partner farms in Ooty, Hosur and Thiruvallur." },
  { Icon: Truck, title: "Slot delivery in Chennai", body: "Six insulated delivery slots a day with live temperature-controlled tracking." },
  { Icon: ShieldCheck, title: "Double quality check", body: "Graded at farm gate & re-inspected at hub. Nothing over 24 hours ever ships." },
  { Icon: Sparkles, title: "Instant wallet refunds", body: "Not 100% delighted? Zero-questions instant credit to your VeggieFlick wallet." },
];

const TESTIMONIALS = [
  { name: "Lakshmi Subramanian", area: "Anna Nagar", text: "The keerai actually snaps when you bend it — that never happens with other apps. Sambar kit is a lifesaver on weeknights.", rating: 5 },
  { name: "Rahul Menon", area: "OMR Thoraipakkam", text: "Ordered at 9 PM, got my slot at 6 AM the next morning. Alphonso mangoes were exactly as promised, no chemical smell.", rating: 5 },
  { name: "Fathima Noor", area: "T. Nagar", text: "Cut vegetables save me 20 minutes every morning. Clean packaging and unbeatable farm prices.", rating: 5 },
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
      { id: "r-1", title: "Classic Arachuvitta Sambar", slug: "classic-arachuvitta-sambar", emoji: "soup", summary: "Freshly ground sambar podi transforms an everyday sambar into a Sunday special.", preparationTime: 15, cookingTime: 30, difficulty: "Easy" },
      { id: "r-2", title: "Keerai Masiyal With Garlic Tempering", slug: "keerai-masiyal-with-garlic-tempering", emoji: "leafy", summary: "A five-ingredient comfort dish that pairs with rice, roti or idli.", preparationTime: 10, cookingTime: 15, difficulty: "Easy" },
      { id: "r-3", title: "Roasted Broccoli And Bell Pepper Toss", slug: "roasted-broccoli-and-bell-pepper-toss", emoji: "broccoli", summary: "A ten-minute high-protein side that keeps its crunch.", preparationTime: 10, cookingTime: 10, difficulty: "Easy" },
      { id: "r-4", title: "Chennai Sunday Vegetable Biryani", slug: "chennai-sunday-vegetable-biryani", emoji: "rice", summary: "Seeraga samba rice, mint and a kit that removes all the prep work.", preparationTime: 30, cookingTime: 35, difficulty: "Medium" }
    ];
  }

  if (blogRows.length === 0) {
    blogRows = [
      { id: "b-1", title: "How VeggieFlick Keeps Vegetables Farm Fresh For 24 Hours", slug: "how-veggieflick-keeps-vegetables-farm-fresh", emoji: "delivery", shortDescription: "From a 4 AM harvest to your kitchen before lunch — inside our Chennai cold chain." },
      { id: "b-2", title: "Seasonal Eating In Tamil Nadu: A Month By Month Guide", slug: "seasonal-eating-in-tamil-nadu", emoji: "calendar", shortDescription: "What to buy, when to buy it, and why seasonal produce always tastes better." },
      { id: "b-3", title: "Storing Greens So They Last Three Days Longer", slug: "storing-greens-so-they-last-three-days-longer", emoji: "leafy", shortDescription: "The wet-cloth method, the box trick, and mistakes that wilt your keerai overnight." }
    ];
  }

  return (
    <>
      {/* HERO SECTION WITH LUXURY SOFT BLUE TO EMERALD GRADIENT & DYNAMIC HERO QUOTES HEADING */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#e0f2fe] via-[#f0f9ff] to-white pb-8 pt-4 md:py-16">
        {/* Ambient glows */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-emerald-200/35 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 top-40 h-96 w-96 rounded-full bg-sky-200/40 blur-3xl" />

        <div className="container-page grid items-center gap-10 py-6 md:py-8 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="brand" icon="fresh">
                {counts.productCount}+ products · Chennai only
              </Badge>
              <span className="chip bg-emerald-100/90 font-extrabold text-emerald-950 border border-emerald-300/80 shadow-xs">
                ✨ 10-Min Prep Ready Kits
              </span>
            </div>

            {/* Dynamic Rotating Quotes Title */}
            <div className="mt-4">
              <HeroDialogueHeading />
            </div>

            <p className="mt-3 max-w-xl text-[16px] md:text-[17px] leading-relaxed text-slate-600">
              Vegetables, fruits, pre-cut veggies and 10-minute ready-to-cook meal kits picked at dawn from Tamil Nadu farms — delivered directly to your Chennai doorstep.
            </p>

            {/* EMBOSSED DYNAMIC CHEF DIALOGUE SLIDER */}
            <ChefDialogueSlider />

            <div className="mt-7 flex flex-wrap gap-3.5">
              <Link href="/shop" className="btn btn-primary shadow-xl shadow-emerald-700/25 px-6 py-3.5 text-sm md:text-base font-bold transition-transform hover:scale-[1.02] active:scale-[0.98]">
                Shop Today&apos;s Harvest
              </Link>
              <Link href="/shop?freshToday=true" className="btn btn-outline bg-white/95 backdrop-blur px-5 py-3.5 text-sm md:text-base font-bold shadow-sm hover:bg-emerald-50/50">
                Fresh Today Collection
              </Link>
            </div>

            <dl className="mt-8 grid max-w-lg grid-cols-3 gap-3">
              {[
                { label: "Delivery Radius", value: "25 km" },
                { label: "Daily Slots", value: "6 Slots" },
                { label: "Organic SKUs", value: `${counts.organicCount}+` },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-sky-100 bg-white/90 px-3.5 py-3 shadow-xs">
                  <dt className="text-[10px] font-bold tracking-widest text-muted uppercase">
                    {stat.label}
                  </dt>
                  <dd className="mt-1 text-[19px] md:text-[21px] font-extrabold tracking-tight text-ink">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border-4 border-white shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=80"
                alt="Basket of fresh Indian vegetables and fruits"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 620px"
                className="object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-sm shadow-sm">
                  Fresh Daily Harvest
                </span>
                <p className="mt-2 text-sm font-semibold text-white/95">Ooty Carrots, Country Tomatoes, Alphonso Mangoes & Leafy Greens</p>
              </div>
            </div>

            <div className="card absolute -bottom-5 left-4 flex items-center gap-3 border border-sky-100 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-md md:left-8">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
                <Bike size={19} strokeWidth={1.8} />
              </span>
              <div>
                <p className="text-[11px] font-medium text-muted">Next available slot</p>
                <p className="text-[13px] font-bold text-ink">Tomorrow · 06:00 – 08:00 AM</p>
              </div>
            </div>

            <div className="card absolute -top-4 right-4 hidden items-center gap-2 border border-emerald-100 bg-white/95 px-3.5 py-2 shadow-md md:flex backdrop-blur-md">
              <span className="text-emerald-700">
                <Leaf size={15} strokeWidth={2} />
              </span>
              <span className="text-[12px] font-bold text-emerald-950">Farm Fresh Across Chennai</span>
            </div>
          </div>
        </div>
      </section>

      {/* FREE DELIVERY BANNER */}
      <div className="bg-[#e6f9f3] border-y border-[#b2edd6] py-3 text-center text-xs md:text-sm font-black text-[#00684a] shadow-xs">
        🚀 <span className="tracking-wide uppercase font-black">FREE EXPRESS DELIVERY</span> on all orders above ₹199 across Chennai!
      </div>

      {/* CATEGORIES */}
      <AnimatedSection className="container-page py-10 md:py-14">
        <SectionHeading
          eyebrow="Shop by category"
          title="Everything fresh, sorted for you"
          description="Curated aisles designed around how Chennai kitchens actually cook."
          href="/shop"
        />
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4 lg:grid-cols-8">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/shop?category=${category.slug}`}
              className="card card-lift flex flex-col items-center gap-3 p-4 text-center border-sky-100/70 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 bg-white/90"
            >
              <CategoryIconTile icon={category.icon} accent={category.accent} size={56} />
              <span className="text-[13px] font-extrabold text-slate-800 leading-tight">{category.name}</span>
            </Link>
          ))}
        </div>
      </AnimatedSection>

      {/* SMART COOKING MEAL KITS COMBOS */}
      <ComboKitsSection />

      {/* FLASH SALE */}
      {flashSale.length > 0 && (
        <AnimatedSection className="bg-surface py-14 md:py-16 border-y border-line/40">
          <div className="container-page">
            <SectionHeading
              eyebrow="Flash sale · Today only"
              title="Biggest savings of the day"
              description="Deep discounts on surplus-fresh crates. Limited daily availability."
              href="/shop?sort=discount"
            />
            <ProductCarousel products={flashSale} />
          </div>
        </AnimatedSection>
      )}

      {/* BEST SELLERS */}
      <AnimatedSection className="container-page py-14 md:py-16">
        <SectionHeading
          eyebrow="Popular in Chennai"
          title="Most shopped near you"
          description="Daily fresh staples delivered to thousands of Chennai kitchens every morning."
          href="/shop?bestSeller=true"
        />
        <ProductCarousel products={bestSellers} />
      </AnimatedSection>

      {/* FRESH TODAY */}
      {freshToday.length > 0 && (
        <AnimatedSection className="container-page py-14 md:py-16">
          <SectionHeading
            eyebrow="Fresh today"
            title="Harvested this morning"
            description="Crates that landed at our Koyambedu hub before sunrise."
            href="/shop?freshToday=true"
          />
          <div className="grid grid-cols-2 gap-3.5 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
            {freshToday.slice(0, 8).map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </AnimatedSection>
      )}

      {/* WHY US */}
      <AnimatedSection className="bg-emerald-950 py-16 md:py-20 text-white relative overflow-hidden">
        <div className="pointer-events-none absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="container-page relative z-10">
          <div className="mb-10 text-center max-w-2xl mx-auto">
            <span className="chip bg-emerald-900/80 text-emerald-300 border border-emerald-700/60 font-extrabold text-[11px] uppercase tracking-widest mb-3">
              ✨ Why VeggieFlick
            </span>
            <h2 className="text-balance text-3xl font-extrabold tracking-tight text-white md:text-4xl mt-1">
              Freshness is an operations problem. We solved it.
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-emerald-200/80">
              A cold chain built for Chennai&apos;s climate, strictly enforced with our 24-hour freshness rule.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {WHY_US.map(({ Icon, title, body }) => (
              <div key={title} className="rounded-3xl border border-emerald-800/60 bg-emerald-900/40 p-6 backdrop-blur transition-transform hover:-translate-y-1 hover:border-emerald-500/40">
                <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-300">
                  <Icon size={22} strokeWidth={1.8} />
                </span>
                <h3 className="text-[16px] font-bold tracking-tight text-white">{title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-emerald-200/70">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ORGANIC */}
      {organic.length > 0 && (
        <AnimatedSection className="container-page py-14 md:py-16">
          <SectionHeading
            eyebrow="Certified organic"
            title="Zero pesticide, full flavour"
            description="Jaivik Bharat certified growers from Krishnagiri, Ooty and Vellore."
            href="/shop?organic=true"
          />
          <ProductCarousel products={organic} />
        </AnimatedSection>
      )}

      {/* EXOTIC */}
      {exotic.length > 0 && (
        <AnimatedSection className="container-page py-14 md:py-16">
          <SectionHeading
            eyebrow="Exotic & continental"
            title="For the gourmet kitchen"
            description="Broccoli, zucchini, coloured peppers and cherry tomatoes from the Nilgiris."
            href="/shop?category=exotic-vegetables"
          />
          <ProductCarousel products={exotic} />
        </AnimatedSection>
      )}

      {/* RECIPES */}
      <AnimatedSection className="container-page py-14 md:py-16">
        <SectionHeading
          eyebrow="Cook with us"
          title="Recipes built around today's basket"
          description="Simple South Indian and continental recipes using produce you already ordered."
          href="/recipes"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {recipeRows.map((recipe) => {
            const Icon = lookupIcon(recipe.emoji);
            return (
              <Link key={recipe.id} href={`/recipes/${recipe.slug}`} className="card card-lift overflow-hidden bg-white/90">
                <div className="relative aspect-[4/3] bg-emerald-50/50 flex items-center justify-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
                    <Icon size={32} strokeWidth={1.5} />
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="line-clamp-1 text-[15px] font-bold text-ink">{recipe.title}</h3>
                  <p className="mt-1.5 line-clamp-2 text-[12px] text-muted">{recipe.summary}</p>
                  <p className="mt-3 text-[10px] font-bold tracking-widest text-emerald-800 uppercase">
                    {recipe.preparationTime + recipe.cookingTime} min · {recipe.difficulty}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </AnimatedSection>

      {/* TESTIMONIALS */}
      <AnimatedSection className="bg-slate-950 py-16 text-white md:py-20 relative overflow-hidden">
        <div className="pointer-events-none absolute -left-20 top-0 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="container-page relative z-10">
          <div className="mb-10 text-center">
            <p className="eyebrow text-amber-400 font-extrabold uppercase tracking-widest">Customer love</p>
            <h2 className="mt-2 text-balance text-3xl font-extrabold tracking-tight md:text-4xl text-white">
              Rated 4.8 by 12,400+ Chennai households
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((item) => (
              <figure
                key={item.name}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur shadow-lg transition-transform hover:-translate-y-1"
              >
                <div className="mb-3 flex gap-1" aria-label={`${item.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={15}
                      strokeWidth={1.8}
                      className={i < item.rating ? "fill-amber-400 text-amber-400" : "text-white/20"}
                    />
                  ))}
                </div>
                <blockquote className="text-[14px] leading-relaxed text-slate-200">
                  &ldquo;{item.text}&rdquo;
                </blockquote>
                <figcaption className="mt-5 text-[12px] font-bold tracking-wider text-emerald-400 uppercase">
                  {item.name} · {item.area}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* BLOG */}
      <AnimatedSection className="container-page py-14 md:py-16">
        <SectionHeading eyebrow="Healthy living" title="From the VeggieFlick journal" href="/blog" />
        <div className="grid gap-4 md:grid-cols-3">
          {blogRows.map((blog) => {
            const Icon = lookupIcon(blog.emoji);
            return (
              <Link key={blog.id} href={`/blog/${blog.slug}`} className="card card-lift overflow-hidden bg-white/90">
                <div className="relative aspect-[16/9] bg-emerald-50/40 flex items-center justify-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
                    <Icon size={26} strokeWidth={1.5} />
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="line-clamp-2 text-[14px] font-bold text-ink">{blog.title}</h3>
                  <p className="mt-1.5 line-clamp-2 text-[12px] text-muted">{blog.shortDescription}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </AnimatedSection>

      {/* NEWSLETTER CTA */}
      <AnimatedSection className="container-page pb-16">
        <div className="card grid items-center gap-6 bg-gradient-to-r from-emerald-900 to-emerald-950 p-6 md:grid-cols-2 md:p-10 text-white rounded-3xl border border-emerald-800/80 shadow-2xl">
          <div>
            <span className="chip bg-emerald-800/80 text-emerald-200 border border-emerald-700/60 font-extrabold text-[11px] uppercase tracking-widest">
              ✨ Fresh Drops
            </span>
            <h2 className="mt-2 text-balance text-2xl font-extrabold tracking-tight md:text-3xl text-white">
              Get Friday&apos;s fresh drop first
            </h2>
            <p className="mt-3 text-[14px] leading-relaxed text-emerald-100/80">
              Weekly seasonal picks, chef recipes, and exclusive subscriber deals delivered straight to your inbox.
            </p>
            <ul className="mt-5 flex flex-wrap gap-4 text-[12px] font-semibold text-emerald-200">
              <li className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-400" /> Secure checkout
              </li>
              <li className="flex items-center gap-1.5">
                <Bike size={14} className="text-emerald-400" /> Free delivery &gt; ₹199
              </li>
              <li className="flex items-center gap-1.5">
                <Leaf size={14} className="text-emerald-400" /> 100% Farm fresh
              </li>
            </ul>
          </div>
          <NewsletterForm variant="hero" />
        </div>
      </AnimatedSection>
    </>
  );
}
