import { env } from "@/lib/env";
import { safeEqual } from "@/lib/crypto";
import { processOutbox } from "@/lib/email/outbox";

/**
 * Retries pending/failed enquiry notifications. Call on a schedule (Vercel Cron: see vercel.json)
 * with header `Authorization: Bearer <CRON_SECRET>`.
 */
export async function GET(req: Request) {
  const auth = req.headers.get("authorization") ?? "";
  if (!env.cronSecret || !safeEqual(auth, `Bearer ${env.cronSecret}`)) {
    return Response.json({ error: "Unauthorised" }, { status: 401 });
  }
  const result = await processOutbox(25);
  return Response.json({ ok: true, ...result });
}
