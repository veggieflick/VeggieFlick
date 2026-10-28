const { Pool } = require("pg");
const fs = require("fs");

const pool = new Pool({
  connectionString:
    "postgresql://postgres.qteotyhogcsucfumsbxr:veggieflick%402026@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres",
  ssl: { rejectUnauthorized: false },
});

// The 7 official categories requested by user
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

async function syncCatalog() {
  const client = await pool.connect();
  try {
    console.log("Connected to Supabase PostgreSQL. Syncing user product list...");

    // 1. Upsert Categories
    const catMap = new Map();
    for (const c of OFFICIAL_CATEGORIES) {
      let [existing] = (
        await client.query("SELECT id, slug FROM categories WHERE slug = $1 LIMIT 1", [c.slug])
      ).rows;

      if (!existing) {
        // Try finding by name
        const byName = (
          await client.query("SELECT id, slug FROM categories WHERE name ILIKE $1 LIMIT 1", [
            `%${c.name.split(" ")[0]}%`,
          ])
        ).rows[0];
        if (byName) {
          existing = byName;
          await client.query(
            "UPDATE categories SET name = $1, slug = $2, tamil_name = $3, sort_order = $4, status = 'active' WHERE id = $5",
            [c.name, c.slug, c.tamilName, c.sortOrder, existing.id]
          );
        } else {
          const inserted = (
            await client.query(
              `INSERT INTO categories (name, slug, tamil_name, icon, accent, description, sort_order, status)
               VALUES ($1, $2, $3, $4, $5, $6, $7, 'active') RETURNING id`,
              [c.name, c.slug, c.tamilName, c.icon, c.accent, c.description, c.sortOrder]
            )
          ).rows[0];
          existing = inserted;
        }
      } else {
        await client.query(
          "UPDATE categories SET name = $1, tamil_name = $2, sort_order = $3, status = 'active' WHERE id = $4",
          [c.name, c.tamilName, c.sortOrder, existing.id]
        );
      }
      catMap.set(c.slug, existing.id);
      console.log(`Category '${c.name}' synced with ID: ${existing.id}`);
    }

    // Load existing products for image recycling
    const existingProds = (
      await client.query(
        "SELECT p.id, p.name, p.slug, img.image_url FROM products p LEFT JOIN product_images img ON img.product_id = p.id AND img.is_primary = true"
      )
    ).rows;

    const findImage = (keywords) => {
      for (const kw of keywords) {
        const found = existingProds.find(
          (p) => p.name.toLowerCase().includes(kw.toLowerCase()) && p.image_url
        );
        if (found) return found.image_url;
      }
      return null;
    };

    // Define all user products
    const ALL_USER_PRODUCTS = [
      // 1. Chopped Vegetables (Instant/Ready to cook)
      {
        name: "Beans",
        tamilName: "பீன்ஸ் (நறுக்கியது)",
        slug: "chopped-beans",
        catSlug: "chopped-vegetables",
        variantName: "250 g",
        sellingPrice: "45.00",
        mrp: "55.00",
        imgKw: ["beans", "cut-beans"],
        fallbackImg: "/images/products/cut-beans.jpg",
        desc: "Fresh green beans, washed and finely chopped ready for cooking.",
      },
      {
        name: "Carrot",
        tamilName: "கேரட் (நறுக்கியது)",
        slug: "chopped-carrot",
        catSlug: "chopped-vegetables",
        variantName: "250 g",
        sellingPrice: "29.00",
        mrp: "40.00",
        imgKw: ["carrot", "cut-carrot"],
        fallbackImg: "/images/products/cut-carrot.jpg",
        desc: "Crisp Ooty carrots, peeled and neatly diced ready to cook.",
      },
      {
        name: "Beet root",
        tamilName: "பீட்ரூட் (நறுக்கியது)",
        slug: "chopped-beet-root",
        catSlug: "chopped-vegetables",
        variantName: "250 g",
        sellingPrice: "35.00",
        mrp: "45.00",
        imgKw: ["beetroot", "cut-beetroot"],
        fallbackImg: "/images/products/cut-beetroot.jpg",
        desc: "Fresh farm beetroots, peeled and cubed for easy stir fry or salad.",
      },
      {
        name: "Lady’s finger",
        tamilName: "வெண்டைக்காய் (நறுக்கியது)",
        slug: "chopped-ladys-finger",
        catSlug: "chopped-vegetables",
        variantName: "250 g",
        sellingPrice: "28.00",
        mrp: "38.00",
        imgKw: ["lady's finger", "cut-lady-finger"],
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
        slug: "chopped-hyacinth-bean",
        catSlug: "chopped-vegetables",
        variantName: "500 g",
        sellingPrice: "35.00",
        mrp: "50.00",
        imgKw: ["hyacinth", "avarakai"],
        fallbackImg: "/images/products/cut-beans.jpg",
        desc: "Fresh broad avarakai cleaned and chopped for authentic poriyal.",
      },
      {
        name: "Elephant foot yam",
        tamilName: "சேனைக்கிழங்கு (நறுக்கியது)",
        slug: "chopped-elephant-foot-yam",
        catSlug: "chopped-vegetables",
        variantName: "500 g",
        sellingPrice: "35.00",
        mrp: "50.00",
        imgKw: ["elephant", "yam"],
        fallbackImg: "/images/products/cut-carrot.jpg",
        desc: "Peeled and diced elephant foot yam, zero itchy skin prep.",
      },
      {
        name: "All types of Spinach (mention the spinach name in watzup)",
        tamilName: "கீரை வகைகள் (வாட்ஸ்அப்பில் பெயரை குறிப்பிடவும்)",
        slug: "fresh-spinach-all-types",
        catSlug: "chopped-vegetables",
        variantName: "500 g",
        sellingPrice: "35.00",
        mrp: "50.00",
        imgKw: ["spinach", "shredded spinach"],
        fallbackImg: "/images/products/cut-beans.jpg",
        desc: "Fresh leafy spinach sorted, cleaned and shredded. Please WhatsApp your specific variety.",
      },
      {
        name: "Ivy gourd (kovaka)",
        tamilName: "கோவக்காய் (நறுக்கியது)",
        slug: "chopped-ivy-gourd",
        catSlug: "chopped-vegetables",
        variantName: "500 g",
        sellingPrice: "35.00",
        mrp: "50.00",
        imgKw: ["ivy gourd", "kovaka"],
        fallbackImg: "/images/products/cut-lady-finger.jpg",
        desc: "Cleaned and sliced kovakkai rounds, ready for pan roast.",
      },
      {
        name: "Bitter guard",
        tamilName: "பாகற்காய் (நறுக்கியது)",
        slug: "chopped-bitter-guard",
        catSlug: "chopped-vegetables",
        variantName: "500 g",
        sellingPrice: "35.00",
        mrp: "50.00",
        imgKw: ["bitter gourd", "bitter guard"],
        fallbackImg: "/images/products/cut-lady-finger.jpg",
        desc: "Deseeded and sliced bitter gourd rings ready for fry or curry.",
      },
      {
        name: "Snake gourd",
        tamilName: "புடலங்காய் (நறுக்கியது)",
        slug: "chopped-snake-gourd",
        catSlug: "chopped-vegetables",
        variantName: "500 g",
        sellingPrice: "35.00",
        mrp: "50.00",
        imgKw: ["snake gourd", "snack guard"],
        fallbackImg: "/images/products/cut-lady-finger.jpg",
        desc: "Pith removed and diced snake gourd for kootu and curry.",
      },
      {
        name: "Bottle guard",
        tamilName: "சுரைக்காய் (நறுக்கியது)",
        slug: "chopped-bottle-guard",
        catSlug: "chopped-vegetables",
        variantName: "500 g",
        sellingPrice: "35.00",
        mrp: "50.00",
        imgKw: ["bottle gourd", "bottle guard"],
        fallbackImg: "/images/products/cut-cauliflower.jpg",
        desc: "Tender bottle gourd peeled and cleanly cubed.",
      },
      {
        name: "Radish",
        tamilName: "முள்ளங்கி (நறுக்கியது)",
        slug: "chopped-radish",
        catSlug: "chopped-vegetables",
        variantName: "500 g",
        sellingPrice: "35.00",
        mrp: "50.00",
        imgKw: ["radish"],
        fallbackImg: "/images/products/cut-carrot.jpg",
        desc: "Crisp white radish peeled and sliced for sambar.",
      },
      {
        name: "Chayote squash (chow chow)",
        tamilName: "சௌ சௌ (நறுக்கியது)",
        slug: "chopped-chayote-squash",
        catSlug: "chopped-vegetables",
        variantName: "500 g",
        sellingPrice: "35.00",
        mrp: "50.00",
        imgKw: ["chayote", "chow chow"],
        fallbackImg: "/images/products/cut-cauliflower.jpg",
        desc: "Peeled and diced chow chow for dal kootu.",
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
        desc: "Bite-sized washed cauliflower florets, clean and insect-free.",
      },
      {
        name: "Yellow Pumpkin",
        tamilName: "பரங்கிக்காய் / மஞ்சள் பூசணி",
        slug: "chopped-yellow-pumpkin",
        catSlug: "chopped-vegetables",
        variantName: "500 g",
        sellingPrice: "35.00",
        mrp: "50.00",
        imgKw: ["yellow pumpkin"],
        fallbackImg: "/images/products/cut-carrot.jpg",
        desc: "Sweet yellow pumpkin skin removed and cubed.",
      },
      {
        name: "White pumpkin",
        tamilName: "வெள்ளை பூசணிக்காய் (Ash Gourd)",
        slug: "chopped-white-pumpkin",
        catSlug: "chopped-vegetables",
        variantName: "500 g",
        sellingPrice: "35.00",
        mrp: "50.00",
        imgKw: ["ash gourd", "white pumpkin"],
        fallbackImg: "/images/products/cut-cauliflower.jpg",
        desc: "Juicy white ash gourd cubed for mor kulambu or halwa.",
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
        fallbackImg: "/images/products/cut-beans.jpg",
        desc: "Crunchy green bell peppers deseeded and diced.",
      },
      {
        name: "German turnip (Nukal)",
        tamilName: "நூல்கோல் (நறுக்கியது)",
        slug: "chopped-german-turnip",
        catSlug: "chopped-vegetables",
        variantName: "500 g",
        sellingPrice: "35.00",
        mrp: "50.00",
        imgKw: ["knol-khol", "nukal", "turnip"],
        fallbackImg: "/images/products/cut-cauliflower.jpg",
        desc: "Tender knol-khol peeled and cubed for kootu or curry.",
      },
      {
        name: "Cabbage",
        tamilName: "முட்டைகோஸ் (நறுக்கியது)",
        slug: "chopped-cabbage",
        catSlug: "chopped-vegetables",
        variantName: "500 g",
        sellingPrice: "35.00",
        mrp: "50.00",
        imgKw: ["cabbage"],
        fallbackImg: "/images/products/cut-cauliflower.jpg",
        desc: "Fine shredded cabbage washed and ready for poriyal.",
      },
      {
        name: "Mushroom",
        tamilName: "காளான் (நறுக்கியது)",
        slug: "chopped-mushroom",
        catSlug: "chopped-vegetables",
        variantName: "500 g",
        sellingPrice: "35.00",
        mrp: "50.00",
        imgKw: ["mushroom"],
        fallbackImg: "/images/products/cut-cauliflower.jpg",
        desc: "Fresh button mushrooms cleaned and sliced for fry or gravy.",
      },
      {
        name: "Ridge gourd (Peerkangai)",
        tamilName: "பீர்க்கங்காய் (நறுக்கியது)",
        slug: "chopped-ridge-gourd",
        catSlug: "chopped-vegetables",
        variantName: "500 g",
        sellingPrice: "35.00",
        mrp: "50.00",
        imgKw: ["ridge gourd", "peerkangai"],
        fallbackImg: "/images/products/cut-lady-finger.jpg",
        desc: "Ridges peeled and diced peerkangai ready for dal curry.",
      },
      {
        name: "Onion",
        tamilName: "முழு வெங்காயம்",
        slug: "fresh-whole-onion",
        catSlug: "chopped-vegetables",
        variantName: "1 kg",
        sellingPrice: "38.00",
        mrp: "50.00",
        imgKw: ["whole-onion", "onion"],
        fallbackImg: "/images/products/whole-onion.jpg",
        desc: "Selected quality farm-fresh dry onions.",
      },
      {
        name: "Tomato",
        tamilName: "நாட்டு தக்காளி",
        slug: "fresh-whole-tomato",
        catSlug: "chopped-vegetables",
        variantName: "500 g",
        sellingPrice: "29.00",
        mrp: "40.00",
        imgKw: ["whole-tomato", "tomato"],
        fallbackImg: "/images/products/whole-tomato.jpg",
        desc: "Ripe, firm red country tomatoes.",
      },
      {
        name: "Grated coconut",
        tamilName: "துருவிய தேங்காய்",
        slug: "fresh-grated-coconut",
        catSlug: "chopped-vegetables",
        variantName: "200 g",
        sellingPrice: "42.00",
        mrp: "55.00",
        imgKw: ["grated coconut"],
        fallbackImg: "/images/products/grated-coconut.jpg",
        desc: "Fresh sweet coconut grated without brown husk.",
      },
      {
        name: "Peeled small onion",
        tamilName: "உரித்த சின்ன வெங்காயம்",
        slug: "peeled-small-onion",
        catSlug: "chopped-vegetables",
        variantName: "500 g",
        sellingPrice: "35.00",
        mrp: "50.00",
        imgKw: ["peeled small onion"],
        fallbackImg: "/images/products/peeled-onion-garlic.jpg",
        desc: "100% skin peeled shallots (chinna vengayam), tear-free cooking.",
      },
      {
        name: "Peeled garlic",
        tamilName: "உரித்த பூண்டு",
        slug: "peeled-garlic",
        catSlug: "chopped-vegetables",
        variantName: "500 g",
        sellingPrice: "35.00",
        mrp: "50.00",
        imgKw: ["peeled garlic"],
        fallbackImg: "/images/products/peeled-onion-garlic.jpg",
        desc: "Clean peeled garlic cloves ready for paste or cooking.",
      },
      {
        name: "Sliced big onion",
        tamilName: "நறுக்கிய பெரிய வெங்காயம்",
        slug: "sliced-big-onion",
        catSlug: "chopped-vegetables",
        variantName: "1 kg",
        sellingPrice: "38.00",
        mrp: "50.00",
        imgKw: ["sliced big onion", "onion-slices"],
        fallbackImg: "/images/products/onion-slices.jpg",
        desc: "Precision sliced onions for curries, briyani and fry.",
      },
      {
        name: "Sliced tomato",
        tamilName: "நறுக்கிய தக்காளி",
        slug: "sliced-tomato",
        catSlug: "chopped-vegetables",
        variantName: "500 g",
        sellingPrice: "29.00",
        mrp: "40.00",
        imgKw: ["tomato slices", "sliced tomato"],
        fallbackImg: "/images/products/tomato-slices.jpg",
        desc: "Evenly sliced juicy tomatoes ready for gravies.",
      },
      {
        name: "Broccoli",
        tamilName: "ப்ராக்கோலி (நறுக்கியது)",
        slug: "chopped-broccoli",
        catSlug: "chopped-vegetables",
        variantName: "250 g",
        sellingPrice: "85.00",
        mrp: "110.00",
        imgKw: ["broccoli", "chopped broccoli"],
        fallbackImg: "/images/products/cut-cauliflower.jpg",
        desc: "Fresh green broccoli florets washed and ready to saute.",
      },
      {
        name: "Shredded coriander/mint/curry leaves",
        tamilName: "நறுக்கிய கொத்தமல்லி / புதினா / கறிவேப்பிலை",
        slug: "shredded-herbs-mix",
        catSlug: "chopped-vegetables",
        variantName: "150 g",
        sellingPrice: "30.00",
        mrp: "40.00",
        imgKw: ["coriander", "mint", "curry"],
        fallbackImg: "/images/products/peeled-onion-garlic.jpg",
        desc: "Freshly cleaned and shredded coriander, mint and curry leaves garnish pack.",
      },
      {
        name: "Others please mention in watzup",
        tamilName: "பிற காய்கறிகள் (வாட்ஸ்அப்பில் குறிப்பிடவும்)",
        slug: "custom-cut-vegetables-whatsapp",
        catSlug: "chopped-vegetables",
        variantName: "500 g",
        sellingPrice: "35.00",
        mrp: "50.00",
        imgKw: ["sambar veg mix", "custom"],
        fallbackImg: "/images/products/sambar-cut-mix.jpg",
        desc: "Special cutting requests or other vegetable varieties. Please mention on WhatsApp.",
      },

      // 2. Chopped Fruits
      {
        name: "Pappaya",
        tamilName: "நறுக்கிய பப்பாளி",
        slug: "chopped-pappaya",
        catSlug: "chopped-fruits",
        variantName: "500 g",
        sellingPrice: "35.00",
        mrp: "50.00",
        imgKw: ["papaya", "pappaya"],
        fallbackImg: "/images/products/fruit-cut-papaya.jpg",
        desc: "Sweet and ripe papaya deseeded and cut into fresh cubes.",
      },
      {
        name: "Pine Apple",
        tamilName: "நறுக்கிய அன்னாசி",
        slug: "chopped-pine-apple",
        catSlug: "chopped-fruits",
        variantName: "500 g",
        sellingPrice: "35.00",
        mrp: "50.00",
        imgKw: ["pineapple", "pine apple"],
        fallbackImg: "/images/products/fruit-cut-pineapple.jpg",
        desc: "Thorns removed and core-cut juicy pineapple chunks.",
      },
      {
        name: "Water melon",
        tamilName: "நறுக்கிய தர்பூசணி",
        slug: "chopped-water-melon",
        catSlug: "chopped-fruits",
        variantName: "500 g",
        sellingPrice: "35.00",
        mrp: "50.00",
        imgKw: ["watermelon", "water melon"],
        fallbackImg: "/images/products/fruit-cut-watermelon.jpg",
        desc: "Sweet red watermelon cubes, deseeded and chilled.",
      },
      {
        name: "Pear",
        tamilName: "நறுக்கிய பேரிக்காய்",
        slug: "chopped-pear",
        catSlug: "chopped-fruits",
        variantName: "300 g",
        sellingPrice: "59.00",
        mrp: "75.00",
        imgKw: ["pear", "chopped pear"],
        fallbackImg: "/images/products/fruit-cut-papaya.jpg",
        desc: "Crunchy green pears cored and sliced.",
      },
      {
        name: "Dragon fruit",
        tamilName: "டிராகன் ஃப்ரூட்",
        slug: "chopped-dragon-fruit",
        catSlug: "chopped-fruits",
        variantName: "500 g",
        sellingPrice: "35.00",
        mrp: "50.00",
        imgKw: ["dragon fruit"],
        fallbackImg: "/images/products/fruit-cut-dragon.jpg",
        desc: "Exotic dragon fruit skin peeled and diced into cubes.",
      },
      {
        name: "Kiwi",
        tamilName: "கிவி (நறுக்கியது)",
        slug: "chopped-kiwi",
        catSlug: "chopped-fruits",
        variantName: "500 g",
        sellingPrice: "35.00",
        mrp: "50.00",
        imgKw: ["kiwi"],
        fallbackImg: "/images/products/fruit-cut-dragon.jpg",
        desc: "Fresh zesty green kiwi peeled and sliced.",
      },
      {
        name: "Guava",
        tamilName: "நறுக்கிய கொய்யா",
        slug: "chopped-guava",
        catSlug: "chopped-fruits",
        variantName: "500 g",
        sellingPrice: "35.00",
        mrp: "50.00",
        imgKw: ["guava"],
        fallbackImg: "/images/products/fruit-cut-papaya.jpg",
        desc: "Crunchy fresh country guava sliced into wedges.",
      },
      {
        name: "Cucumber",
        tamilName: "வெள்ளரிக்காய் (நறுக்கியது)",
        slug: "chopped-cucumber",
        catSlug: "chopped-fruits",
        variantName: "250 g",
        sellingPrice: "45.00",
        mrp: "60.00",
        imgKw: ["cucumber"],
        fallbackImg: "/images/products/fruit-cut-watermelon.jpg",
        desc: "Cooling salad cucumber peeled and sliced.",
      },
      {
        name: "Orange",
        tamilName: "ஆரஞ்சு சுளைகள்",
        slug: "fresh-cut-orange",
        catSlug: "chopped-fruits",
        variantName: "350 g",
        sellingPrice: "49.00",
        mrp: "65.00",
        imgKw: ["orange", "citrus"],
        fallbackImg: "/images/products/fruit-salad-citrus.jpg",
        desc: "Sweet Nagpur oranges peeled into clean juicy segments.",
      },
      {
        name: "Apple",
        tamilName: "நறுக்கிய ஆப்பிள்",
        slug: "chopped-apple",
        catSlug: "chopped-fruits",
        variantName: "500 g",
        sellingPrice: "35.00",
        mrp: "50.00",
        imgKw: ["apple", "chopped apple"],
        fallbackImg: "/images/products/fruit-combo-deluxe.jpg",
        desc: "Kashmir red apples cored and cleanly sliced.",
      },
      {
        name: "Green Apple",
        tamilName: "கிரீன் ஆப்பிள் (நறுக்கியது)",
        slug: "chopped-green-apple",
        catSlug: "chopped-fruits",
        variantName: "350 g",
        sellingPrice: "49.00",
        mrp: "65.00",
        imgKw: ["green apple"],
        fallbackImg: "/images/products/fruit-combo-deluxe.jpg",
        desc: "Crisp and tangy Granny Smith green apple slices.",
      },
      {
        name: "Pomegranate",
        tamilName: "உதிர்த்த மாதுளை முத்துக்கள்",
        slug: "shredded-pomegranate",
        catSlug: "chopped-fruits",
        variantName: "500 g",
        sellingPrice: "150.00",
        mrp: "190.00",
        imgKw: ["pomegranate", "shredded pomegranate"],
        fallbackImg: "/images/products/fruit-cut-pomegranate.jpg",
        desc: "Sweet ruby red pomegranate arils completely separated and ready to eat.",
      },
      {
        name: "Gooseberry",
        tamilName: "நெல்லிக்காய் (நறுக்கியது)",
        slug: "chopped-gooseberry",
        catSlug: "chopped-fruits",
        variantName: "300 g",
        sellingPrice: "48.00",
        mrp: "60.00",
        imgKw: ["gooseberry"],
        fallbackImg: "/images/products/fruit-cut-papaya.jpg",
        desc: "Fresh amla gooseberry deseeded and chopped for juices and immunity.",
      },
      {
        name: "Banana (Brown/yellow)",
        tamilName: "நறுக்கிய வாழைப்பழம் (மஞ்சள் / செவ்வாழை)",
        slug: "sliced-banana-fresh",
        catSlug: "chopped-fruits",
        variantName: "350 g",
        sellingPrice: "35.00",
        mrp: "50.00",
        imgKw: ["banana"],
        fallbackImg: "/images/products/fruit-combo-deluxe.jpg",
        desc: "Sweet sliced bananas (yellow or red banana).",
      },
      {
        name: "Grapes (Green/black)",
        tamilName: "கழுவிய திராட்சை (பச்சை / கருப்பு)",
        slug: "fresh-grapes-pack",
        catSlug: "chopped-fruits",
        variantName: "250 g",
        sellingPrice: "45.00",
        mrp: "60.00",
        imgKw: ["grapes"],
        fallbackImg: "/images/products/fruit-combo-deluxe.jpg",
        desc: "Washed seedless sweet grapes (green and black mix).",
      },

      // 3. Sprouts (pre order only)
      {
        name: "Cucumber Sprout",
        tamilName: "வெள்ளரி முளைகட்டியது",
        slug: "cucumber-sprout",
        catSlug: "sprouts",
        variantName: "250 g",
        sellingPrice: "45.00",
        mrp: "60.00",
        imgKw: ["cucumber"],
        fallbackImg: "/images/products/veg-salad-fresh.jpg",
        desc: "Fresh sprouted seeds with diced cucumber for natural hydration.",
      },
      {
        name: "Groundnut",
        tamilName: "முளைகட்டிய நிலக்கடலை",
        slug: "groundnut-sprout",
        catSlug: "sprouts",
        variantName: "200 g",
        sellingPrice: "49.00",
        mrp: "65.00",
        imgKw: ["horse gram", "groundnut"],
        fallbackImg: "/images/products/veg-salad-sprouts.jpg",
        desc: "Germinated raw peanuts loaded with healthy fats and energy.",
      },
      {
        name: "Green Mong Dal",
        tamilName: "முளைகட்டிய பாசிப்பயறு",
        slug: "green-moong-dal-sprout",
        catSlug: "sprouts",
        variantName: "250 g",
        sellingPrice: "99.00",
        mrp: "120.00",
        imgKw: ["moong dal", "mong dal"],
        fallbackImg: "/images/products/veg-salad-sprouts.jpg",
        desc: "Naturally sprouted whole green gram, high in fiber and live enzymes.",
      },
      {
        name: "Black channa",
        tamilName: "முளைகட்டிய கருப்பு கொண்டைக்கடலை",
        slug: "black-channa-sprout",
        catSlug: "sprouts",
        variantName: "250 g",
        sellingPrice: "89.00",
        mrp: "110.00",
        imgKw: ["black channa"],
        fallbackImg: "/images/products/veg-salad-sprouts.jpg",
        desc: "Sprouted Kala Chana, rich in iron, zinc and complex carbohydrates.",
      },
      {
        name: "White channa",
        tamilName: "முளைகட்டிய வெள்ளை கொண்டைக்கடலை",
        slug: "white-channa-sprout",
        catSlug: "sprouts",
        variantName: "250 g",
        sellingPrice: "89.00",
        mrp: "110.00",
        imgKw: ["white channa"],
        fallbackImg: "/images/products/veg-salad-sprouts.jpg",
        desc: "Germinated Kabuli Channa, tender and packed with plant protein.",
      },
      {
        name: "Soya beans",
        tamilName: "முளைகட்டிய சோயாபீன்ஸ்",
        slug: "soya-beans-sprout",
        catSlug: "sprouts",
        variantName: "250 g",
        sellingPrice: "79.00",
        mrp: "99.00",
        imgKw: ["soya bean", "soya beans"],
        fallbackImg: "/images/products/veg-salad-sprouts.jpg",
        desc: "Sprouted yellow soybeans, ultimate plant-based protein powerhouse.",
      },
      {
        name: "Green peas",
        tamilName: "முளைகட்டிய பச்சை பட்டாணி",
        slug: "green-peas-sprout",
        catSlug: "sprouts",
        variantName: "500 g",
        sellingPrice: "35.00",
        mrp: "50.00",
        imgKw: ["green peas"],
        fallbackImg: "/images/products/veg-salad-sprouts.jpg",
        desc: "Sweet germinated green peas, delicious in salads or curries.",
      },
      {
        name: "Horse gram",
        tamilName: "முளைகட்டிய கொள்ளு",
        slug: "horse-gram-sprout",
        catSlug: "sprouts",
        variantName: "200 g",
        sellingPrice: "55.00",
        mrp: "70.00",
        imgKw: ["horse gram"],
        fallbackImg: "/images/products/veg-salad-sprouts.jpg",
        desc: "Traditional sprouted Kollu, renowned for metabolism boost and energy.",
      },

      // 4. Combo
      {
        name: "Pulav combo",
        tamilName: "புலாவ் ஸ்பெஷல் காய்கறி காம்போ",
        slug: "pulav-combo-kit",
        catSlug: "combos",
        variantName: "Serves 4 (750 g)",
        sellingPrice: "129.00",
        mrp: "160.00",
        imgKw: ["pulav", "white pulav"],
        fallbackImg: "/images/products/pulav-special-veggie-combo-kit.png",
        desc: "Big Onion slices, Tomato, Chilli, Grated Coconut, Carrot, Beans, Peas, Potato, Ginger, Garlic.",
      },
      {
        name: "Vegetables Biriyani combo",
        tamilName: "வெஜிடபிள் பிரியாணி ஸ்பெஷல் காம்போ",
        slug: "vegetables-biriyani-combo-kit",
        catSlug: "combos",
        variantName: "Serves 4 (800 g)",
        sellingPrice: "179.00",
        mrp: "220.00",
        imgKw: ["briyani", "biriyani", "biryani"],
        fallbackImg: "/images/products/vegetables-biryani-special-kit.png",
        desc: "Big Onion slices, Tomato, Chilli, Carrot, Beans, Peas, Potato, Ginger, Garlic.",
      },
      {
        name: "Aviyal combo",
        tamilName: "பாரம்பரிய அவியல் காய்கறி கலவை",
        slug: "aviyal-combo-kit",
        catSlug: "combos",
        variantName: "Serves 4 (700 g)",
        sellingPrice: "125.00",
        mrp: "155.00",
        imgKw: ["aviyal"],
        fallbackImg: "/images/products/traditional-aviyal-7-veggie-cut-mix.png",
        desc: "Elephant Foot Yam, Drumstick, Carrot, Beans, Pusanikai, Valaikai, Avaraikai.",
      },
      {
        name: "Bisimila bath (with onion/without onion)",
        tamilName: "பிசிபேலே பாத் காய்கறி காம்போ",
        slug: "bisimila-bath-combo-kit",
        catSlug: "combos",
        variantName: "Serves 4 (750 g)",
        sellingPrice: "139.00",
        mrp: "175.00",
        imgKw: ["bisi bele", "bisimila"],
        fallbackImg: "/images/products/bisi-bele-bath-kit.png",
        desc: "Small Onion, Drumstick, Carrot, Beans, Capsicum, Peas, Pusanikai (White or Yellow), Tomato, Potato, Brinjal.",
      },

      // 5. Fruit salad
      {
        name: "Custom Fruit Salad Bowl (Add fruits & berries based on your wish)",
        tamilName: "விருப்பப்படி பழங்கள் மற்றும் பெர்ரிகள் சேர்த்த பழ சாலட்",
        slug: "custom-fruit-salad-bowl",
        catSlug: "fruit-salad",
        variantName: "350 g Bowl",
        sellingPrice: "119.00",
        mrp: "150.00",
        imgKw: ["fruit salad", "exotic fruit"],
        fallbackImg: "/images/products/fruit-salad-exotic.jpg",
        desc: "Custom bowl: Raspberry, Blueberry, Cranberry, Strawberry, Plums, Guava, Watermelon, Banana, Pineapple, Grapes, Apple.",
      },
      {
        name: "Tropical Melon & Berry Fruit Salad",
        tamilName: "ட்ராபிகல் மெலன் & பெர்ரி பழ சாலட்",
        slug: "tropical-melon-berry-salad",
        catSlug: "fruit-salad",
        variantName: "350 g Bowl",
        sellingPrice: "99.00",
        mrp: "130.00",
        imgKw: ["tropical melon", "melon & berry"],
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
        imgKw: ["watermelon mint"],
        fallbackImg: "/images/products/fruit-salad-watermelon.jpg",
        desc: "Crisp red seedless watermelon cubes infused with fresh garden mint leaves.",
      },

      // 6. Sprouts salads
      {
        name: "Sprouts Salad (Select any 3 items - Pre-Order Only)",
        tamilName: "முளைகட்டிய பயறு சாலட் (ஏதேனும் 3 தேர்வு செய்யவும்)",
        slug: "custom-sprouts-salad-diet-bowl",
        catSlug: "sprouts-salads",
        variantName: "300 g Bowl",
        sellingPrice: "79.00",
        mrp: "105.00",
        imgKw: ["sprouts salad", "protein sprouts"],
        fallbackImg: "/images/products/sprouts-salad-custom-bowl.jpg",
        desc: "Select 3: Cucumber, Groundnut, Green Moong, Black Channa, White Channa, Soya Beans, Green Peas, Horse Gram.",
      },
      {
        name: "Protein Sprouts Power Salad",
        tamilName: "புரோட்டீன் ஸ்ப்ரௌட்ஸ் பவர் சாலட்",
        slug: "protein-sprouts-power-salad",
        catSlug: "sprouts-salads",
        variantName: "250 g",
        sellingPrice: "79.00",
        mrp: "100.00",
        imgKw: ["protein sprouts"],
        fallbackImg: "/images/products/veg-salad-sprouts.jpg",
        desc: "Triple sprouted power bowl: Moong, Channa, Soya with pepper lime dressing.",
      },

      // 7. Vegetables salads
      {
        name: "Vegetables Salad (Select any 3 items)",
        tamilName: "காய்கறி சாலட் (ஏதேனும் 3 தேர்வு செய்யவும்)",
        slug: "custom-vegetables-salad-diet-bowl",
        catSlug: "vegetables-salads",
        variantName: "300 g Bowl",
        sellingPrice: "79.00",
        mrp: "105.00",
        imgKw: ["vegetable salad", "fresh vegetables salad"],
        fallbackImg: "/images/products/vegetable-salad-custom-bowl.jpg",
        desc: "Select 3: Cucumber, Cabbage, Corn, Carrot, Sliced Beetroot, Broccoli, Mango, Tomato, Big Onion, Coriander Leaves.",
      },
      {
        name: "Fresh Vegetables Salad Bowl",
        tamilName: "ஃப்ரெஷ் காய்கறி சாலட் பவுல்",
        slug: "fresh-vegetables-salad-bowl",
        catSlug: "vegetables-salads",
        variantName: "250 g",
        sellingPrice: "99.00",
        mrp: "125.00",
        imgKw: ["fresh vegetables salad"],
        fallbackImg: "/images/products/veg-salad-fresh.jpg",
        desc: "Crunchy carrot, cucumber, cabbage, tomato and bell pepper with lemon vinaigrette.",
      },
    ];

    console.log(`Total products to sync: ${ALL_USER_PRODUCTS.length}`);

    // Track synced product IDs so we know which products to keep active
    const activeProductIds = new Set();

    for (const item of ALL_USER_PRODUCTS) {
      const catId = catMap.get(item.catSlug);
      if (!catId) {
        console.error(`Missing category ID for ${item.catSlug}`);
        continue;
      }

      // Check if product already exists by exact slug or matching name
      let [existingProd] = (
        await client.query(
          "SELECT id, name, slug FROM products WHERE slug = $1 OR name ILIKE $2 LIMIT 1",
          [item.slug, `%${item.name.split(" ")[0]}%`]
        )
      ).rows;

      // Special case: Preserve Soya Bean Sprout ID from our live order
      if (item.name.toLowerCase().includes("soya")) {
        const [soya] = (
          await client.query("SELECT id FROM products WHERE name ILIKE '%soya%' LIMIT 1")
        ).rows;
        if (soya) existingProd = soya;
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

      // Check variant
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
        const vIns = (
          await client.query(
            `INSERT INTO product_variants (
              product_id, variant_name, weight, unit, mrp, selling_price, cost_price, is_default, status
            ) VALUES ($1, $2, '0.500', 'g', $3, $4, '25.00', true, 'active')
            RETURNING id`,
            [prodId, item.variantName, item.mrp, item.sellingPrice]
          )
        ).rows[0];
        variantId = vIns.id;
      }

      // Check inventory
      const [inv] = (
        await client.query("SELECT id FROM inventory WHERE variant_id = $1 LIMIT 1", [variantId])
      ).rows;
      if (!inv) {
        await client.query(
          `INSERT INTO inventory (variant_id, warehouse_name, available_stock, minimum_stock, maximum_stock, reorder_level)
           VALUES ($1, 'Chennai Central Hub', 100, 5, 500, 20)`,
          [variantId]
        );
      }

      // Assign image (reuse existing Base64 if available, otherwise fallback)
      let resolvedImg = findImage(item.imgKw) || item.fallbackImg;

      const [imgRow] = (
        await client.query(
          "SELECT id, image_url FROM product_images WHERE product_id = $1 AND is_primary = true LIMIT 1",
          [prodId]
        )
      ).rows;

      if (imgRow) {
        // Keep existing image if it's already there and valid
        if (!imgRow.image_url || imgRow.image_url === "") {
          await client.query("UPDATE product_images SET image_url = $1 WHERE id = $2", [
            resolvedImg,
            imgRow.id,
          ]);
        }
      } else {
        await client.query(
          `INSERT INTO product_images (product_id, image_url, is_primary, display_order)
           VALUES ($1, $2, true, 1)`,
          [prodId, resolvedImg]
        );
      }
    }

    // Deactivate / Remove any product in DB that is NOT in the user's list
    console.log("Deactivating products not in the user list...");
    const allDbProds = (await client.query("SELECT id, name FROM products")).rows;
    let deactivatedCount = 0;
    for (const p of allDbProds) {
      if (!activeProductIds.has(p.id)) {
        await client.query("UPDATE products SET status = 'deleted' WHERE id = $1", [p.id]);
        deactivatedCount++;
        console.log(`Deactivated non-list product: ${p.name}`);
      }
    }

    console.log(
      `SUCCESS: Synced ${activeProductIds.size} official products across 7 categories. Deactivated ${deactivatedCount} non-list items.`
    );
  } catch (err) {
    console.error("Sync error:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

syncCatalog();
