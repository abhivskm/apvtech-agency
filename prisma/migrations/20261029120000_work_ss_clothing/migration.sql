-- Work: SS Clothing / Shree Shyam Garments (real client project, live at ss-clothing.vercel.app), placed third.
-- Images are static files in public/work/ss-clothing (screenshots of the live site); replace them in Admin → Media Library.
-- No results or metrics are claimed. Content only; runs once per database.

INSERT INTO "MediaAsset" ("id","kind","url","filename","mime","width","height","alt","credit","updatedAt") VALUES
('media-ssclothing-cover','IMAGE','/work/ss-clothing/cover.jpg','ss-clothing-cover.jpg','image/jpeg',2400,1600,'SS Clothing product page shown on a desktop browser and a phone',NULL,(NOW() AT TIME ZONE 'UTC')),
('media-ssclothing-new','IMAGE','/work/ss-clothing/new-arrivals.jpg','ss-clothing-new-arrivals.jpg','image/jpeg',1800,750,'SS Clothing new arrivals row with New, Trending and discount labels',NULL,(NOW() AT TIME ZONE 'UTC')),
('media-ssclothing-enquire','IMAGE','/work/ss-clothing/mobile-enquire.jpg','ss-clothing-mobile-enquire.jpg','image/jpeg',780,1200,'SS Clothing product on a phone: size picker, in-stock status, Enquire on WhatsApp and DM on Instagram',NULL,(NOW() AT TIME ZONE 'UTC')),
('media-ssclothing-mobile','IMAGE','/work/ss-clothing/mobile-product.jpg','ss-clothing-mobile-product.jpg','image/jpeg',780,1200,'SS Clothing product gallery on a phone',NULL,(NOW() AT TIME ZONE 'UTC')),
('media-ssclothing-product','IMAGE','/work/ss-clothing/product.jpg','ss-clothing-product.jpg','image/jpeg',1800,1125,'SS Clothing product page with photo gallery, price, MRP, discount, colours and sizes',NULL,(NOW() AT TIME ZONE 'UTC'))
ON CONFLICT ("id") DO NOTHING;

UPDATE "Project" SET "order" = "order" + 1 WHERE "order" >= 2;

INSERT INTO "Project" ("id","slug","title","client","isConcept","year","summary","description","challenge","solution","outcome","coverId","industryId","featured","order","status","publishedAt","seoTitle","seoDescription","updatedAt")
SELECT 'proj_ssclothing','ss-clothing-menswear-showcase',
 'SS Clothing — menswear showcase with WhatsApp & Instagram enquiries',
 'SS Clothing (Shree Shyam Garments)', false, 2026,
 'A product showcase website for a men''s wear store at Karond Square, Bhopal, where customers browse online and enquire on WhatsApp or Instagram.',
 '<p><a href="https://ss-clothing.vercel.app/">Visit the SS Clothing website</a></p>',
 'SS Clothing''s customers discover new stock on Instagram and then message or visit the store. The shop needed a proper catalogue that shows every style, size and price, sends serious buyers straight to WhatsApp or Instagram DM, and stays simple enough for the owner to update from a phone, without a cart, payments or customer accounts.',
 'We designed and built a fast catalogue website: a mega menu grouped into topwear, bottomwear and more, search, a hero slider, category tiles, New Arrivals and Trending rows, and collection pages with category and size filters and sorting. Product pages have a photo gallery with zoom, colours, sizes, in-stock or sold-out status, fabric and fit details, and two clear actions: Enquire on WhatsApp and DM on Instagram. The owner''s admin portal covers adding and editing products, uploading and reordering several photos at once, hiding products or marking them sold out, choosing what appears in the homepage rows, and managing categories. An analytics dashboard shows real visits only: live visitors, new and returning visitors, WhatsApp and call taps, and per-product views and enquiry conversion.',
 'The website is live. The owner manages products, photos and categories from the admin portal, and changes appear on the site immediately.',
 'media-ssclothing-cover', (SELECT "id" FROM "Industry" WHERE "slug" = 'ecommerce'),
 true, 2, 'PUBLISHED', (NOW() AT TIME ZONE 'UTC'),
 'SS Clothing — Menswear Showcase Website, Bhopal',
 'Case study: a menswear catalogue website for a Bhopal store with WhatsApp and Instagram enquiries, an owner admin portal and real visit analytics.',
 (NOW() AT TIME ZONE 'UTC');

INSERT INTO "ProjectMedia" ("id","projectId","mediaId","order") VALUES
('pm_ssclothing_1','proj_ssclothing','media-ssclothing-new',0),
('pm_ssclothing_2','proj_ssclothing','media-ssclothing-enquire',1),
('pm_ssclothing_3','proj_ssclothing','media-ssclothing-mobile',2),
('pm_ssclothing_4','proj_ssclothing','media-ssclothing-product',3);

INSERT INTO "ProjectService" ("projectId","serviceId")
SELECT 'proj_ssclothing', s."id" FROM "Service" s WHERE s."slug" IN ('website-development','ecommerce-development','whatsapp-booking-setup')
ON CONFLICT DO NOTHING;

INSERT INTO "ProjectCategoryLink" ("projectId","categoryId")
SELECT 'proj_ssclothing', c."id" FROM "ProjectCategory" c WHERE c."slug" IN ('website-design','ecommerce')
ON CONFLICT DO NOTHING;
