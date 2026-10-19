import "server-only";
import { AuthError, requirePermission } from "@/lib/auth/guard";
import type { Permission } from "@/lib/auth/permissions";
import type { SessionUser } from "@/lib/auth/session";

/**
 * For admin route handlers (non-server-action endpoints): verify same-origin for unsafe methods
 * (CSRF defence in addition to SameSite=Lax cookies) and enforce the permission.
 */
export async function guardRoute(req: Request, permission: Permission): Promise<SessionUser | Response> {
  if (req.method !== "GET" && req.method !== "HEAD") {
    const origin = req.headers.get("origin");
    const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
    if (!origin || !host || new URL(origin).host !== host) {
      return Response.json({ error: "Cross-site request blocked" }, { status: 403 });
    }
  }
  try {
    return await requirePermission(permission);
  } catch (err) {
    if (err instanceof AuthError) return Response.json({ error: err.message }, { status: err.status });
    throw err;
  }
}
