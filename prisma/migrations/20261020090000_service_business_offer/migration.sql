-- Service-business offer: two new services, a Salons/Spas/Clinics industry, pricing add-ons,
-- a customer-journey block on AI & Automation, a CRM deliverable on IT & Software and one article.
-- Content only; runs once per database and is fully editable in the admin afterwards.
-- Records are looked up by slug (ids differ between databases). Timestamps are UTC.

-- ── Media (Unsplash, replaceable in Admin → Media Library) ──────────────────────────────
INSERT INTO "MediaAsset" ("id","kind","url","filename","mime","width","height","alt","credit","updatedAt") VALUES
('media-salon-modern','IMAGE','https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?auto=format&fit=crop&crop=entropy&w=2000&h=1333&q=80','salon-modern.jpg','image/jpeg',2000,1333,'Modern salon interior with styling chairs and round mirrors','Unsplash',(NOW() AT TIME ZONE 'UTC')),
('media-reception-tablet','IMAGE','https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&crop=entropy&w=2000&h=1333&q=80','reception-tablet.jpg','image/jpeg',2000,1333,'Receptionist checking in a customer on a tablet at a salon front desk','Unsplash',(NOW() AT TIME ZONE 'UTC')),
('media-phone-hand','IMAGE','https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&crop=entropy&w=2000&h=1333&q=80','phone-hand.jpg','image/jpeg',2000,1333,'Person tapping a message on a smartphone','Unsplash',(NOW() AT TIME ZONE 'UTC')),
('media-planner-coffee','IMAGE','https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&crop=entropy&w=2000&h=1333&q=80','planner-coffee.jpg','image/jpeg',2000,1333,'Monthly planner with appointments next to a cup of coffee','Unsplash',(NOW() AT TIME ZONE 'UTC'))
ON CONFLICT ("id") DO NOTHING;

-- ── Services ────────────────────────────────────────────────────────────────────────────
INSERT INTO "Service" ("id","slug","title","category","shortDescription","featuredLabel","heroHeadline","heroText","heroMediaId","body","problems","benefits","deliverables","process","ctaLabel","ctaHref","whatsappMessage","order","showOnHome","status","publishedAt","seoTitle","seoDescription","updatedAt") VALUES
('svc_whatsapp_booking','whatsapp-booking-setup','WhatsApp & Booking Setup','AI and Automation',
 'WhatsApp Business, online booking, confirmations and reminders set up properly, so enquiries turn into appointments without the back-and-forth.',
 'New',
 'From "Hi, are you free today?" to a confirmed booking.',
 'We set up the tools your customers already use (WhatsApp, Google and a simple booking link) and connect them so every enquiry has a clear next step.',
 'media-reception-tablet',
 '<p>For salons, clinics, studios and other appointment-based businesses, most bookings start as a WhatsApp message or a call. When replies are slow, details get lost in chats and reminders depend on someone remembering, customers drift away or simply don''t turn up.</p>
<h2>What we set up</h2>
<ul><li><strong>WhatsApp Business</strong>: business profile, catalogue of services and prices, quick replies, greeting and away messages. For higher volumes we can set up the official WhatsApp Business Platform (API) on your own number through an approved provider.</li><li><strong>Online booking</strong>: a booking link and a QR code for your counter, showing real availability for each service and staff member.</li><li><strong>Confirmations and reminders</strong>: automatic messages when a booking is made, a day before and a few hours before, each with an easy way to reschedule.</li><li><strong>Payment requests</strong>: optional deposits or payment links through your existing payment gateway.</li><li><strong>One customer list</strong>: bookings and contact details kept in one place you own, instead of scattered across phones.</li></ul>
<h2>How we work</h2>
<p>We start with how bookings happen today, then choose tools that fit your size and budget. Everything is set up in your name, documented and handed over with training. Messages only go to customers who have contacted you or agreed to hear from you, and WhatsApp''s messaging charges (if you use the API) are billed by the provider at cost.</p>',
 ARRAY['Enquiries sit unanswered on WhatsApp during busy hours','Bookings are tracked in a notebook or across several phones','Customers forget appointments and don''t show up','Taking deposits or payments means chasing people manually'],
 ARRAY['Faster, consistent replies to every enquiry','Customers can book themselves at any time','Automatic reminders that help reduce no-shows','Tools set up in your name, with training for your team'],
 ARRAY['WhatsApp Business profile, catalogue and quick replies','Booking link and counter QR code','Confirmation and reminder messages','Optional WhatsApp Business Platform (API) setup on your number','Payment link or deposit setup','Customer list and handover documentation'],
 '[{"title":"Review","description":"See how enquiries and bookings reach you today."},{"title":"Choose","description":"Pick tools that fit your size, budget and team."},{"title":"Set up","description":"Configure WhatsApp, booking, reminders and payments in your name."},{"title":"Train","description":"Hand over with a short guide and a walkthrough for your team."}]'::jsonb,
 'Discuss this service','/contact',NULL,10,true,'PUBLISHED',(NOW() AT TIME ZONE 'UTC'),
 'WhatsApp Business & Online Booking Setup',
 'WhatsApp Business, online booking, reminders and payment links set up for salons, clinics and service businesses in India.',
 (NOW() AT TIME ZONE 'UTC')),
('svc_reviews_followup','reviews-customer-follow-up','Reviews & Customer Follow-up','Search and Google Visibility',
 'Steady Google reviews, thoughtful replies and timely follow-ups that bring past customers back, all within Google''s and WhatsApp''s rules.',
 NULL,
 'Happy customers, said out loud. Past customers, back again.',
 'We build simple routines that ask every customer for a review, reply to what they say and remind them when they''re due to come back.',
 'media-phone-hand',
 '<p>Reviews are one of the first things people check on Google before choosing a local business, and repeat customers are usually the most valuable ones you have. Both need a routine, not occasional effort.</p>
<h2>Reviews, done properly</h2>
<ul><li><strong>Review requests</strong>: a short thank-you message with your Google review link after each visit, sent to every customer.</li><li><strong>Replies</strong>: polite, personal responses to new reviews, positive and negative, written in your voice.</li><li><strong>Low-rating alerts</strong>: you hear about a poor review straight away, so you can respond and fix the problem.</li><li><strong>Monthly summary</strong>: what customers are praising and what keeps coming up as a complaint.</li></ul>
<p>We follow Google''s review policies: we never offer rewards for reviews, never write reviews for you, and never filter out unhappy customers before asking.</p>
<h2>Bringing customers back</h2>
<ul><li><strong>Due-again reminders</strong>: a friendly nudge when a customer is due for their next visit or service.</li><li><strong>Win-back messages</strong>: a personal check-in for customers you haven''t seen in a while, sometimes with an offer.</li><li><strong>Occasions</strong>: birthday or anniversary messages where customers have shared the date.</li></ul>
<p>Messages only go to customers who have agreed to hear from you, and every message makes it easy to opt out.</p>',
 ARRAY['Happy customers rarely leave reviews unless asked','Reviews go unanswered for weeks','You don''t know which customers haven''t returned','Follow-ups depend on someone remembering'],
 ARRAY['A steady flow of genuine Google reviews','Every review answered promptly','Past customers reminded at the right time','Clear monthly view of customer feedback'],
 ARRAY['Review request messages and QR code','Review reply routine (or replies written for you)','Low-rating alerts','Due-again and win-back message flows','Monthly feedback summary'],
 '[{"title":"Audit","description":"Review your current ratings, replies and customer list."},{"title":"Set up","description":"Create request, reply and follow-up routines."},{"title":"Run","description":"Send, reply and follow up every week."},{"title":"Report","description":"Share a short monthly summary and adjust."}]'::jsonb,
 'Discuss this service','/contact',NULL,11,true,'PUBLISHED',(NOW() AT TIME ZONE 'UTC'),
 'Google Reviews & Customer Follow-up Service',
 'Google review requests, review replies and customer win-back follow-ups for local and service businesses in India, within Google''s policies.',
 (NOW() AT TIME ZONE 'UTC'));

INSERT INTO "Faq" ("id","question","answer","group","serviceId","status","order","updatedAt") VALUES
('faq_wab_1','Can we keep our current WhatsApp number?','Usually, yes. The WhatsApp Business app works on your existing number. Moving a number to the WhatsApp Business Platform (API) has a few requirements, which we check with you before starting.','service','svc_whatsapp_booking','PUBLISHED',0,(NOW() AT TIME ZONE 'UTC')),
('faq_wab_2','Do we need special software for bookings?','Not always. Many businesses do well with a simple booking tool plus WhatsApp reminders. We recommend the lightest setup that fits how you work.','service','svc_whatsapp_booking','PUBLISHED',1,(NOW() AT TIME ZONE 'UTC')),
('faq_wab_3','Are there ongoing costs besides your fee?','Possibly: booking tools may have a subscription, and WhatsApp Business Platform messages are charged by Meta through the provider. We explain these before you decide, and they are billed at cost.','service','svc_whatsapp_booking','PUBLISHED',2,(NOW() AT TIME ZONE 'UTC')),
('faq_rev_1','Will you write reviews for us?','No. Reviews must come from real customers. We help you ask every customer in a simple way and reply to what they write.','service','svc_reviews_followup','PUBLISHED',0,(NOW() AT TIME ZONE 'UTC')),
('faq_rev_2','Can you remove bad reviews?','We can''t remove genuine reviews. We can report reviews that break Google''s policies, and help you reply professionally, which future customers notice.','service','svc_reviews_followup','PUBLISHED',1,(NOW() AT TIME ZONE 'UTC'));

-- Related services (shown at the bottom of each service page)
INSERT INTO "ServiceRelation" ("fromId","toId")
SELECT f.id, t.id FROM "Service" f JOIN "Service" t ON (f.slug, t.slug) IN (
  ('whatsapp-booking-setup','reviews-customer-follow-up'),
  ('whatsapp-booking-setup','ai-automation'),
  ('whatsapp-booking-setup','website-development'),
  ('reviews-customer-follow-up','seo-google-presence'),
  ('reviews-customer-follow-up','whatsapp-booking-setup'),
  ('reviews-customer-follow-up','social-media-management'),
  ('ai-automation','whatsapp-booking-setup'),
  ('seo-google-presence','reviews-customer-follow-up'))
ON CONFLICT DO NOTHING;

-- ── Industry: Salons, Spas & Clinics ────────────────────────────────────────────────────
INSERT INTO "Industry" ("id","slug","title","shortTitle","intro","needs","body","heroMediaId","order","status","publishedAt","seoTitle","seoDescription","updatedAt") VALUES
('ind_salons_clinics','salons-spas-clinics','Salons, Spas & Clinics','Salons & clinics',
 'Google visibility, WhatsApp booking, reminders and reviews for appointment-based businesses.',
 ARRAY['Being found on Google Maps when people search nearby','Quick replies and easy booking on WhatsApp','Reminders that help reduce no-shows','Steady reviews and customers who come back'],
 '<p>Salons, spas, clinics and studios live on appointments. Most new customers find you on Google or Instagram, check your reviews and then send a WhatsApp message, and many return only if someone reminds them.</p>
<h2>What we focus on</h2>
<ul><li>Google Business Profile with services, prices, photos and booking links</li><li>WhatsApp Business setup with quick replies, a service catalogue and booking</li><li>Confirmations and reminders before every appointment</li><li>Review requests after each visit, and replies to every review</li><li>Due-again and win-back messages for regular services</li><li>A mobile-first website with services, prices, team and location</li><li>Photos and reels of your space, team and results (with client consent)</li></ul>
<p>For clinics and health services, we keep advertising and messaging within the rules that apply to your profession, and never make claims about treatment outcomes.</p>',
 'media-salon-modern',4,'PUBLISHED',(NOW() AT TIME ZONE 'UTC'),
 'Digital Marketing for Salons, Spas & Clinics',
 'Google Maps visibility, WhatsApp booking, reminders, reviews and websites for salons, spas, clinics and studios across India.',
 (NOW() AT TIME ZONE 'UTC'));

INSERT INTO "IndustryService" ("industryId","serviceId")
SELECT i.id, s.id FROM "Industry" i JOIN "Service" s ON (i.slug, s.slug) IN (
  ('salons-spas-clinics','seo-google-presence'),
  ('salons-spas-clinics','whatsapp-booking-setup'),
  ('salons-spas-clinics','reviews-customer-follow-up'),
  ('salons-spas-clinics','website-development'),
  ('salons-spas-clinics','social-media-management'),
  ('restaurants-hospitality','reviews-customer-follow-up'),
  ('restaurants-hospitality','whatsapp-booking-setup'),
  ('small-business','whatsapp-booking-setup'),
  ('small-business','reviews-customer-follow-up'))
ON CONFLICT DO NOTHING;

-- ── Existing services: customer journey (AI & Automation) and CRM deliverable (IT & Software) ──
UPDATE "Service"
   SET "body" = CASE
         WHEN position('<h2>Responsible by design</h2>' in "body") > 0
           THEN replace("body", '<h2>Responsible by design</h2>', '<h2>A connected customer journey</h2>
<p>For appointment-based businesses, the most useful automation follows the customer from first search to repeat visit:</p>
<ol><li><strong>Found</strong>: on Google, Maps or your website</li><li><strong>Chat</strong>: quick, consistent replies on WhatsApp</li><li><strong>Book</strong>: a booking link that shows real availability</li><li><strong>Remind</strong>: confirmations and reminders before the visit</li><li><strong>Review</strong>: a thank-you and a review request afterwards</li><li><strong>Return</strong>: a timely nudge when they''re due again</li></ol>
<p>See <a href="/services/whatsapp-booking-setup">WhatsApp &amp; Booking Setup</a> and <a href="/services/reviews-customer-follow-up">Reviews &amp; Customer Follow-up</a>.</p>
<h2>Responsible by design</h2>')
         ELSE "body" END,
       "updatedAt" = (NOW() AT TIME ZONE 'UTC')
 WHERE "slug" = 'ai-automation' AND position('A connected customer journey' in "body") = 0;

UPDATE "Service"
   SET "deliverables" = array_append("deliverables", 'Simple CRM and customer dashboard setup'),
       "updatedAt" = (NOW() AT TIME ZONE 'UTC')
 WHERE "slug" = 'it-support-software' AND NOT ('Simple CRM and customer dashboard setup' = ANY("deliverables"));

-- ── Pricing page: "Add to any plan" (right after the plan cards) ─────────────────────────
UPDATE "PageSection" SET "order" = "order" + 1
 WHERE "pageId" = (SELECT "id" FROM "Page" WHERE "slug" = 'pricing') AND "order" >= 1;

INSERT INTO "PageSection" ("id","pageId","type","key","order","visible","data","updatedAt")
SELECT 'sec_pricing_addons', p."id", 'why', 'pricing-addons', 1, true,
 '{
   "eyebrow": "Add-ons",
   "heading": "Add to any plan",
   "description": "Optional extras, mainly for appointment-based businesses. Each is quoted after a short call, based on your setup.",
   "points": [
     {"title": "Booking & reminders setup", "text": "Booking link, counter QR code, WhatsApp confirmations and reminders. Price on request."},
     {"title": "Review program", "text": "Review requests after every visit, replies to every review and low-rating alerts. Price on request."},
     {"title": "Customer win-back campaigns", "text": "Due-again reminders and personal check-ins for customers you haven''t seen in a while. Price on request."},
     {"title": "WhatsApp Business Platform (API) setup", "text": "Your verified number, approved message templates and connection to your tools. Price on request; Meta''s messaging charges billed at cost."},
     {"title": "Customer data migration", "text": "Move customer lists and booking history from spreadsheets or old tools. Price on request."}
   ]
 }'::jsonb,
 (NOW() AT TIME ZONE 'UTC')
FROM "Page" p WHERE p."slug" = 'pricing';

-- ── Insights article ────────────────────────────────────────────────────────────────────
INSERT INTO "Article" ("id","slug","title","excerpt","body","coverId","authorName","categoryId","readingMinutes","status","publishedAt","seoDescription","updatedAt")
SELECT 'art_no_show_reminders','cut-no-shows-whatsapp-reminders',
 'How service businesses can cut no-shows with WhatsApp reminders',
 'No-shows cost salons, clinics and studios time they can''t sell again. A simple reminder routine on WhatsApp is one of the easiest fixes.',
 '<p>Every missed appointment is an empty slot you can''t sell again. Most no-shows aren''t rude; people simply forget, double-book or can''t find an easy way to reschedule. A clear reminder routine handles most of that.</p>
<h2>1. Confirm straight away</h2>
<p>Send a short confirmation as soon as the booking is made: service, date, time, address and who they''re seeing. It reassures the customer and catches mistakes early.</p>
<h2>2. Remind twice, not ten times</h2>
<p>A reminder the day before and another a few hours before works well for most businesses. More than that starts to feel like spam.</p>
<h2>3. Make rescheduling easy</h2>
<p>Every reminder should include a simple way to reschedule or cancel. A cancelled slot can be filled; a silent no-show can''t.</p>
<h2>4. Keep messages short and personal</h2>
<p>Use the customer''s name and the details that matter. Avoid long paragraphs, too many emojis and anything that looks like an advert.</p>
<h2>5. Message only people who expect it</h2>
<p>Send reminders to customers who booked with you or agreed to hear from you. If you use the WhatsApp Business Platform (API), reminder templates must be approved first, and there are per-message charges.</p>
<h2>6. Consider deposits for repeat no-shows</h2>
<p>For long or high-value appointments, a small advance payment through a payment link can protect your time. Keep the policy clear and fair, and mention it at booking.</p>
<h2>7. Track it</h2>
<p>Note no-shows for a month before and after you start. You''ll see what''s working, and which services or time slots need a different approach.</p>
<p>If you''d like this set up for you, see <a href="/services/whatsapp-booking-setup">WhatsApp &amp; Booking Setup</a>.</p>',
 'media-planner-coffee','Studio team',c."id",5,'PUBLISHED',(NOW() AT TIME ZONE 'UTC'),
 'Practical tips for salons, clinics and studios to reduce no-shows with WhatsApp confirmations, reminders and easy rescheduling.',
 (NOW() AT TIME ZONE 'UTC')
FROM (SELECT (SELECT "id" FROM "ArticleCategory" WHERE "slug" = 'ai-automation') AS "id") c;

INSERT INTO "ArticleTag" ("articleId","tagId")
SELECT 'art_no_show_reminders', t."id" FROM "Tag" t WHERE t."slug" IN ('automation','small-business')
ON CONFLICT DO NOTHING;
