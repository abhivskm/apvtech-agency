import { describe, expect, it } from "vitest";
import { classifySource, isBot, parsePayload, parseUserAgent, scrubError } from "@/lib/analytics/server";
import { contentGroup } from "@/lib/analytics/shared";

const IDS = { v: "a".repeat(32), s: "b".repeat(32) };
const CHROME = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36";
const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";

describe("contentGroup", () => {
  it("maps paths to groups and slugs", () => {
    expect(contentGroup("/")).toEqual({ group: "home", slug: null });
    expect(contentGroup("/services")).toEqual({ group: "service", slug: null });
    expect(contentGroup("/services/seo-google-presence")).toEqual({ group: "service", slug: "seo-google-presence" });
    expect(contentGroup("/work/kaasthify?x=1")).toEqual({ group: "work", slug: "kaasthify" });
    expect(contentGroup("/industries/startups")).toEqual({ group: "industry", slug: "startups" });
    expect(contentGroup("/insights/some-article")).toEqual({ group: "insight", slug: "some-article" });
    expect(contentGroup("/pricing").group).toBe("pricing");
    expect(contentGroup("/about").group).toBe("about");
    expect(contentGroup("/contact").group).toBe("contact");
    expect(contentGroup("/privacy-policy")).toEqual({ group: "legal", slug: "privacy-policy" });
    expect(contentGroup("/some-custom-page")).toEqual({ group: "other", slug: "some-custom-page" });
  });
});

describe("bots and user agents", () => {
  it("filters bots and empty user agents, not real browsers", () => {
    expect(isBot("Googlebot/2.1")).toBe(true);
    expect(isBot("Mozilla/5.0 HeadlessChrome/120")).toBe(true);
    expect(isBot("WhatsApp/2.23")).toBe(true);
    expect(isBot("")).toBe(true);
    expect(isBot(CHROME)).toBe(false);
    expect(isBot(IPHONE)).toBe(false);
  });
  it("reads device, browser and OS", () => {
    expect(parseUserAgent(CHROME)).toEqual({ device: "desktop", browser: "Chrome", os: "Windows" });
    expect(parseUserAgent(IPHONE)).toEqual({ device: "mobile", browser: "Safari", os: "iOS" });
  });
});

describe("classifySource", () => {
  it("prefers UTM tags, then the referrer", () => {
    expect(classifySource({ utmSource: "Insta", utmMedium: "cpc" })).toEqual({ channel: "Paid", source: "insta" });
    expect(classifySource({ referrerHost: "www.google.co.in" })).toEqual({ channel: "Organic search", source: "google.co.in" });
    expect(classifySource({ referrerHost: "l.instagram.com" })).toEqual({ channel: "Social", source: "l.instagram.com" });
    expect(classifySource({ referrerHost: "example.com" })).toEqual({ channel: "Referral", source: "example.com" });
    expect(classifySource({})).toEqual({ channel: "Direct", source: "direct" });
  });
});

describe("parsePayload privacy rules", () => {
  it("rejects bad IDs", () => {
    expect(parsePayload({ v: "x", s: IDS.s })).toBeNull();
    expect(parsePayload(null)).toBeNull();
  });
  it("drops unknown event types and unknown fields", () => {
    const p = parsePayload({ ...IDS, p: "/contact", e: [{ t: "pageview", p: "/contact", email: "ravi@example.com", message: "hello" }, { t: "form_contents", label: "secret" }] });
    expect(p?.events).toHaveLength(1);
    expect(JSON.stringify(p)).not.toContain("ravi@example.com");
    expect(JSON.stringify(p)).not.toContain("secret");
  });
  it("strips query strings from paths", () => {
    const p = parsePayload({ ...IDS, p: "/contact?email=ravi@example.com", e: [{ t: "pageview", p: "/contact?phone=9876543210#x" }] });
    expect(p?.path).toBe("/contact");
    expect(p?.events[0].path).toBe("/contact");
  });
  it("scrubs personal data from error messages and limits sizes", () => {
    expect(scrubError("Failed for ravi@example.com at https://a.com/x?y=1 phone 9876543210")).toBe("Failed for [email] at [url] phone [number]");
    const p = parsePayload({ ...IDS, d: 9_999_999, e: Array.from({ length: 80 }, () => ({ t: "scroll", value: 25 })) });
    expect(p?.events).toHaveLength(50);
    expect(p?.engagedMs).toBe(120_000);
  });
});
