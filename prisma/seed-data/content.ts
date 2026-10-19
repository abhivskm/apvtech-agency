export const INDUSTRIES = [
  {
    slug: "small-business",
    title: "Small & Medium-Sized Businesses",
    shortTitle: "SMBs",
    intro: "Practical digital foundations for established local businesses that want to be easier to find, look more credible online and spend less time on marketing admin.",
    needs: [
      "A professional website that explains services clearly",
      "A complete, active Google Business Profile",
      "Consistent social media without hiring a full team",
      "Simple systems to capture and follow up enquiries",
    ],
    body: `<p>Most small and medium-sized businesses grew through referrals and reputation. Today, even referred customers check you online before they call. If your website is outdated, your Google listing incomplete or your social pages quiet, you may be losing work you never hear about.</p>
<h2>Where we usually start</h2>
<ul><li>Refreshing or rebuilding the website so it clearly explains what you do and makes enquiring easy</li><li>Optimising your Google Business Profile and local SEO</li><li>Setting up a manageable social media rhythm with on-brand templates</li><li>Routing enquiries from the website and WhatsApp into one place</li></ul>
<p>We scope work in stages, so you can start with the highest-impact improvements and expand when it makes sense.</p>`,
    media: "clothing-store",
    services: ["website-development", "seo-google-presence", "social-media-management", "ai-automation"],
  },
  {
    slug: "startups",
    title: "Startups & New Brands",
    shortTitle: "Startups",
    intro: "Brand identity, launch websites and early marketing for founders who need to look credible from day one and move quickly.",
    needs: [
      "A distinctive identity that can grow with the company",
      "A launch website or landing page, fast",
      "Pitch, product and social creative that looks consistent",
      "Early campaigns to test positioning and demand",
    ],
    body: `<p>Early-stage companies need to make a credible impression on customers, investors and future hires, often before the product is finished. We help founders build a brand and digital presence that feels considered without slowing the business down.</p>
<h2>How we help</h2>
<ul><li>Naming support, identity design and brand guidelines</li><li>Launch websites and landing pages designed to be iterated</li><li>Pitch decks, product imagery and launch content</li><li>Small, well-tracked paid tests to learn what messaging resonates</li></ul>`,
    media: "team-collab",
    services: ["creative-design", "website-development", "paid-advertising", "video-production"],
  },
  {
    slug: "ecommerce",
    title: "E-commerce & D2C Brands",
    shortTitle: "E-commerce",
    intro: "Stores, product photography, content and campaigns for brands selling directly to customers online.",
    needs: [
      "A fast, trustworthy store designed for mobile shoppers",
      "Consistent product photography across every channel",
      "A steady supply of reels and social content",
      "Paid campaigns with conversion tracking you can rely on",
    ],
    body: `<p>Direct-to-consumer brands compete on experience. Customers judge quality from photographs, trust from product pages, and convenience from checkout. Everything needs to work together — and keep producing fresh content.</p>
<h2>A connected setup</h2>
<ul><li>Store design and development on Shopify, WooCommerce or custom stacks</li><li>Product, lifestyle and campaign photography</li><li>Reels and short-form content for social and ads</li><li>Meta and Google campaigns with proper tracking</li></ul>`,
    media: "cosmetics-flatlay",
    services: ["ecommerce-development", "product-photography", "video-production", "paid-advertising"],
  },
  {
    slug: "restaurants-hospitality",
    title: "Restaurants, Cafés & Hotels",
    shortTitle: "Hospitality",
    intro: "Food photography, social content, local search and booking-friendly websites for hospitality businesses.",
    needs: [
      "Food and space photography that reflects the experience",
      "Strong Google Maps presence and review management",
      "Regular reels and social posts around menus and events",
      "Websites with menus, booking and directions that work on mobile",
    ],
    body: `<p>Diners and guests decide with their eyes and their phones. Photographs on Google, delivery apps and Instagram often matter as much as the menu itself, and most people will check your Google listing before they visit.</p>
<h2>What we focus on</h2>
<ul><li>Food, drink and interior photography for menus, delivery apps and social</li><li>Google Business Profile optimisation and review response routines</li><li>Reels around dishes, events and the team behind the counter</li><li>Mobile-first websites with menus, booking links and directions</li></ul>`,
    media: "restaurant-interior",
    services: ["product-photography", "social-media-management", "seo-google-presence", "website-development"],
  },
];

export const PROJECT_CATEGORIES = [
  { slug: "website-design", name: "Website design" },
  { slug: "ecommerce", name: "E-commerce" },
  { slug: "branding", name: "Branding" },
  { slug: "social-campaigns", name: "Social campaigns" },
  { slug: "product-photography", name: "Product photography" },
  { slug: "video-production", name: "Video production" },
  { slug: "digital-advertising", name: "Digital advertising" },
];

/** Concept (self-initiated) projects. Clearly labelled publicly; no client names or invented results. */
export const PROJECTS = [
  {
    slug: "monsoon-roast-coffee",
    title: "Monsoon Roast — coffee brand identity & store",
    summary: "A concept identity, packaging system and Shopify store design for a speciality coffee roaster.",
    cover: "coffee-packaging",
    gallery: ["coffee-packaging", "latte-hands", "latte-cups"],
    industry: "ecommerce",
    categories: ["branding", "ecommerce", "product-photography"],
    services: ["creative-design", "ecommerce-development", "product-photography"],
    challenge: "Speciality coffee shelves are crowded with similar kraft-paper bags. The concept brief: create a brand that feels premium but approachable, and a store that explains origins and roast profiles without overwhelming new buyers.",
    solution: "A restrained identity built around a single bold wordmark and colour-coded roast levels, packaging that reads clearly from a distance, and a store structure that lets customers shop by taste rather than by estate.",
    outcome: "This is a self-initiated concept project created to demonstrate our approach. It has not been launched commercially.",
    featured: true,
  },
  {
    slug: "saffron-table-restaurant",
    title: "Saffron Table — restaurant launch campaign",
    summary: "Concept food photography, menu design and a launch social campaign for a modern Indian restaurant.",
    cover: "food-plates",
    gallery: ["food-plates", "restaurant-dining", "salad-bowl", "restaurant-interior"],
    industry: "restaurants-hospitality",
    categories: ["product-photography", "social-campaigns", "branding"],
    services: ["product-photography", "social-media-management", "creative-design"],
    challenge: "New restaurants have a short window to build awareness. The concept explores how a coordinated shoot can supply menus, delivery apps, Google listings and a month of launch content at once.",
    solution: "A single planned shoot day producing overhead dish photography, atmosphere shots and short clips, paired with a launch calendar that moves from teasers to opening-week offers.",
    outcome: "Concept project for demonstration. Imagery shown is licensed stock used to illustrate art direction.",
    featured: true,
  },
  {
    slug: "atelier-north-fashion",
    title: "Atelier North — fashion e-commerce",
    summary: "A mobile-first store concept for an independent clothing label, built around lookbooks and size confidence.",
    cover: "clothing-rack",
    gallery: ["clothing-rack", "clothing-store", "phone-app"],
    industry: "ecommerce",
    categories: ["ecommerce", "website-design"],
    services: ["ecommerce-development", "website-development", "product-photography"],
    challenge: "Independent fashion brands lose sales to uncertainty about fit and fabric. The concept tackles this on small screens, where most fashion shopping happens.",
    solution: "Editorial lookbook pages that link directly to products, fabric close-ups, model measurements on every product, and a streamlined size guide in the add-to-cart flow.",
    outcome: "Self-initiated concept work. No performance claims are made.",
    featured: true,
  },
  {
    slug: "sonic-audio-product-shoot",
    title: "Sonic — product photography & reels",
    summary: "Concept product stills and vertical video for a consumer audio brand's launch.",
    cover: "headphones-yellow",
    gallery: ["headphones-yellow", "watches-white", "video-timeline"],
    industry: "ecommerce",
    categories: ["product-photography", "video-production", "digital-advertising"],
    services: ["product-photography", "video-production", "paid-advertising"],
    challenge: "Tech accessories are often photographed identically. The concept explores bold colour backdrops and motion to stand out in social feeds and ads.",
    solution: "High-contrast colour-blocked stills for ads and the store, plus a set of six-second reels designed for sound-off viewing.",
    outcome: "Concept project. Imagery shown is licensed stock used to illustrate direction.",
    featured: true,
  },
  {
    slug: "coastline-retreat-hotel",
    title: "Coastline Retreat — boutique hotel website",
    summary: "A booking-focused website concept for a boutique coastal hotel.",
    cover: "hotel-pool",
    gallery: ["hotel-pool", "restaurant-terrace", "cafe-interior"],
    industry: "restaurants-hospitality",
    categories: ["website-design", "product-photography"],
    services: ["website-development", "seo-google-presence", "product-photography"],
    challenge: "Boutique hotels compete with booking platforms for direct reservations. The concept looks at how a website can encourage direct booking without hiding information.",
    solution: "Room pages with honest photography and clear inclusions, a persistent booking button, local guides that support search visibility, and fast pages for mobile visitors.",
    outcome: "Self-initiated concept work for demonstration purposes.",
    featured: false,
  },
  {
    slug: "glow-studio-skincare-ads",
    title: "Glow Studio — skincare ad creative",
    summary: "Concept campaign creative and flat-lay photography for a skincare and cosmetics brand.",
    cover: "cosmetics-flatlay",
    gallery: ["cosmetics-flatlay", "brand-swatches", "analytics-dark"],
    industry: "ecommerce",
    categories: ["digital-advertising", "social-campaigns", "product-photography"],
    services: ["paid-advertising", "creative-design", "product-photography"],
    challenge: "Beauty advertising is crowded and audiences tire of the same creative quickly. The concept explores a modular creative system that produces many variations from one shoot.",
    solution: "Flat-lay photography designed to be cropped into every ad placement, a set of headline templates, and a testing plan for comparing creative angles.",
    outcome: "Concept project. No campaign was run and no results are claimed.",
    featured: false,
  },
];

export const ARTICLE_CATEGORIES = [
  { slug: "website-strategy", name: "Website strategy" },
  { slug: "seo", name: "SEO & Google presence" },
  { slug: "social-media", name: "Social media" },
  { slug: "branding", name: "Branding" },
  { slug: "photography-video", name: "Photography & video" },
  { slug: "ecommerce", name: "E-commerce" },
  { slug: "ai-automation", name: "AI & automation" },
];

export const ARTICLES = [
  {
    slug: "what-a-small-business-website-needs",
    title: "What a small business website actually needs in 2026",
    excerpt: "Before you redesign, get clear on the handful of things that make a business website useful to customers — and the things that don't matter as much as they seem.",
    category: "website-strategy",
    tags: ["websites", "small business"],
    cover: "wireframe-sketches",
    minutes: 6,
    body: `<p>Most small business websites try to do too much or too little. Here is what genuinely matters to the people who visit.</p>
<h2>1. A clear answer to "what do you do, and for whom?"</h2>
<p>Visitors should understand your offer within a few seconds of landing. That means a specific headline, not a slogan, and a short supporting line explaining who you help.</p>
<h2>2. Service pages that answer real questions</h2>
<p>Each major service deserves its own page: what's included, who it's for, how the process works, rough timelines and the questions customers usually ask. These pages also give search engines something specific to understand.</p>
<h2>3. Proof, used honestly</h2>
<p>Photographs of real work, genuine testimonials, and specifics about your process build trust. Invented statistics or stock testimonials do the opposite when people notice.</p>
<h2>4. Easy ways to get in touch</h2>
<p>A short enquiry form, a click-to-call phone number, and a WhatsApp link — visible on mobile without hunting for them.</p>
<h2>5. Speed on mobile</h2>
<p>Many visitors will be on a phone with an inconsistent connection. Compressed images, minimal scripts and a simple layout matter more than visual effects.</p>
<h2>6. A way to update it yourself</h2>
<p>Offers, team members and opening hours change. If every edit needs a developer, the site will drift out of date.</p>
<p>Everything else — animations, blogs, integrations — is worth considering once these foundations are right.</p>`,
  },
  {
    slug: "google-business-profile-checklist",
    title: "A practical Google Business Profile checklist for local businesses",
    excerpt: "Your Google Business Profile is often seen before your website. Here's how to make sure it's complete, accurate and working for you.",
    category: "seo",
    tags: ["local seo", "google business profile"],
    cover: "marketing-desk",
    minutes: 5,
    body: `<p>For many local searches, Google shows the map and business listings above regular website results. A complete, active profile helps customers choose you.</p>
<h2>Get the basics exactly right</h2>
<ul><li>Business name as it appears in the real world — no extra keywords</li><li>The most accurate primary category, plus relevant secondary categories</li><li>Address or service area, phone number and website link</li><li>Opening hours, including special hours for holidays</li></ul>
<h2>Describe what you actually offer</h2>
<p>Add your services or products with short descriptions, and write a business description that explains what you do in plain language.</p>
<h2>Add genuine photos regularly</h2>
<p>Exterior, interior, team, products and work. Real photos help customers recognise your premises and understand what to expect.</p>
<h2>Build a review routine</h2>
<p>Ask satisfied customers for reviews as part of your normal process, and reply to every review — positive or negative — politely and promptly. Never buy or incentivise reviews; it breaches Google's policies.</p>
<h2>Keep it active</h2>
<p>Use posts for offers, events and updates, and answer questions in the Q&amp;A section. Check the profile monthly for suggested edits from the public.</p>`,
  },
  {
    slug: "social-media-content-calendar",
    title: "How to plan a social media content calendar you can actually keep",
    excerpt: "Consistency beats intensity. A simple planning approach that keeps your social presence active without taking over your week.",
    category: "social-media",
    tags: ["social media", "content planning"],
    cover: "social-letters",
    minutes: 5,
    body: `<p>Most brands don't struggle with ideas — they struggle with consistency. A calendar turns social media from a daily scramble into a monthly decision.</p>
<h2>Choose three to five content pillars</h2>
<p>Pillars are recurring themes: your products, behind the scenes, customer stories, education and offers. They make planning faster and help your audience know what to expect.</p>
<h2>Set a sustainable frequency</h2>
<p>Three good posts a week, every week, will usually outperform daily posting for a fortnight followed by silence.</p>
<h2>Plan around real moments</h2>
<p>Mark launches, festivals, seasons and local events in advance, then fill the gaps with pillar content.</p>
<h2>Batch production</h2>
<p>Shoot photos and reels for a whole month in one or two sessions. Design posts in batches using templates.</p>
<h2>Review monthly</h2>
<p>Look at which posts led to profile visits, messages or website clicks — not just likes — and adjust next month's plan.</p>`,
  },
  {
    slug: "brand-consistency-small-teams",
    title: "Brand consistency for small teams: a simple system",
    excerpt: "You don't need a 60-page brand book. You need a few clear rules and templates people will actually use.",
    category: "branding",
    tags: ["branding", "design systems"],
    cover: "brand-swatches",
    minutes: 4,
    body: `<p>When everyone on a small team designs their own posters and posts, a brand slowly fragments. The fix isn't more rules — it's fewer, clearer ones.</p>
<h2>The essentials</h2>
<ul><li><strong>Logo usage:</strong> which version to use on light and dark backgrounds, and minimum sizes.</li><li><strong>Colours:</strong> one or two primary colours, a neutral, and an accent — with exact values.</li><li><strong>Typography:</strong> one font for headings, one for text.</li><li><strong>Image style:</strong> a few example photos that show the look you want.</li><li><strong>Tone of voice:</strong> three words that describe how you sound, with examples.</li></ul>
<h2>Templates beat guidelines</h2>
<p>Editable templates for social posts, offers, presentations and documents make consistency the easy option.</p>`,
  },
  {
    slug: "product-photography-for-ecommerce",
    title: "Product photography for e-commerce: what to plan before the shoot",
    excerpt: "Great product images start with a plan. Here's what to decide before anyone picks up a camera.",
    category: "photography-video",
    tags: ["product photography", "e-commerce"],
    cover: "watches-white",
    minutes: 6,
    body: `<p>Product photos often decide whether someone adds to cart. Planning ahead makes shoots faster, cheaper and more consistent.</p>
<h2>Know where the images will be used</h2>
<p>Your store, marketplaces, social media and ads all have different size and background requirements. List them before the shoot.</p>
<h2>Write a shot list</h2>
<p>For each product: front, back, side, detail, scale reference and in-use shots. Consistent angles across the catalogue make your store look organised.</p>
<h2>Decide on backgrounds and styling</h2>
<p>Plain backgrounds for catalogue images; styled or lifestyle sets for hero images and social. Collect reference images to agree on mood.</p>
<h2>Prepare the products</h2>
<p>Clean, steam, remove stickers and have spares ready. Small blemishes become very visible in high-resolution photos.</p>
<h2>Plan for video too</h2>
<p>Capturing short clips during the same session is far cheaper than a separate shoot later.</p>`,
  },
  {
    slug: "reels-that-hold-attention",
    title: "Short-form video: making reels that hold attention",
    excerpt: "The first two seconds decide whether anyone watches the rest. Practical tips for brand reels.",
    category: "photography-video",
    tags: ["video", "reels"],
    cover: "video-timeline",
    minutes: 4,
    body: `<p>Short-form video rewards clarity and pace. A few principles make a big difference.</p>
<h2>Lead with the most interesting moment</h2>
<p>Open on the result, the reveal or the question — not your logo.</p>
<h2>Design for sound-off viewing</h2>
<p>Add captions and on-screen text so the message works without audio.</p>
<h2>Keep it focused</h2>
<p>One idea per reel. If you have three tips, consider three reels.</p>
<h2>Shoot vertically, and with intent</h2>
<p>Plan the vertical frame from the start rather than cropping horizontal footage.</p>
<h2>End with a clear next step</h2>
<p>Visit the profile, send a message, or check the link — make it obvious.</p>`,
  },
  {
    slug: "ecommerce-product-page-essentials",
    title: "Seven essentials for e-commerce product pages",
    excerpt: "Product pages do the heavy lifting in online stores. These details reduce hesitation and returns.",
    category: "ecommerce",
    tags: ["e-commerce", "conversion"],
    cover: "ecommerce-laptop",
    minutes: 5,
    body: `<ol><li><strong>Multiple high-quality images</strong>, including detail and scale shots.</li><li><strong>A clear, specific title</strong> that says what the product is.</li><li><strong>Price, offers and taxes</strong> stated plainly.</li><li><strong>Size, material and specifications</strong> in a scannable format.</li><li><strong>Delivery times and costs</strong> visible before checkout.</li><li><strong>Returns and exchange policy</strong> summarised on the page.</li><li><strong>Genuine reviews</strong> where available, displayed honestly.</li></ol>
<p>Each of these answers a question a hesitant customer would otherwise leave to ask elsewhere.</p>`,
  },
  {
    slug: "automation-ideas-for-small-businesses",
    title: "Five automation ideas that save small businesses hours each week",
    excerpt: "Automation isn't only for large companies. Simple workflows that remove repetitive tasks and reduce missed leads.",
    category: "ai-automation",
    tags: ["automation", "ai"],
    cover: "ai-letters",
    minutes: 5,
    body: `<p>Automation works best on tasks that are repetitive, rule-based and easy to get wrong when people are busy.</p>
<h2>1. Centralise enquiries</h2>
<p>Send website forms, ad leads and other sources into one list or CRM, with an instant notification to the right person.</p>
<h2>2. Automatic acknowledgements</h2>
<p>Confirm receipt of an enquiry by email so customers know they've been heard.</p>
<h2>3. Follow-up reminders</h2>
<p>Create a task automatically if a lead hasn't been contacted within a set time.</p>
<h2>4. Weekly reports</h2>
<p>Pull numbers from sales, ads and analytics into one summary every Monday.</p>
<h2>5. AI-assisted drafting — with review</h2>
<p>Use AI tools to draft product descriptions or replies, always reviewed by a person before anything reaches a customer.</p>`,
  },
];
