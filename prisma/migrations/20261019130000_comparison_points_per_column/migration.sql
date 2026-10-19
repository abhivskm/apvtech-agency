-- Comparison sections: each column now owns its list of points (edited per column in Admin → Pages).
-- Converts shared rows {label, a, b, ours} into columns[].points and rowLabels[]. Content only; runs once per database.

UPDATE "PageSection" ps
   SET "data" = (ps."data" - 'rows' - 'columns') || jsonb_build_object(
         'columns', (
           SELECT COALESCE(jsonb_agg(jsonb_build_object(
                    'title', COALESCE(c->>'title', ''),
                    'style', CASE c->>'column' WHEN 'ours' THEN 'ours' WHEN 'a' THEN 'none' ELSE 'muted' END,
                    'points', COALESCE((
                      SELECT jsonb_agg(jsonb_build_object('text', COALESCE(r->>(c->>'column'), '')) ORDER BY rn)
                        FROM jsonb_array_elements(ps."data"->'rows') WITH ORDINALITY AS rr(r, rn)), '[]'::jsonb)
                  ) ORDER BY cn), '[]'::jsonb)
             FROM jsonb_array_elements(ps."data"->'columns') WITH ORDINALITY AS cc(c, cn)),
         'rowLabels', COALESCE((
           SELECT jsonb_agg(jsonb_build_object('label', COALESCE(r->>'label', '')) ORDER BY rn)
             FROM jsonb_array_elements(ps."data"->'rows') WITH ORDINALITY AS rr(r, rn)), '[]'::jsonb)),
       "updatedAt" = (NOW() AT TIME ZONE 'UTC')
 WHERE ps."type" = 'comparison'
   AND jsonb_typeof(ps."data"->'columns') = 'array'
   AND jsonb_typeof(ps."data"->'rows') = 'array';
