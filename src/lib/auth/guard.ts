import "server-only";
import { redirect } from "next/navigation";
import { getSessionUser, type SessionUser } from "@/lib/auth/session";
import { can, type Permission } from "@/lib/auth/permissions";

export class AuthError extends Error {
  constructor(
    message: string,
    public status: 401 | 403,
  ) {
    super(message);
  }
}

/** For server actions and route handlers: throws AuthError instead of redirecting. */
export async function requirePermission(permission: Permission): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new AuthError("You must be signed in.", 401);
  if (!can(user.role, permission)) throw new AuthError("You do not have permission to do that.", 403);
  return user;
}

/** For admin pages: redirects to login, or renders a forbidden notice via the `forbidden` flag. */
export async function requirePagePermission(permission: Permission): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");
  if (!can(user.role, permission)) redirect("/admin?forbidden=1");
  return user;
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");
  return user;
}
