export type FallbackBlog = {
  id: string;
  title: string;
  slug: string;
  emoji: string;
  author: string;
  shortDescription: string;
  content: string;
  publishedAt: Date;
  seoTitle?: string;
  seoDescription?: string;
};

export type FallbackRecipe = {
  id: string;
  title: string;
  slug: string;
  emoji: string;
  summary: string;
  ingredients: string[];
  instructions: string[];
  preparationTime: number;
  cookingTime: number;
  servings: number;
  difficulty: string;
  createdAt: Date;
};

export type FallbackCoupon = {
  couponCode: string;
  title: string;
  description: string;
  discountType: "fixed_amount" | "percentage" | "free_delivery";
  discountValue: string;
  minimumOrderAmount: string;
  maximumDiscount: string | null;
  expiryDate: Date;
};

export const FALLBACK_BLOGS: FallbackBlog[] = [
  {
    id: "blog-1",
    title: "How VeggieFlick Keeps Vegetables Farm Fresh For 24 Hours",
    slug: "how-veggieflick-keeps-vegetables-farm-fresh-for-24-hours",
    emoji: "delivery",
    author: "VeggieFlick Team",
    shortDescription: "From a 4 AM harvest to your kitchen before lunch — inside our Chennai cold chain.",
    content: `Freshness is a logistics problem before it is a quality problem.

Our day starts at 4 AM at the Koyambedu wholesale market and partner farms across Hosur, Ooty and Thiruvallur. Produce is graded twice — once at the farm gate and once at our Chennai hub — before it is washed in ozonated water and moved into a 4°C cold room.

Every crate carries a harvest timestamp. If a crate crosses 24 hours in our hub it never reaches a customer; it goes to our surplus donation partners instead. That single rule is why our leafy greens still snap when they reach you.

Delivery riders carry insulated bags with gel packs, so the last mile in Chennai heat does not undo a morning of careful handling.`,
    publishedAt: new Date("2026-03-01T06:00:00.000Z"),
    seoTitle: "How VeggieFlick Keeps Vegetables Farm Fresh For 24 Hours | VeggieFlick Blog",
    seoDescription: "From a 4 AM harvest to your kitchen before lunch — inside our Chennai cold chain.",
  },
  {
    id: "blog-2",
    title: "Seasonal Eating In Tamil Nadu: A Month By Month Guide",
    slug: "seasonal-eating-in-tamil-nadu-a-month-by-month-guide",
    emoji: "calendar",
    author: "Chef K. Sundaram",
    shortDescription: "What to buy, when to buy it, and why seasonal produce always tastes better.",
    content: `Eating seasonally is the cheapest upgrade you can make to your cooking.

January to March belongs to carrots, beetroot and citrus. April and May are mango months — Alphonso, Banganapalli and Imam Pasand arrive in that order. The monsoon brings gourds, greens and corn, while October to December is peak tomato, cauliflower and guava season.

Seasonal produce travels less, costs less and carries more nutrition because it is harvested at maturity rather than picked early for storage. Watch our Fresh Today collection — it always mirrors what is genuinely in season around Chennai.`,
    publishedAt: new Date("2026-03-10T06:00:00.000Z"),
    seoTitle: "Seasonal Eating In Tamil Nadu: A Month By Month Guide | VeggieFlick Blog",
    seoDescription: "What to buy, when to buy it, and why seasonal produce always tastes better.",
  },
  {
    id: "blog-3",
    title: "Storing Greens So They Last Three Days Longer",
    slug: "storing-greens-so-they-last-three-days-longer",
    emoji: "leafy",
    author: "Deepa Raman",
    shortDescription: "The wet-cloth method, the box trick, and mistakes that wilt your keerai overnight.",
    content: `Greens die of two things: moisture loss and moisture excess.

Step one, never wash keerai until you cook it. Step two, remove the rubber band — compressed stems bruise and rot. Step three, wrap the bunch loosely in a lightly damp cotton cloth and store it in an airtight box in the middle shelf of your fridge, not the crisper.

Done right, spinach and mulai keerai stay usable for three to four days instead of one. Herbs like coriander and mint do even better standing upright in a glass with an inch of water and a loose cover.`,
    publishedAt: new Date("2026-03-15T06:00:00.000Z"),
    seoTitle: "Storing Greens So They Last Three Days Longer | VeggieFlick Blog",
    seoDescription: "The wet-cloth method, the box trick, and mistakes that wilt your keerai overnight.",
  },
  {
    id: "blog-4",
    title: "Why Cut Vegetables Are The Weeknight Hack Chennai Needed",
    slug: "why-cut-vegetables-are-the-weeknight-hack-chennai-needed",
    emoji: "cut",
    author: "VeggieFlick Team",
    shortDescription: "Twenty minutes saved per meal, less waste, and the same nutrition when handled right.",
    content: `The average South Indian home spends 22 minutes a day just peeling and chopping.

Our cut vegetable range removes that step without compromising safety. Produce is washed in ozonated water, cut on sanitised stainless steel, chilled instantly and packed in food-grade trays with a same-day use-by date.

Nutrient loss in cut vegetables is real but small when the cold chain is unbroken — typically under 5% of vitamin C in the first 24 hours. Buy it, cook it the same day, and you get back nearly three hours a week.`,
    publishedAt: new Date("2026-03-20T06:00:00.000Z"),
    seoTitle: "Why Cut Vegetables Are The Weeknight Hack Chennai Needed | VeggieFlick Blog",
    seoDescription: "Twenty minutes saved per meal, less waste, and the same nutrition when handled right.",
  },
];

export const FALLBACK_RECIPES: FallbackRecipe[] = [
  {
    id: "rec-1",
    title: "Classic Arachuvitta Sambar",
    slug: "classic-arachuvitta-sambar",
    emoji: "soup",
    summary: "Freshly ground sambar podi transforms an everyday sambar into a Sunday special.",
    ingredients: [
      "1 Sambar Recipe Kit",
      "1 lemon-sized tamarind ball",
      "1 cup toor dal",
      "2 tbsp coconut oil",
      "Curry leaves and mustard for tempering",
      "Salt to taste",
    ],
    instructions: [
      "Pressure cook toor dal for 4 whistles until soft and mash well.",
      "Soak tamarind in hot water and extract thick pulp.",
      "Boil the cut vegetables from the kit with turmeric until fork tender.",
      "Add tamarind extract and the sambar podi pack, simmer for 8 minutes.",
      "Stir in mashed dal, adjust salt and simmer 5 more minutes.",
      "Temper mustard, curry leaves and hing in coconut oil and pour over.",
    ],
    preparationTime: 15,
    cookingTime: 30,
    servings: 4,
    difficulty: "Easy",
    createdAt: new Date("2026-03-01T06:00:00.000Z"),
  },
  {
    id: "rec-2",
    title: "Keerai Masiyal With Garlic Tempering",
    slug: "keerai-masiyal-with-garlic-tempering",
    emoji: "leafy",
    summary: "A five-ingredient comfort dish that pairs with rice, roti or idli.",
    ingredients: [
      "2 bunches Mulai Keerai",
      "6 garlic cloves, crushed",
      "2 dried red chillies",
      "1 tsp cumin",
      "2 tbsp sesame oil",
      "Salt to taste",
    ],
    instructions: [
      "Wash the greens thoroughly and chop roughly.",
      "Cook with a splash of water until fully wilted, about 6 minutes.",
      "Mash coarsely with a wooden masher.",
      "Heat sesame oil, splutter cumin, add garlic and red chillies.",
      "Pour the tempering over the mashed greens and mix.",
      "Serve hot with steamed rice and a spoon of ghee.",
    ],
    preparationTime: 10,
    cookingTime: 15,
    servings: 3,
    difficulty: "Easy",
    createdAt: new Date("2026-03-05T06:00:00.000Z"),
  },
  {
    id: "rec-3",
    title: "Roasted Broccoli And Bell Pepper Toss",
    slug: "roasted-broccoli-and-bell-pepper-toss",
    emoji: "broccoli",
    summary: "A ten-minute high-protein side that keeps its crunch.",
    ingredients: [
      "250 g Broccoli florets",
      "1 Coloured Capsicum Trio, sliced",
      "2 tbsp olive oil",
      "1 tsp crushed pepper",
      "1 tsp chilli flakes",
      "Juice of half a lemon",
    ],
    instructions: [
      "Blanch broccoli in salted water for 2 minutes, then shock in ice water.",
      "Heat olive oil in a wide pan on high heat.",
      "Add peppers first, toss for 2 minutes to keep them crisp.",
      "Add broccoli, pepper and chilli flakes, toss for 3 minutes.",
      "Finish with lemon juice and flaky salt off the heat.",
    ],
    preparationTime: 10,
    cookingTime: 10,
    servings: 2,
    difficulty: "Easy",
    createdAt: new Date("2026-03-12T06:00:00.000Z"),
  },
  {
    id: "rec-4",
    title: "Chennai Sunday Vegetable Biryani",
    slug: "chennai-sunday-vegetable-biryani",
    emoji: "rice",
    summary: "Seeraga samba rice, mint and a kit that removes all the prep work.",
    ingredients: [
      "1 Biryani Veg Kit",
      "2 cups seeraga samba rice",
      "1 cup thick curd",
      "3 tbsp ghee",
      "2 onions, sliced",
      "3 green chillies, slit",
    ],
    instructions: [
      "Soak the rice for 30 minutes and drain.",
      "Fry sliced onions in ghee until golden and set aside.",
      "Sauté the whole spice pouch, then the kit vegetables for 5 minutes.",
      "Add curd, mint-coriander and green chillies, cook for 4 minutes.",
      "Add rice and 3 cups water, cook on low for 12 minutes covered.",
      "Rest 10 minutes, fluff gently and top with birista.",
    ],
    preparationTime: 30,
    cookingTime: 35,
    servings: 4,
    difficulty: "Medium",
    createdAt: new Date("2026-03-18T06:00:00.000Z"),
  },
];

export const FALLBACK_COUPONS: FallbackCoupon[] = [
  {
    couponCode: "FRESH50",
    title: "₹50 off on orders above ₹499",
    description: "Flat ₹50 off for every Chennai customer on orders above ₹499.",
    discountType: "fixed_amount",
    discountValue: "50.00",
    minimumOrderAmount: "499.00",
    maximumDiscount: null,
    expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
  },
  {
    couponCode: "VEGGIE10",
    title: "10% off up to ₹120",
    description: "Save 10% on your entire basket, capped at ₹120.",
    discountType: "percentage",
    discountValue: "10.00",
    minimumOrderAmount: "299.00",
    maximumDiscount: "120.00",
    expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
  },
  {
    couponCode: "FREEDEL",
    title: "Free delivery on any order",
    description: "Zero delivery charge anywhere within our 25 km Chennai radius.",
    discountType: "free_delivery",
    discountValue: "0.00",
    minimumOrderAmount: "199.00",
    maximumDiscount: null,
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  },
  {
    couponCode: "WELCOME100",
    title: "₹100 off for new customers",
    description: "First order discount for new VeggieFlick shoppers.",
    discountType: "fixed_amount",
    discountValue: "100.00",
    minimumOrderAmount: "699.00",
    maximumDiscount: null,
    expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
  },
];
