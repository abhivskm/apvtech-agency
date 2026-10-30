-- Privacy Policy: describe the first-party analytics. Content only; runs once per database.
-- Replaces the original analytics paragraph if it is still there. If it was edited in the admin, the new
-- section goes before "WhatsApp" instead; a policy edited beyond that is left for the owner to update by hand.
WITH new_text AS (
  SELECT '<h2>Analytics and cookies</h2>
<p>We use our own analytics, hosted with this website, to understand how it is used and improve it. We do not sell this data or use it for advertising.</p>
<p><strong>What we collect:</strong> pages viewed, time spent and how far you scroll; buttons and links clicked; the site or campaign that brought you here; device type, browser, operating system and language; approximate location (country, state and city); page speed measurements and technical errors; and whether the enquiry form was viewed, started, submitted or failed.</p>
<p><strong>What we do not collect:</strong> anything you type into a form, your name, email or phone number, or your IP address. Location is provided by our hosting provider and your IP address is not stored in our analytics.</p>
<p><strong>How it works:</strong> a random visitor ID and visit ID are kept in your browser''s local storage. They are not used to identify you, and we cannot link them to you by name. Other analytics tools, if enabled, are loaded only in line with the cookie preferences shown to you. Essential cookies are used for website security and, for staff, to keep administrators signed in.</p>
<p><strong>Retention:</strong> detailed analytics events are kept for 13 months, then reduced to daily totals that contain no visitor IDs.</p>
<p><strong>Your choices:</strong> analytics are switched off if your browser sends a Do Not Track or Global Privacy Control signal, or if you decline in the cookie preferences. You can also <a href="/?ignore_me=1">opt out on this device</a>.</p>' AS html
)
UPDATE "PageSection" ps
   SET "data" = jsonb_set(ps."data", '{html}', to_jsonb(
         CASE
           WHEN position('<h2>Analytics and cookies</h2>
<p>If analytics are enabled on this website, they are loaded only in line with the cookie preferences shown to you. Essential cookies are used for website security and, for staff, to keep administrators signed in.</p>' in ps."data"->>'html') > 0
             THEN replace(ps."data"->>'html', '<h2>Analytics and cookies</h2>
<p>If analytics are enabled on this website, they are loaded only in line with the cookie preferences shown to you. Essential cookies are used for website security and, for staff, to keep administrators signed in.</p>', n.html)
           ELSE replace(ps."data"->>'html', '<h2>WhatsApp</h2>', n.html || '
<h2>WhatsApp</h2>')
         END)),
       "updatedAt" = (NOW() AT TIME ZONE 'UTC')
  FROM new_text n
 WHERE ps."pageId" = (SELECT "id" FROM "Page" WHERE "slug" = 'privacy-policy')
   AND ps."type" = 'richText'
   AND ps."data"->>'html' LIKE '%<h2>WhatsApp</h2>%';
