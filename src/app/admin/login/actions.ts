"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { getDummyHash, verifyPassword } from "@/lib/auth/password";
import { createSession, destroyCurrentSession, getSessionUser } from "@/lib/auth/session";
import { clearHits, countHits, recordHit } from "@/lib/rate-limit";
import { clientIpHash, userAgent } from "@/lib/request";
import { logActivity } from "@/lib/audit";

const schema = z.object({
  email: z.email().trim().toLowerCase().max(200),
  password: z.string().min(1).max(200),
  next: z.string().max(300).optional(),
});

const WINDOW = 15 * 60_000;
const MAX_PER_EMAIL = 5;
const MAX_PER_IP = 20;

export type LoginState = { error?: string } | undefined;

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = schema.safeParse({ email: formData.get("email"), password: formData.get("password"), next: formData.get("next") || undefined });
  if (!parsed.success) return { error: "Enter your email and password." };
  const { email, password, next } = parsed.data;
  const ipHash = await clientIpHash();

  const [emailHits, ipHits] = await Promise.all([countHits(`login:email:${email}`, WINDOW), countHits(`login:ip:${ipHash}`, WINDOW)]);
  if (emailHits >= MAX_PER_EMAIL || ipHits >= MAX_PER_IP) {
    return { error: "Too many sign-in attempts. Please wait 15 minutes and try again." };
  }

  const user = await db.user.findUnique({ where: { email } });
  // Always run a hash verification so response time doesn't reveal whether the account exists.
  const ok = await verifyPassword(user?.passwordHash ?? (await getDummyHash()), password);

  if (!user || !ok || !user.active) {
    await Promise.all([recordHit(`login:email:${email}`), recordHit(`login:ip:${ipHash}`)]);
    if (user) await logActivity({ id: user.id, email: user.email }, "auth.login_failed", "User", user.id, "Failed sign-in attempt");
    return { error: "Incorrect email or password." };
  }

  await clearHits(`login:email:${email}`);
  await createSession(user.id, { ipHash, userAgent: await userAgent() });
  await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await logActivity({ id: user.id, email: user.email }, "auth.login", "User", user.id, "Signed in");

  const dest = next && next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin";
  redirect(dest);
}

export async function logout() {
  const user = await getSessionUser();
  await destroyCurrentSession();
  if (user) await logActivity(user, "auth.logout", "User", user.id, "Signed out");
  redirect("/admin/login");
}
