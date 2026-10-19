import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import type { SessionUser } from "@/lib/auth/session";

const SENSITIVE_KEYS = /pass(word)?|token|secret|hash|key|authorization|cookie/i;

function scrub(value: unknown, depth = 0): unknown {
  if (depth > 3 || value == null) return value ?? null;
  if (Array.isArray(value)) return value.slice(0, 20).map((v) => scrub(v, depth + 1));
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = SENSITIVE_KEYS.test(k) ? "[redacted]" : scrub(v, depth + 1);
    }
    return out;
  }
  if (typeof value === "string" && value.length > 300) return value.slice(0, 300) + "…";
  return value;
}

export async function logActivity(
  actor: Pick<SessionUser, "id" | "email"> | null,
  action: string,
  entityType: string,
  entityId?: string | null,
  summary = "",
  metadata?: Record<string, unknown>,
) {
  try {
    await db.activityLog.create({
      data: {
        actorId: actor?.id ?? null,
        actorEmail: actor?.email ?? null,
        action,
        entityType,
        entityId: entityId ?? null,
        summary: summary.slice(0, 300),
        metadata: metadata ? (scrub(metadata) as Prisma.InputJsonValue) : undefined,
      },
    });
  } catch (err) {
    // Auditing must never break the primary operation.
    console.error("activity log failed", err);
  }
}
