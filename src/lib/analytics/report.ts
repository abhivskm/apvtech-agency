import "server-only";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

/** Dashboard queries. Dates are whole days in India time; all values are bound parameters. */
const DAY = /^\d{4}-\d{2}-\d{2}$/;
const IST_MS = 5.5 * 3600_000;
const MAX_DAYS = 400;

export type ReportFilters = { from: Date; to: Date; fromDay: string; toDay: string; device: string | null };

export const istDay = (d: Date) => new Date(d.getTime() + IST_MS).toISOString().slice(0, 10);

export function parseFilters(q: URLSearchParams, now = new Date()): ReportFilters {
  const today = istDay(now);
  const toDay = DAY.test(q.get("to") ?? "") ? q.get("to")! : today;
  const fallback = istDay(new Date(new Date(`${toDay}T00:00:00+05:30`).getTime() - 6 * 86_400_000));
  let fromDay = DAY.test(q.get("from") ?? "") ? q.get("from")! : fallback;
  const to = new Date(new Date(`${toDay}T00:00:00+05:30`).getTime() + 86_400_000);
  let from = new Date(`${fromDay}T00:00:00+05:30`);
  if (!(from < to) || to.getTime() - from.getTime() > MAX_DAYS * 86_400_000) {
    fromDay = fallback;
    from = new Date(`${fromDay}T00:00:00+05:30`);
  }
  const device = q.get("device");
  return { from, to, fromDay, toDay, device: device === "desktop" || device === "mobile" || device === "tablet" ? device : null };
}

const deviceSql = (device: string | null) => (device ? Prisma.sql`AND s."device" = ${device}` : Prisma.empty);

type Row = Record<string, unknown>;
const rows = <T extends Row>(sql: Prisma.Sql) => db.$queryRaw<T[]>(sql);

async function overview(from: Date, to: Date, device: string | null) {
  const [r] = await rows<{ visitors: number; sessions: number; pageviews: number; engaged: number; newVisitors: number; returningVisitors: number; leads: number }>(Prisma.sql`
    SELECT COUNT(DISTINCT s."visitorId")::int AS visitors,
           COUNT(*)::int AS sessions,
           COALESCE(SUM(s."pageviews"), 0)::int AS pageviews,
           COALESCE(AVG(s."engagedMs"), 0)::int AS engaged,
           COUNT(DISTINCT s."visitorId") FILTER (WHERE s."isNewVisitor")::int AS "newVisitors",
           COUNT(DISTINCT s."visitorId") FILTER (WHERE NOT s."isNewVisitor")::int AS "returningVisitors",
           COUNT(*) FILTER (WHERE s."isLead")::int AS leads
    FROM "AnalyticsSession" s
    WHERE s."startedAt" >= ${from} AND s."startedAt" < ${to} ${deviceSql(device)}`);
  return r;
}

/** Top values of one event dimension, with the number of distinct visits. */
const eventsBy = (f: ReportFilters, where: Prisma.Sql, key: Prisma.Sql, limit = 10) =>
  rows<{ key: string | null; area?: string | null; count: number; sessions: number }>(Prisma.sql`
    SELECT ${key} AS key, COUNT(*)::int AS count, COUNT(DISTINCT e."sessionId")::int AS sessions
    FROM "AnalyticsEvent" e JOIN "AnalyticsSession" s ON s."id" = e."sessionId"
    WHERE e."createdAt" >= ${f.from} AND e."createdAt" < ${f.to} ${deviceSql(f.device)} AND ${where}
    GROUP BY 1 ORDER BY 2 DESC LIMIT ${limit}`);

const sessionsBy = (f: ReportFilters, column: "device" | "browser" | "os" | "language" | "country" | "region" | "city") =>
  rows<{ key: string | null; sessions: number }>(Prisma.sql`
    SELECT s.${Prisma.raw(`"${column}"`)} AS key, COUNT(*)::int AS sessions
    FROM "AnalyticsSession" s
    WHERE s."startedAt" >= ${f.from} AND s."startedAt" < ${f.to} ${deviceSql(f.device)}
    GROUP BY 1 ORDER BY 2 DESC LIMIT 10`);

export async function report(f: ReportFilters) {
  const span = f.to.getTime() - f.from.getTime();
  const [current, previous] = await Promise.all([overview(f.from, f.to, f.device), overview(new Date(f.from.getTime() - span), f.from, f.device)]);

  const [daily, sources, campaigns, pages, services, work, insights, industries, funnel, cta, nav, cards, contacts, outbound, scroll] = await Promise.all([
    rows<{ day: string; sessions: number; pageviews: number; leads: number }>(Prisma.sql`
      SELECT to_char(s."startedAt" + interval '5 hours 30 minutes', 'YYYY-MM-DD') AS day,
             COUNT(*)::int AS sessions, COALESCE(SUM(s."pageviews"), 0)::int AS pageviews, COUNT(*) FILTER (WHERE s."isLead")::int AS leads
      FROM "AnalyticsSession" s
      WHERE s."startedAt" >= ${f.from} AND s."startedAt" < ${f.to} ${deviceSql(f.device)}
      GROUP BY 1 ORDER BY 1`),
    rows<{ channel: string; source: string; sessions: number; visitors: number; leads: number }>(Prisma.sql`
      SELECT s."channel", s."source", COUNT(*)::int AS sessions, COUNT(DISTINCT s."visitorId")::int AS visitors, COUNT(*) FILTER (WHERE s."isLead")::int AS leads
      FROM "AnalyticsSession" s
      WHERE s."startedAt" >= ${f.from} AND s."startedAt" < ${f.to} ${deviceSql(f.device)}
      GROUP BY 1, 2 ORDER BY 3 DESC LIMIT 15`),
    rows<{ source: string | null; medium: string | null; campaign: string | null; sessions: number; leads: number }>(Prisma.sql`
      SELECT s."utmSource" AS source, s."utmMedium" AS medium, s."utmCampaign" AS campaign, COUNT(*)::int AS sessions, COUNT(*) FILTER (WHERE s."isLead")::int AS leads
      FROM "AnalyticsSession" s
      WHERE s."startedAt" >= ${f.from} AND s."startedAt" < ${f.to} AND s."utmSource" IS NOT NULL ${deviceSql(f.device)}
      GROUP BY 1, 2, 3 ORDER BY 4 DESC LIMIT 15`),
    eventsBy(f, Prisma.sql`e."type" = 'pageview'`, Prisma.sql`e."path"`, 15),
    eventsBy(f, Prisma.sql`e."type" = 'pageview' AND e."group" = 'service' AND e."slug" IS NOT NULL`, Prisma.sql`e."slug"`),
    eventsBy(f, Prisma.sql`e."type" = 'pageview' AND e."group" = 'work' AND e."slug" IS NOT NULL`, Prisma.sql`e."slug"`),
    eventsBy(f, Prisma.sql`e."type" = 'pageview' AND e."group" = 'insight' AND e."slug" IS NOT NULL`, Prisma.sql`e."slug"`),
    eventsBy(f, Prisma.sql`e."type" = 'pageview' AND e."group" = 'industry' AND e."slug" IS NOT NULL`, Prisma.sql`e."slug"`),
    rows<{ visits: number; interest: number; contact: number; started: number; leads: number }>(Prisma.sql`
      SELECT COUNT(DISTINCT s."id")::int AS visits,
             COUNT(DISTINCT s."id") FILTER (WHERE e."type" = 'pageview' AND e."group" IN ('service', 'work', 'pricing'))::int AS interest,
             COUNT(DISTINCT s."id") FILTER (WHERE e."type" = 'pageview' AND e."group" = 'contact')::int AS contact,
             COUNT(DISTINCT s."id") FILTER (WHERE e."type" = 'form_start')::int AS started,
             COUNT(DISTINCT s."id") FILTER (WHERE e."type" = 'form_success')::int AS leads
      FROM "AnalyticsSession" s LEFT JOIN "AnalyticsEvent" e ON e."sessionId" = s."id"
      WHERE s."startedAt" >= ${f.from} AND s."startedAt" < ${f.to} ${deviceSql(f.device)}`),
    rows<{ label: string | null; area: string | null; count: number; sessions: number }>(Prisma.sql`
      SELECT e."label", e."area", COUNT(*)::int AS count, COUNT(DISTINCT e."sessionId")::int AS sessions
      FROM "AnalyticsEvent" e JOIN "AnalyticsSession" s ON s."id" = e."sessionId"
      WHERE e."createdAt" >= ${f.from} AND e."createdAt" < ${f.to} AND e."type" = 'cta' ${deviceSql(f.device)}
      GROUP BY 1, 2 ORDER BY 3 DESC LIMIT 20`),
    eventsBy(f, Prisma.sql`e."type" = 'nav'`, Prisma.sql`e."label"`),
    rows<{ label: string | null; area: string | null; count: number; sessions: number }>(Prisma.sql`
      SELECT e."label", e."area", COUNT(*)::int AS count, COUNT(DISTINCT e."sessionId")::int AS sessions
      FROM "AnalyticsEvent" e JOIN "AnalyticsSession" s ON s."id" = e."sessionId"
      WHERE e."createdAt" >= ${f.from} AND e."createdAt" < ${f.to} AND e."type" = 'card' ${deviceSql(f.device)}
      GROUP BY 1, 2 ORDER BY 3 DESC LIMIT 15`),
    eventsBy(f, Prisma.sql`e."type" = 'contact_click'`, Prisma.sql`e."label"`),
    eventsBy(f, Prisma.sql`e."type" = 'outbound'`, Prisma.sql`e."label"`),
    eventsBy(f, Prisma.sql`e."type" = 'scroll'`, Prisma.sql`e."value"::text`, 4),
  ]);

  const [device, browser, os, language, country, region, city, vitals, notFound, jsErrors, formErrors, usage, archive] = await Promise.all([
    sessionsBy(f, "device"),
    sessionsBy(f, "browser"),
    sessionsBy(f, "os"),
    sessionsBy(f, "language"),
    sessionsBy(f, "country"),
    sessionsBy(f, "region"),
    sessionsBy(f, "city"),
    rows<{ metric: string | null; p75: number; samples: number }>(Prisma.sql`
      SELECT e."label" AS metric, percentile_cont(0.75) WITHIN GROUP (ORDER BY e."value")::int AS p75, COUNT(*)::int AS samples
      FROM "AnalyticsEvent" e JOIN "AnalyticsSession" s ON s."id" = e."sessionId"
      WHERE e."createdAt" >= ${f.from} AND e."createdAt" < ${f.to} AND e."type" = 'vital' ${deviceSql(f.device)}
      GROUP BY 1 ORDER BY 1`),
    eventsBy(f, Prisma.sql`e."type" = '404'`, Prisma.sql`e."path"`),
    eventsBy(f, Prisma.sql`e."type" = 'js_error'`, Prisma.sql`e."label"`),
    eventsBy(f, Prisma.sql`e."type" = 'form_error'`, Prisma.sql`e."label"`),
    rows<{ events: number; bytes: number }>(Prisma.sql`SELECT (SELECT COUNT(*)::int FROM "AnalyticsEvent") AS events, pg_database_size(current_database())::float8 AS bytes`),
    rows<{ month: string; metric: string; value: number }>(Prisma.sql`
      SELECT to_char("day", 'YYYY-MM') AS month, "metric", SUM("value")::int AS value
      FROM "AnalyticsDaily" WHERE "dimension" = '' GROUP BY 1, 2 ORDER BY 1 DESC LIMIT 72`),
  ]);

  return {
    range: { from: f.fromDay, to: f.toDay, device: f.device },
    current,
    previous,
    daily,
    sources,
    campaigns,
    pages,
    services,
    work,
    insights,
    industries,
    funnel: funnel[0],
    cta,
    nav,
    cards,
    contacts,
    outbound,
    scroll,
    audience: { device, browser, os, language, country, region, city },
    vitals,
    notFound,
    jsErrors,
    formErrors,
    usage: usage[0],
    archive,
  };
}
export type AnalyticsReport = Awaited<ReturnType<typeof report>>;

const ACTIVE_MS = 60_000;

export async function live(now = new Date()) {
  const since = new Date(now.getTime() - ACTIVE_MS);
  const [active, feed] = await Promise.all([
    db.analyticsSession.findMany({
      where: { lastSeenAt: { gte: since } },
      orderBy: { lastSeenAt: "desc" },
      take: 200,
      select: { currentPath: true, device: true, browser: true, source: true, channel: true, country: true, region: true, city: true, lastSeenAt: true },
    }),
    db.analyticsEvent.findMany({
      where: { type: { not: "vital" } },
      orderBy: { id: "desc" },
      take: 40,
      select: {
        id: true,
        type: true,
        path: true,
        label: true,
        area: true,
        value: true,
        createdAt: true,
        session: { select: { device: true, source: true, country: true, region: true, city: true } },
      },
    }),
  ]);
  const count = (key: (s: (typeof active)[number]) => string | null) => {
    const m = new Map<string, number>();
    for (const s of active) {
      const k = key(s) ?? "Unknown";
      m.set(k, (m.get(k) ?? 0) + 1);
    }
    return [...m].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([label, value]) => ({ label, value }));
  };
  return {
    now: now.toISOString(),
    active: active.length,
    pages: count((s) => s.currentPath),
    locations: count((s) => [s.city, s.region, s.country].filter(Boolean).join(", ") || null),
    devices: count((s) => s.device),
    sources: count((s) => s.source),
    feed: feed.map((e) => ({ ...e, id: e.id.toString(), createdAt: e.createdAt.toISOString() })),
  };
}
export type AnalyticsLive = Awaited<ReturnType<typeof live>>;
