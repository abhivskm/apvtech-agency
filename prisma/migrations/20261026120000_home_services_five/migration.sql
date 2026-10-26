-- Homepage services: show five groups (Digital Experience, Search & Google, Social, Branding, AI & Automation).
-- The other services stay published on /services; tick "Show on homepage" in Admin → Services to bring one back.
UPDATE "Service"
   SET "showOnHome" = false, "updatedAt" = (NOW() AT TIME ZONE 'UTC')
 WHERE "slug" IN ('product-photography', 'video-production', 'paid-advertising', 'it-support-software');
