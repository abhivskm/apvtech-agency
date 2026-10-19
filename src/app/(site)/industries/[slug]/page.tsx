import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { getIndustryForPreview, getPublishedIndustries, getPublishedIndustry, getSettings } from "@/lib/content/queries";
import { withPreview } from "@/lib/content/preview";
import { notFoundOrRedirect } from "@/lib/content/redirects";
import { buildMetadata } from "@/lib/seo";
import { sanitizeRichText } from "@/lib/sanitize";
import { whatsappLink } from "@/lib/whatsapp";
import { Breadcrumbs, MediaImage, RichText } from "@/components/site/ui";
import { WhatsAppIcon } from "@/components/site/icons";

export const revalidate = 300;
export const dynamicParams = true;

type Props = { params: Promise<{ slug: string }> };
const load = (slug: string) => withPreview(slug, getPublishedIndustry, getIndustryForPreview);

export async function generateStaticParams() {
  return (await getPublishedIndustries()).map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const ind = await load(slug);
  if (!ind) return {};
  return buildMetadata({
    ogLabel: "Industries",
    title: ind.title,
    seoTitle: ind.seoTitle,
    description: ind.seoDescription || ind.intro,
    path: `/industries/${ind.slug}`,
    image: ind.heroMedia,
    canonicalUrl: ind.canonicalUrl,
    noindex: ind.noindex || ind.status !== "PUBLISHED",
  });
}

export default async function IndustryPage({ params }: Props) {
  const { slug } = await params;
  const [ind, settings] = await Promise.all([load(slug), getSettings()]);
  if (!settings) notFound();
  if (!ind) return notFoundOrRedirect(`/industries/${slug}`);
  const services = ind.services.map((s) => s.service).filter((s) => s.status === "PUBLISHED");
  const wa = whatsappLink(settings.whatsappNumber, `Hi, I run a business in ${ind.shortTitle || ind.title} and would like to discuss digital services.`);

  return (
    <>
      <section className="pt-[calc(var(--header-h)+clamp(2.5rem,7vw,6rem))]">
        <div className="wrap">
          <Breadcrumbs items={[{ name: "Industries", path: "/industries" }, { name: ind.title, path: `/industries/${ind.slug}` }]} settings={settings} />
          <h1 className="t-display mt-12 max-w-[16ch] t-balance">
            <span className="hero-line">
              <span>{ind.title}</span>
            </span>
          </h1>
          <div className="grid-12 mt-10">
            <p className="t-lead fade-in col-span-12 text-muted lg:col-span-6 lg:col-start-7">{ind.intro}</p>
          </div>
          <div className="mt-[clamp(3rem,7vw,6rem)]" data-reveal="mask">
            <MediaImage media={ind.heroMedia} aspect="aspect-[16/9] lg:aspect-[21/9]" sizes="100vw" priority />
          </div>
        </div>
      </section>

      {ind.needs.length > 0 && (
        <section className="section">
          <div className="wrap grid-12 gap-y-10">
            <h2 className="t-h2 col-span-12 lg:col-span-4">What businesses like yours usually need</h2>
            <ol className="col-span-12 grid gap-px border border-line bg-line sm:grid-cols-2 lg:col-span-8">
              {ind.needs.map((n, i) => (
                <li key={i} className="bg-bg p-6 lg:p-8" data-reveal>
                  <span className="font-display text-sm text-accent">{String(i + 1).padStart(2, "0")}</span>
                  <p className="t-h4 mt-4 font-normal">{n}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {ind.body && (
        <section className="section-tight">
          <div className="wrap grid-12">
            <div className="col-span-12 lg:col-span-7 lg:col-start-4">
              <RichText html={sanitizeRichText(ind.body)} />
            </div>
          </div>
        </section>
      )}

      {services.length > 0 && (
        <section className="section-tight">
          <div className="wrap">
            <h2 className="t-eyebrow mb-6">Relevant services</h2>
            <ul className="grid grid-cols-1 gap-px border border-line bg-line md:grid-cols-2">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link href={`/services/${s.slug}`} className="group flex h-full items-start justify-between gap-6 bg-bg p-6 transition-colors hover:bg-surface lg:p-8">
                    <span>
                      <span className="t-h3 block">{s.title}</span>
                      <span className="mt-3 block text-[0.9375rem] text-muted">{s.shortDescription}</span>
                    </span>
                    <ArrowUpRight className="h-6 w-6 shrink-0 text-muted group-hover:text-accent" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {ind.projects.length > 0 && (
        <section className="section-tight">
          <div className="wrap">
            <h2 className="t-h2">Related work</h2>
            <ul className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
              {ind.projects.map((p) => (
                <li key={p.slug}>
                  <Link href={`/work/${p.slug}`} className="group block">
                    <div className="relative">
                      <MediaImage media={p.cover} aspect="aspect-[4/5]" sizes="(min-width: 768px) 33vw, 100vw" />
                      {p.isConcept && <span className="tag-concept absolute left-3 top-3">Concept</span>}
                    </div>
                    <h3 className="t-h4 mt-4 group-hover:text-accent">{p.title}</h3>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="section">
        <div className="wrap grid-12 items-end gap-y-8 border-t border-line pt-14">
          <h2 className="t-h1 col-span-12 max-w-[18ch] lg:col-span-7">Let&apos;s plan what your business needs next.</h2>
          <div className="col-span-12 flex flex-wrap gap-3 lg:col-span-5 lg:justify-end">
            <Link href="/contact" className="btn btn-primary">
              {settings.defaultCtaLabel} <ArrowUpRight className="btn-arrow h-4 w-4" aria-hidden />
            </Link>
            {wa && (
              <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                <WhatsAppIcon className="h-4 w-4" /> WhatsApp
              </a>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
