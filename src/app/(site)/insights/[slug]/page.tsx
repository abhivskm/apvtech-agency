import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { getAllPublishedArticleSlugs, getArticleForPreview, getPublishedArticle, getPublishedArticles, getSettings } from "@/lib/content/queries";
import { withPreview } from "@/lib/content/preview";
import { notFoundOrRedirect } from "@/lib/content/redirects";
import { articleJsonLd, buildMetadata } from "@/lib/seo";
import { sanitizeRichText } from "@/lib/sanitize";
import { ArticleCard, Breadcrumbs, MediaImage, RichText } from "@/components/site/ui";
import { JsonLd } from "@/components/site/JsonLd";

export const revalidate = 300;
export const dynamicParams = true;

type Props = { params: Promise<{ slug: string }> };
const load = (slug: string) => withPreview(slug, getPublishedArticle, getArticleForPreview);

export async function generateStaticParams() {
  return (await getAllPublishedArticleSlugs()).map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const a = await load(slug);
  if (!a) return {};
  return buildMetadata({
    title: a.title,
    seoTitle: a.seoTitle,
    description: a.seoDescription || a.excerpt,
    path: `/insights/${a.slug}`,
    image: a.ogImage ?? a.cover,
    canonicalUrl: a.canonicalUrl,
    noindex: a.noindex || a.status !== "PUBLISHED",
    type: "article",
    publishedTime: a.publishedAt,
    modifiedTime: a.updatedAt,
  });
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const [a, settings, latest] = await Promise.all([load(slug), getSettings(), getPublishedArticles(1, 4)]);
  if (!settings) notFound();
  if (!a) return notFoundOrRedirect(`/insights/${slug}`);
  const more = latest.items.filter((x) => x.slug !== a.slug).slice(0, 3);

  return (
    <article>
      <JsonLd data={articleJsonLd(a, settings)} />
      <header className="pt-[calc(var(--header-h)+clamp(2.5rem,7vw,6rem))]">
        <div className="wrap">
          <Breadcrumbs items={[{ name: "Insights", path: "/insights" }, { name: a.title, path: `/insights/${a.slug}` }]} settings={settings} />
          <div className="grid-12 mt-12">
            <div className="col-span-12 lg:col-span-9">
              <p className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
                {a.category && (
                  <Link href={`/insights?category=${a.category.slug}`} className="chip !min-h-8 !py-1">
                    {a.category.name}
                  </Link>
                )}
                {a.publishedAt && (
                  <time dateTime={a.publishedAt.toISOString()}>
                    {a.publishedAt.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                  </time>
                )}
                <span>{a.readingMinutes} min read</span>
              </p>
              <h1 className="t-h1 mt-6 t-balance">{a.title}</h1>
              <p className="t-lead mt-6 max-w-[56ch] text-muted">{a.excerpt}</p>
              {a.authorName && (
                <p className="mt-6 text-sm">
                  By {a.authorName}
                  {a.authorRole ? <span className="text-muted">, {a.authorRole}</span> : null}
                </p>
              )}
            </div>
          </div>
          {a.cover && (
            <div className="mt-14" data-reveal="mask">
              <MediaImage media={a.cover} aspect="aspect-[16/9]" sizes="100vw" priority />
            </div>
          )}
        </div>
      </header>

      <div className="section-tight">
        <div className="wrap grid-12">
          <div className="col-span-12 lg:col-span-7 lg:col-start-4">
            <RichText html={sanitizeRichText(a.body)} />
            {a.tags.length > 0 && (
              <ul className="mt-12 flex flex-wrap gap-2 border-t border-line pt-8" aria-label="Tags">
                {a.tags.map((t) => (
                  <li key={t.tagId} className="rounded-full border border-line px-3 py-1 text-sm text-muted">
                    #{t.tag.name}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-14 border border-line p-8">
              <p className="t-h3">Want help putting this into practice?</p>
              <p className="mt-3 text-muted">Tell us about your business and we&apos;ll suggest practical next steps.</p>
              <Link href="/contact" className="btn btn-primary mt-6">
                {settings.defaultCtaLabel} <ArrowUpRight className="btn-arrow h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {more.length > 0 && (
        <section className="section">
          <div className="wrap">
            <h2 className="t-h2">Keep reading</h2>
            <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {more.map((m) => (
                <ArticleCard key={m.id} article={m} />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
