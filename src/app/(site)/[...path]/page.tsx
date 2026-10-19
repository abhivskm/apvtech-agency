import { CmsPage, loadPage, pageMetadata } from "@/components/site/CmsPage";
import { getPublishedCustomPageSlugs } from "@/lib/content/queries";
import { notFoundOrRedirect } from "@/lib/content/redirects";
import { RESERVED_PAGE_SLUGS } from "@/lib/slug";

export const revalidate = 300;
export const dynamicParams = true;

type Props = { params: Promise<{ path: string[] }> };

export async function generateStaticParams() {
  return (await getPublishedCustomPageSlugs()).map((p) => ({ path: [p.slug] }));
}

export async function generateMetadata({ params }: Props) {
  const { path } = await params;
  if (path.length !== 1 || RESERVED_PAGE_SLUGS.has(path[0])) return {};
  return pageMetadata(path[0], `/${path[0]}`);
}

/**
 * Catch-all for admin-created pages (Admin → Pages) and managed redirects.
 * Anything else falls through to the 404 page.
 */
export default async function CatchAllPage({ params }: Props) {
  const { path } = await params;
  const full = "/" + path.map(decodeURIComponent).join("/");
  if (path.length === 1 && !RESERVED_PAGE_SLUGS.has(path[0])) {
    const page = await loadPage(path[0]);
    if (page && !page.isSystem) return <CmsPage slug={path[0]} />;
  }
  return notFoundOrRedirect(full);
}
