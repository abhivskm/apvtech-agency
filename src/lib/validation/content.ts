import { z } from "zod";
import { isHttpUrl, isSafeHref } from "@/lib/url-safety";
import { SLUG_RE } from "@/lib/slug";

/* Shared building blocks */
export const str = (max = 300) => z.string().trim().max(max);
export const optStr = (max = 300) =>
  z.string().trim().max(max).optional().nullable().transform((v) => (v ? v : null));
export const reqStr = (label: string, max = 300) => z.string().trim().min(1, `${label} is required`).max(max);
export const slug = z.string().trim().toLowerCase().min(1, "Slug is required").max(80).regex(SLUG_RE, "Use lowercase letters, numbers and hyphens only");
export const status = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);
export const mediaId = z.string().max(40).optional().nullable().transform((v) => v || null);
export const href = z.string().trim().max(500).refine((v) => isSafeHref(v), "Use a site path (/contact), https:// URL, mailto: or tel:");
export const optHref = z
  .string().trim().max(500).optional().nullable()
  .transform((v) => v || null)
  .refine((v) => v === null || isSafeHref(v), "Use a site path (/contact), https:// URL, mailto: or tel:");
export const optUrl = z
  .string().trim().max(500).optional().nullable()
  .transform((v) => v || null)
  .refine((v) => v === null || isHttpUrl(v), "Enter a full URL starting with https://");
export const stringList = (maxItems = 30, maxLen = 300) =>
  z.array(z.string().trim().max(maxLen)).max(maxItems).transform((a) => a.filter(Boolean));
export const idList = z.array(z.string().max(40)).max(100).default([]);

export const seoFields = {
  seoTitle: optStr(70),
  seoDescription: optStr(170),
  canonicalUrl: optUrl,
  noindex: z.boolean().default(false),
};

export const serviceSchema = z.object({
  title: reqStr("Title", 120),
  slug,
  category: str(80).default(""),
  shortDescription: reqStr("Short description", 400),
  featuredLabel: optStr(40),
  heroHeadline: reqStr("Hero headline", 200),
  heroText: str(600).default(""),
  heroMediaId: mediaId,
  body: str(100_000).default(""),
  problems: stringList(),
  benefits: stringList(),
  deliverables: stringList(),
  process: z.array(z.object({ title: reqStr("Step title", 80), description: str(500).default("") })).max(10).default([]),
  ctaLabel: optStr(60),
  ctaHref: optHref,
  whatsappMessage: optStr(300),
  showOnHome: z.boolean().default(true),
  status,
  relatedIds: idList,
  ogImageId: mediaId,
  ...seoFields,
});
export type ServiceInput = z.input<typeof serviceSchema>;

export const projectSchema = z.object({
  title: reqStr("Title", 120),
  slug,
  client: optStr(120),
  isConcept: z.boolean().default(true),
  year: z.preprocess((v) => (v === "" || v == null ? null : v), z.coerce.number().int().min(2000, "Enter a year from 2000").max(2100).nullable()),
  summary: reqStr("Summary", 400),
  description: str(100_000).default(""),
  challenge: str(4000).default(""),
  solution: str(4000).default(""),
  outcome: str(4000).default(""),
  coverId: mediaId,
  videoUrl: optUrl,
  industryId: mediaId,
  featured: z.boolean().default(false),
  status,
  galleryIds: idList,
  serviceIds: idList,
  categoryIds: idList,
  metrics: z
    .array(z.object({ label: reqStr("Metric label", 80), value: reqStr("Metric value", 30), note: optStr(200), verified: z.boolean().default(false) }))
    .max(8)
    .default([]),
  ogImageId: mediaId,
  ...seoFields,
});
export type ProjectInput = z.input<typeof projectSchema>;

export const industrySchema = z.object({
  title: reqStr("Title", 120),
  shortTitle: str(60).default(""),
  slug,
  intro: reqStr("Intro", 600),
  needs: stringList(12),
  body: str(100_000).default(""),
  heroMediaId: mediaId,
  status,
  serviceIds: idList,
  ...seoFields,
});
export type IndustryInput = z.input<typeof industrySchema>;

export const articleSchema = z.object({
  title: reqStr("Title", 160),
  slug,
  excerpt: reqStr("Excerpt", 400),
  body: str(200_000).default(""),
  coverId: mediaId,
  authorName: str(80).default(""),
  authorRole: optStr(80),
  categoryId: mediaId,
  tags: stringList(12, 40),
  readingMinutes: z.coerce.number().int().min(1).max(120).default(5),
  status,
  publishedAt: z
    .string().optional().nullable()
    .transform((v) => (v ? new Date(v) : null))
    .refine((d) => d === null || !Number.isNaN(d.getTime()), "Invalid date"),
  ogImageId: mediaId,
  ...seoFields,
});
export type ArticleInput = z.input<typeof articleSchema>;

const rupees = z.preprocess(
  (v) => (v === "" || v == null ? null : typeof v === "string" ? v.replace(/[₹,\s]/g, "") : v),
  z.coerce.number({ error: "Enter a number, e.g. 24999" }).int("Whole rupees only").min(0).max(100_000_000).nullable(),
);

export const planSchema = z.object({
  name: reqStr("Plan name", 60),
  slug,
  tagline: str(120).default(""),
  bestFor: str(300).default(""),
  description: str(600).default(""),
  setupPrice: rupees,
  monthlyPrice: rupees,
  pricePrefix: str(40).default("Starting from"),
  includesLabel: optStr(80),
  features: stringList(25, 200),
  notes: stringList(8, 200),
  highlighted: z.boolean().default(false),
  badge: optStr(30),
  ctaLabel: reqStr("Button text", 40),
  status,
});
export type PlanInput = z.input<typeof planSchema>;

export const pageMetaSchema = z.object({
  title: reqStr("Title", 120),
  slug,
  status,
  publishedAt: z
    .string().optional().nullable()
    .transform((v) => (v ? new Date(v) : null))
    .refine((d) => d === null || !Number.isNaN(d.getTime()), "Invalid date"),
  ogImageId: mediaId,
  ...seoFields,
});

export const testimonialSchema = z.object({
  name: reqStr("Name", 100),
  role: optStr(100),
  company: optStr(100),
  quote: reqStr("Quote", 1200),
  photoId: mediaId,
  status,
});

export const faqSchema = z.object({
  question: reqStr("Question", 300),
  answer: reqStr("Answer", 3000),
  group: str(60).default("general").transform((v) => v || "general"),
  serviceId: mediaId,
  status,
});

export const navItemSchema = z.object({
  id: z.string().max(40).optional(),
  label: reqStr("Label", 60),
  href,
  visible: z.boolean().default(true),
  newTab: z.boolean().default(false),
  children: z
    .array(z.object({ id: z.string().max(40).optional(), label: reqStr("Label", 60), href, visible: z.boolean().default(true), newTab: z.boolean().default(false) }))
    .max(20)
    .default([]),
});
export const navSaveSchema = z.object({
  location: z.enum(["HEADER", "FOOTER_SERVICES", "FOOTER_INDUSTRIES", "FOOTER_COMPANY", "FOOTER_LEGAL"]),
  items: z.array(navItemSchema).max(30),
});

export const SOCIAL_PLATFORMS = ["instagram", "facebook", "linkedin", "youtube", "pinterest", "x", "threads", "behance", "dribbble", "whatsapp-channel", "other"] as const;
export const socialSaveSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().max(40).optional(),
        platform: z.enum(SOCIAL_PLATFORMS),
        label: reqStr("Label", 60),
        url: z.string().trim().refine(isHttpUrl, "Enter a full https:// profile URL"),
        visible: z.boolean().default(true),
      }),
    )
    .max(20),
});

export const redirectSchema = z.object({
  fromPath: z.string().trim().min(2, "Enter a path such as /old-page").max(300).refine((v) => v.startsWith("/") && !v.startsWith("//") && !v.startsWith("/admin") && !v.startsWith("/api"), "Must start with / and cannot target /admin or /api"),
  toPath: href,
  permanent: z.boolean().default(true),
});

const hexColor = z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, "Use a 6-digit hex colour such as #C8F169");
export const brandingSchema = z.object({
  brandName: reqStr("Brand name", 60),
  brandShortName: optStr(20),
  tagline: reqStr("Tagline", 120),
  supportingMessage: str(400).default(""),
  logoId: mediaId,
  faviconId: mediaId,
  colors: z.object({
    background: hexColor,
    surface: hexColor,
    elevated: hexColor,
    text: hexColor,
    muted: hexColor,
    accent: hexColor,
  }),
});

const optEmail = z.string().trim().max(200).optional().nullable().transform((v) => v || null).refine((v) => v === null || z.email().safeParse(v).success, "Enter a valid email address");

export const contactSchema = z.object({
  contactEmail: optEmail,
  phone: optStr(30),
  whatsappNumber: optStr(30),
  whatsappMessage: reqStr("Default WhatsApp message", 300),
  address: optStr(200),
  city: optStr(80),
  region: optStr(80),
  postalCode: optStr(12),
  serviceAreas: str(400).default(""),
  businessHours: optStr(200),
  googleBusinessUrl: optUrl,
});

export const seoSettingsSchema = z.object({
  defaultSeoTitle: reqStr("Default SEO title", 70),
  defaultSeoDescription: reqStr("Default meta description", 170),
  titleTemplate: z.string().trim().max(80).refine((v) => v.includes("%s"), "Template must contain %s"),
  ogImageId: mediaId,
  gscVerification: optStr(100).refine((v) => v === null || /^[A-Za-z0-9_-]+$/.test(v), "Paste only the content value of the verification meta tag"),
});

export const globalSettingsSchema = z.object({
  siteUrl: optUrl,
  notificationEmail: optEmail,
  defaultCtaLabel: reqStr("Default CTA label", 40),
  defaultCtaHref: href,
  footerText: str(500).default(""),
  copyrightText: str(200).default(""),
  gaMeasurementId: optStr(20).refine((v) => v === null || /^G-[A-Z0-9]{4,12}$/.test(v), "GA4 IDs look like G-XXXXXXXXXX"),
  gtmContainerId: optStr(20).refine((v) => v === null || /^GTM-[A-Z0-9]{4,10}$/.test(v), "GTM IDs look like GTM-XXXXXXX"),
  consentEnabled: z.boolean().default(false),
  consentMessage: str(300).default(""),
  enquiryRetentionDays: z.coerce.number().int().min(30).max(3650),
});

export const userCreateSchema = z.object({
  name: reqStr("Name", 80),
  email: z.email("Enter a valid email").trim().toLowerCase().max(200),
  role: z.enum(["SUPER_ADMIN", "EDITOR", "MARKETING"]),
  password: z.string().min(1, "Password is required").max(200),
});
export const userUpdateSchema = z.object({
  name: reqStr("Name", 80),
  role: z.enum(["SUPER_ADMIN", "EDITOR", "MARKETING"]),
  active: z.boolean(),
});
