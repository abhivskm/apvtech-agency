import { z } from "zod";
import { isSafeHref } from "@/lib/url-safety";

/**
 * Structured page-section registry. Each section type declares its editable fields once;
 * the admin builder renders forms from these specs and the server validates with the derived zod schema.
 * No arbitrary code or HTML-without-sanitising is ever accepted.
 */

export type FieldSpec =
  | { name: string; label: string; kind: "text"; help?: string; required?: boolean; max?: number }
  | { name: string; label: string; kind: "textarea"; help?: string; required?: boolean; max?: number }
  | { name: string; label: string; kind: "richtext"; help?: string }
  | { name: string; label: string; kind: "link"; help?: string; required?: boolean }
  | { name: string; label: string; kind: "media"; help?: string }
  | { name: string; label: string; kind: "mediaList"; help?: string; max?: number }
  | { name: string; label: string; kind: "boolean"; help?: string }
  | { name: string; label: string; kind: "number"; help?: string; min?: number; max?: number }
  | { name: string; label: string; kind: "select"; help?: string; options: { value: string; label: string }[] }
  | { name: string; label: string; kind: "list"; help?: string; max?: number; fields: FieldSpec[] };

export type SectionDef = {
  label: string;
  description: string;
  fields: FieldSpec[];
  defaults: Record<string, unknown>;
};

const cta = (name: string, label: string, required = false): FieldSpec => ({ name, label, kind: "link", required });

export const SECTION_TYPES = {
  hero: {
    label: "Hero",
    description: "Large opening statement with optional call-to-action buttons and imagery.",
    fields: [
      { name: "variant", label: "Layout", kind: "select", options: [{ value: "signature", label: "Signature collage (homepage)" }, { value: "simple", label: "Simple editorial" }] },
      { name: "eyebrow", label: "Eyebrow", kind: "text", max: 80 },
      { name: "headline", label: "Headline", kind: "textarea", required: true, max: 160, help: "Use line breaks to control how the headline wraps on large screens." },
      { name: "subheadline", label: "Supporting headline", kind: "text", max: 200 },
      { name: "description", label: "Description", kind: "textarea", max: 500 },
      cta("primaryCta", "Primary button"),
      cta("secondaryCta", "Secondary button"),
      { name: "media", label: "Images", kind: "mediaList", max: 6, help: "Signature layout uses up to 5 images in a layered composition." },
      { name: "mediaLabels", label: "Image labels", kind: "text", max: 200, help: "Comma-separated, one per image (signature layout), e.g. Websites, Product, Branding" },
    ],
    defaults: { variant: "simple", headline: "New section", media: [] },
  },
  positioning: {
    label: "Positioning statement",
    description: "Editorial heading, paragraph and supporting points.",
    fields: [
      { name: "eyebrow", label: "Eyebrow", kind: "text", max: 80 },
      { name: "heading", label: "Heading", kind: "textarea", required: true, max: 160 },
      { name: "body", label: "Body", kind: "textarea", max: 1200 },
      { name: "points", label: "Points", kind: "list", max: 8, fields: [
        { name: "title", label: "Title", kind: "text", required: true, max: 80 },
        { name: "text", label: "Text", kind: "textarea", max: 300 },
      ] },
    ],
    defaults: { heading: "Heading", points: [] },
  },
  services: {
    label: "Services grid",
    description: "Shows published services marked “Show on homepage”, in their configured order.",
    fields: [
      { name: "eyebrow", label: "Eyebrow", kind: "text", max: 80 },
      { name: "heading", label: "Heading", kind: "textarea", required: true, max: 160 },
      { name: "description", label: "Description", kind: "textarea", max: 400 },
    ],
    defaults: { heading: "Services" },
  },
  work: {
    label: "Project grid",
    description: "Featured published projects (falls back to latest published).",
    fields: [
      { name: "eyebrow", label: "Eyebrow", kind: "text", max: 80 },
      { name: "heading", label: "Heading", kind: "textarea", required: true, max: 160 },
      { name: "description", label: "Description", kind: "textarea", max: 400 },
      { name: "limit", label: "Number of projects", kind: "number", min: 1, max: 12 },
    ],
    defaults: { heading: "Selected work", limit: 4 },
  },
  process: {
    label: "Process / timeline",
    description: "Numbered stages explaining how you work.",
    fields: [
      { name: "eyebrow", label: "Eyebrow", kind: "text", max: 80 },
      { name: "heading", label: "Heading", kind: "textarea", required: true, max: 160 },
      { name: "description", label: "Description", kind: "textarea", max: 400 },
      { name: "steps", label: "Stages", kind: "list", max: 8, fields: [
        { name: "title", label: "Title", kind: "text", required: true, max: 60 },
        { name: "text", label: "Description", kind: "textarea", max: 400 },
      ] },
    ],
    defaults: { heading: "How we work", steps: [] },
  },
  industries: {
    label: "Industries",
    description: "Published industry pages with their key needs.",
    fields: [
      { name: "eyebrow", label: "Eyebrow", kind: "text", max: 80 },
      { name: "heading", label: "Heading", kind: "textarea", required: true, max: 160 },
      { name: "description", label: "Description", kind: "textarea", max: 400 },
    ],
    defaults: { heading: "Industries" },
  },
  why: {
    label: "Why choose us",
    description: "Reasons to work with you. Avoid unverifiable claims.",
    fields: [
      { name: "eyebrow", label: "Eyebrow", kind: "text", max: 80 },
      { name: "heading", label: "Heading", kind: "textarea", required: true, max: 160 },
      { name: "description", label: "Description", kind: "textarea", max: 400 },
      { name: "points", label: "Points", kind: "list", max: 10, fields: [
        { name: "title", label: "Title", kind: "text", required: true, max: 80 },
        { name: "text", label: "Text", kind: "textarea", max: 300 },
      ] },
    ],
    defaults: { heading: "Why us", points: [] },
  },
  results: {
    label: "Results / case studies",
    description: "Shows VERIFIED project metrics only. When none exist, the fallback text is shown instead.",
    fields: [
      { name: "eyebrow", label: "Eyebrow", kind: "text", max: 80 },
      { name: "heading", label: "Heading", kind: "textarea", required: true, max: 160 },
      { name: "description", label: "Description", kind: "textarea", max: 400 },
      { name: "fallbackHeading", label: "Fallback heading (no verified results yet)", kind: "text", max: 160 },
      { name: "fallbackPoints", label: "Fallback points", kind: "list", max: 6, fields: [
        { name: "title", label: "Title", kind: "text", required: true, max: 80 },
        { name: "text", label: "Text", kind: "textarea", max: 300 },
      ] },
    ],
    defaults: { heading: "Results", fallbackPoints: [] },
  },
  testimonials: {
    label: "Testimonials",
    description: "Published testimonials. The section hides itself when none are published.",
    fields: [
      { name: "eyebrow", label: "Eyebrow", kind: "text", max: 80 },
      { name: "heading", label: "Heading", kind: "textarea", required: true, max: 160 },
    ],
    defaults: { heading: "What clients say" },
  },
  comparison: {
    label: "Comparison (3 columns)",
    description: "Side-by-side comparison. Your column is highlighted; leave its title empty to use the brand name. Keep points factual.",
    fields: [
      { name: "eyebrow", label: "Eyebrow", kind: "text", max: 80 },
      { name: "heading", label: "Heading", kind: "textarea", required: true, max: 160 },
      { name: "description", label: "Description", kind: "textarea", max: 400 },
      { name: "colATitle", label: "Column 1 title", kind: "text", max: 60, help: "e.g. No website" },
      { name: "colBTitle", label: "Column 2 title", kind: "text", max: 60, help: "e.g. Freelancers & other agencies" },
      { name: "oursTitle", label: "Your column title", kind: "text", max: 60, help: "Leave empty to use your brand name." },
      { name: "rows", label: "Rows", kind: "list", max: 10, fields: [
        { name: "label", label: "Row label (shown on mobile)", kind: "text", max: 60 },
        { name: "a", label: "Column 1", kind: "text", required: true, max: 160 },
        { name: "b", label: "Column 2", kind: "text", required: true, max: 160 },
        { name: "ours", label: "Your column", kind: "text", required: true, max: 160 },
      ] },
    ],
    defaults: { heading: "How we compare", colATitle: "Option A", colBTitle: "Option B", rows: [] },
  },
  plans: {
    label: "Plans & pricing",
    description: "Published plans from Admin → Plans & Pricing, with a link to the full pricing page.",
    fields: [
      { name: "eyebrow", label: "Eyebrow", kind: "text", max: 80 },
      { name: "heading", label: "Heading", kind: "textarea", required: true, max: 160 },
      { name: "description", label: "Description", kind: "textarea", max: 400 },
    ],
    defaults: { heading: "Plans" },
  },
  insights: {
    label: "Latest insights",
    description: "Most recent published articles.",
    fields: [
      { name: "eyebrow", label: "Eyebrow", kind: "text", max: 80 },
      { name: "heading", label: "Heading", kind: "textarea", required: true, max: 160 },
      { name: "description", label: "Description", kind: "textarea", max: 400 },
      { name: "limit", label: "Number of articles", kind: "number", min: 1, max: 9 },
    ],
    defaults: { heading: "Insights", limit: 3 },
  },
  cta: {
    label: "Call to action",
    description: "Closing prompt with a primary button and optional WhatsApp button.",
    fields: [
      { name: "heading", label: "Heading", kind: "textarea", required: true, max: 160 },
      { name: "body", label: "Supporting copy", kind: "textarea", max: 400 },
      cta("primaryCta", "Primary button"),
      { name: "showWhatsapp", label: "Show WhatsApp button (only appears if a number is configured)", kind: "boolean" },
    ],
    defaults: { heading: "Let’s talk", showWhatsapp: true },
  },
  richText: {
    label: "Rich text",
    description: "Formatted text content (sanitised).",
    fields: [
      { name: "heading", label: "Heading", kind: "text", max: 160 },
      { name: "html", label: "Content", kind: "richtext" },
    ],
    defaults: { html: "<p></p>" },
  },
  imageText: {
    label: "Image and text",
    description: "Image beside formatted text.",
    fields: [
      { name: "heading", label: "Heading", kind: "text", max: 160 },
      { name: "html", label: "Content", kind: "richtext" },
      { name: "image", label: "Image", kind: "media" },
      { name: "imagePosition", label: "Image position", kind: "select", options: [{ value: "left", label: "Left" }, { value: "right", label: "Right" }] },
      cta("cta", "Button"),
    ],
    defaults: { html: "<p></p>", imagePosition: "right" },
  },
  gallery: {
    label: "Image gallery",
    description: "A grid of images from the media library.",
    fields: [
      { name: "heading", label: "Heading", kind: "text", max: 160 },
      { name: "media", label: "Images", kind: "mediaList", max: 24 },
    ],
    defaults: { media: [] },
  },
  video: {
    label: "Video",
    description: "Embed a YouTube/Vimeo link or a video from the media library.",
    fields: [
      { name: "heading", label: "Heading", kind: "text", max: 160 },
      { name: "url", label: "YouTube or Vimeo URL", kind: "text", max: 300, help: "Leave blank to use an uploaded video below." },
      { name: "video", label: "Uploaded video", kind: "media" },
      { name: "caption", label: "Caption", kind: "text", max: 200 },
    ],
    defaults: {},
  },
  faq: {
    label: "FAQ",
    description: "Published FAQs from a group.",
    fields: [
      { name: "heading", label: "Heading", kind: "text", max: 160 },
      { name: "group", label: "FAQ group", kind: "text", max: 60, help: "Matches the group set on FAQs, e.g. “general”." },
    ],
    defaults: { heading: "Frequently asked questions", group: "general" },
  },
  stats: {
    label: "Statistics (verified only)",
    description: "Figures are hidden publicly unless you confirm they are verified.",
    fields: [
      { name: "heading", label: "Heading", kind: "text", max: 160 },
      { name: "verified", label: "I confirm these figures are accurate and verifiable", kind: "boolean" },
      { name: "items", label: "Figures", kind: "list", max: 6, fields: [
        { name: "value", label: "Value", kind: "text", required: true, max: 20 },
        { name: "label", label: "Label", kind: "text", required: true, max: 80 },
        { name: "note", label: "Source / note", kind: "text", max: 160 },
      ] },
    ],
    defaults: { verified: false, items: [] },
  },
  logoStrip: {
    label: "Logo strip",
    description: "Logos of tools, partners or clients you are permitted to display.",
    fields: [
      { name: "heading", label: "Heading", kind: "text", max: 160 },
      { name: "media", label: "Logos", kind: "mediaList", max: 16 },
    ],
    defaults: { media: [] },
  },
  custom: {
    label: "Content blocks",
    description: "A flexible list of titled blocks with optional links.",
    fields: [
      { name: "eyebrow", label: "Eyebrow", kind: "text", max: 80 },
      { name: "heading", label: "Heading", kind: "text", max: 160 },
      { name: "items", label: "Blocks", kind: "list", max: 12, fields: [
        { name: "title", label: "Title", kind: "text", required: true, max: 100 },
        { name: "text", label: "Text", kind: "textarea", max: 600 },
        { name: "link", label: "Link", kind: "link" },
      ] },
    ],
    defaults: { items: [] },
  },
} satisfies Record<string, SectionDef>;

export type SectionType = keyof typeof SECTION_TYPES;
export const SECTION_TYPE_KEYS = Object.keys(SECTION_TYPES) as SectionType[];

export type LinkValue = { label?: string; href?: string };

const linkSchema = (required?: boolean) =>
  z
    .object({ label: z.string().trim().max(60).optional().default(""), href: z.string().trim().max(500).optional().default("") })
    .refine((v) => !v.href || isSafeHref(v.href), { message: "Link must be a site path (/contact), https:// URL, mailto: or tel:" })
    .refine((v) => !required || (v.label && v.href), { message: "Label and destination are required" });

function fieldSchema(f: FieldSpec): z.ZodType {
  switch (f.kind) {
    case "text":
    case "textarea": {
      const s = z.string().trim().max(f.max ?? 5000);
      return f.required ? s.min(1, `${f.label} is required`) : s.optional().default("");
    }
    case "richtext":
      return z.string().max(100_000).optional().default("");
    case "link":
      return linkSchema(f.required).optional();
    case "media":
      return z.string().max(40).nullable().optional();
    case "mediaList":
      return z.array(z.string().max(40)).max(f.max ?? 50).optional().default([]);
    case "boolean":
      return z.boolean().optional().default(false);
    case "number":
      return z.coerce.number().int().min(f.min ?? 0).max(f.max ?? 1000).optional();
    case "select":
      return z.enum(f.options.map((o) => o.value) as [string, ...string[]]).optional();
    case "list":
      return z.array(z.object(Object.fromEntries(f.fields.map((sf) => [sf.name, fieldSchema(sf)])))).max(f.max ?? 50).optional().default([]);
  }
}

const schemaCache = new Map<string, z.ZodType>();
export function sectionSchema(type: SectionType) {
  let s = schemaCache.get(type);
  if (!s) {
    const def: SectionDef = SECTION_TYPES[type];
    s = z.object(Object.fromEntries(def.fields.map((f) => [f.name, fieldSchema(f)])));
    schemaCache.set(type, s);
  }
  return s;
}

export function isSectionType(t: string): t is SectionType {
  return t in SECTION_TYPES;
}
