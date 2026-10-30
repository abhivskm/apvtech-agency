import { db } from "@/lib/db";

export const retentionMonths = () => {
  const n = Number(process.env.ANALYTICS_RETENTION_MONTHS);
  return Number.isInteger(n) && n > 0 ? n : 13;
};

/**
 * Moves visits older than the retention window into daily totals, then deletes the raw rows
 * (their events go with them). Runs from the nightly job in one transaction, so a failure leaves nothing half done.
 */
export async function rollupAndPurge(now = new Date(), months = retentionMonths()) {
  const cutoff = new Date(now);
  cutoff.setMonth(cutoff.getMonth() - months);
  return db.$transaction(
    async (tx) => {
      const old = await tx.analyticsSession.count({ where: { startedAt: { lt: cutoff } } });
      if (!old) return { sessions: 0 };
      await tx.$executeRaw`
        INSERT INTO "AnalyticsDaily" ("day", "metric", "dimension", "value")
        SELECT "day", "metric", "dimension", SUM("value")::int FROM (
          SELECT ("startedAt" + interval '5 hours 30 minutes')::date AS "day", m."metric", '' AS "dimension", m."value"
          FROM "AnalyticsSession" s
          CROSS JOIN LATERAL (VALUES
            ('sessions', 1),
            ('pageviews', s."pageviews"),
            ('engaged_seconds', s."engagedMs" / 1000),
            ('leads', CASE WHEN s."isLead" THEN 1 ELSE 0 END)
          ) AS m("metric", "value")
          WHERE s."startedAt" < ${cutoff}
          UNION ALL
          SELECT ("startedAt" + interval '5 hours 30 minutes')::date, 'source', "source", 1
          FROM "AnalyticsSession" WHERE "startedAt" < ${cutoff}
          UNION ALL
          SELECT (s."startedAt" + interval '5 hours 30 minutes')::date, 'page', e."path", 1
          FROM "AnalyticsEvent" e JOIN "AnalyticsSession" s ON s."id" = e."sessionId"
          WHERE s."startedAt" < ${cutoff} AND e."type" = 'pageview'
        ) d
        GROUP BY 1, 2, 3
        ON CONFLICT ("day", "metric", "dimension") DO UPDATE SET "value" = "AnalyticsDaily"."value" + EXCLUDED."value"`;
      await tx.$executeRaw`
        INSERT INTO "AnalyticsDaily" ("day", "metric", "dimension", "value")
        SELECT ("startedAt" + interval '5 hours 30 minutes')::date, 'visitors', '', COUNT(DISTINCT "visitorId")::int
        FROM "AnalyticsSession" WHERE "startedAt" < ${cutoff}
        GROUP BY 1
        ON CONFLICT ("day", "metric", "dimension") DO UPDATE SET "value" = "AnalyticsDaily"."value" + EXCLUDED."value"`;
      await tx.analyticsSession.deleteMany({ where: { startedAt: { lt: cutoff } } });
      return { sessions: old };
    },
    { timeout: 60_000 },
  );
}
