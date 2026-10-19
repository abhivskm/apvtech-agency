import { db } from "@/lib/db";

/**
 * Database-backed sliding-window rate limiter. Works across serverless instances
 * without extra infrastructure. Returns true when the action is allowed.
 */
export async function rateLimit(bucket: string, limit: number, windowMs: number): Promise<boolean> {
  const since = new Date(Date.now() - windowMs);
  const count = await db.rateLimitHit.count({ where: { bucket, createdAt: { gte: since } } });
  if (count >= limit) return false;
  await db.rateLimitHit.create({ data: { bucket } });
  // Opportunistic cleanup of old rows (cheap, indexed).
  if (Math.random() < 0.02) {
    await db.rateLimitHit.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - 24 * 3600_000) } } });
  }
  return true;
}

export async function countHits(bucket: string, windowMs: number): Promise<number> {
  return db.rateLimitHit.count({ where: { bucket, createdAt: { gte: new Date(Date.now() - windowMs) } } });
}

export async function recordHit(bucket: string) {
  await db.rateLimitHit.create({ data: { bucket } });
}

export async function clearHits(bucket: string) {
  await db.rateLimitHit.deleteMany({ where: { bucket } });
}
