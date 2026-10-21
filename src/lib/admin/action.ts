import "server-only";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { AuthError, requirePermission } from "@/lib/auth/guard";
import type { Permission } from "@/lib/auth/permissions";
import type { SessionUser } from "@/lib/auth/session";
import { logError } from "@/lib/log";

export type ActionResult<T = undefined> =
  | { ok: true; message?: string; data?: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export function zodFieldErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "form";
    out[key] ??= issue.message;
  }
  return out;
}

/**
 * Wraps every admin mutation: enforces the permission server-side, converts validation,
 * auth and unique-constraint errors into friendly results, and never leaks stack traces.
 */
export function adminAction<I, T = undefined>(permission: Permission, fn: (input: I, user: SessionUser) => Promise<ActionResult<T>>) {
  return async (input: I): Promise<ActionResult<T>> => {
    try {
      const user = await requirePermission(permission);
      return await fn(input, user);
    } catch (err) {
      if (err instanceof AuthError) return { ok: false, error: err.message };
      if (err instanceof z.ZodError) return { ok: false, error: "Please fix the highlighted fields.", fieldErrors: zodFieldErrors(err) };
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2002") {
          const target = Array.isArray(err.meta?.target) ? (err.meta?.target as string[]).join(", ") : "value";
          return { ok: false, error: `That ${target} is already in use.`, fieldErrors: { [String(Array.isArray(err.meta?.target) ? (err.meta?.target as string[])[0] : "form")]: "Already in use" } };
        }
        if (err.code === "P2003") return { ok: false, error: "This item is still referenced elsewhere and cannot be removed." };
        if (err.code === "P2025") return { ok: false, error: "This item no longer exists. Refresh the page." };
      }
      // Re-throw Next.js control-flow errors (redirect / notFound)
      if (err && typeof err === "object" && "digest" in err && String((err as { digest: unknown }).digest).startsWith("NEXT_")) throw err;
      logError("admin action failed", err);
      return { ok: false, error: "Something went wrong. Please try again." };
    }
  };
}
