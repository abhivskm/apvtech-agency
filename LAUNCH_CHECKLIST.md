# Launch checklist

Work through this before telling anyone about the site. Everything except the hosting accounts is done in the admin panel, with no code changes.

## Brand and business details (Admin)

- [ ] **Final brand name**, short name and tagline (Branding & Theme). "FORM & SIGNAL" is a temporary working name.
- [ ] Logo (transparent PNG/WebP) and favicon (Branding & Theme)
- [ ] Brand colours, if they change (Branding & Theme). Keep text contrast at or above 4.5:1.
- [ ] Public email and phone number (Contact Information)
- [ ] **WhatsApp business number** (Contact Information). Click the generated link to test it.
- [ ] Address, city and PIN code, **only if you want them public** (enables local-business structured data)
- [ ] Service areas and business hours
- [ ] Google Business Profile URL
- [ ] Social profile URLs (Social Media). Real accounts only.
- [ ] Default social sharing image, 1200 × 630 (SEO & Redirects)
- [ ] Footer text and copyright line (Global Settings)

## Content

- [ ] Replace the temporary Unsplash photos with your own work (Media Library → Replace file)
- [ ] Review all 10 service pages and adjust them to how you actually work and price
- [ ] Replace or unpublish the concept projects once you have real case studies (with client permission)
- [ ] Add genuine testimonials, with permission, or leave the section hidden
- [ ] Review the About page copy
- [ ] **Have the Privacy Policy and Terms reviewed by a legal professional**, including DPDP Act 2023 obligations
- [ ] Set an author name on the articles, or edit them

## Accounts and integrations (environment variables)

- [ ] Domain purchased and DNS set up
- [ ] Neon database (`DATABASE_URL`, `DIRECT_DATABASE_URL`)
- [ ] Cloudflare R2 bucket, public URL and scoped API token (`STORAGE_DRIVER=s3`, `S3_*`)
- [ ] Resend account with a verified domain (`RESEND_API_KEY`, `EMAIL_FROM`), and the notification email set in Global Settings. Send a test email.
- [ ] `APP_SECRET` and `CRON_SECRET` generated (random, 32+ characters)
- [ ] `NEXT_PUBLIC_SITE_URL` set to the real domain, and Global Settings → Public site URL
- [ ] First Super Admin created with `npm run create-admin`, and any development accounts removed
- [ ] Optional: GA4 / GTM IDs, with consent enabled if you use analytics cookies
- [ ] Google Search Console verified and the sitemap submitted

## Final checks

- [ ] Global Settings → integration checklist shows green, or each amber item is understood
- [ ] Submit a test enquiry, check it appears in Enquiries and the email arrives, then delete it
- [ ] Check the site on a real phone (iOS and Android): navigation, contact form, WhatsApp button
- [ ] Test a backup restore (see README → Backups)
- [ ] Run `npm run typecheck && npm run lint && npm test && npm run build`
