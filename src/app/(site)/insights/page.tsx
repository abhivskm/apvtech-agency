import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getArticleCategories, getPublishedArticles, getSettings } from "@/lib/content/queries";
import { loadPage, pageMetadata, splitSections } from "@/components/site/CmsPage";
import { SectionRenderer } from "@/components/site/sections";
import { ArticleCard, Breadcrumbs, EmptyState } from "@/components/site/ui";

const PER_PAGE = 9;

type Props = { searchParams: Promise<{ page?: string; category?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { page, category } = await searchParams;
  const base = await pageMetadata("insights", "/insights");
  // Filtered / paginated listings are not indexed separately; canonical points to the main listing.
  if ((page && page !== "1") || category) return { ...base, robots: { index: false, follow: true } };
  return base;
}

export default async function InsightsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const current = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const category = sp.category && /^[a-z0-9-]{1,80}$/.test(sp.category) ? sp.category : undefined;
  const [page, settings, list, categories] = await Promise.all([
    loadPage("insights"),
    getSettings(),
    getPublishedArticles(current, PER_PAGE, category),
    getArticleCategories(),
  ]);
  if (!settings) notFound();
  if (current > 1 && current > list.pages) notFound();
  const { head, tail } = splitSections(page?.sections ?? []);
  const qs = (p: number, c?: string) => {
    const params = new URLSearchParams();
    if (c) params.set("category", c);
    if (p > 1) params.set("page", String(p));
    const s = params.toString();
    return `/insights${s ? `?${s}` : ""}`;
  };

  return (
    <>
      {head.length > 0 && <SectionRenderer sections={head} settings={settings} />}
      <section className="section-tight">
        <div className="wrap">
          <div className="mb-10">
            <Breadcrumbs items={[{ name: "Insights", path: "/insights" }]} settings={settings} />
          </div>
          {categories.length > 0 && (
            <nav aria-label="Article categories" className="mb-14 flex flex-wrap gap-2">
              <Link href="/insights" className="chip" aria-current={!category ? "page" : undefined}>
                All
              </Link>
              {categories.map((c) => (
                <Link key={c.id} href={qs(1, c.slug)} className="chip" aria-current={category === c.slug ? "page" : undefined}>
                  {c.name}
                </Link>
              ))}
            </nav>
          )}

          {list.items.length === 0 ? (
            <EmptyState title="No articles yet" text="New articles are on the way." />
          ) : (
            <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
              {list.items.map((a, i) => (
                <ArticleCard key={a.id} article={a} priority={i < 3} />
              ))}
            </div>
          )}

          {list.pages > 1 && (
            <nav aria-label="Pagination" className="mt-20 flex items-center justify-between border-t border-line pt-8">
              {current > 1 ? (
                <Link href={qs(current - 1, category)} className="btn btn-ghost" rel="prev">
                  Previous
                </Link>
              ) : (
                <span />
              )}
              <p className="text-sm text-muted">
                Page {current} of {list.pages}
              </p>
              {current < list.pages ? (
                <Link href={qs(current + 1, category)} className="btn btn-ghost" rel="next">
                  Next
                </Link>
              ) : (
                <span />
              )}
            </nav>
          )}
        </div>
      </section>
      {tail.length > 0 && <SectionRenderer sections={tail} settings={settings} />}
    </>
  );
}
