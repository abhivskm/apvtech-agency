import { db } from "@/lib/db";
import { classifySource, parseUserAgent, type ParsedPayload } from "@/lib/analytics/server";

export type VisitorMeta = { userAgent: string; country?: string | null; region?: string | null; city?: string | null };

/** Stores one batch. Location comes from hosting headers; the IP address itself is never read or saved here. */
export async function ingest(payload: ParsedPayload, meta: VisitorMeta, now = new Date()) {
  const { context: c, events } = payload;
  const pageviews = events.filter((e) => e.type === "pageview").length;
  const lastView = [...events].reverse().find((e) => e.type === "pageview" || e.type === "404");
  const isLead = events.some((e) => e.type === "form_success");
  await db.analyticsSession.upsert({
    where: { id: payload.sessionId },
    create: {
      id: payload.sessionId,
      visitorId: payload.visitorId,
      isNewVisitor: payload.isNewVisitor,
      startedAt: now,
      lastSeenAt: now,
      entryPath: lastView?.path ?? payload.path,
      currentPath: lastView?.path ?? payload.path,
      ...classifySource(c),
      ...c,
      ...parseUserAgent(meta.userAgent),
      country: meta.country ?? null,
      region: meta.region ?? null,
      city: meta.city ?? null,
      pageviews,
      engagedMs: payload.engagedMs,
      isLead,
    },
    update: {
      lastSeenAt: now,
      currentPath: lastView?.path ?? payload.path,
      pageviews: { increment: pageviews },
      engagedMs: { increment: payload.engagedMs },
      ...(isLead ? { isLead: true } : {}),
    },
  });
  if (events.length) {
    await db.analyticsEvent.createMany({ data: events.map((e) => ({ ...e, sessionId: payload.sessionId, createdAt: now })) });
  }
}
