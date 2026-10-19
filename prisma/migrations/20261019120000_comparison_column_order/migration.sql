-- Comparison sections: column order is now an editable "columns" list (reorder with ↑ ↓ in Admin → Pages).
-- Converts the Pricing comparison to: No website → your brand → Freelancers & other agencies.
-- Content only; runs once per database.

UPDATE "PageSection"
   SET "data" = ("data" - 'colATitle' - 'colBTitle' - 'oursTitle') || jsonb_build_object('columns', jsonb_build_array(
         jsonb_build_object('title', COALESCE("data"->>'colATitle', 'No website'), 'column', 'a'),
         jsonb_build_object('title', COALESCE("data"->>'oursTitle', ''), 'column', 'ours'),
         jsonb_build_object('title', COALESCE("data"->>'colBTitle', 'Freelancers & other agencies'), 'column', 'b'))),
       "updatedAt" = (NOW() AT TIME ZONE 'UTC')
 WHERE "type" = 'comparison' AND NOT ("data" ? 'columns');
