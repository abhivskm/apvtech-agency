-- AlterTable
ALTER TABLE "Enquiry" ADD COLUMN     "plan" TEXT;

-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "pricingNote" TEXT NOT NULL DEFAULT 'Prices exclude 18% GST.';

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT NOT NULL DEFAULT '',
    "bestFor" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "setupPrice" INTEGER,
    "monthlyPrice" INTEGER,
    "pricePrefix" TEXT NOT NULL DEFAULT 'Starting from',
    "includesLabel" TEXT,
    "features" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "highlighted" BOOLEAN NOT NULL DEFAULT false,
    "badge" TEXT,
    "ctaLabel" TEXT NOT NULL DEFAULT 'Choose this plan',
    "order" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Plan_slug_key" ON "Plan"("slug");

-- CreateIndex
CREATE INDEX "Plan_status_order_idx" ON "Plan"("status", "order");

-- ─────────────────────────────────────────────────────────────────────────────
-- Starter content for the pricing feature. Runs exactly once per database, so
-- later edits or deletions made in the admin are never overwritten.
-- Timestamps use UTC explicitly (columns are timestamp without time zone; Prisma reads them as UTC).
-- Prices are DRAFTS in whole rupees (exclusive of GST) — review them in Admin → Plans.
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO "Plan" ("id","slug","name","tagline","bestFor","description","setupPrice","monthlyPrice","pricePrefix","includesLabel","features","notes","highlighted","badge","ctaLabel","order","status","publishedAt","updatedAt") VALUES
('plan_starter','starter','Starter','Get online, properly.','New and small businesses that need a credible first website and a Google listing.',
 'A professional website and the essentials for being found locally, with light monthly care so nothing goes stale.',
 24999, 4999, 'Starting from', NULL,
 ARRAY['Up to 5-page responsive website','Mobile-first design and fast loading','Enquiry form, WhatsApp and click-to-call buttons','Basic on-page SEO, sitemap and Search Console setup','Google Business Profile setup','Analytics setup','Monthly: updates, backups and security checks','Monthly: 4 Google Business Profile posts'],
 ARRAY['Domain and hosting billed at cost'],
 false, NULL, 'Choose Starter', 0, 'PUBLISHED', (NOW() AT TIME ZONE 'UTC'), (NOW() AT TIME ZONE 'UTC')),
('plan_growth','growth','Growth','Show up and stay visible.','Established local businesses ready to grow search visibility and social presence.',
 'A larger, editable website plus ongoing local SEO and social media management, reported every month.',
 49999, 19999, 'Starting from', 'Everything in Starter, plus:',
 ARRAY['Up to 10 pages with an easy-to-use CMS','Local SEO and Google Business Profile optimisation','Keyword research and on-page SEO for key pages','Social media management on 2 platforms','12 designed posts and 4 reels per month','Content calendar shared for approval','Monthly performance report'],
 ARRAY[]::TEXT[],
 true, 'Most popular', 'Choose Growth', 1, 'PUBLISHED', (NOW() AT TIME ZONE 'UTC'), (NOW() AT TIME ZONE 'UTC')),
('plan_pro','pro','Pro','Grow with campaigns and content.','Brands and e-commerce businesses investing in paid growth and regular content.',
 'E-commerce or advanced websites, regular photo and video content, and managed ad campaigns with proper tracking.',
 99999, 44999, 'Starting from', 'Everything in Growth, plus:',
 ARRAY['E-commerce store or advanced website','Conversion and pixel tracking setup','Meta and Google Ads management','Social media management on 3 platforms','20 designed posts and 8 reels per month','Monthly half-day product or content shoot','Fortnightly review call'],
 ARRAY['Ad spend is paid directly to Google / Meta and is not included'],
 false, NULL, 'Choose Pro', 2, 'PUBLISHED', (NOW() AT TIME ZONE 'UTC'), (NOW() AT TIME ZONE 'UTC')),
('plan_enterprise','enterprise','Enterprise','A complete digital team.','Growing companies that need custom technology, automation and a dedicated team.',
 'A tailored scope across every channel, with custom software, automation and a dedicated point of contact.',
 NULL, NULL, 'Custom quote', 'Everything in Pro, plus:',
 ARRAY['Custom software, portals and integrations','AI solutions and workflow automation','Video production and brand films','Multi-location or multi-brand management','Dedicated account manager','Priority support','Quarterly strategy workshops'],
 ARRAY[]::TEXT[],
 false, NULL, 'Talk to us', 3, 'PUBLISHED', (NOW() AT TIME ZONE 'UTC'), (NOW() AT TIME ZONE 'UTC'));

-- Pricing page (system page rendered at /pricing): hero, then plans, then FAQ + CTA.
INSERT INTO "Page" ("id","slug","title","isSystem","status","publishedAt","seoTitle","seoDescription","updatedAt")
VALUES ('page_pricing','pricing','Pricing',true,'PUBLISHED',(NOW() AT TIME ZONE 'UTC'),'Plans & pricing',
 'Website, SEO, social media and growth plans for businesses across India. Clear starting prices, with every scope confirmed in a written proposal.',(NOW() AT TIME ZONE 'UTC'));

INSERT INTO "PageSection" ("id","pageId","type","key","order","visible","data","updatedAt") VALUES
('sec_pricing_hero','page_pricing','hero','pricing-hero',0,true,
 '{"variant":"simple","eyebrow":"Plans & pricing","headline":"Pick a starting point.\nWe''ll tailor the rest.","description":"Four plans that grow with your business. Prices are starting points — every engagement is confirmed in a written proposal before work begins.","media":[]}'::jsonb, (NOW() AT TIME ZONE 'UTC')),
('sec_pricing_faq','page_pricing','faq','pricing-faq',1,true,
 '{"heading":"Pricing questions","group":"pricing"}'::jsonb, (NOW() AT TIME ZONE 'UTC')),
('sec_pricing_cta','page_pricing','cta','pricing-cta',2,true,
 '{"heading":"Not sure which plan fits?","body":"Tell us about your business and goals. We''ll recommend a plan — or a custom mix — that makes sense for where you are now.","primaryCta":{"label":"Get a recommendation","href":"/contact"},"showWhatsapp":true}'::jsonb, (NOW() AT TIME ZONE 'UTC'));

INSERT INTO "Faq" ("id","question","answer","group","status","order","updatedAt") VALUES
('faq_pricing_1','Are these the final prices?','They are starting prices. The exact scope and cost depend on your requirements and are confirmed in a written proposal before any work begins.','pricing','PUBLISHED',0,(NOW() AT TIME ZONE 'UTC')),
('faq_pricing_2','Is GST included?','No. Prices are exclusive of GST, which is added at 18% on invoices.','pricing','PUBLISHED',1,(NOW() AT TIME ZONE 'UTC')),
('faq_pricing_3','Is advertising spend included?','No. Ad spend is paid directly to Google or Meta from your own account. Our fee covers strategy, creative and management.','pricing','PUBLISHED',2,(NOW() AT TIME ZONE 'UTC')),
('faq_pricing_4','Can I change plans later?','Yes. You can move up, down or switch to a custom scope as your needs change. We will agree the timing with you.','pricing','PUBLISHED',3,(NOW() AT TIME ZONE 'UTC')),
('faq_pricing_5','Can I choose individual services instead of a plan?','Absolutely. Plans are a convenient starting point, but every service is also available on its own.','pricing','PUBLISHED',4,(NOW() AT TIME ZONE 'UTC'));

-- Homepage: add a plans section just before the final call to action.
UPDATE "PageSection" SET "order" = "order" + 1
 WHERE "pageId" = (SELECT "id" FROM "Page" WHERE "slug" = 'home') AND "key" = 'home-cta';
INSERT INTO "PageSection" ("id","pageId","type","key","order","visible","data","updatedAt")
SELECT 'sec_home_plans', p."id", 'plans', 'home-plans',
       COALESCE((SELECT "order" FROM "PageSection" WHERE "pageId" = p."id" AND "key" = 'home-cta'), 99) - 1, true,
       '{"eyebrow":"Plans","heading":"Simple plans that grow with you.","description":"Starting prices for our most common packages. Every scope is confirmed in a written proposal."}'::jsonb, (NOW() AT TIME ZONE 'UTC')
FROM "Page" p WHERE p."slug" = 'home';

-- Navigation: "Pricing" in the header (after Industries) and in the footer Studio column.
UPDATE "NavItem" SET "order" = "order" + 1
 WHERE "location" = 'HEADER' AND "parentId" IS NULL
   AND "order" > COALESCE((SELECT "order" FROM "NavItem" WHERE "location" = 'HEADER' AND "parentId" IS NULL AND "href" = '/industries' LIMIT 1), 2);
INSERT INTO "NavItem" ("id","location","label","href","order","visible","updatedAt")
SELECT 'nav_header_pricing','HEADER','Pricing','/pricing',
       COALESCE((SELECT "order" FROM "NavItem" WHERE "location" = 'HEADER' AND "parentId" IS NULL AND "href" = '/industries' LIMIT 1), 2) + 1, true, (NOW() AT TIME ZONE 'UTC')
WHERE EXISTS (SELECT 1 FROM "NavItem" WHERE "location" = 'HEADER');
INSERT INTO "NavItem" ("id","location","label","href","order","visible","updatedAt")
SELECT 'nav_footer_pricing','FOOTER_COMPANY','Pricing','/pricing',
       COALESCE((SELECT MAX("order") FROM "NavItem" WHERE "location" = 'FOOTER_COMPANY'), 0) + 1, true, (NOW() AT TIME ZONE 'UTC')
WHERE EXISTS (SELECT 1 FROM "NavItem" WHERE "location" = 'FOOTER_COMPANY');
