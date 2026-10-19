import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";

const PATHS: Record<string, (slug: string) => string> = {
  page: (s) => (s === "home" ? "/" : `/${s}`),
  service: (s) => `/services/${s}`,
  project: (s) => `/work/${s}`,
  industry: (s) => `/industries/${s}`,
  article: (s) => `/insights/${s}`,
};

/** Enables draft mode for signed-in content editors and redirects to the item. */
export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user || !(can(user.role, "pages.manage") || can(user.role, "articles.manage"))) {
    return new Response("Unauthorised", { status: 401 });
  }
  const url = new URL(req.url);
  const type = url.searchParams.get("type") ?? "";
  const slug = url.searchParams.get("slug") ?? "";
  if (!PATHS[type] || !/^[a-z0-9-]{1,80}$/.test(slug)) return new Response("Invalid preview request", { status: 400 });
  (await draftMode()).enable();
  redirect(PATHS[type](slug));
}
