import { mid } from "./ids";

type Section = { key: string; type: string; data: Record<string, unknown>; visible?: boolean };
type SeedPage = { slug: string; title: string; seoTitle?: string; seoDescription: string; sections: Section[] };

const process = [
  { title: "Discover", text: "We learn how your business works, who your customers are, where they find you today and what success should look like." },
  { title: "Strategize", text: "We decide what to do first and why — the channels, messages and priorities with the clearest path to results." },
  { title: "Create", text: "Websites, content, campaigns and tools built by one team, so everything looks and sounds like the same brand." },
  { title: "Optimize", text: "We measure what's working, report honestly and keep improving instead of launching and walking away." },
];

export const PAGES: SeedPage[] = [
  {
    slug: "home",
    title: "Home",
    seoDescription:
      "A connected digital partner for growing businesses in India — websites, SEO and Google visibility, social content, photography, video, ads and automation under one roof.",
    sections: [
      {
        key: "home-hero",
        type: "hero",
        data: {
          variant: "signature",
          eyebrow: "Digital studio · India",
          headline: "Your brand.\nBuilt for\nwhat's next.",
          subheadline: "Websites, visibility, content, and technology — all working together.",
          description: "We help ambitious businesses across India build stronger digital experiences, get discovered online, and turn attention into opportunity.",
          primaryCta: { label: "Start a Project", href: "/contact" },
          secondaryCta: { label: "Explore Our Work", href: "/work" },
          media: [mid("web-ui-screens"), mid("headphones-yellow"), mid("coffee-packaging"), mid("video-timeline"), mid("food-plates")],
          mediaLabels: "Websites, Product photography, Branding, Video, Food campaigns",
        },
      },
      {
        key: "home-positioning",
        type: "positioning",
        data: {
          eyebrow: "One partner. Every digital touchpoint.",
          heading: "Your entire digital presence.\nConnected.",
          body: "Most businesses manage their website, Google listing, social media, photography and ads through different people who never speak to each other. The result is mixed messages, duplicated effort and gaps where customers drop off. We bring it under one roof — so your website, search visibility, content and technology are planned together and pull in the same direction.",
          points: [
            { title: "Website", text: "The place every channel leads back to. Clear, fast and built to convert." },
            { title: "Google visibility", text: "Search and Maps presence so you're found when people are already looking." },
            { title: "Social & content", text: "Consistent creative that keeps your brand visible between purchases." },
            { title: "Technology", text: "Automation and tools that make the whole system easier to run." },
          ],
        },
      },
      {
        key: "home-services",
        type: "services",
        data: {
          eyebrow: "Services",
          heading: "Everything you need to show up, stand out, and grow.",
          description: "Choose a single service or combine them. Either way, the work is planned with the bigger picture in mind.",
        },
      },
      {
        key: "home-work",
        type: "work",
        data: {
          eyebrow: "Selected work",
          heading: "Made with intention.\nBuilt to make an impact.",
          description: "Concept projects that show how we think about brands, websites, photography and campaigns. Client case studies will appear here as projects launch.",
          limit: 4,
        },
      },
      {
        key: "home-process",
        type: "process",
        data: {
          eyebrow: "How we work",
          heading: "A clear process, from first call to continuous improvement.",
          steps: process,
        },
      },
      {
        key: "home-industries",
        type: "industries",
        data: {
          eyebrow: "Industries",
          heading: "Tailored to the way your business grows.",
          description: "Different businesses need different things from their digital presence. We start from yours.",
        },
      },
      {
        key: "home-why",
        type: "why",
        data: {
          eyebrow: "Why work with us",
          heading: "One team. Fewer gaps.\nBetter-connected work.",
          points: [
            { title: "Multiple capabilities, one roof", text: "Design, development, search, content, photography, video and automation — without coordinating five vendors." },
            { title: "Creative and technical", text: "The people designing your brand work alongside the people building your website and tracking." },
            { title: "Strategy before execution", text: "We agree what matters and why before producing anything." },
            { title: "Consistent across channels", text: "Your website, social feed, ads and print look and sound like one brand." },
            { title: "Clear communication", text: "Named contacts, regular updates and plain-language reporting." },
            { title: "Tailored, not templated", text: "Scopes built around your goals and budget, not fixed packages." },
            { title: "Support that scales", text: "Start with one project and add services as the business grows." },
          ],
        },
      },
      {
        key: "home-results",
        type: "results",
        data: {
          eyebrow: "Results",
          heading: "Outcomes we can stand behind.",
          description: "Verified results from client projects appear here.",
          fallbackHeading: "We'll show results when they're real.",
          fallbackPoints: [
            { title: "Baselines first", text: "Every engagement starts by recording where you are today — traffic, enquiries, rankings, reach — so progress can be measured honestly." },
            { title: "Tracking that works", text: "Analytics, conversion events and enquiry sources are set up and tested before we report on anything." },
            { title: "Reports in plain language", text: "Monthly summaries of what changed, what we did and what we recommend next — including what didn't work." },
          ],
        },
      },
      { key: "home-testimonials", type: "testimonials", data: { eyebrow: "Kind words", heading: "What clients say." } },
      {
        key: "home-insights",
        type: "insights",
        data: { eyebrow: "Insights", heading: "Notes on building a better digital presence.", limit: 3 },
      },
      {
        key: "home-cta",
        type: "cta",
        data: {
          heading: "Let's make your next move count.",
          body: "Tell us what you're building. We'll help you figure out what to do next.",
          primaryCta: { label: "Start a Project", href: "/contact" },
          showWhatsapp: true,
        },
      },
    ],
  },
  {
    slug: "services",
    title: "Services",
    seoTitle: "Digital services",
    seoDescription: "Website development, e-commerce, SEO and Google presence, social media, creative design, photography, video, paid advertising, AI automation and IT support.",
    sections: [
      {
        key: "services-hero",
        type: "hero",
        data: {
          variant: "simple",
          eyebrow: "Services",
          headline: "Every digital touchpoint,\nplanned together.",
          description: "Pick the service you need today. We'll make sure it fits with everything else your brand does online.",
        },
      },
      {
        key: "services-cta",
        type: "cta",
        data: { heading: "Not sure where to start?", body: "Tell us about your business and goals. We'll suggest the few things that will make the biggest difference first.", primaryCta: { label: "Start a Project", href: "/contact" }, showWhatsapp: true },
      },
    ],
  },
  {
    slug: "work",
    title: "Work",
    seoTitle: "Work & concept projects",
    seoDescription: "Website, e-commerce, branding, photography, video and campaign projects.",
    sections: [
      {
        key: "work-hero",
        type: "hero",
        data: {
          variant: "simple",
          eyebrow: "Work",
          headline: "Made with intention.",
          description: "Projects labelled “Concept” are self-initiated studies that show our approach. Client case studies are added as projects launch and clients approve them.",
        },
      },
    ],
  },
  {
    slug: "industries",
    title: "Industries",
    seoDescription: "Digital solutions tailored for small businesses, startups, e-commerce brands, restaurants, cafés and hotels.",
    sections: [
      {
        key: "industries-hero",
        type: "hero",
        data: {
          variant: "simple",
          eyebrow: "Industries",
          headline: "Built around how\nyour business grows.",
          description: "The right mix of website, search, content and technology depends on your industry. These are the businesses we focus on.",
        },
      },
    ],
  },
  {
    slug: "insights",
    title: "Insights",
    seoDescription: "Practical articles on websites, SEO, Google Business Profile, social media, branding, photography, video, e-commerce and automation.",
    sections: [
      {
        key: "insights-hero",
        type: "hero",
        data: { variant: "simple", eyebrow: "Insights", headline: "Notes from the studio.", description: "Practical, no-hype guidance for business owners building their digital presence." },
      },
    ],
  },
  {
    slug: "about",
    title: "About",
    seoDescription: "A new digital studio in India bringing websites, search, content, photography, video and technology together for growing businesses.",
    sections: [
      {
        key: "about-hero",
        type: "hero",
        data: {
          variant: "simple",
          eyebrow: "About",
          headline: "A connected digital\ngrowth partner.",
          description: "We're a new studio built on a simple idea: businesses grow faster when their website, search visibility, content and technology are planned by one team.",
          media: [mid("team-whiteboard")],
        },
      },
      {
        key: "about-story",
        type: "imageText",
        data: {
          heading: "Why we started",
          html: "<p>Growing businesses in India are often juggling a web developer, a freelance designer, a photographer, someone for social media and someone else for ads. Each does their part — but nobody is responsible for how it all fits together.</p><p>We set up the studio to close those gaps. One brief, one team, and a shared understanding of what the business is trying to achieve.</p><p>We're new, and we won't pretend otherwise. What we offer is care, clear communication and work we're proud to put our name to.</p>",
          image: mid("studio-workspace"),
          imagePosition: "right",
        },
      },
      {
        key: "about-values",
        type: "custom",
        data: {
          eyebrow: "How we work",
          heading: "Principles we hold ourselves to",
          items: [
            { title: "Honesty over hype", text: "No guaranteed rankings, invented statistics or fake reviews. We tell you what's realistic." },
            { title: "Strategy first", text: "We understand the business problem before choosing the deliverable." },
            { title: "Craft in the details", text: "Typography, image quality, load times and accessibility all matter." },
            { title: "You own your assets", text: "Your domains, accounts, files and code belong to you." },
          ],
        },
      },
      {
        key: "about-process",
        type: "process",
        data: { eyebrow: "Process", heading: "Four stages, repeated as you grow.", steps: process },
      },
      {
        key: "about-cta",
        type: "cta",
        data: { heading: "Let's make your next move count.", body: "Tell us what you're building. We'll help you figure out what to do next.", primaryCta: { label: "Start a Project", href: "/contact" }, showWhatsapp: true },
      },
    ],
  },
  {
    slug: "contact",
    title: "Contact",
    seoTitle: "Start a project",
    seoDescription: "Tell us about your business and what you're planning. We'll reply with next steps.",
    sections: [
      {
        key: "contact-hero",
        type: "hero",
        data: {
          variant: "simple",
          eyebrow: "Start a project",
          headline: "Tell us what\nyou're building.",
          description: "Share a few details and we'll get back to you with questions, ideas and next steps. Prefer to chat? Message us on WhatsApp.",
        },
      },
      { key: "contact-faq", type: "faq", data: { heading: "Before you get in touch", group: "general" } },
    ],
  },
  {
    slug: "privacy-policy",
    title: "Privacy Policy",
    seoDescription: "How we collect, use and protect personal information submitted through this website.",
    sections: [
      {
        key: "privacy-body",
        type: "richText",
        data: {
          heading: "Privacy Policy",
          html: `<p><em>Last updated: {date}</em></p>
<p>This policy explains how {brand} ("we", "us") handles personal information collected through this website. Please have this policy reviewed by a qualified professional before relying on it.</p>
<h2>Information we collect</h2>
<p>When you submit an enquiry, we collect the details you provide: your name, business name, email address, phone or WhatsApp number, website, industry, services of interest, budget, timeline and project description. We also record the date of submission and your consent.</p>
<p>For security and spam prevention we store a one-way hashed form of your IP address, not the address itself.</p>
<h2>How we use it</h2>
<ul><li>To respond to your enquiry and discuss your project</li><li>To keep records of our communication</li><li>To protect the website against spam and abuse</li></ul>
<p>We do not sell your information or use it for unrelated marketing without your permission.</p>
<h2>Analytics and cookies</h2>
<p>We use our own analytics, hosted with this website, to understand how it is used and improve it. We do not sell this data or use it for advertising.</p>
<p><strong>What we collect:</strong> pages viewed, time spent and how far you scroll; buttons and links clicked; the site or campaign that brought you here; device type, browser, operating system and language; approximate location (country, state and city); page speed measurements and technical errors; and whether the enquiry form was viewed, started, submitted or failed.</p>
<p><strong>What we do not collect:</strong> anything you type into a form, your name, email or phone number, or your IP address. Location is provided by our hosting provider and your IP address is not stored in our analytics.</p>
<p><strong>How it works:</strong> a random visitor ID and visit ID are kept in your browser's local storage. They are not used to identify you, and we cannot link them to you by name. Other analytics tools, if enabled, are loaded only in line with the cookie preferences shown to you. Essential cookies are used for website security and, for staff, to keep administrators signed in.</p>
<p><strong>Retention:</strong> detailed analytics events are kept for 13 months, then reduced to daily totals that contain no visitor IDs.</p>
<p><strong>Your choices:</strong> analytics are switched off if your browser sends a Do Not Track or Global Privacy Control signal, or if you decline in the cookie preferences. You can also <a href="/?ignore_me=1">opt out on this device</a>.</p>
<h2>WhatsApp</h2>
<p>If you choose to contact us via WhatsApp, your conversation is handled by WhatsApp under its own terms and privacy policy.</p>
<h2>Retention</h2>
<p>Enquiries are kept only as long as needed to respond and maintain business records, after which they are deleted or anonymised.</p>
<h2>Your rights</h2>
<p>You may request access to, correction of, or deletion of your personal information by contacting us using the details on our contact page. We handle requests in line with applicable Indian law, including the Digital Personal Data Protection Act, 2023.</p>
<h2>Contact</h2>
<p>For privacy questions, please use the contact details on our <a href="/contact">contact page</a>.</p>`,
        },
      },
    ],
  },
  {
    slug: "terms-and-conditions",
    title: "Terms and Conditions",
    seoDescription: "Terms governing the use of this website.",
    sections: [
      {
        key: "terms-body",
        type: "richText",
        data: {
          heading: "Terms and Conditions",
          html: `<p><em>Last updated: {date}</em></p>
<p>These terms govern your use of the {brand} website. Please have these terms reviewed by a qualified professional before relying on them.</p>
<h2>Use of this website</h2>
<p>You may browse this website and contact us for business purposes. You must not misuse the website, attempt to gain unauthorised access, or submit false or harmful information.</p>
<h2>Content</h2>
<p>Website content is provided for general information and does not constitute a proposal or contract. Projects labelled "Concept" are self-initiated work created to demonstrate our approach and do not represent commissioned client work.</p>
<h2>Intellectual property</h2>
<p>Unless stated otherwise, content on this website belongs to us or is used under licence. Photography credited to third parties remains the property of its owners.</p>
<h2>Services</h2>
<p>Any services we provide are governed by a separate written agreement or proposal, which takes precedence over these terms.</p>
<h2>No guarantees</h2>
<p>We do not guarantee specific search rankings, leads, sales or other outcomes. Results depend on many factors outside our control.</p>
<h2>Liability</h2>
<p>To the extent permitted by law, we are not liable for indirect losses arising from use of this website.</p>
<h2>Governing law</h2>
<p>These terms are governed by the laws of India.</p>`,
        },
      },
    ],
  },
];

export const GENERAL_FAQS = [
  { q: "Do you work with businesses outside your city?", a: "Yes. Most of our work can be done remotely across India. Photography and video shoots are planned per location." },
  { q: "What does a project cost?", a: "It depends on scope. After an initial conversation we'll send a written proposal with clear deliverables, timelines and pricing. There's no charge for the first discussion." },
  { q: "Can we start with one service and add more later?", a: "Absolutely. Many clients start with a website or a photoshoot and add search, social or ads once the foundations are in place." },
  { q: "Do you guarantee results?", a: "We don't guarantee rankings, leads or sales — nobody honestly can. We do commit to clear goals, solid execution and transparent reporting." },
];
