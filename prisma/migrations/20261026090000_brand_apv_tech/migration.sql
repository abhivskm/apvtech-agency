-- Final brand name: APV Tech (replaces the temporary working name FORM & SIGNAL).
-- Only values still set to the old defaults are changed; anything edited in the admin is kept.
UPDATE "SiteSettings" SET "brandName" = 'APV Tech', "updatedAt" = (NOW() AT TIME ZONE 'UTC') WHERE "brandName" = 'FORM & SIGNAL';
UPDATE "SiteSettings" SET "brandShortName" = 'APV', "updatedAt" = (NOW() AT TIME ZONE 'UTC') WHERE "brandShortName" = 'F&S';
UPDATE "SiteSettings"
   SET "defaultSeoTitle" = replace("defaultSeoTitle", 'FORM & SIGNAL', 'APV Tech'), "updatedAt" = (NOW() AT TIME ZONE 'UTC')
 WHERE "defaultSeoTitle" LIKE '%FORM & SIGNAL%';
