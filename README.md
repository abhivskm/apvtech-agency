# Agency website + CMS

A digital-agency website with a database-backed CMS and admin panel. Built with Next.js 15 (App Router), TypeScript, Tailwind CSS 4, PostgreSQL and Prisma.

The brand is currently the temporary working name **FORM & SIGNAL**. The name, tagline, logo, colours, contact details and social links are all stored in the database. Change them in **Admin → Branding & Theme / Contact Information**. Nothing is hard-coded across the codebase.

---

## Contents

1. [What's included](#whats-included)
2. [Architecture](#architecture)
3. [Local development](#local-development)
4. [Creating the first administrator](#creating-the-first-administrator)
5. [Managing content](#managing-content)
6. [Configuration reference](#configuration-reference)
7. [Deploying (Vercel + Neon + Cloudflare R2 + Resend)](#deploying-vercel--neon--cloudflare-r2--resend)
8. [Alternative: single server with Docker](#alternative-single-server-with-docker)
9. [Media storage](#media-storage)
10. [Email notifications](#email-notifications)
11. [Analytics, Search Console and consent](#analytics-search-console-and-consent)
12. [Backups](#backups)
13. [Testing](#testing)
14. [Security notes](#security-notes)
15. [Troubleshooting](#troubleshooting)

---

## What's included

**Public site.** `/`, `/services` plus 10 service pages, `/work` plus project pages (with category filters), `/industries` plus 4 industry pages, `/about`, `/insights` plus articles (with pagination and categories), `/contact`, `/privacy-policy` and `/terms-and-conditions`. Custom CMS pages live at `/[slug]`, and there's a branded 404 page.
Every page has metadata, a canonical URL, Open Graph tags and JSON-LD (Organization/WebSite, Service, Article, BreadcrumbList). LocalBusiness data is added only when you enter a real address. The site also has `sitemap.xml`, `robots.txt`, managed redirects, a WhatsApp click-to-chat button and links, the enquiry form, and analytics with optional consent.

**Admin (`/admin`).** Dashboard (live counts), Homepage sections, Pages (structured section builder), Navigation, Services, Projects, Industries, Insights (rich-text editor with scheduling), Testimonials, FAQs, Media library, Enquiries (status, notes, assignment, CSV export, anonymise/delete, retention), Contact information, Social media, SEO & redirects, Branding & theme, Global settings (with an integration checklist), Users & permissions, Activity log and My account.

**Roles.** Super Admin (everything), Editor (pages and content, no leads or settings), Marketing Manager (articles, testimonials, FAQs, media, homepage, social/SEO/contact, leads). The full matrix lives in [`src/lib/auth/permissions.ts`](src/lib/auth/permissions.ts) and is shown in Admin → Users. Every page, server action and API route checks permissions on the server.

## Architecture

```
prisma/                 schema.prisma, migrations/, seed.ts (+ seed-data/)
scripts/                create-admin.ts, dev-db.mjs (Postgres without Docker), screenshot.mjs + vitals.mjs (dev QA: screenshots/overflow, lab LCP/CLS)
src/app/(site)/         public routes (server components, ISR + tag revalidation)
src/app/admin/          login + (panel)/ admin screens and their server actions
src/app/api/            admin media upload/replace, CSV export, preview, cron (email retries)
src/components/site/    public design system: header, footer, hero, section renderer…
src/components/admin/   admin design system: forms, media picker, rich text, sortable lists
src/lib/                db, auth (sessions, RBAC), validation (zod), content queries/cache,
                        storage adapters (local / S3-R2), email outbox, SEO, WhatsApp, sanitising
tests/unit, tests/integration (Vitest), tests/e2e (Playwright)
```

Key decisions:

- **Auth** is built in, not a third-party service. Passwords are hashed with argon2id. Sessions are random 256-bit tokens, stored only as SHA-256 hashes, in httpOnly SameSite=Lax cookies that expire after 7 days of inactivity. They can be revoked, and are revoked automatically on password or role change. Sign-in is throttled per email and per IP. Server Actions have Next.js's built-in Origin check; API routes check Origin explicitly.
- **Content** lives in relational tables. Page sections are typed JSON validated by a section registry ([`src/lib/validation/sections.ts`](src/lib/validation/sections.ts)), and the same registry generates the admin forms. Rich text is sanitised when saved and again when rendered.
- **Publishing.** Public queries only return `PUBLISHED` items whose publish date has passed. Every admin change invalidates the cache, so the live site updates within seconds, with no redeploy. Scheduled items appear within about 5 minutes of their publish time.
- **Previews.** Drafts can be previewed only by signed-in editors, via draft mode plus a session check.
- **Leads.** Each enquiry is saved before any email is attempted. Notifications go through an outbox with retries and visible status.

## Local development

Requirements: Node 20 or later (22 LTS recommended) and PostgreSQL 16.

```bash
npm install
cp .env.example .env          # then set APP_SECRET (see the comment in the file)
```

Start PostgreSQL using **one** of these:

```bash
npm run db:up         # Docker Desktop (docker-compose.yml, port 5433)
npm run db:embedded   # no Docker: downloads and runs real Postgres binaries as your user (port 5433)
```

> On Windows, Docker Desktop needs WSL 2 (`wsl --install`, then reboot). Until that's set up, `npm run db:embedded` works without admin rights. It keeps data in `~/.agency-platform/pgdata` (override with `PG_DATA_DIR`) and creates UTF-8 databases `agency` and `agency_test`.

Then:

```bash
npx prisma migrate dev     # apply migrations
npm run seed               # starter content (safe to re-run: only creates what's missing)
npm run create-admin       # create your Super Admin (see below)
npm run dev                # http://localhost:3000  ·  admin at /admin
```

`SEED_FORCE=true npm run seed` resets the seeded records to their original content. It is development only and refused when `NODE_ENV=production`.

### What the seed creates

- Site settings with the temporary brand. All contact fields are left **empty** on purpose, so no fictional phone, email or address is ever published.
- 10 services, 4 industries, 8 original articles, general FAQs, the homepage and other core pages, and the header and footer navigation.
- 6 **concept projects**. They are clearly labelled as self-initiated work, with no client names and no results.
- About 40 temporary Unsplash photos (Unsplash License), registered in the media library so you can replace each one.
- **No** users, testimonials, statistics or social profiles. Add real ones as you get them.

## Creating the first administrator

There is no default account. From a terminal with access to the database:

```bash
npm run create-admin
# prompts for email, name and password (hidden, minimum 12 characters), then creates a Super Admin
```

To run it non-interactively (for example once, on first deploy):

```bash
ADMIN_EMAIL=you@yourdomain.in ADMIN_NAME="Your Name" ADMIN_PASSWORD='…' npm run create-admin
```

**Production, from your computer:** `npm run create-admin:prod` asks you to paste the production connection string (hidden input) and shows the target database before creating anything.

**Production, from the browser (one-time setup):** add a `SETUP_TOKEN` environment variable (a random string of at least 24 characters) in your host and redeploy. While the database has **no users at all**, `/admin/login` then shows a "First-time setup" form that requires that code. It creates the first Super Admin and signs you in. Once any admin exists, the form and its server action are permanently disabled. Remove `SETUP_TOKEN` afterwards.

Forgot the password? Run `npm run create-admin -- --reset-password` with the same email. Super Admins can add more users in **Admin → Users & Permissions**, and everyone can change their own password in **My account**.

## Managing content

| Task | Where |
| --- | --- |
| Change the brand name, logo, favicon or colours | Branding & Theme |
| Add a phone number, email, address or **WhatsApp number** | Contact Information |
| Edit, reorder or hide homepage sections | Homepage Sections |
| Build a landing page | Pages → New page → add sections → Publish |
| Header and footer menus | Navigation |
| Add or edit services, projects or industries | Services / Portfolio / Industries |
| Write, schedule or publish an article | Blog / Insights (set a future date to schedule) |
| Replace a stock photo everywhere it's used | Media Library → select → Replace file |
| Rename a URL without breaking links | change the slug, then add a redirect in SEO & Redirects |
| Handle leads | Enquiries (status, notes, assign, export CSV) |
| Add a teammate | Users & Permissions |

Draft content is never public. Use **Preview** to see a draft on the real site design. **Archive** hides content without deleting it, and **Restore** brings it back as a draft.

Projects: tick **Concept project** for self-initiated work. Public metrics are shown only when you tick **Verified**.

## Configuration reference

All secrets live in environment variables. See [`.env.example`](.env.example). Business settings live in the database and are edited in the admin.

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | Postgres connection (on Neon, use the **pooled** URL) |
| `DIRECT_DATABASE_URL` | yes | Non-pooled URL, used by migrations |
| `APP_SECRET` | yes | 32+ random characters, used to hash IPs |
| `NEXT_PUBLIC_SITE_URL` | yes | e.g. `https://www.yourdomain.in` (canonical URLs, sitemap) |
| `STORAGE_DRIVER` | yes | `local` (dev or single server) or `s3` (R2/S3) |
| `S3_*` | if `s3` | Bucket, credentials, endpoint and public URL |
| `MAX_UPLOAD_MB`, `MAX_VIDEO_UPLOAD_MB` | no | Upload limits (defaults 10 and 50) |
| `RESEND_API_KEY`, `EMAIL_FROM` | for email | Enquiry notifications |
| `CRON_SECRET` | recommended | Protects `/api/cron/outbox` (email retries) |

## Deploying (Vercel + Neon + Cloudflare R2 + Resend)

1. **Database (Neon).** Create a project in an India-adjacent region such as `aws-ap-south-1` (Mumbai). Copy the **pooled** connection string into `DATABASE_URL` and the **direct** one into `DIRECT_DATABASE_URL`.
2. **Media (Cloudflare R2).** Create a bucket. Enable public access through a custom domain (for example `media.yourdomain.in`) or the r2.dev URL. Create an API token with *Object Read & Write* on **that bucket only**. Then set:
   `STORAGE_DRIVER=s3`, `S3_ENDPOINT=https://<accountid>.r2.cloudflarestorage.com`, `S3_REGION=auto`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_BASE_URL`.
3. **Email (Resend).** Verify your sending domain, create an API key, and set `RESEND_API_KEY` and `EMAIL_FROM="Website <hello@yourdomain.in>"`.
4. **Vercel.** Import the repository and add all of the variables above (Production and Preview), plus `APP_SECRET`, `CRON_SECRET` and `NEXT_PUBLIC_SITE_URL`. [`vercel.json`](vercel.json) runs `prisma migrate deploy` before each build and schedules the email-retry cron every 15 minutes. Cron frequency depends on your Vercel plan; on Hobby, change it to daily.
5. **First deploy.** Once it's live, run locally against the production database (or from Vercel's shell):
   `DATABASE_URL=… npm run seed` (only if you want the starter content), then `DATABASE_URL=… npm run create-admin`.
6. **Domain.** Add your domain in Vercel, then set **Admin → Global Settings → Public site URL**.
7. **Search Console.** Add the property, paste the verification code in **SEO & Redirects**, and submit `/sitemap.xml`.

> **Upload size on Vercel.** Serverless functions accept request bodies up to about 4.5 MB, so uploads larger than that fail on Vercel even if `MAX_UPLOAD_MB` is higher. Compress images before uploading, and for video use YouTube/Vimeo links (Media Library → Add video link) or the Docker deployment. Direct-to-bucket uploads can be added later if large uploads become important.

## Alternative: single server with Docker

```bash
cp .env.example .env.production   # fill in values; also set POSTGRES_USER/PASSWORD/DB for the bundled database
docker compose -f docker-compose.prod.yml up -d --build
```

Put Caddy or Nginx in front for HTTPS. With `STORAGE_DRIVER=local`, uploads persist in the `uploads` volume.

The image contains production dependencies only. Run `npm run seed` and `npm run create-admin` from a checkout of the repository with `DATABASE_URL` pointing at the server's database (for example through an SSH tunnel to port 5432).

## Media storage

- `local` writes to `./storage/uploads` and serves files through `/uploads/...`. Only files registered in the media library are served, always with their recorded MIME type. Use it for development and single-server hosting. **It is not persistent on Vercel.**
- `s3` works with any S3-compatible store (Cloudflare R2, AWS S3, Backblaze B2, MinIO). Give the token permissions on a single bucket only.
- Uploads are checked by sniffing the file's real bytes, not its extension. Accepted types: JPG, PNG, WebP, AVIF, GIF, ICO, MP4 and WebM. SVG is deliberately rejected because it can contain scripts. Size limits are enforced, image dimensions are recorded, and filenames are randomised.
- "Replace file" keeps the media ID, so every page that uses the file updates. Deleting is blocked while a file is still in use.

## Email notifications

When an enquiry arrives it is **saved first**, then a notification is queued in `EmailOutbox` and sent once straight away. If sending fails, it is retried by `/api/cron/outbox` (every 15 minutes on Vercel) or from **Enquiries → Retry**. If email isn't configured, notifications are marked "not configured" (never "sent"), and **Global Settings** shows what is missing. Use **Send test email** there to check the setup.

## Analytics, Search Console and consent

Add a GA4 ID (`G-…`) and/or GTM ID (`GTM-…`) in **Global Settings**. Nothing loads until an ID is set. If you turn on the consent option, analytics loads only after the visitor clicks *Accept*. The Search Console verification code and Google Business Profile URL are set in **SEO & Redirects** and **Contact Information**.

## Backups

- **Neon:** point-in-time restore is included. Also take a regular logical backup:
  `pg_dump "$DIRECT_DATABASE_URL" -Fc -f backup-$(date +%F).dump`
  Restore with `pg_restore --clean --no-owner -d "$DIRECT_DATABASE_URL" backup.dump`.
- **Docker:** `docker compose -f docker-compose.prod.yml exec db pg_dump -U $POSTGRES_USER -Fc $POSTGRES_DB > backup.dump`, plus a copy of the `uploads` volume.
- **R2/S3:** turn on bucket versioning or sync to a second bucket on a schedule.
- Test a restore at least once before launch.

## Testing

```bash
npm run typecheck     # TypeScript (strict)
npm run lint          # ESLint
npm test              # Vitest: unit + integration (uses the agency_test database, migrated automatically)
npm run test:e2e      # Playwright, against a running app with seeded data and an admin account:
                      # E2E_ADMIN_EMAIL=… E2E_ADMIN_PASSWORD=… BASE_URL=http://localhost:3000 npm run test:e2e
npm run build         # production build
```

Integration tests refuse to run against a database whose URL doesn't contain "test". The end-to-end suite creates and then removes its own temporary service, media file and editor account. It leaves behind one test enquiry named "E2E Visitor…", which you can delete from the admin.

## Security notes

- Admin pages, server actions and API routes each enforce authentication **and** role permissions on the server. Middleware only performs a fast redirect.
- Security headers include CSP, `frame-ancestors 'none'`, nosniff, Referrer-Policy, Permissions-Policy, HSTS in production, and `noindex` plus `no-store` on admin routes.
- All input is validated with zod on the server. Links accept only site paths, `https:`, `mailto:` and `tel:`. Rich text and JSON-LD are escaped or sanitised. CSV exports neutralise spreadsheet formulas.
- IP addresses are stored only as keyed hashes. The activity log never stores passwords or tokens. Enquiries can be anonymised or deleted, and a retention policy is available.
- Never commit `.env*` files; they are already in `.gitignore`.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| "Site not initialised" | Run `npx prisma migrate deploy` and `npm run seed` against the same `DATABASE_URL` |
| Can't reach the database on Windows | Docker needs WSL 2. Use `npm run db:embedded` instead |
| `character … has no equivalent in encoding "WIN1252"` | The database was created with a non-UTF-8 encoding. Recreate it as UTF-8 (`db:embedded` now forces this) |
| Admin changes don't show on the site | Make sure the item is **Published** and its publish date isn't in the future. Hard-refresh the page |
| Uploads fail on Vercel | Set `STORAGE_DRIVER=s3` with R2 credentials, and keep files under about 4.5 MB |
| Enquiry emails not arriving | Global Settings shows what's missing. Check that the Resend domain is verified, then use "Send test email" |
| WhatsApp button missing | Add a valid number in Contact Information |
| Locked out after failed sign-ins | Wait 15 minutes, or run `npm run create-admin -- --reset-password` |
