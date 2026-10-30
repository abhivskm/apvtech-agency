import { guardRoute } from "@/lib/admin/route-guard";
import { parseFilters } from "@/lib/analytics/report";
import { logActivity } from "@/lib/audit";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const MAX_ROWS = 50_000;

/** Escapes a CSV cell and neutralises spreadsheet formulas (=, +, -, @ prefixes). */
function cell(v: unknown) {
  let s = v == null ? "" : v instanceof Date ? v.toISOString() : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

const csv = (header: string[], rows: unknown[][]) => [header, ...rows].map((r) => r.map(cell).join(",")).join("\r\n");

/** CSV of raw sessions or events for the chosen dates and device. */
export async function GET(req: Request) {
  const user = await guardRoute(req, "analytics.export");
  if (user instanceof Response) return user;
  const q = new URL(req.url).searchParams;
  const f = parseFilters(q);
  const device = f.device ? { device: f.device } : {};
  const dataset = q.get("dataset") === "events" ? "events" : "sessions";

  let body: string;
  if (dataset === "events") {
    const rows = await db.analyticsEvent.findMany({
      where: { createdAt: { gte: f.from, lt: f.to }, session: device },
      orderBy: { id: "desc" },
      take: MAX_ROWS,
      include: { session: { select: { visitorId: true, device: true, channel: true, source: true, country: true, region: true, city: true } } },
    });
    body = csv(
      ["Time (UTC)", "Event", "Path", "Group", "Slug", "Label", "Area", "Value", "Session", "Visitor", "Device", "Channel", "Source", "Country", "State", "City"],
      rows.map((e) => [e.createdAt, e.type, e.path, e.group, e.slug, e.label, e.area, e.value, e.sessionId, e.session.visitorId, e.session.device, e.session.channel, e.session.source, e.session.country, e.session.region, e.session.city]),
    );
  } else {
    const rows = await db.analyticsSession.findMany({ where: { startedAt: { gte: f.from, lt: f.to }, ...device }, orderBy: { startedAt: "desc" }, take: MAX_ROWS });
    body = csv(
      ["Started (UTC)", "Last seen (UTC)", "Session", "Visitor", "New visitor", "Entry page", "Channel", "Source", "Referrer", "UTM source", "UTM medium", "UTM campaign", "UTM term", "UTM content", "Device", "Browser", "OS", "Language", "Country", "State", "City", "Pageviews", "Engaged seconds", "Lead"],
      rows.map((s) => [s.startedAt, s.lastSeenAt, s.id, s.visitorId, s.isNewVisitor, s.entryPath, s.channel, s.source, s.referrerHost, s.utmSource, s.utmMedium, s.utmCampaign, s.utmTerm, s.utmContent, s.device, s.browser, s.os, s.language, s.country, s.region, s.city, s.pageviews, Math.round(s.engagedMs / 1000), s.isLead]),
    );
  }
  await logActivity(user, "analytics.export", "Analytics", dataset, `Exported analytics ${dataset} ${f.fromDay} to ${f.toDay}`);
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="analytics-${dataset}-${f.fromDay}-to-${f.toDay}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
