"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword, passwordProblem } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { safeEqual } from "@/lib/crypto";
import { rateLimit } from "@/lib/rate-limit";
import { clientIpHash, userAgent } from "@/lib/request";
import { logActivity } from "@/lib/audit";

export type SetupState = { error?: string; field?: string } | undefined;

const schema = z.object({
  token: z.string().trim().min(1, "Enter the setup code").max(200),
  name: z.string().trim().min(2, "Enter your name").max(80),
  email: z.email("Enter a valid email").trim().toLowerCase().max(200),
  password: z.string().max(200),
  confirm: z.string().max(200),
});

/**
 * One-time creation of the first Super Admin from the browser.
 * Requires the SETUP_TOKEN environment variable (only the site owner can read it) and only works
 * while the database has no users at all — after that this action always refuses.
 */
export async function setupFirstAdmin(_prev: SetupState, formData: FormData): Promise<SetupState> {
  const ipHash = await clientIpHash();
  if (!(await rateLimit(`setup:${ipHash}`, 5, 15 * 60_000))) return { error: "Too many attempts. Wait 15 minutes and try again." };

  const expected = process.env.SETUP_TOKEN ?? "";
  if (expected.length < 24) return { error: "Browser setup is disabled on this server." };

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { error: issue.message, field: String(issue.path[0]) };
  }
  const { token, name, email, password, confirm } = parsed.data;
  if (!safeEqual(token, expected)) return { error: "That setup code is not correct.", field: "token" };
  const problem = passwordProblem(password);
  if (problem) return { error: problem, field: "password" };
  if (password !== confirm) return { error: "Passwords don't match.", field: "confirm" };

  const passwordHash = await hashPassword(password);
  const user = await db.$transaction(
    async (tx) => {
      if ((await tx.user.count()) > 0) return null;
      return tx.user.create({ data: { email, name, passwordHash, role: "SUPER_ADMIN", lastLoginAt: new Date() } });
    },
    { isolationLevel: "Serializable" },
  );
  if (!user) return { error: "An administrator already exists. Please sign in instead." };

  await logActivity({ id: user.id, email: user.email }, "user.create_setup", "User", user.id, `First Super Admin ${email} created via one-time browser setup`);
  await createSession(user.id, { ipHash, userAgent: await userAgent() });
  redirect("/admin");
}
