import { env } from "@/lib/env";
import { db } from "@/lib/db";
import { safeEqual } from "@/lib/crypto";
import { processOutbox } from "@/lib/email/outbox";
import { rollupAndPurge } from "@/lib/analytics/retention";
import { storageStatus } from "@/lib/storage";
import { cleanupOrphanBlobs } from "@/lib/storage/blob";
import { logError } from "@/lib/log";

/**
 * Nightly maintenance (Vercel Cron: see vercel.json), called with header `Authorization: Bearer <CRON_SECRET>`:
 * retries pending/failed enquiry notifications, removes unfinished media uploads and applies analytics retention.
 */
export async function GET(req: Request) {
  const auth = req.headers.get("authorization") ?? "";
  if (!env.cronSecret || !safeEqual(auth, `Bearer ${env.cronSecret}`)) {
    return Response.json({ error: "Unauthorised" }, { status: 401 });
  }
  const result = await processOutbox(25);

  let orphanUploadsDeleted = 0;
  const storage = storageStatus();
  if (storage.directUpload && storage.configured) {
    try {
      orphanUploadsDeleted = await cleanupOrphanBlobs(env.blobToken, async (pathnames) => {
        const rows = await db.mediaAsset.findMany({ where: { storageKey: { in: pathnames } }, select: { storageKey: true } });
        return new Set(rows.map((r) => r.storageKey!));
      });
    } catch (err) {
      logError("orphan upload cleanup failed", err);
    }
  }

  let analyticsSessionsRolledUp = 0;
  try {
    analyticsSessionsRolledUp = (await rollupAndPurge()).sessions;
  } catch (err) {
    logError("analytics retention failed", err);
  }
  return Response.json({ ok: true, ...result, orphanUploadsDeleted, analyticsSessionsRolledUp });
}
