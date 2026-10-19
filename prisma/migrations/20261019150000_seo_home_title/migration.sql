-- SEO: put "digital agency in India" in the homepage title (only if the title is still the original default).
-- Editable later in Admin → SEO & Redirects.
UPDATE "SiteSettings"
   SET "defaultSeoTitle" = 'FORM & SIGNAL — Digital Agency in India for Websites, SEO & Growth',
       "updatedAt" = (NOW() AT TIME ZONE 'UTC')
 WHERE "defaultSeoTitle" = 'FORM & SIGNAL — Websites, SEO, content & digital growth';
