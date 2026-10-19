import "server-only";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import { getRedirects } from "@/lib/content/queries";
import { normalisePath } from "@/lib/url-safety";

/** Look up an admin-managed redirect for a path, following at most one hop. */
export async function findRedirect(path: string) {
  const from = normalisePath(path);
  const all = await getRedirects();
  return all.find((r) => normalisePath(r.fromPath) === from) ?? null;
}

/** Use instead of notFound() in public routes so managed redirects take precedence over 404s. */
export async function notFoundOrRedirect(path: string): Promise<never> {
  const r = await findRedirect(path);
  if (r && normalisePath(r.toPath) !== normalisePath(path)) {
    if (r.permanent) permanentRedirect(r.toPath);
    redirect(r.toPath);
  }
  notFound();
}
