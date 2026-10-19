-- Pricing lives only on /pricing (reached from the "Pricing" menu item): remove the plans section from the homepage.
-- Content only; it can be re-added any time in Admin → Homepage Sections → Add section → "Plans & pricing".
DELETE FROM "PageSection"
 WHERE "type" = 'plans'
   AND "pageId" = (SELECT "id" FROM "Page" WHERE "slug" = 'home');
