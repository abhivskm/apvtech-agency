-- Adds a 3-column comparison section to the Pricing page, between the plan cards and the FAQs.
-- Content only (no schema change). Runs once per database; edit it later in Admin → Pages → Pricing.
-- Timestamps use UTC explicitly (columns are timestamp without time zone; Prisma reads them as UTC).

UPDATE "PageSection" SET "order" = "order" + 1
 WHERE "pageId" = (SELECT "id" FROM "Page" WHERE "slug" = 'pricing') AND "order" >= 1;

INSERT INTO "PageSection" ("id","pageId","type","key","order","visible","data","updatedAt")
SELECT 'sec_pricing_compare', p."id", 'comparison', 'pricing-comparison', 1, true,
 '{
   "eyebrow": "Comparison",
   "heading": "Why businesses choose one connected team",
   "colATitle": "No website",
   "colBTitle": "Freelancers & other agencies",
   "oursTitle": "",
   "rows": [
     {"label": "Being found", "a": "Customers searching online can''t find or check you", "b": "A website, often built separately from SEO and social", "ours": "Website, Google, social and ads planned together"},
     {"label": "Who does the work", "a": "You handle everything yourself", "b": "Several people to brief and coordinate", "ours": "One team and one point of contact"},
     {"label": "Planning", "a": "Ad-hoc posts and offers, no plan", "b": "Each specialist works on their own piece", "ours": "Strategy first, then execution"},
     {"label": "Branding", "a": "Missing or inconsistent", "b": "Styles and messages can differ per channel", "ours": "Consistent branding on every channel"},
     {"label": "Pricing", "a": "No spend, but missed enquiries from people searching online", "b": "Separate quotes that are hard to compare", "ours": "Clear proposals with starting prices"},
     {"label": "Ownership & results", "a": "Nothing to measure or improve", "b": "Logins and files spread across vendors", "ours": "You own your accounts, files and code, with monthly reports"}
   ]
 }'::jsonb,
 (NOW() AT TIME ZONE 'UTC')
FROM "Page" p WHERE p."slug" = 'pricing';
