-- Work: Kaasthify (real client project, live at kaasthify.in), placed first.
-- Images are static files in public/work/kaasthify (screenshots of the live site); replace them in Admin → Media Library.
-- No results or metrics are claimed. Content only; runs once per database.

INSERT INTO "MediaAsset" ("id","kind","url","filename","mime","width","height","alt","credit","updatedAt") VALUES
('media-kaasthify-cover','IMAGE','/work/kaasthify/cover.jpg','kaasthify-cover.jpg','image/jpeg',2400,1600,'Kaasthify furniture marketplace shown on a desktop browser and a phone',NULL,(NOW() AT TIME ZONE 'UTC')),
('media-kaasthify-shop','IMAGE','/work/kaasthify/shop.jpg','kaasthify-shop.jpg','image/jpeg',1800,925,'Kaasthify shop page with room filters and furniture listed by maker',NULL,(NOW() AT TIME ZONE 'UTC')),
('media-kaasthify-mobile','IMAGE','/work/kaasthify/mobile-home.jpg','kaasthify-mobile-home.jpg','image/jpeg',780,1200,'Kaasthify homepage on a phone with search, location and room categories',NULL,(NOW() AT TIME ZONE 'UTC')),
('media-kaasthify-custom','IMAGE','/work/kaasthify/custom-design.jpg','kaasthify-custom-design.jpg','image/jpeg',1800,1200,'Kaasthify custom design flow: share a photo, set the size, get a quote',NULL,(NOW() AT TIME ZONE 'UTC')),
('media-kaasthify-hero','IMAGE','/work/kaasthify/home-hero.jpg','kaasthify-home-hero.jpg','image/jpeg',1800,800,'Kaasthify homepage hero: pieces from trusted makers, or built from your own idea',NULL,(NOW() AT TIME ZONE 'UTC'))
ON CONFLICT ("id") DO NOTHING;

UPDATE "Project" SET "order" = "order" + 1;

INSERT INTO "Project" ("id","slug","title","client","isConcept","summary","description","challenge","solution","outcome","coverId","industryId","featured","order","status","publishedAt","seoTitle","seoDescription","updatedAt")
SELECT 'proj_kaasthify','kaasthify-furniture-marketplace',
 'Kaasthify — furniture marketplace & custom-design platform',
 'Kaasthify', false,
 'A marketplace for solid-wood furniture from verified workshops across India, with made-to-measure ordering from a single photo.',
 '<p><a href="https://www.kaasthify.in/">Visit kaasthify.in</a></p>',
 'Buying solid-wood furniture online usually means choosing from fixed sizes and sellers you know nothing about. Kaasthify needed one platform where buyers can shop pieces from independent workshops across India, or ask for a piece built to their own dimensions, while every seller stays verified and every order stays trackable.',
 'We designed and built the complete marketplace. Buyers browse a catalogue organised by room, with each piece credited to the workshop that makes it, and can see makers near their location, save a wishlist, check out and track orders. A custom-design flow lets them upload a reference photo, enter size, material and finish, and receive a quote before paying anything. Makers get their own area to register a store, complete KYC verification and manage their catalogue, orders and payouts. The storefront is mobile-first, with app-style bottom navigation on phones.',
 'Kaasthify is live at kaasthify.in, with shopping, custom requests and seller onboarding all running on the platform.',
 'media-kaasthify-cover', (SELECT "id" FROM "Industry" WHERE "slug" = 'ecommerce'),
 true, 0, 'PUBLISHED', (NOW() AT TIME ZONE 'UTC'),
 'Kaasthify — Furniture Marketplace Website',
 'Case study: a solid-wood furniture marketplace with verified makers, made-to-measure custom orders and seller onboarding, live at kaasthify.in.',
 (NOW() AT TIME ZONE 'UTC');

INSERT INTO "ProjectMedia" ("id","projectId","mediaId","order") VALUES
('pm_kaasthify_1','proj_kaasthify','media-kaasthify-shop',0),
('pm_kaasthify_2','proj_kaasthify','media-kaasthify-mobile',1),
('pm_kaasthify_3','proj_kaasthify','media-kaasthify-custom',2),
('pm_kaasthify_4','proj_kaasthify','media-kaasthify-hero',3);

INSERT INTO "ProjectService" ("projectId","serviceId")
SELECT 'proj_kaasthify', s."id" FROM "Service" s WHERE s."slug" IN ('website-development','ecommerce-development')
ON CONFLICT DO NOTHING;

INSERT INTO "ProjectCategoryLink" ("projectId","categoryId")
SELECT 'proj_kaasthify', c."id" FROM "ProjectCategory" c WHERE c."slug" IN ('website-design','ecommerce')
ON CONFLICT DO NOTHING;
