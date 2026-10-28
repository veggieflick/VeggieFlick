const { Pool } = require("pg");
const fs = require("fs");

const pool = new Pool({
  connectionString:
    "postgresql://postgres.qteotyhogcsucfumsbxr:veggieflick%402026@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres",
  ssl: { rejectUnauthorized: false },
});

// Load original backed up DB products (containing user's uploaded Base64 images)
const BACKED_UP_PRODS = JSON.parse(
  fs.readFileSync("./scripts/current-db-products.json", "utf8")
);

function getBackedUpImage(keywords, fallback) {
  for (const kw of keywords) {
    const found = BACKED_UP_PRODS.find(
      (p) => p.name.toLowerCase().includes(kw.toLowerCase()) && p.image_url
    );
    if (found && found.image_url) {
      return found.image_url;
    }
  }
  return fallback;
}

// 7 Official Categories
const OFFICIAL_CATEGORIES = [
  {
    name: "Chopped Vegetables (Instant/Ready to cook)",
    slug: "chopped-vegetables",
    tamilName: "நறுக்கிய காய்கறிகள் (Instant/Ready to cook)",
    icon: "vegetables",
    accent: "#16A34A",
    description: "Daily fresh vegetables diced, sliced & peeled ready to cook with zero kitchen prep waste.",
    sortOrder: 1,
  },
  {
    name: "Chopped Fruits",
    slug: "chopped-fruits",
    tamilName: "நறுக்கிய பழங்கள்",
    icon: "fruit",
    accent: "#D97706",
    description: "Cleanly cut, seedless & freshly diced fruits packed for instant eating.",
    sortOrder: 2,
  },
  {
    name: "Sprouts (pre order only)",
    slug: "sprouts",
    tamilName: "முளைகட்டிய பயறுகள் (Pre-Order Only)",
    icon: "sprout",
    accent: "#0D9488",
    description: "Naturally sprouted organic pulses with 24-hr germination. Pre-order only.",
    sortOrder: 3,
    isPreOrder: true,
  },
  {
    name: "Combo",
    slug: "combos",
    tamilName: "சமையல் காம்போ கிட்ஸ்",
    icon: "soup",
    accent: "#EA580C",
    description: "Pulav, Biriyani, Aviyal & Bisi Bele Bath recipe kits kg-wise.",
    sortOrder: 4,
  },
  {
    name: "Fruit salad",
    slug: "fruit-salad",
    tamilName: "பழ சாலட் (Customizable)",
    icon: "fruit",
    accent: "#E11D48",
    description: "Fresh fruit & berry salad bowls (add fruits and berries based on your wish).",
    sortOrder: 5,
  },
  {
    name: "Sprouts salads",
    slug: "sprouts-salads",
    tamilName: "முளைகட்டிய பயறு சாலட் (Pre-Order Only)",
    icon: "sprout",
    accent: "#65A30D",
    description: "Diet-friendly sprouts salad bowls (Select any 3 items - Pre-order only).",
    sortOrder: 6,
    isPreOrder: true,
  },
  {
    name: "Vegetables salads",
    slug: "vegetables-salads",
    tamilName: "காய்கறி சாலட் (Select Any 3 Items)",
    icon: "salad",
    accent: "#059669",
    description: "Fresh garden vegetable salad bowls (Select any 3 items).",
    sortOrder: 7,
  },
];

// All User Products mapped directly to the 7 sections
const USER_PRODUCTS = [
  // ==========================================
  // 1. Chopped Vegetables (Instant/Ready to cook)
  // ==========================================
  {
    name: "Beans",
    tamilName: "பீன்ஸ் (நறுக்கியது)",
    slug: "chopped-beans",
    catSlug: "chopped-vegetables",
    variantName: "250 g",
    sellingPrice: "45.00",
    mrp: "55.00",
    imgKw: ["beans"],
    fallbackImg: "/images/products/cut-beans.jpg",
    desc: "Fresh green beans, string-removed and finely chopped ready for cooking.",
  },
  {
    name: "Carrot",
    tamilName: "கேரட் (நறுக்கியது)",
    slug: "chopped-carrot",
    catSlug: "chopped-vegetables",
    variantName: "250 g",
    sellingPrice: "29.00",
    mrp: "40.00",
    imgKw: ["carrot"],
    fallbackImg: "/images/products/cut-carrot.jpg",
    desc: "Crisp fresh carrots, peeled and neatly diced ready to cook.",
  },
  {
    name: "Beet root",
    tamilName: "பீட்ரூட் (நறுக்கியது)",
    slug: "chopped-beet-root",
    catSlug: "chopped-vegetables",
    variantName: "250 g",
    sellingPrice: "35.00",
    mrp: "45.00",
    imgKw: ["beetroot"],
    fallbackImg: "/images/products/cut-beetroot.jpg",
    desc: "Fresh farm beetroots, peeled and cubed for easy stir fry or poriyal.",
  },
  {
    name: "Lady’s finger",
    tamilName: "வெண்டைக்காய் (நறுக்கியது)",
    slug: "chopped-ladys-finger",
    catSlug: "chopped-vegetables",
    variantName: "250 g",
    sellingPrice: "28.00",
    mrp: "38.00",
    imgKw: ["lady's finger", "lady"],
    fallbackImg: "/images/products/cut-lady-finger.jpg",
    desc: "Tender bhendi cut into even rings for crispy fry or sambar.",
  },
  {
    name: "Cluster beans (kothavaranga)",
    tamilName: "கொத்தவரங்காய் (நறுக்கியது)",
    slug: "chopped-cluster-beans",
    catSlug: "chopped-vegetables",
    variantName: "250 g",
    sellingPrice: "50.00",
    mrp: "65.00",
    imgKw: ["kothavarangai", "cluster"],
    fallbackImg: "/images/products/cut-beans.jpg",
    desc: "Fresh cluster beans strings removed and chopped ready to boil.",
  },
  {
    name: "Hyacinth bean (Avarakai)",
    tamilName: "அவரைக்காய் (நறுக்கியது)",
    slug: "chopped-hyacinth-beans",
    catSlug: "chopped-vegetables",
    variantName: "500 g",
    sellingPrice: "35.00",
    mrp: "48.00",
    imgKw: ["hyacinth", "avarakai"],
    fallbackImg: "/images/products/cut-beans.jpg",
    desc: "Fresh tender avarakai destringed and chopped for traditional poriyal.",
  },
  {
    name: "Elephant foot yam",
    tamilName: "சேனைக்கிழங்கு (நறுக்கியது)",
    slug: "chopped-elephant-foot-yam",
    catSlug: "chopped-vegetables",
    variantName: "500 g",
    sellingPrice: "35.00",
    mrp: "50.00",
    imgKw: ["elephant foot", "yam"],
    fallbackImg: "/images/products/cut-vegetables.jpg",
    desc: "Skin peeled and cleanly cubed senai kizhangu ready for roast or curry.",
  },
  {
    name: "All types of Spinach (mention the spinach name in watzup)",
    tamilName: "அனைத்து வகை கீரைகள் (பெயரை வாட்ஸ்அப்பில் குறிப்பிடவும்)",
    slug: "chopped-spinach-leaves",
    catSlug: "chopped-vegetables",
    variantName: "500 g",
    sellingPrice: "35.00",
    mrp: "45.00",
    imgKw: ["spinach", "shredded spinach"],
    fallbackImg: "/images/products/cut-vegetables.jpg",
    desc: "Washed and shredded fresh greens. Mention specific variety (Palak, Arai Keerai, Siru Keerai, Murungai) on WhatsApp.",
  },
  {
    name: "Ivy gourd (kovaka)",
    tamilName: "கோவக்காய் (நறுக்கியது)",
    slug: "chopped-ivy-gourd",
    catSlug: "chopped-vegetables",
    variantName: "500 g",
    sellingPrice: "35.00",
    mrp: "48.00",
    imgKw: ["ivy gourd", "kovaka"],
    fallbackImg: "/images/products/cut-vegetables.jpg",
    desc: "Evenly sliced crisp kovakkai ready for poriyal or stir fry.",
  },
  {
    name: "Bitter guard",
    tamilName: "பாகற்காய் (நறுக்கியது)",
    slug: "chopped-bitter-gourd",
    catSlug: "chopped-vegetables",
    variantName: "500 g",
    sellingPrice: "35.00",
    mrp: "48.00",
    imgKw: ["bitter gourd", "bitter"],
    fallbackImg: "/images/products/cut-vegetables.jpg",
    desc: "Deseeded and ring sliced bitter gourd ready to fry or pitla.",
  },
  {
    name: "Snack guard",
    tamilName: "புடலங்காய் (நறுக்கியது)",
    slug: "chopped-snake-gourd",
    catSlug: "chopped-vegetables",
    variantName: "500 g",
    sellingPrice: "35.00",
    mrp: "45.00",
    imgKw: ["snake gourd", "snack"],
    fallbackImg: "/images/products/cut-vegetables.jpg",
    desc: "Pith removed and neatly sliced tender snake gourd.",
  },
  {
    name: "Bottle guard",
    tamilName: "சுரைக்காய் (நறுக்கியது)",
    slug: "chopped-bottle-gourd",
    catSlug: "chopped-vegetables",
    variantName: "500 g",
    sellingPrice: "35.00",
    mrp: "45.00",
    imgKw: ["bottle gourd", "bottle"],
    fallbackImg: "/images/products/cut-vegetables.jpg",
    desc: "Peeled and diced water-rich bottle gourd for kootu and soups.",
  },
  {
    name: "Radish",
    tamilName: "முள்ளங்கி (நறுக்கியது)",
    slug: "chopped-radish",
    catSlug: "chopped-vegetables",
    variantName: "500 g",
    sellingPrice: "35.00",
    mrp: "45.00",
    imgKw: ["radish"],
    fallbackImg: "/images/products/cut-vegetables.jpg",
    desc: "Crisp white radish, peeled and sliced for sambar or paratha.",
  },
  {
    name: "Chayote squash (chow chow)",
    tamilName: "சௌ சௌ (நறுக்கியது)",
    slug: "chopped-chayote-chow-chow",
    catSlug: "chopped-vegetables",
    variantName: "500 g",
    sellingPrice: "35.00",
    mrp: "45.00",
    imgKw: ["chayote", "chow"],
    fallbackImg: "/images/products/cut-vegetables.jpg",
    desc: "Peeled and diced chow chow cubes for dal and kootu.",
  },
  {
    name: "Cauliflower",
    tamilName: "காலிஃபிளவர் (நறுக்கியது)",
    slug: "chopped-cauliflower",
    catSlug: "chopped-vegetables",
    variantName: "200 g",
    sellingPrice: "50.00",
    mrp: "65.00",
    imgKw: ["cauliflower"],
    fallbackImg: "/images/products/cut-cauliflower.jpg",
    desc: "Clean florets washed and prepped for curries, roast or gobi dishes.",
  },
  {
    name: "Yellow Pumpkin",
    tamilName: "பரங்கிக்காய் (மஞ்சள் பூசணி)",
    slug: "chopped-yellow-pumpkin",
    catSlug: "chopped-vegetables",
    variantName: "500 g",
    sellingPrice: "35.00",
    mrp: "45.00",
    imgKw: ["yellow pumpkin", "pumpkin"],
    fallbackImg: "/images/products/cut-vegetables.jpg",
    desc: "Sweet yellow pumpkin deseeded, skin peeled and diced into chunks.",
  },
  {
    name: "White pumpkin",
    tamilName: "வெள்ளை பூசணிக்காய் (Ash Gourd)",
    slug: "chopped-white-pumpkin-ash-gourd",
    catSlug: "chopped-vegetables",
    variantName: "500 g",
    sellingPrice: "35.00",
    mrp: "45.00",
    imgKw: ["ash gourd", "white pumpkin"],
    fallbackImg: "/images/products/cut-vegetables.jpg",
    desc: "Cooling ash gourd deseeded, peeled and cubed for mor kuzhambu.",
  },
  {
    name: "Capsicum",
    tamilName: "குடைமிளகாய் (நறுக்கியது)",
    slug: "chopped-capsicum",
    catSlug: "chopped-vegetables",
    variantName: "500 g",
    sellingPrice: "35.00",
    mrp: "50.00",
    imgKw: ["capsicum"],
    fallbackImg: "/images/products/cut-vegetables.jpg",
    desc: "Crunchy green bell peppers deseeded and chopped ready to saute.",
  },
  {
    name: "German turnip (Nukal)",
    tamilName: "நூல் கோல் (நறுக்கியது)",
    slug: "chopped-german-turnip-nukal",
    catSlug: "chopped-vegetables",
    variantName: "500 g",
    sellingPrice: "35.00",
    mrp: "48.00",
    imgKw: ["knol-khol", "knol", "nukal"],
    fallbackImg: "/images/products/cut-vegetables.jpg",
    desc: "Tender knol-khol peeled and diced for wholesome village kootu.",
  },
  {
    name: "Cabbage",
    tamilName: "முட்டைகோஸ் (நறுக்கியது)",
    slug: "chopped-cabbage",
    catSlug: "chopped-vegetables",
    variantName: "500 g",
    sellingPrice: "35.00",
    mrp: "45.00",
    imgKw: ["cabbage"],
    fallbackImg: "/images/products/cut-vegetables.jpg",
    desc: "Finely shredded fresh green cabbage ready for poriyal or salad.",
  },
  {
    name: "Mushroom",
    tamilName: "காளான் (சுத்தம் செய்யப்பட்டது)",
    slug: "chopped-mushroom",
    catSlug: "chopped-vegetables",
    variantName: "500 g",
    sellingPrice: "35.00",
    mrp: "60.00",
    imgKw: ["mushroom"],
    fallbackImg: "/images/products/cut-vegetables.jpg",
    desc: "Plump button mushrooms washed, trimmed and halved for curries and briyani.",
  },
  {
    name: "Ridge gourd (Peerkangai)",
    tamilName: "பீர்க்கங்காய் (நறுக்கியது)",
    slug: "chopped-ridge-gourd",
    catSlug: "chopped-vegetables",
    variantName: "500 g",
    sellingPrice: "35.00",
    mrp: "48.00",
    imgKw: ["ridge gourd", "peerkangai"],
    fallbackImg: "/images/products/cut-vegetables.jpg",
    desc: "Ridges peeled and cubed tender ridge gourd for kootu or thuvaiyal.",
  },
  {
    name: "Onion",
    tamilName: "வெங்காயம் (நறுக்கியது)",
    slug: "chopped-onion",
    catSlug: "chopped-vegetables",
    variantName: "500 g",
    sellingPrice: "35.00",
    mrp: "45.00",
    imgKw: ["sliced big onion", "onion"],
    fallbackImg: "/images/products/onion-slices.jpg",
    desc: "Fresh onions peeled and finely chopped for instant tadka and cooking.",
  },
  {
    name: "Tomato",
    tamilName: "தக்காளி (நறுக்கியது)",
    slug: "chopped-tomato",
    catSlug: "chopped-vegetables",
    variantName: "500 g",
    sellingPrice: "35.00",
    mrp: "45.00",
    imgKw: ["tomato slices", "tomato"],
    fallbackImg: "/images/products/tomato-slices.jpg",
    desc: "Ripe, firm country tomatoes diced and ready for curries and rasam.",
  },
  {
    name: "Grated coconut",
    tamilName: "துருவிய தேங்காய்",
    slug: "grated-coconut",
    catSlug: "chopped-vegetables",
    variantName: "200 g",
    sellingPrice: "42.00",
    mrp: "55.00",
    imgKw: ["grated coconut", "coconut"],
    fallbackImg: "/images/products/grated-coconut.jpg",
    desc: "100% pure fresh grated coconut, zero moisture loss, ready for chutneys and poriyals.",
  },
  {
    name: "Peeled small onion",
    tamilName: "உரித்த சின்ன வெங்காயம் (சாம்பார் வெங்காயம்)",
    slug: "peeled-small-onion",
    catSlug: "chopped-vegetables",
    variantName: "500 g",
    sellingPrice: "35.00",
    mrp: "60.00",
    imgKw: ["peeled small onion", "small onion"],
    fallbackImg: "/images/products/peeled-onion-garlic.jpg",
    desc: "Hand-peeled pungent shallots, saving 30 mins of tedious kitchen work.",
  },
  {
    name: "Peeled garlic",
    tamilName: "உரித்த பூண்டு",
    slug: "peeled-garlic",
    catSlug: "chopped-vegetables",
    variantName: "500 g",
    sellingPrice: "35.00",
    mrp: "70.00",
    imgKw: ["peeled garlic", "garlic"],
    fallbackImg: "/images/products/peeled-onion-garlic.jpg",
    desc: "Cleanly peeled organic garlic cloves ready for paste, rasam or tadka.",
  },
  {
    name: "Sliced big onion",
    tamilName: "நறுக்கிய பெரிய வெங்காய ஸ்லைஸ்",
    slug: "sliced-big-onion",
    catSlug: "chopped-vegetables",
    variantName: "1 kg",
    sellingPrice: "38.00",
    mrp: "50.00",
    imgKw: ["sliced big onion"],
    fallbackImg: "/images/products/onion-slices.jpg",
    desc: "Even ring-cut big onion slices for briyani, pulav, sandwich and garnishing.",
  },
  {
    name: "Sliced tomato",
    tamilName: "நறுக்கிய தக்காளி ஸ்லைஸ்",
    slug: "sliced-tomato",
    catSlug: "chopped-vegetables",
    variantName: "500 g",
    sellingPrice: "29.00",
    mrp: "40.00",
    imgKw: ["tomato slices", "tomato"],
    fallbackImg: "/images/products/tomato-slices.jpg",
    desc: "Round cross-cut firm tomato slices for burgers, sandwiches and briyani layer.",
  },
  {
    name: "Broccoli",
    tamilName: "ப்ரோக்கோலி (நறுக்கியது)",
    slug: "chopped-broccoli",
    catSlug: "chopped-vegetables",
    variantName: "250 g",
    sellingPrice: "85.00",
    mrp: "110.00",
    imgKw: ["chopped broccoli", "broccoli"],
    fallbackImg: "/images/products/cut-vegetables.jpg",
    desc: "Crunchy green broccoli florets trimmed and washed ready to steam or stir fry.",
  },
  {
    name: "Shredded coriander/mint/curry leaves",
    tamilName: "நறுக்கிய கொத்தமல்லி / புதினா / கருவேப்பிலை",
    slug: "shredded-coriander-mint-curry-leaves",
    catSlug: "chopped-vegetables",
    variantName: "150 g",
    sellingPrice: "29.00",
    mrp: "40.00",
    imgKw: ["coriander", "mint", "curry leaves"],
    fallbackImg: "/images/products/cut-vegetables.jpg",
    desc: "Washed and finely shredded aromatic herb mix for final seasoning and garnishing.",
  },
  {
    name: "Others please mention in watzup",
    tamilName: "பிற காய்கறிகள் (வாட்ஸ்அப்பில் தெரிவிக்கவும்)",
    slug: "custom-vegetable-request-whatsapp",
    catSlug: "chopped-vegetables",
    variantName: "Custom Pack",
    sellingPrice: "35.00",
    mrp: "50.00",
    imgKw: ["custom", "vegetable"],
    fallbackImg: "/images/products/cut-vegetables.jpg",
    desc: "Any other specific vegetable cut or mix you need - mention details directly on WhatsApp order support.",
  },

  // ==========================================
  // 2. Chopped Fruits
  // ==========================================
  {
    name: "Pappaya",
    tamilName: "பப்பாளி (நறுக்கியது)",
    slug: "chopped-pappaya",
    catSlug: "chopped-fruits",
    variantName: "500 g",
    sellingPrice: "35.00",
    mrp: "50.00",
    imgKw: ["chopped papaya", "papaya"],
    fallbackImg: "/images/products/fruit-cut-papaya.jpg",
    desc: "Sweet orange papaya peeled, deseeded and cleanly diced for instant snacking.",
  },
  {
    name: "Pine Apple",
    tamilName: "அன்னாசிப்பழம் (நறுக்கியது)",
    slug: "chopped-pine-apple",
    catSlug: "chopped-fruits",
    variantName: "500 g",
    sellingPrice: "35.00",
    mrp: "60.00",
    imgKw: ["chopped pineapple", "pineapple"],
    fallbackImg: "/images/products/fruit-cut-pineapple.jpg",
    desc: "Thorny eyes removed and juicy golden pineapple cut into bite-sized chunks.",
  },
  {
    name: "Water melon",
    tamilName: "தர்பூசணி (நறுக்கியது)",
    slug: "chopped-water-melon",
    catSlug: "chopped-fruits",
    variantName: "500 g",
    sellingPrice: "35.00",
    mrp: "45.00",
    imgKw: ["chopped watermelon", "watermelon"],
    fallbackImg: "/images/products/fruit-cut-watermelon.jpg",
    desc: "Chilled ruby-red seedless watermelon cubes, packed fresh.",
  },
  {
    name: "Pear",
    tamilName: "பேரிக்காய் (நறுக்கியது)",
    slug: "chopped-pear",
    catSlug: "chopped-fruits",
    variantName: "300 g",
    sellingPrice: "59.00",
    mrp: "75.00",
    imgKw: ["chopped pear", "pear"],
    fallbackImg: "/images/products/fruit-combo-deluxe.jpg",
    desc: "Crisp green pear cored and sliced, rich in dietary fiber.",
  },
  {
    name: "Dragon fruit",
    tamilName: "டிராகன் பழம் (நறுக்கியது)",
    slug: "chopped-dragon-fruit",
    catSlug: "chopped-fruits",
    variantName: "500 g",
    sellingPrice: "35.00",
    mrp: "70.00",
    imgKw: ["dragon fruit", "dragon"],
    fallbackImg: "/images/products/fruit-cut-dragon.jpg",
    desc: "Exotic magenta/white dragon fruit cubed and chilled, antioxidant rich.",
  },
  {
    name: "Kiwi",
    tamilName: "கிவி (நறுக்கியது)",
    slug: "chopped-kiwi",
    catSlug: "chopped-fruits",
    variantName: "500 g",
    sellingPrice: "35.00",
    mrp: "80.00",
    imgKw: ["chopped kiwi", "kiwi"],
    fallbackImg: "/images/products/fruit-combo-deluxe.jpg",
    desc: "Fuzzy peel removed, sweet-tangy green kiwi sliced and packed.",
  },
  {
    name: "Guava",
    tamilName: "கொய்யாப்பழம் (நறுக்கியது)",
    slug: "chopped-guava",
    catSlug: "chopped-fruits",
    variantName: "500 g",
    sellingPrice: "35.00",
    mrp: "50.00",
    imgKw: ["chopped guava", "guava"],
    fallbackImg: "/images/products/fruit-combo-deluxe.jpg",
    desc: "Crispy farm-fresh country guava wedges seasoned with natural sweetness.",
  },
  {
    name: "Cucumber (Chopped Fruit)",
    tamilName: "வெள்ளரிக்காய் (நறுக்கிய பழம்)",
    slug: "chopped-cucumber-fruit",
    catSlug: "chopped-fruits",
    variantName: "250 g",
    sellingPrice: "89.00",
    mrp: "105.00",
    imgKw: ["cucumber"],
    fallbackImg: "/images/products/fruit-combo-deluxe.jpg",
    desc: "Hydrating crisp salad cucumber sliced for refreshing fruit bowls.",
  },
  {
    name: "Orange",
    tamilName: "ஆரஞ்சு (சுளைகள்)",
    slug: "chopped-orange",
    catSlug: "chopped-fruits",
    variantName: "400 g",
    sellingPrice: "59.00",
    mrp: "75.00",
    imgKw: ["orange"],
    fallbackImg: "/images/products/fruit-salad-citrus.jpg",
    desc: "Juicy citrus segments peeled, seeds removed for refreshing snacking.",
  },
  {
    name: "Apple",
    tamilName: "ஆப்பிள் (நறுக்கியது)",
    slug: "chopped-apple",
    catSlug: "chopped-fruits",
    variantName: "500 g",
    sellingPrice: "35.00",
    mrp: "70.00",
    imgKw: ["chopped apple", "apple"],
    fallbackImg: "/images/products/fruit-combo-deluxe.jpg",
    desc: "Crisp sweet red apples cored and cleanly sliced.",
  },
  {
    name: "Green Apple",
    tamilName: "கிரீன் ஆப்பிள் (பச்சை ஆப்பிள் நறுக்கியது)",
    slug: "chopped-green-apple",
    catSlug: "chopped-fruits",
    variantName: "350 g",
    sellingPrice: "69.00",
    mrp: "90.00",
    imgKw: ["green apple", "apple"],
    fallbackImg: "/images/products/fruit-combo-deluxe.jpg",
    desc: "Tangy Granny Smith green apples cored and crisp sliced.",
  },
  {
    name: "Pomegranate",
    tamilName: "மாதுளை முத்துக்கள்",
    slug: "chopped-pomegranate-arils",
    catSlug: "chopped-fruits",
    variantName: "500 g",
    sellingPrice: "150.00",
    mrp: "190.00",
    imgKw: ["shredded pomegranate", "pomegranate"],
    fallbackImg: "/images/products/fruit-cut-pomegranate.jpg",
    desc: "100% ruby-red arils separated by hand, zero rind or pith.",
  },
  {
    name: "Gooseberry",
    tamilName: "நெல்லிக்காய் (நறுக்கியது)",
    slug: "chopped-gooseberry",
    catSlug: "chopped-fruits",
    variantName: "300 g",
    sellingPrice: "48.00",
    mrp: "60.00",
    imgKw: ["chopped gooseberry", "gooseberry"],
    fallbackImg: "/images/products/fruit-combo-deluxe.jpg",
    desc: "Vitamin C packed Amla deseeded and cleanly portioned.",
  },
  {
    name: "Banana (Brown/yellow)",
    tamilName: "வாழைப்பழம் (பிரவுன் / மஞ்சள்)",
    slug: "chopped-banana-brown-yellow",
    catSlug: "chopped-fruits",
    variantName: "400 g",
    sellingPrice: "35.00",
    mrp: "50.00",
    imgKw: ["banana"],
    fallbackImg: "/images/products/fruit-combo-deluxe.jpg",
    desc: "Naturally ripened sweet bananas sliced for instant eating or smoothies.",
  },
  {
    name: "Grapes (Green/black)",
    tamilName: "திராட்சை (பச்சை / கருப்பு)",
    slug: "chopped-grapes-green-black",
    catSlug: "chopped-fruits",
    variantName: "350 g",
    sellingPrice: "65.00",
    mrp: "85.00",
    imgKw: ["grapes"],
    fallbackImg: "/images/products/fruit-combo-deluxe.jpg",
    desc: "Seedless sweet green and black grapes washed and ready to enjoy.",
  },

  // ==========================================
  // 3. Sprouts (pre order only)
  // ==========================================
  {
    name: "Cucumber (Sprout Mix)",
    tamilName: "வெள்ளரிக்காய் முளைப்பயறு கலவை",
    slug: "sprouts-cucumber",
    catSlug: "sprouts",
    variantName: "250 g",
    sellingPrice: "45.00",
    mrp: "60.00",
    imgKw: ["cucumber"],
    fallbackImg: "/images/products/veg-salad-sprouts.jpg",
    desc: "Pre-order: Diced fresh cucumber tossed with live germinated sprouts.",
    isPreOrder: true,
  },
  {
    name: "Groundnut",
    tamilName: "முளைகட்டிய நிலக்கடலை (வேர்க்கடலை)",
    slug: "sprouts-groundnut",
    catSlug: "sprouts",
    variantName: "250 g",
    sellingPrice: "65.00",
    mrp: "85.00",
    imgKw: ["groundnut"],
    fallbackImg: "/images/products/veg-salad-sprouts.jpg",
    desc: "Pre-order: Germinated raw peanuts with high vitamin E and healthy fats.",
    isPreOrder: true,
  },
  {
    name: "Green Mong Dal",
    tamilName: "முளைகட்டிய பச்சைப்பயறு",
    slug: "sprouts-green-moong-dal",
    catSlug: "sprouts",
    variantName: "250 g",
    sellingPrice: "99.00",
    mrp: "120.00",
    imgKw: ["moong dal sprout", "moong"],
    fallbackImg: "/images/products/veg-salad-sprouts.jpg",
    desc: "Pre-order: Tender, 24-hr germinated green moong shoots rich in antioxidants.",
    isPreOrder: true,
  },
  {
    name: "Black channa",
    tamilName: "முளைகட்டிய கருப்பு கொண்டைக்கடலை",
    slug: "sprouts-black-channa",
    catSlug: "sprouts",
    variantName: "250 g",
    sellingPrice: "89.00",
    mrp: "110.00",
    imgKw: ["black channa sprout", "black channa"],
    fallbackImg: "/images/products/veg-salad-sprouts.jpg",
    desc: "Pre-order: High-fiber, iron-dense black chickpeas germinated naturally.",
    isPreOrder: true,
  },
  {
    name: "White channa",
    tamilName: "முளைகட்டிய வெள்ளை சுண்டல்",
    slug: "sprouts-white-channa",
    catSlug: "sprouts",
    variantName: "250 g",
    sellingPrice: "89.00",
    mrp: "110.00",
    imgKw: ["white channa sprout", "white channa"],
    fallbackImg: "/images/products/veg-salad-sprouts.jpg",
    desc: "Pre-order: Delicate sprouted Kabuli chickpeas packed with plant protein.",
    isPreOrder: true,
  },
  {
    name: "Soya beans",
    tamilName: "முளைகட்டிய சோயா பீன்ஸ்",
    slug: "sprouts-soya-beans",
    catSlug: "sprouts",
    variantName: "250 g",
    sellingPrice: "79.00",
    mrp: "99.00",
    imgKw: ["soya bean sprout", "soya"],
    fallbackImg: "/images/products/veg-salad-sprouts.jpg",
    desc: "Pre-order: Powerhouse sprouted whole soya beans with maximum bioavailable protein.",
    isPreOrder: true,
  },
  {
    name: "Green peas",
    tamilName: "முளைகட்டிய பச்சை பட்டாணி",
    slug: "sprouts-green-peas",
    catSlug: "sprouts",
    variantName: "500 g",
    sellingPrice: "35.00",
    mrp: "55.00",
    imgKw: ["green peas sprout", "green peas"],
    fallbackImg: "/images/products/veg-salad-sprouts.jpg",
    desc: "Pre-order: Sweet germinated whole green peas with live digestive enzymes.",
    isPreOrder: true,
  },
  {
    name: "Horse gram",
    tamilName: "முளைகட்டிய கொள்ளு பயறு",
    slug: "sprouts-horse-gram",
    catSlug: "sprouts",
    variantName: "200 g",
    sellingPrice: "55.00",
    mrp: "70.00",
    imgKw: ["horse gram sprout", "horse gram"],
    fallbackImg: "/images/products/veg-salad-sprouts.jpg",
    desc: "Pre-order: Traditional sprouted Kollu, renowned for metabolism boost and energy.",
    isPreOrder: true,
  },

  // ==========================================
  // 4. Combo
  // ==========================================
  {
    name: "Pulav combo",
    tamilName: "புலாவ் ஸ்பெஷல் காய்கறி காம்போ",
    slug: "pulav-combo-kit",
    catSlug: "combos",
    variantName: "Serves 4 (750 g)",
    sellingPrice: "129.00",
    mrp: "160.00",
    imgKw: ["white pulav veg combo", "pulav"],
    fallbackImg: "/images/products/pulav-special-veggie-combo-kit.png",
    desc: "Ingredients: Big Onion slices, Tomato, Chilli, Grated Coconut, Carrot, Beans, Peas, Potato, Ginger, Garlic.",
  },
  {
    name: "Vegetables Biriyani combo",
    tamilName: "வெஜிடபிள் பிரியாணி ஸ்பெஷல் காம்போ",
    slug: "vegetables-biriyani-combo-kit",
    catSlug: "combos",
    variantName: "Serves 4 (800 g)",
    sellingPrice: "179.00",
    mrp: "220.00",
    imgKw: ["briyani veg combo", "biriyani", "biryani"],
    fallbackImg: "/images/products/vegetables-biryani-special-kit.png",
    desc: "Ingredients: Big Onion slices, Tomato, Chilli, Carrot, Beans, Peas, Potato, Ginger, Garlic.",
  },
  {
    name: "Aviyal combo",
    tamilName: "பாரம்பரிய அவியல் காய்கறி கலவை",
    slug: "aviyal-combo-kit",
    catSlug: "combos",
    variantName: "Serves 4 (700 g)",
    sellingPrice: "125.00",
    mrp: "155.00",
    imgKw: ["aviyal  veg combo", "aviyal"],
    fallbackImg: "/images/products/traditional-aviyal-7-veggie-cut-mix.png",
    desc: "Ingredients: Elephant Foot Yam, Drumstick, Carrot, Beans, Pusanikai, Valaikai, Avaraikai.",
  },
  {
    name: "Bisimila bath (with onion/without onion)",
    tamilName: "பிசிபேலே பாத் காய்கறி காம்போ",
    slug: "bisimila-bath-combo-kit",
    catSlug: "combos",
    variantName: "Serves 4 (750 g)",
    sellingPrice: "139.00",
    mrp: "175.00",
    imgKw: ["bisi bele bath veg combo", "bisimila", "bisi bele"],
    fallbackImg: "/images/products/bisi-bele-bath-kit.png",
    desc: "Ingredients: Small Onion, Drumstick, Carrot, Beans, Capsicum, Peas, Pusanikai (White or Yellow), Tomato, Potato, Brinjal.",
  },

  // ==========================================
  // 5. Fruit salad
  // (you can add fruits and berries based on your wish)
  // ==========================================
  {
    name: "Custom Fruit Salad Bowl (Add fruits & berries based on your wish)",
    tamilName: "விருப்பப்படி பழங்கள் மற்றும் பெர்ரிகள் சேர்த்த பழ சாலட்",
    slug: "custom-fruit-salad-bowl",
    catSlug: "fruit-salad",
    variantName: "350 g Bowl",
    sellingPrice: "119.00",
    mrp: "150.00",
    imgKw: ["exotic fruit salad bowl", "fruit salad"],
    fallbackImg: "/images/products/fruit-salad-exotic.jpg",
    desc: "Add fruits and berries based on your wish: Raspberry, Blueberry, Cranberry, Strawberry, Plums, Guava, Watermelon, Banana, Pineapple, Grapes, Apple.",
  },
  {
    name: "Tropical Melon & Berry Fruit Salad",
    tamilName: "ட்ராபிகல் மெலன் & பெர்ரி பழ சாலட்",
    slug: "tropical-melon-berry-salad",
    catSlug: "fruit-salad",
    variantName: "350 g Bowl",
    sellingPrice: "99.00",
    mrp: "130.00",
    imgKw: ["tropical melon & berry bowl", "melon & berry"],
    fallbackImg: "/images/products/fruit-salad-melon.jpg",
    desc: "Chilled diced watermelon, honeydew melon, sweet berries & mint toss.",
  },
  {
    name: "Watermelon Mint Refresher Salad Bowl",
    tamilName: "தர்பூசணி மின்ட் ரெஃப்ரெஷர் சாலட்",
    slug: "watermelon-mint-refresher-salad",
    catSlug: "fruit-salad",
    variantName: "350 g Bowl",
    sellingPrice: "65.00",
    mrp: "85.00",
    imgKw: ["watermelon mint refresher bowl", "watermelon mint"],
    fallbackImg: "/images/products/fruit-salad-watermelon.jpg",
    desc: "Crisp red seedless watermelon cubes infused with fresh garden mint leaves.",
  },
  {
    name: "Strawberry Fruit Salad Bowl",
    tamilName: "ஸ்ட்ராபெர்ரி பழ சாலட் பவுல்",
    slug: "strawberry-fruit-salad-bowl",
    catSlug: "fruit-salad",
    variantName: "350 g Bowl",
    sellingPrice: "109.00",
    mrp: "140.00",
    imgKw: ["chopped strawberry", "strawberry"],
    fallbackImg: "/images/products/fruit-salad-exotic.jpg",
    desc: "Juicy Mahabaleshwar strawberries sliced and tossed with kiwi and apple.",
  },
  {
    name: "Blueberry & Berry Bliss Salad Bowl",
    tamilName: "ப்ளூபெர்ரி & பெர்ரி பிளிஸ் பழ சாலட்",
    slug: "blueberry-berry-bliss-salad-bowl",
    catSlug: "fruit-salad",
    variantName: "350 g Bowl",
    sellingPrice: "129.00",
    mrp: "165.00",
    imgKw: ["fruit salad", "berry"],
    fallbackImg: "/images/products/fruit-salad-exotic.jpg",
    desc: "Plump fresh blueberries, cranberries, raspberry and pomegranate arils.",
  },

  // ==========================================
  // 6. Sprouts salads (pre order only)
  // (based on your diet plan select any 3 items) - (pre order only)
  // ==========================================
  {
    name: "Sprouts Salad (Select any 3 items - Pre-Order Only)",
    tamilName: "முளைகட்டிய பயறு சாலட் (ஏதேனும் 3 தேர்வு செய்யவும் - Pre-Order Only)",
    slug: "custom-sprouts-salad-diet-bowl",
    catSlug: "sprouts-salads",
    variantName: "300 g Bowl",
    sellingPrice: "79.00",
    mrp: "105.00",
    imgKw: ["sprouts salad", "protein sprouts power salad"],
    fallbackImg: "/images/products/sprouts-salad-custom-bowl.jpg",
    desc: "Select any 3 items: Cucumber, Groundnut, Green Moong, Black Channa, White Channa, Soya Beans, Green Peas, Horse Gram. Pre-order only.",
    isPreOrder: true,
  },
  {
    name: "Protein Sprouts Power Salad",
    tamilName: "புரோட்டீன் ஸ்ப்ரௌட்ஸ் பவர் சாலட்",
    slug: "protein-sprouts-power-salad",
    catSlug: "sprouts-salads",
    variantName: "250 g",
    sellingPrice: "79.00",
    mrp: "100.00",
    imgKw: ["protein sprouts power salad", "sprouts salad"],
    fallbackImg: "/images/products/veg-salad-sprouts.jpg",
    desc: "Triple sprouted power bowl: Moong, Channa, Soya with pepper lime dressing.",
    isPreOrder: true,
  },
  {
    name: "Sprouted Moong & Cucumber Diet Bowl",
    tamilName: "முளைகட்டிய பாசிப்பயறு & வெள்ளரி டயட் சாலட்",
    slug: "sprouted-moong-cucumber-diet-bowl",
    catSlug: "sprouts-salads",
    variantName: "250 g",
    sellingPrice: "69.00",
    mrp: "90.00",
    imgKw: ["moong dal sprout", "sprouts salad"],
    fallbackImg: "/images/products/veg-salad-sprouts.jpg",
    desc: "Low calorie, high enzyme pre-order salad bowl for active fitness and digestion.",
    isPreOrder: true,
  },

  // ==========================================
  // 7. Vegetables salads
  // (based on your diet plan select any 3 items)
  // ==========================================
  {
    name: "Vegetables Salad (Select any 3 items)",
    tamilName: "காய்கறி சாலட் (ஏதேனும் 3 தேர்வு செய்யவும்)",
    slug: "custom-vegetables-salad-diet-bowl",
    catSlug: "vegetables-salads",
    variantName: "300 g Bowl",
    sellingPrice: "79.00",
    mrp: "105.00",
    imgKw: ["vegetable salad", "fresh vegetables salad bowl"],
    fallbackImg: "/images/products/vegetable-salad-custom-bowl.jpg",
    desc: "Select any 3 items: Cucumber, Cabbage, Corn, Carrot, Sliced Beetroot, Broccoli, Mango, Tomato, Big Onion, Coriander Leaves.",
  },
  {
    name: "Fresh Vegetables Salad Bowl",
    tamilName: "ஃப்ரெஷ் காய்கறி சாலட் பவுல்",
    slug: "fresh-vegetables-salad-bowl",
    catSlug: "vegetables-salads",
    variantName: "250 g",
    sellingPrice: "99.00",
    mrp: "125.00",
    imgKw: ["fresh vegetables salad bowl", "vegetable salad"],
    fallbackImg: "/images/products/veg-salad-fresh.jpg",
    desc: "Crunchy carrot, cucumber, cabbage, tomato and bell pepper with lemon vinaigrette.",
  },
  {
    name: "Sweet Corn & Broccoli Crunch Salad",
    tamilName: "ஸ்வீட் கார்ன் & ப்ரோக்கோலி கிரஞ்ச் சாலட்",
    slug: "sweet-corn-broccoli-crunch-salad",
    catSlug: "vegetables-salads",
    variantName: "300 g Bowl",
    sellingPrice: "89.00",
    mrp: "115.00",
    imgKw: ["vegetable salad"],
    fallbackImg: "/images/products/veg-salad-fresh.jpg",
    desc: "Steamed sweet corn, raw broccoli florets, diced carrot and coriander garnish.",
  },
];

async function applyOfficialCatalog() {
  const client = await pool.connect();
  try {
    console.log("=== APPLYING VEGGIEFLICK OFFICIAL CATALOG (7 CATEGORIES) ===");

    // Step 1: Cleanly upsert 7 official categories
    const catMap = new Map();

    for (const c of OFFICIAL_CATEGORIES) {
      // Find category by exact slug
      let [existing] = (
        await client.query("SELECT id, name, slug FROM categories WHERE slug = $1 LIMIT 1", [c.slug])
      ).rows;

      if (!existing) {
        // Try finding by exact name
        const [byName] = (
          await client.query("SELECT id, name, slug FROM categories WHERE name = $1 LIMIT 1", [c.name])
        ).rows;
        if (byName) {
          existing = byName;
          await client.query(
            `UPDATE categories SET
              name = $1, slug = $2, tamil_name = $3, icon = $4, accent = $5,
              description = $6, sort_order = $7, status = 'active'
            WHERE id = $8`,
            [c.name, c.slug, c.tamilName, c.icon, c.accent, c.description, c.sortOrder, existing.id]
          );
        } else {
          // Insert new category
          const [ins] = (
            await client.query(
              `INSERT INTO categories (name, slug, tamil_name, icon, accent, description, sort_order, status)
               VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')
               RETURNING id, name, slug`,
              [c.name, c.slug, c.tamilName, c.icon, c.accent, c.description, c.sortOrder]
            )
          ).rows;
          existing = ins;
        }
      } else {
        // Update existing category
        await client.query(
          `UPDATE categories SET
            name = $1, tamil_name = $2, icon = $3, accent = $4,
            description = $5, sort_order = $6, status = 'active'
          WHERE id = $7`,
          [c.name, c.tamilName, c.icon, c.accent, c.description, c.sortOrder, existing.id]
        );
      }

      catMap.set(c.slug, existing.id);
      console.log(`[Category] ${c.name} -> ID: ${existing.id} (slug: ${c.slug})`);
    }

    // Set all other legacy categories to inactive
    const officialSlugs = OFFICIAL_CATEGORIES.map((c) => c.slug);
    const deactivatedCats = (
      await client.query(
        "UPDATE categories SET status = 'inactive' WHERE slug NOT IN ($1, $2, $3, $4, $5, $6, $7) RETURNING name, slug",
        officialSlugs
      )
    ).rows;
    console.log(`Deactivated ${deactivatedCats.length} old/legacy categories.`);

    // Step 2: Upsert each official product
    console.log(`\nUpserting ${USER_PRODUCTS.length} official products...`);
    const activeProductIds = new Set();

    for (const item of USER_PRODUCTS) {
      const catId = catMap.get(item.catSlug);
      if (!catId) {
        console.error(`ERROR: Category ID not found for ${item.catSlug}`);
        continue;
      }

      // Check for existing product:
      // Priority 1: If it's Soya bean, find the exact one used by the live paid order!
      let existingProd = null;
      if (item.name.toLowerCase().includes("soya")) {
        const [soya] = (
          await client.query(
            "SELECT id, name, slug FROM products WHERE id = 'b19b2230-8385-443e-a5c8-31d97b6179e7' OR name ILIKE '%soya%' LIMIT 1"
          )
        ).rows;
        if (soya) existingProd = soya;
      }

      // Priority 2: Check by exact slug
      if (!existingProd) {
        const [bySlug] = (
          await client.query("SELECT id, name, slug FROM products WHERE slug = $1 LIMIT 1", [item.slug])
        ).rows;
        if (bySlug) existingProd = bySlug;
      }

      // Priority 3: Check by exact name in current DB
      if (!existingProd) {
        const [byName] = (
          await client.query("SELECT id, name, slug FROM products WHERE name = $1 LIMIT 1", [item.name])
        ).rows;
        if (byName) existingProd = byName;
      }

      let prodId;
      if (existingProd) {
        prodId = existingProd.id;
        await client.query(
          `UPDATE products SET
            name = $1,
            tamil_name = $2,
            slug = $3,
            category_id = $4,
            short_description = $5,
            description = $5,
            is_cut_vegetable = true,
            status = 'active',
            updated_at = NOW()
          WHERE id = $6`,
          [item.name, item.tamilName, item.slug, catId, item.desc, prodId]
        );
      } else {
        const sku = "VF-" + Math.floor(100000 + Math.random() * 900000);
        const ins = (
          await client.query(
            `INSERT INTO products (
              name, tamil_name, slug, category_id, sku, emoji, short_description, description,
              is_featured, is_best_seller, is_organic, is_cut_vegetable, is_fresh_today, status
            ) VALUES ($1, $2, $3, $4, $5, 'vegetables', $6, $6, true, true, false, true, true, 'active')
            RETURNING id`,
            [item.name, item.tamilName, item.slug, catId, sku, item.desc]
          )
        ).rows[0];
        prodId = ins.id;
      }

      activeProductIds.add(prodId);

      // Upsert Product Variant
      let [existingVariant] = (
        await client.query(
          "SELECT id FROM product_variants WHERE product_id = $1 AND is_default = true LIMIT 1",
          [prodId]
        )
      ).rows;

      let variantId;
      if (existingVariant) {
        variantId = existingVariant.id;
        await client.query(
          `UPDATE product_variants SET
            variant_name = $1,
            selling_price = $2,
            mrp = $3,
            status = 'active',
            updated_at = NOW()
          WHERE id = $4`,
          [item.variantName, item.sellingPrice, item.mrp, variantId]
        );
      } else {
        const [vIns] = (
          await client.query(
            `INSERT INTO product_variants (
              product_id, variant_name, weight, unit, mrp, selling_price, cost_price, is_default, status
            ) VALUES ($1, $2, '0.500', 'g', $3, $4, '25.00', true, 'active')
            RETURNING id`,
            [prodId, item.variantName, item.mrp, item.sellingPrice]
          )
        ).rows;
        variantId = vIns.id;
      }

      // Upsert Inventory
      const [inv] = (
        await client.query("SELECT id FROM inventory WHERE variant_id = $1 LIMIT 1", [variantId])
      ).rows;
      if (!inv) {
        await client.query(
          `INSERT INTO inventory (variant_id, warehouse_name, available_stock, minimum_stock, maximum_stock, reorder_level)
           VALUES ($1, 'Chennai Central Hub', 100, 5, 500, 20)`,
          [variantId]
        );
      } else {
        await client.query(
          "UPDATE inventory SET available_stock = 100 WHERE id = $1",
          [inv.id]
        );
      }

      // Resolve Image: Use user's uploaded base64 image if present, else fallback image
      const resolvedImg = getBackedUpImage(item.imgKw, item.fallbackImg);

      const [imgRow] = (
        await client.query(
          "SELECT id, image_url FROM product_images WHERE product_id = $1 AND is_primary = true LIMIT 1",
          [prodId]
        )
      ).rows;

      if (imgRow) {
        await client.query("UPDATE product_images SET image_url = $1 WHERE id = $2", [
          resolvedImg,
          imgRow.id,
        ]);
      } else {
        await client.query(
          `INSERT INTO product_images (product_id, image_url, is_primary, display_order)
           VALUES ($1, $2, true, 1)`,
          [prodId, resolvedImg]
        );
      }
    }

    // Step 3: Deactivate any product in the DB not in the official list
    console.log("\nDeactivating non-official products in DB...");
    const allDbProds = (await client.query("SELECT id, name FROM products")).rows;
    let deactivatedCount = 0;
    for (const p of allDbProds) {
      if (!activeProductIds.has(p.id)) {
        await client.query("UPDATE products SET status = 'deleted' WHERE id = $1", [p.id]);
        deactivatedCount++;
        console.log(`- Deactivated: ${p.name}`);
      }
    }

    console.log(
      `\nSUCCESS: Synced ${activeProductIds.size} official products across 7 categories. Deactivated ${deactivatedCount} non-official items.`
    );
  } catch (err) {
    console.error("Error applying catalog:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  applyOfficialCatalog();
}

module.exports = { USER_PRODUCTS, OFFICIAL_CATEGORIES };
