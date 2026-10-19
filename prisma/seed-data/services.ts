export type SeedService = {
  slug: string;
  title: string;
  category: string;
  shortDescription: string;
  featuredLabel?: string;
  heroHeadline: string;
  heroText: string;
  media: string;
  body: string;
  problems: string[];
  benefits: string[];
  deliverables: string[];
  process: { title: string; description: string }[];
  faqs: { q: string; a: string }[];
  related: string[];
};

export const SERVICES: SeedService[] = [
  {
    slug: "website-development",
    title: "Website Design & Development",
    category: "Digital Experience",
    shortDescription: "Fast, considered business websites and landing pages designed to explain what you do and turn visits into enquiries.",
    featuredLabel: "Core service",
    heroHeadline: "Websites that explain, persuade and perform.",
    heroText: "From a focused five-page business site to a multi-language platform, we design and build websites around how your customers actually decide.",
    media: "web-ui-screens",
    body: `<p>Your website is usually the first serious conversation a customer has with your business. We plan it like one: what visitors need to know, in what order, and what we want them to do next.</p>
<h2>What we build</h2>
<ul><li><strong>Business websites</strong> — clear service pages, credible about pages and contact flows that make it easy to get in touch.</li><li><strong>Landing pages</strong> — single-purpose pages for campaigns, launches and lead generation, built to load quickly on mobile data.</li><li><strong>E-commerce</strong> — online stores on Shopify, WooCommerce or custom stacks (see our dedicated e-commerce service).</li><li><strong>Content-managed sites</strong> — so your team can update text, images and offers without calling a developer.</li></ul>
<h2>Built for real conditions</h2>
<p>Most of your visitors will arrive on a phone, often on a patchy connection. We design mobile-first, keep pages light, compress imagery properly and test on real devices. Accessibility, sensible headings and clean URLs are part of the build, not an afterthought — they help both people and search engines understand your site.</p>
<h2>After launch</h2>
<p>We offer maintenance plans covering updates, backups, uptime monitoring, small content changes and periodic conversion reviews, so the site keeps improving instead of slowly going stale.</p>`,
    problems: [
      "Your current site looks dated and doesn't reflect the quality of your work",
      "Visitors arrive but rarely enquire or call",
      "Pages are slow or awkward to use on mobile",
      "Updating content requires a developer every time",
      "You don't know which pages or campaigns actually produce leads",
    ],
    benefits: [
      "A clear structure that answers customer questions in the right order",
      "Mobile-first design that is fast on real Indian networks",
      "Enquiry, call and WhatsApp paths placed where people need them",
      "An editable CMS so your team can make routine updates",
      "Technical SEO foundations built in from day one",
    ],
    deliverables: [
      "Sitemap, page structure and content plan",
      "Visual design for desktop and mobile",
      "Responsive front-end development",
      "CMS setup and training",
      "Contact forms, WhatsApp and call integration",
      "Analytics and conversion tracking setup",
      "Technical SEO setup (metadata, sitemap, structured data)",
      "Launch checklist, hosting setup and handover documentation",
    ],
    process: [
      { title: "Discovery", description: "We learn about your business, customers, competitors and goals, and audit any existing site." },
      { title: "Structure & content", description: "We map pages, user journeys and the content each page needs before any visual design starts." },
      { title: "Design", description: "Desktop and mobile designs for key pages, reviewed together and refined." },
      { title: "Build & test", description: "Development, CMS setup, performance tuning and testing across browsers and devices." },
      { title: "Launch & improve", description: "Go-live, redirects from old URLs, tracking checks and an optional maintenance plan." },
    ],
    faqs: [
      { q: "How long does a business website take?", a: "A typical 5–10 page business website takes four to eight weeks depending on content readiness and the number of review rounds. We give you a schedule after discovery." },
      { q: "Will I be able to update the website myself?", a: "Yes. We set up a content management system and walk your team through it, so routine changes to text, images and offers don't need a developer." },
      { q: "Do you write the website content?", a: "We can. Copywriting can be included in the project, or we can structure and edit content your team provides." },
    ],
    related: ["ecommerce-development", "seo-google-presence", "creative-design"],
  },
  {
    slug: "ecommerce-development",
    title: "E-commerce Development",
    category: "Digital Experience",
    shortDescription: "Online stores that make products easy to find, easy to trust and easy to buy — with the operations behind them set up properly.",
    heroHeadline: "Online stores designed around how people buy.",
    heroText: "We plan, design and build e-commerce experiences for D2C brands, retailers and growing product businesses.",
    media: "ecommerce-laptop",
    body: `<p>A good online store does more than list products. It builds confidence, answers objections and removes friction at every step between discovery and delivery.</p>
<h2>Platforms</h2>
<p>We work with Shopify for most brands that want reliability and a strong app ecosystem, WooCommerce where WordPress flexibility matters, and custom builds when your catalogue, pricing or integrations need it. We'll recommend the simplest option that genuinely fits.</p>
<h2>What we focus on</h2>
<ul><li>Product pages with clear photography, sizing, delivery and returns information</li><li>Collection and search structures that match how customers browse</li><li>Checkout flows with Indian payment options (UPI, cards, wallets, COD where appropriate)</li><li>Shipping, GST invoicing and inventory integrations</li><li>Analytics and conversion tracking for paid campaigns</li></ul>
<h2>Photography and content</h2>
<p>Because we also run product shoots, your store can launch with consistent, well-lit imagery and copy written for the product — rather than placeholders and manufacturer descriptions.</p>`,
    problems: [
      "Customers add to cart but don't complete checkout",
      "Product pages lack the detail and imagery needed to build trust",
      "Your catalogue is hard to browse or search",
      "Orders, inventory and shipping are managed manually across tools",
      "You rely entirely on marketplaces and want a direct channel",
    ],
    benefits: [
      "A store structure that helps customers find the right product quickly",
      "Product pages that answer questions before they become objections",
      "Payment and shipping options suited to Indian customers",
      "Integrated tracking so you can measure campaign return",
      "Consistent product photography and copy across the catalogue",
    ],
    deliverables: [
      "Platform recommendation and store architecture",
      "Store design (home, collection, product, cart, checkout customisation where supported)",
      "Theme or custom development",
      "Payment gateway, shipping and tax configuration",
      "Product data import and catalogue structuring",
      "Analytics, pixel and conversion event setup",
      "Team training and launch support",
    ],
    process: [
      { title: "Audit & plan", description: "Catalogue, customers, operations and the platform that suits them." },
      { title: "Experience design", description: "Browsing, product and checkout journeys designed for mobile shoppers." },
      { title: "Build & integrate", description: "Store build with payments, shipping, inventory and tracking connected." },
      { title: "Content & launch", description: "Product content, photography, QA and a monitored launch." },
    ],
    faqs: [
      { q: "Shopify or WooCommerce — which is better?", a: "It depends on your catalogue, budget, integrations and how much control you need. Shopify is simpler to run; WooCommerce offers more flexibility. We recommend after understanding your operations." },
      { q: "Can you migrate my existing store?", a: "Yes. We migrate products, customers and order history where the platforms allow it, and set up redirects so you keep existing search visibility." },
    ],
    related: ["website-development", "product-photography", "paid-advertising"],
  },
  {
    slug: "seo-google-presence",
    title: "SEO & Google Presence",
    category: "Search and Google Visibility",
    shortDescription: "Technical, on-page and local SEO plus Google Business Profile optimisation, so the right people can find you when they search.",
    featuredLabel: "Local visibility",
    heroHeadline: "Be easier to find when customers are already looking.",
    heroText: "We improve how search engines understand your business — your website, your content and your Google Business Profile.",
    media: "analytics-laptop",
    body: `<p>Search visibility comes from a website search engines can crawl and understand, content that genuinely answers what people search for, and consistent business information across the web. Nobody can guarantee rankings — but these fundamentals consistently make a difference over time.</p>
<h2>Technical SEO</h2>
<p>Crawlability, indexation, site speed, mobile usability, structured data, canonical URLs, redirects and sitemap health. We fix what blocks search engines from understanding your site.</p>
<h2>On-page SEO and content</h2>
<p>Keyword research grounded in real search behaviour, page titles and descriptions, heading structure, internal linking and content improvements for the pages that matter most to your business.</p>
<h2>Local SEO and Google Business Profile</h2>
<p>For businesses serving a city or region, your Google Business Profile is often more visible than your website. We optimise categories, services, descriptions, photos and posts, help you build a healthy review process, and keep your name, address and phone details consistent across directories.</p>
<h2>Reporting</h2>
<p>Monthly reports in plain language: what we worked on, what changed in Search Console and analytics, and what we recommend next.</p>`,
    problems: [
      "Competitors appear on Google and in Maps while you don't",
      "Your website has pages Google isn't indexing",
      "Your Google Business Profile is incomplete or unmanaged",
      "You're not sure which searches bring customers to you",
      "Traffic dropped after a redesign or migration",
    ],
    benefits: [
      "A technically healthy site that search engines can crawl and understand",
      "Content aligned with what your customers actually search for",
      "A complete, active Google Business Profile",
      "Consistent business information across key directories",
      "Clear reporting connected to enquiries, not just traffic",
    ],
    deliverables: [
      "Technical SEO audit and prioritised fix list",
      "Keyword and competitor research",
      "On-page optimisation of priority pages",
      "Google Business Profile setup or optimisation",
      "Local citation clean-up",
      "Search Console and analytics configuration",
      "Monthly reporting and recommendations",
    ],
    process: [
      { title: "Audit", description: "Technical crawl, content review, Business Profile and competitor benchmarking." },
      { title: "Prioritise", description: "A roadmap ordered by likely impact and effort." },
      { title: "Implement", description: "Technical fixes, on-page improvements and local optimisation." },
      { title: "Measure & iterate", description: "Monthly reporting and adjustments based on Search Console data." },
    ],
    faqs: [
      { q: "Can you guarantee first-page rankings?", a: "No — and you should be cautious of anyone who does. Rankings depend on competition and on search engines' own systems. We focus on the work that consistently improves visibility and report transparently on progress." },
      { q: "How long before SEO shows results?", a: "Technical fixes can show effects within weeks; content and local improvements usually take three to six months to show meaningful change, depending on competition." },
      { q: "Do you manage Google Business Profiles?", a: "Yes. We can optimise your profile, add photos and posts, and help set up a process for requesting and replying to reviews. You remain the owner of the profile." },
    ],
    related: ["website-development", "social-media-management", "paid-advertising"],
  },
  {
    slug: "social-media-management",
    title: "Social Media Management",
    category: "Social Media and Content",
    shortDescription: "Strategy, content calendars, creative production and day-to-day account management for brands that want a consistent social presence.",
    heroHeadline: "A social presence that stays consistent — and sounds like you.",
    heroText: "We plan, create and publish social content that reflects your brand and supports real business goals.",
    media: "social-letters",
    body: `<p>Social media works best when it is consistent, recognisably yours, and connected to what the business is trying to achieve — whether that's footfall, enquiries, sales or awareness.</p>
<h2>Strategy</h2>
<p>We define your audience, content pillars, tone of voice and the platforms worth your time. Not every brand needs to be everywhere.</p>
<h2>Content calendars</h2>
<p>Monthly calendars planned around launches, seasons, festivals and your own business moments, shared for approval before anything goes live.</p>
<h2>Creative production</h2>
<p>Posts, carousels, stories and reels produced by the same team that handles your photography, video and design — so everything looks like it belongs to one brand.</p>
<h2>Account management and reporting</h2>
<p>Publishing, community management within agreed hours, and monthly reporting that focuses on what moved: reach, engagement, profile actions and enquiries.</p>`,
    problems: [
      "Posting is irregular and depends on who has time",
      "Your feed doesn't look like one brand",
      "You're unsure what to post or which platforms matter",
      "Content gets likes but doesn't lead to enquiries or sales",
    ],
    benefits: [
      "A clear plan for what to post, where and why",
      "Consistent, on-brand creative across platforms",
      "Content produced in-house: design, photography and reels",
      "Monthly reporting tied to business outcomes",
    ],
    deliverables: [
      "Social media strategy and content pillars",
      "Monthly content calendar",
      "Post, carousel and story design",
      "Reels and short-form video",
      "Captions and hashtag research",
      "Scheduling and publishing",
      "Community management (agreed scope)",
      "Monthly performance report",
    ],
    process: [
      { title: "Strategy", description: "Audience, platforms, pillars and tone of voice." },
      { title: "Plan", description: "A monthly calendar shared for approval." },
      { title: "Produce", description: "Design, shoot, edit and write captions." },
      { title: "Publish & report", description: "Scheduled posting, community care and monthly insights." },
    ],
    faqs: [
      { q: "Which platforms do you manage?", a: "Instagram, Facebook, LinkedIn, YouTube and Pinterest most commonly. We'll recommend where your audience actually spends time." },
      { q: "Do we approve content before it's posted?", a: "Yes. Every monthly calendar is shared for review and approval before publishing." },
    ],
    related: ["creative-design", "video-production", "paid-advertising"],
  },
  {
    slug: "creative-design",
    title: "Branding & Creative Design",
    category: "Branding and Creative Design",
    shortDescription: "Brand identities, posters, banners, ad creatives and marketing collateral that look consistent wherever your brand appears.",
    heroHeadline: "A brand people recognise before they read the name.",
    heroText: "Identity systems and everyday creative — designed to work together across print, screens and storefronts.",
    media: "brand-swatches",
    body: `<p>Strong brands are consistent. The same colours, typography, tone and image style appear whether someone sees your packaging, a poster in your store, an Instagram ad or your website.</p>
<h2>Brand identity</h2>
<p>Logo design, colour palettes, typography, graphic elements and a practical brand guideline that your team and partners can actually follow.</p>
<h2>Marketing and campaign creative</h2>
<ul><li>Posters, flyers and in-store signage</li><li>Website and social banners</li><li>Advertising creatives sized for every placement</li><li>Brochures, menus, catalogues and presentations</li><li>Packaging and label design</li></ul>
<h2>Templates for your team</h2>
<p>Where it helps, we create editable templates so everyday material — offers, announcements, social posts — stays on-brand without starting from scratch.</p>`,
    problems: [
      "Your materials look different every time someone new designs them",
      "Your logo or identity no longer suits the business you've become",
      "Campaign creative takes too long and arrives in the wrong sizes",
      "You're launching a new brand and need an identity from scratch",
    ],
    benefits: [
      "A recognisable, consistent visual identity",
      "Practical guidelines and templates your team can use",
      "Creative delivered in every size and format you need",
      "Design that connects with your photography, video and website",
    ],
    deliverables: [
      "Logo and identity system",
      "Brand guidelines",
      "Posters, banners and signage",
      "Ad creatives in all required placements",
      "Brochures, menus and presentations",
      "Packaging and label design",
      "Editable templates",
    ],
    process: [
      { title: "Brief & research", description: "Audience, competitors and the impression the brand needs to make." },
      { title: "Concepts", description: "Distinct creative directions presented with rationale." },
      { title: "Refine", description: "One direction developed into a complete system." },
      { title: "Roll out", description: "Final files, guidelines and templates." },
    ],
    faqs: [
      { q: "How many logo concepts do we see?", a: "Usually two or three distinct directions, then refinement of the chosen one. We prefer fewer, well-considered options to a long list of variations." },
      { q: "Do we own the final artwork?", a: "Yes. On final payment you receive full rights to the final approved artwork and source files, except for any licensed fonts or stock elements, which we'll list clearly." },
    ],
    related: ["social-media-management", "product-photography", "website-development"],
  },
  {
    slug: "product-photography",
    title: "Product & Commercial Photography",
    category: "Photography and Video Production",
    shortDescription: "Product, food, lifestyle and commercial photography for e-commerce, menus, campaigns and social media.",
    featuredLabel: "Studio & on location",
    heroHeadline: "Photography that sells the product before the copy does.",
    heroText: "Clean catalogue shots, styled lifestyle imagery and food photography — planned around where the images will be used.",
    media: "headphones-yellow",
    body: `<p>Good imagery does a lot of selling. It shows texture, scale and quality, sets a mood, and helps customers imagine the product in their own lives.</p>
<h2>What we shoot</h2>
<ul><li><strong>E-commerce product photography</strong> — consistent white or coloured backgrounds, multiple angles and detail shots that meet marketplace and store requirements.</li><li><strong>Styled and lifestyle imagery</strong> — props, sets and models to show products in context.</li><li><strong>Food and beverage photography</strong> — menus, delivery apps, social media and campaigns for restaurants, cafés and food brands.</li><li><strong>Commercial photography</strong> — spaces, teams, processes and behind-the-scenes for websites and recruitment.</li></ul>
<h2>Planned shoots</h2>
<p>Every shoot starts with a shot list and mood references agreed in advance, so the day is efficient and the outcome predictable. Retouching and delivery in web-optimised and print-ready formats are included.</p>`,
    problems: [
      "Product photos look inconsistent across your store and marketplaces",
      "Images don't capture the quality of the product",
      "Your menu and delivery-app photos don't reflect how good the food is",
      "You need a steady supply of fresh imagery for social media",
    ],
    benefits: [
      "Consistent imagery across your website, marketplaces and social",
      "Shot lists planned around where images will be used",
      "Professional retouching and colour accuracy",
      "Files delivered optimised for web and print",
    ],
    deliverables: [
      "Pre-shoot planning, shot list and mood board",
      "Studio or on-location shoot",
      "Styling and props (as scoped)",
      "Retouching and colour correction",
      "Web-optimised and high-resolution files",
      "Marketplace-compliant crops where required",
    ],
    process: [
      { title: "Plan", description: "Shot list, references and logistics agreed in advance." },
      { title: "Shoot", description: "Studio or location shoot with styling." },
      { title: "Select & retouch", description: "Selection, editing and retouching." },
      { title: "Deliver", description: "Files organised and exported for each channel." },
    ],
    faqs: [
      { q: "Where do shoots take place?", a: "In a studio for most product work, or on location at your restaurant, store or facility when context matters." },
      { q: "How many images will we receive?", a: "It depends on the shot list. We agree the number of final edited images before the shoot so there are no surprises." },
    ],
    related: ["video-production", "ecommerce-development", "social-media-management"],
  },
  {
    slug: "video-production",
    title: "Video Production & Editing",
    category: "Photography and Video Production",
    shortDescription: "Reels, short-form content, promotional films and editing — planned for the platform they'll be watched on.",
    heroHeadline: "Short films and reels that hold attention.",
    heroText: "From scripted brand films to a monthly batch of reels, we plan, shoot and edit video around how people actually watch.",
    media: "video-timeline",
    body: `<p>Video is now the default format on most platforms. The challenge isn't just producing it — it's producing enough of it, consistently, at a quality that reflects your brand.</p>
<h2>What we produce</h2>
<ul><li><strong>Reels and short-form content</strong> — vertical video designed for the first two seconds, captions for silent viewing, and hooks that suit the platform.</li><li><strong>Promotional films</strong> — brand stories, product launches, restaurant and hotel walk-throughs.</li><li><strong>Product videos</strong> — demonstrations, unboxings and features for e-commerce and ads.</li><li><strong>Editing</strong> — we can also edit footage you've already captured.</li></ul>
<h2>Efficient production</h2>
<p>We often plan video and photography together, so one shoot day produces stills, reels and longer cuts — reducing cost and keeping everything visually consistent.</p>`,
    problems: [
      "You know you need video but don't have time to produce it",
      "Reels look amateur next to competitors",
      "Footage exists but nobody has time to edit it",
      "Your product is hard to explain with photos alone",
    ],
    benefits: [
      "Video planned for each platform's format and viewing habits",
      "Combined photo and video shoots for efficiency",
      "Subtitles and captions for sound-off viewing",
      "A steady pipeline of short-form content",
    ],
    deliverables: [
      "Concepts, scripts and storyboards",
      "Shoot planning and production",
      "Editing, colour grading and sound",
      "Subtitles and motion graphics",
      "Exports for Reels, Shorts, YouTube and ads",
    ],
    process: [
      { title: "Concept", description: "Ideas, scripts and formats for each platform." },
      { title: "Pre-production", description: "Schedules, locations, talent and shot lists." },
      { title: "Shoot", description: "Efficient production days covering multiple deliverables." },
      { title: "Post-production", description: "Editing, grading, sound, subtitles and exports." },
    ],
    faqs: [
      { q: "Do you only shoot reels?", a: "No. We produce everything from reels to longer brand films, product videos and walkthroughs." },
      { q: "Can you edit footage we've already shot?", a: "Yes, we offer editing as a standalone service." },
    ],
    related: ["product-photography", "social-media-management", "paid-advertising"],
  },
  {
    slug: "paid-advertising",
    title: "Paid Advertising & Lead Generation",
    category: "Performance Marketing",
    shortDescription: "Meta and Google ad campaigns with strategy, creative, audience targeting, conversion tracking and ongoing optimisation.",
    heroHeadline: "Campaigns built on tracking you can trust.",
    heroText: "We plan, launch and optimise paid campaigns on Meta and Google — and set up the measurement that tells you whether they're working.",
    media: "analytics-dark",
    body: `<p>Paid advertising can reach the right people quickly, but only if the campaign, the creative, the landing page and the tracking all work together. We handle all four.</p>
<h2>Campaign strategy</h2>
<p>Objectives, budgets, platforms and audiences defined around what you can measure: leads, calls, WhatsApp conversations, store visits or online sales.</p>
<h2>Ad creative</h2>
<p>Static, carousel and video creatives produced in-house and tested against each other, so you learn what resonates instead of guessing.</p>
<h2>Audience targeting</h2>
<p>Location, interest and behaviour targeting, remarketing to past visitors, and lookalike audiences built from your real customers where data allows.</p>
<h2>Conversion tracking</h2>
<p>Pixel, Conversions API and Google Ads conversion setup, with events tested before money is spent.</p>
<h2>Optimisation and reporting</h2>
<p>Ongoing adjustment of budgets, audiences and creative, with honest reporting on cost per result. Results depend on your offer, market and budget, so we never promise fixed numbers in advance.</p>`,
    problems: [
      "Ads get clicks but few genuine enquiries",
      "You can't tell which campaigns produce customers",
      "Creative feels stale and performance has dropped",
      "Boosted posts are your only form of advertising",
    ],
    benefits: [
      "Campaigns tied to measurable business outcomes",
      "Accurate conversion tracking before budgets are spent",
      "Fresh creative produced and tested in-house",
      "Transparent reporting on cost per result",
    ],
    deliverables: [
      "Campaign strategy and media plan",
      "Ad account and tracking setup",
      "Ad creative (static, carousel, video)",
      "Landing page recommendations or builds",
      "Ongoing optimisation",
      "Monthly performance reporting",
    ],
    process: [
      { title: "Plan", description: "Goals, budgets, audiences and measurement." },
      { title: "Set up", description: "Tracking, accounts, creative and landing pages." },
      { title: "Launch", description: "Controlled launch with close monitoring." },
      { title: "Optimise", description: "Weekly adjustments and monthly reviews." },
    ],
    faqs: [
      { q: "What budget do we need?", a: "It depends on your market and goals. We'll recommend a starting test budget after understanding your offer and audience, and you always control the spend." },
      { q: "Is the ad spend included in your fee?", a: "No. Ad spend is paid directly to the platforms from your account. Our fee covers strategy, creative and management." },
    ],
    related: ["social-media-management", "creative-design", "website-development"],
  },
  {
    slug: "ai-automation",
    title: "AI Solutions & Workflow Automation",
    category: "AI and Automation",
    shortDescription: "Practical automation and AI tools that remove repetitive work — from lead routing and follow-ups to content and reporting workflows.",
    featuredLabel: "New",
    heroHeadline: "Less repetitive work. More time for the work that matters.",
    heroText: "We identify the manual tasks slowing your team down and automate them with reliable tools and carefully applied AI.",
    media: "ai-letters",
    body: `<p>Many small businesses lose hours each week to copying data between tools, chasing follow-ups and building the same reports. Much of this can be automated reliably.</p>
<h2>Typical workflows</h2>
<ul><li><strong>Lead handling</strong> — capture enquiries from your website, ads and WhatsApp into one place, notify the right person and trigger follow-ups.</li><li><strong>Customer communication</strong> — order updates, appointment reminders and FAQs using authorised, official APIs.</li><li><strong>Content workflows</strong> — AI-assisted drafting, translation and repurposing, always with human review.</li><li><strong>Reporting</strong> — automatic weekly reports pulled from your sales, ads and analytics tools.</li><li><strong>Internal tools</strong> — simple dashboards and assistants built around your documents and processes.</li></ul>
<h2>Responsible by design</h2>
<p>We start with the process, not the tool. Automation is documented, monitored and owned by you. Where AI is involved, we're clear about what it can and can't do, keep a human in the loop for anything customer-facing, and handle your data carefully.</p>`,
    problems: [
      "Leads arrive in different places and some are missed",
      "Your team spends hours on copy-paste admin",
      "Reports take a day to compile every week",
      "You're curious about AI but unsure where it genuinely helps",
    ],
    benefits: [
      "Fewer missed leads and faster responses",
      "Hours of manual work removed each week",
      "Documented automations you own and understand",
      "Realistic, carefully scoped use of AI",
    ],
    deliverables: [
      "Process audit and automation roadmap",
      "Integrations between your existing tools",
      "Custom automation workflows",
      "AI-assisted tools with human review steps",
      "Documentation and team training",
      "Monitoring and support",
    ],
    process: [
      { title: "Map", description: "Document current processes and where time is lost." },
      { title: "Prioritise", description: "Choose automations with the clearest payoff." },
      { title: "Build", description: "Implement, test with real data and document." },
      { title: "Support", description: "Monitor, refine and extend as you grow." },
    ],
    faqs: [
      { q: "Do we need to replace our current tools?", a: "Usually not. Most automation connects the tools you already use." },
      { q: "Is our customer data safe?", a: "We design workflows to share only the data each step needs, use official APIs, and document where data flows. We'll discuss any AI provider's data policies with you before use." },
    ],
    related: ["it-support-software", "website-development", "paid-advertising"],
  },
  {
    slug: "it-support-software",
    title: "IT Support & Custom Software",
    category: "IT and Custom Software",
    shortDescription: "Custom software, integrations, technical support and the digital infrastructure that keeps your business running smoothly.",
    heroHeadline: "Technology that fits how your business actually works.",
    heroText: "Custom tools, integrations and dependable support for businesses that have outgrown off-the-shelf software.",
    media: "server-cables",
    body: `<p>As businesses grow, spreadsheets and generic tools start to strain. We build and support the technology that sits behind your customer-facing presence.</p>
<h2>Custom software</h2>
<p>Booking systems, internal dashboards, customer portals, inventory tools and admin panels designed around your workflow, built with maintainable, well-documented code.</p>
<h2>Integrations</h2>
<p>Connecting your website, store, CRM, accounting, payment and messaging tools so data flows without manual re-entry.</p>
<h2>Technical support and infrastructure</h2>
<ul><li>Domain, DNS and business email setup</li><li>Hosting, backups and security hardening</li><li>Website and application maintenance</li><li>Device and software support for small teams</li></ul>`,
    problems: [
      "Your team relies on spreadsheets that are becoming hard to manage",
      "Off-the-shelf software doesn't match your process",
      "Business email, domains or hosting are set up inconsistently",
      "There's nobody to call when something technical breaks",
    ],
    benefits: [
      "Software designed around your real workflow",
      "Tools that talk to each other",
      "Secure, backed-up infrastructure",
      "A reliable technical partner",
    ],
    deliverables: [
      "Requirements and technical specification",
      "Custom web applications and admin tools",
      "API integrations",
      "Domain, email and hosting setup",
      "Backups, monitoring and security hardening",
      "Ongoing support plans",
    ],
    process: [
      { title: "Understand", description: "Map requirements and constraints with your team." },
      { title: "Specify", description: "Agree scope, architecture and milestones." },
      { title: "Build", description: "Iterative development with regular demos." },
      { title: "Support", description: "Deployment, documentation and ongoing care." },
    ],
    faqs: [
      { q: "Who owns the code you write?", a: "You do, on final payment. We provide the source code and documentation so another developer could maintain it if needed." },
      { q: "Do you offer ongoing support?", a: "Yes, through monthly support plans with agreed response times." },
    ],
    related: ["ai-automation", "website-development", "ecommerce-development"],
  },
];
