import { describe, expect, it } from "vitest";
import { isSafeHref, normalisePath } from "@/lib/url-safety";
import { sanitizeRichText } from "@/lib/sanitize";
import { normaliseWhatsappNumber, whatsappLink, serviceWhatsappMessage } from "@/lib/whatsapp";
import { can, PERMISSIONS } from "@/lib/auth/permissions";
import { passwordProblem } from "@/lib/auth/password";
import { slugify } from "@/lib/slug";
import { embedUrl } from "@/lib/video";

describe("isSafeHref", () => {
  it.each(["/contact", "/services/seo", "#work", "https://example.com", "http://example.com/x", "mailto:hi@example.com", "tel:+919876543210"])("allows %s", (h) => {
    expect(isSafeHref(h)).toBe(true);
  });
  it.each(["javascript:alert(1)", "JAVASCRIPT:alert(1)", " javascript:alert(1)", "data:text/html,<script>", "vbscript:x", "//evil.com", "/\\evil.com", "", "ftp://x.com", "java\nscript:alert(1)"])("rejects %j", (h) => {
    expect(isSafeHref(h)).toBe(false);
  });
  it("normalises redirect paths", () => {
    expect(normalisePath("Old-Page/?utm=1")).toBe("/old-page");
    expect(normalisePath("/")).toBe("/");
  });
});

describe("sanitizeRichText", () => {
  it("removes scripts, event handlers and javascript: links", () => {
    const html = sanitizeRichText('<p onclick="x()">Hi<script>alert(1)</script><a href="javascript:alert(1)">bad</a><img src=x onerror=alert(1)><iframe src="https://e.com"></iframe></p>');
    expect(html).not.toMatch(/script|onclick|onerror|javascript:|iframe/i);
    expect(html).toContain("Hi");
  });
  it("keeps allowed formatting and hardens external links", () => {
    const html = sanitizeRichText('<h2>T</h2><p><strong>b</strong> <a href="https://e.com">x</a> <a href="/contact">c</a></p>');
    expect(html).toContain("<h2>T</h2>");
    expect(html).toContain('rel="noopener noreferrer nofollow"');
    expect(html).toContain('<a href="/contact">c</a>');
  });
});

describe("WhatsApp", () => {
  it.each([
    ["98765 43210", "919876543210"],
    ["+91 98765-43210", "919876543210"],
    ["09876543210", "919876543210"],
    ["0091 9876543210", "919876543210"],
    ["+44 20 7946 0958", "442079460958"],
  ])("normalises %s", (input, out) => {
    expect(normaliseWhatsappNumber(input)).toBe(out);
  });
  it.each(["", null, "abc", "12345", "1234567890123456", "+91 12345 67890"])("rejects %j", (input) => {
    expect(normaliseWhatsappNumber(input as string)).toBeNull();
  });
  it("builds official click-to-chat links with encoded messages", () => {
    expect(whatsappLink("9876543210", "Hi & hello")).toBe("https://wa.me/919876543210?text=Hi%20%26%20hello");
    expect(whatsappLink(null, "x")).toBeNull();
  });
  it("includes the service in prefilled messages", () => {
    expect(serviceWhatsappMessage("base", "SEO")).toContain("SEO");
  });
});

describe("permissions", () => {
  it("restricts user management and global settings to Super Admin", () => {
    expect(can("SUPER_ADMIN", "users.manage")).toBe(true);
    expect(can("EDITOR", "users.manage")).toBe(false);
    expect(can("MARKETING", "users.manage")).toBe(false);
    expect(can("EDITOR", "settings.manage")).toBe(false);
    expect(can("MARKETING", "branding.manage")).toBe(false);
  });
  it("editors manage content but not leads", () => {
    for (const p of ["pages.manage", "services.manage", "projects.manage", "articles.manage", "media.manage"] as const) expect(can("EDITOR", p)).toBe(true);
    expect(can("EDITOR", "leads.view")).toBe(false);
    expect(can("EDITOR", "leads.export")).toBe(false);
  });
  it("marketing managers handle leads and marketing content only", () => {
    expect(can("MARKETING", "leads.view")).toBe(true);
    expect(can("MARKETING", "articles.manage")).toBe(true);
    expect(can("MARKETING", "leads.delete")).toBe(false);
    expect(can("MARKETING", "services.manage")).toBe(false);
  });
  it("Super Admin has every permission; no role or null role gets anything implicitly", () => {
    for (const p of Object.keys(PERMISSIONS) as (keyof typeof PERMISSIONS)[]) {
      expect(can("SUPER_ADMIN", p)).toBe(true);
      expect(can(null, p)).toBe(false);
    }
  });
});

describe("misc", () => {
  it("enforces password strength", () => {
    expect(passwordProblem("short")).toBeTruthy();
    expect(passwordProblem("alllowercaseletters")).toBeTruthy();
    expect(passwordProblem("Str0ng-Passphrase")).toBeNull();
  });
  it("slugifies", () => {
    expect(slugify("Branding & Creative Design!")).toBe("branding-and-creative-design");
    expect(slugify("  Café — Menu ")).toBe("cafe-menu");
  });
  it("only embeds YouTube/Vimeo", () => {
    expect(embedUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
    expect(embedUrl("https://vimeo.com/123456")).toBe("https://player.vimeo.com/video/123456");
    expect(embedUrl("https://evil.com/watch?v=x")).toBeNull();
  });
});
