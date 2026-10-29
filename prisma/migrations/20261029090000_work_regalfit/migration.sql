-- Work: Regal Fit (real client project, live at regalfit.vercel.app), placed second after Kaasthify.
-- Images are static files in public/work/regalfit (screenshots of the live site); replace them in Admin → Media Library.
-- No results or metrics are claimed. Content only; runs once per database.

INSERT INTO "MediaAsset" ("id","kind","url","filename","mime","width","height","alt","credit","updatedAt") VALUES
('media-regalfit-cover','IMAGE','/work/regalfit/cover.jpg','regalfit-cover.jpg','image/jpeg',2400,1600,'Regal Fit menswear website shown on a desktop browser and a phone',NULL,(NOW() AT TIME ZONE 'UTC')),
('media-regalfit-categories','IMAGE','/work/regalfit/categories.jpg','regalfit-categories.jpg','image/jpeg',1800,750,'Regal Fit shop-by-category carousel: oversized tees, shirts, hoodies, sweatshirts, joggers and jeans',NULL,(NOW() AT TIME ZONE 'UTC')),
('media-regalfit-combos','IMAGE','/work/regalfit/combos.jpg','regalfit-combos.jpg','image/jpeg',1800,1081,'Regal Fit combo deals with bundle price, MRP and a Grab deal button that opens WhatsApp',NULL,(NOW() AT TIME ZONE 'UTC')),
('media-regalfit-mobile','IMAGE','/work/regalfit/mobile-home.jpg','regalfit-mobile-home.jpg','image/jpeg',780,1200,'Regal Fit homepage on a phone with call and WhatsApp buttons in the header',NULL,(NOW() AT TIME ZONE 'UTC')),
('media-regalfit-hero','IMAGE','/work/regalfit/home-hero.jpg','regalfit-home-hero.jpg','image/jpeg',1800,1025,'Regal Fit homepage hero slider: Layer up, jackets and overshirts',NULL,(NOW() AT TIME ZONE 'UTC'))
ON CONFLICT ("id") DO NOTHING;

UPDATE "Project" SET "order" = "order" + 1 WHERE "order" >= 1;

INSERT INTO "Project" ("id","slug","title","client","isConcept","year","summary","description","challenge","solution","outcome","coverId","industryId","featured","order","status","publishedAt","seoTitle","seoDescription","updatedAt")
SELECT 'proj_regalfit','regal-fit-menswear-store',
 'Regal Fit — menswear storefront with WhatsApp ordering',
 'Regal Fit Men''s Wear', false, 2026,
 'A fast, mobile-first storefront for a Bhopal streetwear brand, where every product can be ordered on WhatsApp in one tap.',
 '<p><a href="https://regalfit.vercel.app/">Visit the Regal Fit website</a></p>',
 'Regal Fit sells streetwear and daily wear from its store in Bhopal, and most customers already message the shop on WhatsApp. The brand needed a site that looks as good as the big fashion apps and makes ordering on WhatsApp effortless, and that the owner can update every week without a developer, with no cart, payment gateway or monthly e-commerce fees.',
 'We designed and built a single-page storefront in the style of leading Indian fashion sites: auto-sliding hero banners, an offer strip, shop by category, new arrivals, combo deals, a seasonal winterwear section and a filterable catalogue. Every product card shows the price, the MRP and the discount, and "Buy on WhatsApp" opens a chat with the product name and price already filled in. A password-protected admin lets the owner add products, change prices and photos and reorder slides, combos and categories, and changes go live as soon as they are saved. Photos are resized in the browser so pages stay fast on phones. A privacy-friendly visitor dashboard (no cookies, no stored IP addresses) shows live visitors, where people come from, which products are seen and which ones get WhatsApp taps, and campaign links show which Instagram post or QR code brought each visit.',
 'The site is live, and the owner updates products, prices, slides and combos from the admin, and follows interest product by product in the visitor dashboard.',
 'media-regalfit-cover', (SELECT "id" FROM "Industry" WHERE "slug" = 'ecommerce'),
 true, 1, 'PUBLISHED', (NOW() AT TIME ZONE 'UTC'),
 'Regal Fit — Menswear Website with WhatsApp Ordering',
 'Case study: a mobile-first menswear storefront for a Bhopal brand with one-tap WhatsApp ordering, an owner-friendly admin and a privacy-friendly visitor dashboard.',
 (NOW() AT TIME ZONE 'UTC');

INSERT INTO "ProjectMedia" ("id","projectId","mediaId","order") VALUES
('pm_regalfit_1','proj_regalfit','media-regalfit-categories',0),
('pm_regalfit_2','proj_regalfit','media-regalfit-mobile',1),
('pm_regalfit_3','proj_regalfit','media-regalfit-combos',2);

INSERT INTO "ProjectService" ("projectId","serviceId")
SELECT 'proj_regalfit', s."id" FROM "Service" s WHERE s."slug" IN ('website-development','ecommerce-development','whatsapp-booking-setup')
ON CONFLICT DO NOTHING;

INSERT INTO "ProjectCategoryLink" ("projectId","categoryId")
SELECT 'proj_regalfit', c."id" FROM "ProjectCategory" c WHERE c."slug" IN ('website-design','ecommerce')
ON CONFLICT DO NOTHING;
