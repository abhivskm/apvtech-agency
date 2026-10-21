import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import type { Role } from "@prisma/client";
import { db } from "@/lib/db";
import { randomToken, sha256 } from "@/lib/crypto";

export const SESSION_COOKIE = "agency_session";
const SESSION_TTL_MS = 7 * 24 * 3600_000;
const RENEW_THRESHOLD_MS = 24 * 3600_000;
/** Hard limit: however active, a session ends 30 days after sign-in and the user signs in again. */
const SESSION_MAX_AGE_MS = 30 * 24 * 3600_000;

export type SessionUser = { id: string; email: string; name: string; role: Role };

export async function createSession(userId: string, meta: { ipHash?: string; userAgent?: string }) {
  const token = randomToken(32);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.session.create({
    data: { tokenHash: sha256(token), userId, expiresAt, ipHash: meta.ipHash, userAgent: meta.userAgent },
  });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/** Validates the session cookie against the database. Cached per request. */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token || token.length > 100) return null;
  const session = await db.session.findUnique({
    where: { tokenHash: sha256(token) },
    include: { user: { select: { id: true, email: true, name: true, role: true, active: true } } },
  });
  if (!session) return null;
  const hardLimit = session.createdAt.getTime() + SESSION_MAX_AGE_MS;
  if (session.expiresAt.getTime() < Date.now() || hardLimit < Date.now() || !session.user.active) {
    await db.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }
  // Sliding expiry, never past the hard limit: extend sessions that are used again after a day.
  if (session.expiresAt.getTime() - Date.now() < SESSION_TTL_MS - RENEW_THRESHOLD_MS && session.expiresAt.getTime() < hardLimit) {
    const expiresAt = new Date(Math.min(Date.now() + SESSION_TTL_MS, hardLimit));
    await db.session.update({ where: { id: session.id }, data: { expiresAt } }).catch(() => {});
    try {
      jar.set(SESSION_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        expires: expiresAt,
      });
    } catch {
      // Cookies are read-only during Server Component render; renewal happens on the next action.
    }
  }
  const { id, email, name, role } = session.user;
  return { id, email, name, role };
});

export async function destroyCurrentSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await db.session.deleteMany({ where: { tokenHash: sha256(token) } });
  jar.delete(SESSION_COOKIE);
}

export async function revokeUserSessions(userId: string) {
  await db.session.deleteMany({ where: { userId } });
}
