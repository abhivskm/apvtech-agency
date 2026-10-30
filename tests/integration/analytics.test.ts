import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { ingest } from "@/lib/analytics/ingest";
import { rollupAndPurge } from "@/lib/analytics/retention";
import { parsePayload } from "@/lib/analytics/server";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/141.0 Safari/537.36";
const payload = (s: string, e: unknown[], extra: object = {}) => parsePayload({ v: "a".repeat(32), s: s.repeat(32), n: true, p: "/", c: { r: "www.google.com" }, e, ...extra })!;
const meta = { userAgent: UA, country: "IN", region: "MP", city: "Bhopal" };

beforeEach(async () => {
  await db.analyticsSession.deleteMany();
  await db.analyticsDaily.deleteMany();
});
afterAll(() => db.$disconnect());

describe("analytics ingest", () => {
  it("creates one session and adds to it across batches", async () => {
    await ingest(payload("b", [{ t: "pageview", p: "/" }], { d: 5000 }), meta);
    await ingest(payload("b", [{ t: "pageview", p: "/contact" }, { t: "form_start", p: "/contact" }, { t: "form_success", p: "/contact" }], { d: 5000 }), meta);
    const s = await db.analyticsSession.findUniqueOrThrow({ where: { id: "b".repeat(32) } });
    expect(s).toMatchObject({ pageviews: 2, engagedMs: 10000, isLead: true, entryPath: "/", currentPath: "/contact", channel: "Organic search", source: "google.com", device: "desktop", browser: "Chrome", city: "Bhopal" });
    expect(await db.analyticsEvent.count()).toBe(4);
    const contact = await db.analyticsEvent.findFirstOrThrow({ where: { type: "pageview", path: "/contact" } });
    expect(contact.group).toBe("contact");
  });

  it("a heartbeat only updates presence and engaged time", async () => {
    await ingest(payload("c", [{ t: "pageview", p: "/" }]), meta);
    await ingest(payload("c", [], { d: 20000, p: "/" }), meta);
    expect(await db.analyticsEvent.count()).toBe(1);
    expect((await db.analyticsSession.findFirstOrThrow()).engagedMs).toBe(20000);
  });
});

describe("analytics retention", () => {
  it("rolls up and deletes only visits past the window", async () => {
    const now = new Date("2026-10-30T12:00:00Z");
    await ingest(payload("d", [{ t: "pageview", p: "/old" }, { t: "form_success", p: "/old" }], { d: 7000 }), meta, new Date("2025-01-15T12:00:00Z"));
    await ingest(payload("e", [{ t: "pageview", p: "/new" }]), meta, new Date("2026-10-01T12:00:00Z"));

    expect(await rollupAndPurge(now, 13)).toEqual({ sessions: 1 });
    expect((await db.analyticsSession.findMany()).map((s) => s.id)).toEqual(["e".repeat(32)]);
    expect((await db.analyticsEvent.findMany()).map((e) => e.path)).toEqual(["/new"]);

    const daily = await db.analyticsDaily.findMany();
    const get = (metric: string, dimension = "") => daily.find((d) => d.metric === metric && d.dimension === dimension)?.value;
    expect(get("sessions")).toBe(1);
    expect(get("visitors")).toBe(1);
    expect(get("pageviews")).toBe(1);
    expect(get("leads")).toBe(1);
    expect(get("engaged_seconds")).toBe(7);
    expect(get("page", "/old")).toBe(1);
    expect(JSON.stringify(daily)).not.toContain("a".repeat(32));

    expect(await rollupAndPurge(now, 13)).toEqual({ sessions: 0 });
  });
});
