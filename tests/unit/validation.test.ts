import { describe, expect, it } from "vitest";
import { enquirySchema } from "@/lib/validation/enquiry";
import { SECTION_TYPE_KEYS, SECTION_TYPES, sectionSchema } from "@/lib/validation/sections";
import { navSaveSchema, redirectSchema, serviceSchema, socialSaveSchema, brandingSchema, globalSettingsSchema } from "@/lib/validation/content";

const validEnquiry = {
  name: "Asha Rao",
  email: "ASHA@Example.com",
  phone: "+91 98765 43210",
  message: "We need a new website for our café.",
  consent: true,
};

describe("enquiry schema", () => {
  it("accepts a valid enquiry and normalises email", () => {
    const r = enquirySchema.parse(validEnquiry);
    expect(r.email).toBe("asha@example.com");
  });
  it("requires consent", () => {
    expect(enquirySchema.safeParse({ ...validEnquiry, consent: false }).success).toBe(false);
  });
  it("rejects invalid email, phone and short messages", () => {
    const r = enquirySchema.safeParse({ ...validEnquiry, email: "nope", phone: "12", message: "hi" });
    expect(r.success).toBe(false);
    const keys = r.success ? [] : r.error.issues.map((i) => i.path[0]);
    expect(keys).toEqual(expect.arrayContaining(["email", "phone", "message"]));
  });
  it("flags the honeypot", () => {
    expect(enquirySchema.safeParse({ ...validEnquiry, company_url: "http://spam" }).success).toBe(false);
  });
});

describe("section schemas", () => {
  it("every section type's defaults validate", () => {
    for (const t of SECTION_TYPE_KEYS) {
      const r = sectionSchema(t).safeParse(SECTION_TYPES[t].defaults);
      expect(r.success, `${t}: ${!r.success && JSON.stringify(r.error.issues)}`).toBe(true);
    }
  });
  it("rejects unsafe CTA links", () => {
    const r = sectionSchema("cta").safeParse({ heading: "Hi", primaryCta: { label: "Go", href: "javascript:alert(1)" } });
    expect(r.success).toBe(false);
  });
  it("requires headings where marked required", () => {
    expect(sectionSchema("hero").safeParse({ headline: "" }).success).toBe(false);
  });
  it("validates nested list items", () => {
    const bad = sectionSchema("custom").safeParse({ items: [{ title: "x", link: { label: "a", href: "data:text/html,x" } }] });
    expect(bad.success).toBe(false);
  });
});

describe("content schemas", () => {
  it("rejects bad slugs", () => {
    const r = serviceSchema.safeParse({ title: "T", slug: "Bad Slug!", shortDescription: "x", heroHeadline: "h", status: "DRAFT", problems: [], benefits: [], deliverables: [] });
    expect(r.success).toBe(false);
  });
  it("rejects unsafe navigation destinations", () => {
    expect(navSaveSchema.safeParse({ location: "HEADER", items: [{ label: "X", href: "javascript:void(0)" }] }).success).toBe(false);
    expect(navSaveSchema.safeParse({ location: "HEADER", items: [{ label: "X", href: "/about" }] }).success).toBe(true);
  });
  it("social profiles must be http(s)", () => {
    expect(socialSaveSchema.safeParse({ items: [{ platform: "instagram", label: "IG", url: "javascript:x" }] }).success).toBe(false);
  });
  it("redirects cannot target admin routes", () => {
    expect(redirectSchema.safeParse({ fromPath: "/admin/users", toPath: "/" }).success).toBe(false);
  });
  it("brand colours must be hex", () => {
    const colors = { background: "#000000", surface: "#111111", elevated: "#222222", text: "#ffffff", muted: "#999999", accent: "red;}body{x" };
    expect(brandingSchema.safeParse({ brandName: "B", tagline: "T", colors }).success).toBe(false);
  });
  it("analytics IDs are format-checked", () => {
    const base = { defaultCtaLabel: "Go", defaultCtaHref: "/contact", enquiryRetentionDays: 365 };
    expect(globalSettingsSchema.safeParse({ ...base, gaMeasurementId: "G-ABC1234" }).success).toBe(true);
    expect(globalSettingsSchema.safeParse({ ...base, gaMeasurementId: "<script>" }).success).toBe(false);
  });
});
