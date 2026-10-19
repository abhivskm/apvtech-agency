"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { adminAction, type ActionResult } from "@/lib/admin/action";
import { userCreateSchema, userUpdateSchema } from "@/lib/validation/content";
import { hashPassword, passwordProblem, verifyPassword } from "@/lib/auth/password";
import { revokeUserSessions } from "@/lib/auth/session";
import { logActivity } from "@/lib/audit";

async function activeSuperAdmins(excludeId?: string) {
  return db.user.count({ where: { role: "SUPER_ADMIN", active: true, ...(excludeId ? { id: { not: excludeId } } : {}) } });
}

export const createUser = adminAction("users.manage", async (input: Record<string, unknown>, actor) => {
  const data = userCreateSchema.parse(input);
  const problem = passwordProblem(data.password);
  if (problem) return { ok: false, error: problem, fieldErrors: { password: problem } };
  const user = await db.user.create({ data: { email: data.email, name: data.name, role: data.role, passwordHash: await hashPassword(data.password) } });
  await logActivity(actor, "user.create", "User", user.id, `Created ${data.role} account for ${data.email}`);
  return { ok: true, message: "User created. Share the password with them securely and ask them to change it.", data: { redirect: "/admin/users" } };
});

export const updateUser = adminAction("users.manage", async (input: { id: string } & Record<string, unknown>, actor) => {
  const data = userUpdateSchema.parse(input);
  const existing = await db.user.findUniqueOrThrow({ where: { id: input.id } });
  const losingSuper = existing.role === "SUPER_ADMIN" && existing.active && (data.role !== "SUPER_ADMIN" || !data.active);
  if (losingSuper && (await activeSuperAdmins(existing.id)) === 0) {
    return { ok: false, error: "There must always be at least one active Super Admin." };
  }
  await db.user.update({ where: { id: existing.id }, data });
  if (existing.role !== data.role || (existing.active && !data.active)) await revokeUserSessions(existing.id);
  await logActivity(actor, existing.role !== data.role ? "user.role_change" : "user.update", "User", existing.id, `Updated ${existing.email}: role ${existing.role} → ${data.role}, ${data.active ? "active" : "deactivated"}`);
  return { ok: true, message: existing.id === actor.id && existing.role !== data.role ? "Updated. Sign in again to continue." : "User updated" };
});

export const resetUserPassword = adminAction("users.manage", async (input: { id: string; password: string }, actor) => {
  const problem = passwordProblem(input.password);
  if (problem) return { ok: false, error: problem };
  const u = await db.user.update({ where: { id: input.id }, data: { passwordHash: await hashPassword(input.password) } });
  await revokeUserSessions(u.id);
  await logActivity(actor, "user.password_reset", "User", u.id, `Reset password for ${u.email}`);
  return { ok: true, message: "Password reset and existing sessions signed out" };
});

export const revokeSessions = adminAction("users.manage", async (id: string, actor) => {
  await revokeUserSessions(id);
  await logActivity(actor, "user.sessions_revoked", "User", id, "Signed out all sessions");
  return { ok: true, message: "All sessions signed out" };
});

export const deleteUser = adminAction("users.manage", async (id: string, actor) => {
  if (id === actor.id) return { ok: false, error: "You can't delete your own account." };
  const u = await db.user.findUniqueOrThrow({ where: { id } });
  if (u.role === "SUPER_ADMIN" && u.active && (await activeSuperAdmins(id)) === 0) return { ok: false, error: "There must always be at least one active Super Admin." };
  await db.user.delete({ where: { id } });
  await logActivity(actor, "user.delete", "User", id, `Deleted user ${u.email}`);
  return { ok: true, message: "User deleted" };
});

/** Any signed-in user can change their own password (requires the current password). */
export const changeOwnPassword = adminAction("dashboard.view", async (input: { current: string; next: string; confirm: string }, actor): Promise<ActionResult<{ redirect: string }>> => {
  const { current, next, confirm } = z.object({ current: z.string().min(1), next: z.string().max(200), confirm: z.string() }).parse(input);
  if (next !== confirm) return { ok: false, error: "New passwords don't match.", fieldErrors: { confirm: "Doesn't match" } };
  const problem = passwordProblem(next);
  if (problem) return { ok: false, error: problem, fieldErrors: { next: problem } };
  const u = await db.user.findUniqueOrThrow({ where: { id: actor.id } });
  if (!(await verifyPassword(u.passwordHash, current))) return { ok: false, error: "Current password is incorrect.", fieldErrors: { current: "Incorrect" } };
  await db.user.update({ where: { id: u.id }, data: { passwordHash: await hashPassword(next) } });
  await db.session.deleteMany({ where: { userId: u.id } });
  await logActivity(actor, "user.password_change", "User", u.id, "Changed own password");
  return { ok: true, message: "Password changed. Please sign in again.", data: { redirect: "/admin/login" } };
});
