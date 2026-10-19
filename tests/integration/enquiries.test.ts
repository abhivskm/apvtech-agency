import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { createEnquiry } from "@/lib/enquiries";
import { deliverOutboxItem } from "@/lib/email/outbox";
import { rateLimit } from "@/lib/rate-limit";

const base = {
  name: "Ravi Kumar",
  businessName: "Kumar Sweets",
  email: "ravi@example.com",
  phone: "9876543210",
  message: "Looking for a website and Google Business Profile help.",
  services: ["SEO & Google Presence"],
  consent: true,
};
const NOW = Date.now();
const meta = (ip = "ip-1") => ({ ipHash: ip, now: NOW });

beforeEach(async () => {
  await db.emailOutbox.deleteMany();
  await db.enquiry.deleteMany();
  await db.rateLimitHit.deleteMany();
  await db.siteSettings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", brandName: "Test", tagline: "t", colors: {}, defaultSeoTitle: "t", defaultSeoDescription: "d" },
    update: { notificationEmail: null },
  });
});
afterAll(() => db.$disconnect());

describe("createEnquiry", () => {
  it("stores a valid enquiry with consent timestamp", async () => {
    const r = await createEnquiry({ ...base, startedAt: NOW - 10_000 }, meta());
    expect(r).toEqual({ ok: true });
    const rows = await db.enquiry.findMany();
    expect(rows).toHaveLength(1);
    expect(rows[0].consentAt).toBeTruthy();
    expect(rows[0].status).toBe("NEW");
    expect(rows[0].ipHash).toBe("ip-1");
  });

  it("records email as not configured instead of pretending it was sent", async () => {
    await createEnquiry(base, meta());
    const out = await db.emailOutbox.findFirstOrThrow();
    expect(out.status).toBe("SKIPPED_UNCONFIGURED");
    expect(out.lastError).toMatch(/Not configured/);
  });

  it("returns field errors and stores nothing for invalid input", async () => {
    const r = await createEnquiry({ ...base, email: "bad", consent: false }, meta());
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.fieldErrors ?? {})).toEqual(expect.arrayContaining(["email", "consent"]));
    expect(await db.enquiry.count()).toBe(0);
  });

  it("silently drops honeypot submissions", async () => {
    const r = await createEnquiry({ ...base, company_url: "http://spam.example" }, meta());
    expect(r.ok).toBe(true);
    expect(await db.enquiry.count()).toBe(0);
  });

  it("rejects submissions completed implausibly fast", async () => {
    const r = await createEnquiry({ ...base, startedAt: NOW - 500 }, meta());
    expect(r.ok).toBe(false);
    expect(await db.enquiry.count()).toBe(0);
  });

  it("de-duplicates identical submissions within the window", async () => {
    await createEnquiry(base, meta());
    const r = await createEnquiry({ ...base, message: `  ${base.message.toUpperCase()} ` }, meta());
    expect(r).toEqual({ ok: true, duplicate: true });
    expect(await db.enquiry.count()).toBe(1);
  });

  it("rate-limits by IP", async () => {
    for (let i = 0; i < 5; i++) expect((await createEnquiry({ ...base, message: `${base.message} #${i}` }, meta("ip-rl"))).ok).toBe(true);
    const r = await createEnquiry({ ...base, message: `${base.message} #6` }, meta("ip-rl"));
    expect(r.ok).toBe(false);
    expect(await db.enquiry.count()).toBe(5);
  });

  it("keeps the enquiry when email delivery fails, and marks it for retry", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.EMAIL_FROM = "Site <site@example.com>";
    await db.siteSettings.update({ where: { id: "singleton" }, data: { notificationEmail: "team@example.com" } });
    const { env } = await import("@/lib/env");
    env.resendApiKey = "re_test";
    env.emailFrom = "Site <site@example.com>";
    const failing = (id: string) => deliverOutboxItem(id, async () => { throw new Error("provider down"); });
    const r = await createEnquiry(base, { ...meta(), deliver: failing });
    expect(r.ok).toBe(true);
    expect(await db.enquiry.count()).toBe(1);
    const out = await db.emailOutbox.findFirstOrThrow();
    expect(out.status).toBe("FAILED");
    expect(out.attempts).toBe(1);
    expect(out.lastError).toContain("provider down");

    // A later retry succeeds
    const sent = await deliverOutboxItem(out.id, async () => {});
    expect(sent).toBe("SENT");
    env.resendApiKey = "";
    env.emailFrom = "";
  });
});

describe("rateLimit", () => {
  it("allows up to the limit within the window", async () => {
    const results = [];
    for (let i = 0; i < 4; i++) results.push(await rateLimit("t:bucket", 3, 60_000));
    expect(results).toEqual([true, true, true, false]);
  });
});
