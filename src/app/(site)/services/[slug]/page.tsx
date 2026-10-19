import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Check } from "lucide-react";
import { getPublishedService, getPublishedServices, getServiceForPreview, getSettings } from "@/lib/content/queries";
import { withPreview } from "@/lib/content/preview";
import { notFoundOrRedirect } from "@/lib/content/redirects";
import { buildMetadata, serviceJsonLd } from "@/lib/seo";
import { sanitizeRichText } from "@/lib/sanitize";
import { serviceWhatsappMessage, whatsappLink } from "@/lib/whatsapp";
import { isSafeHref } from "@/lib/url-safety";
import { Breadcrumbs, MediaImage, RichText } from "@/components/site/ui";
import { FaqList } from "@/components/site/sections";
import { JsonLd } from "@/components/site/JsonLd";
import { WhatsAppIcon } from "@/components/site/icons";

export const revalidate = 300;
export const dynamicParams = true;

type Props = { params: Promise<{ slug: string }> };

const load = (slug: string) => withPreview(slug, getPublishedService, getServiceForPreview);

export async function generateStaticParams() {
  return (await getPublishedServices()).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const svc = await load(slug);
  if (!svc) return {};
  return buildMetadata({
    title: svc.title,
    seoTitle: svc.seoTitle,
    description: svc.seoDescription || svc.shortDescription,
    path: `/services/${svc.slug}`,
    image: svc.ogImage ?? svc.heroMedia,
    canonicalUrl: svc.canonicalUrl,
    noindex: svc.noindex || svc.status !== "PUBLISHED",
  });
}

function ListBlock({ title, items, numbered = false }: { title: string; items: string[]; numbered?: boolean }) {
  if (!items.length) return null;
  return (
    <div>
      <h2 className="t-eyebrow mb-6">{title}</h2>
      <ul className="border-t border-line">
        {items.map((it, i) => (
          <li key={i} className="flex gap-4 border-b border-line py-4">
            {numbered ? (
              <span className="w-6 shrink-0 font-display text-sm text-accent">{String(i + 1).padStart(2, "0")}</span>
            ) : (
              <Check className="mt-1 h-4 w-4 shrink-0 text-accent" aria-hidden />
            )}
            <span className="text-ink/90">{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const [svc, settings] = await Promise.all([load(slug), getSettings()]);
  if (!settings) notFound();
  if (!svc) return notFoundOrRedirect(`/services/${slug}`);

  const process = (Array.isArray(svc.process) ? svc.process : []) as { title: string; description?: string }[];
  const related = svc.relatedTo.map((r) => r.to).filter((r) => r.status === "PUBLISHED");
  const now = new Date();
  const projects = svc.projects
    .map((p) => p.project)
    .filter((p) => p.status === "PUBLISHED" && (!p.publishedAt || p.publishedAt <= now))
    .slice(0, 3);
  const wa = whatsappLink(settings.whatsappNumber, svc.whatsappMessage || serviceWhatsappMessage(settings.whatsappMessage, svc.title));
  const ctaHref = svc.ctaHref && isSafeHref(svc.ctaHref) ? svc.ctaHref : `/contact?service=${encodeURIComponent(svc.slug)}`;
  const ctaLabel = svc.ctaLabel || settings.defaultCtaLabel;

  return (
    <>
      <JsonLd data={serviceJsonLd(svc, settings)} />
      <section className="pt-[calc(var(--header-h)+clamp(2.5rem,7vw,6rem))]">
        <div className="wrap">
          <Breadcrumbs items={[{ name: "Services", path: "/services" }, { name: svc.title, path: `/services/${svc.slug}` }]} settings={settings} />
          <p className="t-eyebrow mt-12 flex items-center gap-3">
            <span className="signal-dot" aria-hidden /> {svc.title}
          </p>
          <h1 className="t-display mt-6 max-w-[17ch] t-balance">
            <span className="hero-line">
              <span>{svc.heroHeadline}</span>
            </span>
          </h1>
          <div className="grid-12 mt-10 gap-y-8">
            <p className="t-lead fade-in col-span-12 text-muted lg:col-span-6 lg:col-start-7" style={{ ["--d" as string]: "300ms" }}>
              {svc.heroText || svc.shortDescription}
            </p>
            <div className="fade-in col-span-12 flex flex-wrap gap-3 lg:col-span-6 lg:col-start-7" style={{ ["--d" as string]: "400ms" }}>
              <Link href={ctaHref} className="btn btn-primary">
                {ctaLabel} <ArrowUpRight className="btn-arrow h-4 w-4" aria-hidden />
              </Link>
              {wa && (
                <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                  <WhatsAppIcon className="h-4 w-4" /> Ask on WhatsApp
                </a>
              )}
            </div>
          </div>
          {svc.heroMedia && (
            <div className="mt-[clamp(3rem,7vw,6rem)]" data-reveal="mask">
              <MediaImage media={svc.heroMedia} aspect="aspect-[16/9] lg:aspect-[21/9]" sizes="100vw" priority />
            </div>
          )}
        </div>
      </section>

      {svc.problems.length > 0 && (
        <section className="section">
          <div className="wrap grid-12 gap-y-10">
            <h2 className="t-h2 col-span-12 lg:col-span-4">Sound familiar?</h2>
            <ul className="col-span-12 grid gap-px border border-line bg-line sm:grid-cols-2 lg:col-span-8">
              {svc.problems.map((p, i) => (
                <li key={i} className="bg-bg p-6 lg:p-8" data-reveal style={{ ["--reveal-delay" as string]: `${i * 60}ms` }}>
                  <span className="font-display text-sm text-muted">{String(i + 1).padStart(2, "0")}</span>
                  <p className="t-h4 mt-4 font-normal">{p}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {svc.body && (
        <section className="section-tight">
          <div className="wrap grid-12">
            <div className="col-span-12 lg:col-span-7 lg:col-start-4">
              <RichText html={sanitizeRichText(svc.body)} />
            </div>
          </div>
        </section>
      )}

      <section className="section-tight">
        <div className="wrap grid grid-cols-1 gap-14 lg:grid-cols-2">
          <ListBlock title="What you get" items={svc.deliverables} />
          <ListBlock title="Why it helps" items={svc.benefits} />
        </div>
      </section>

      {process.length > 0 && (
        <section className="section bg-surface/40">
          <div className="wrap">
            <h2 className="t-h1 max-w-[16ch]">How it works</h2>
            <ol className="mt-14 grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
              {process.map((st, i) => (
                <li key={i} className="bg-bg p-6 lg:p-8" data-reveal style={{ ["--reveal-delay" as string]: `${i * 90}ms` }}>
                  <span className="font-display text-sm text-accent">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="t-h3 mt-6">{st.title}</h3>
                  {st.description && <p className="mt-3 text-[0.9375rem] text-muted">{st.description}</p>}
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {projects.length > 0 && (
        <section className="section">
          <div className="wrap">
            <h2 className="t-h2">Related work</h2>
            <ul className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
              {projects.map((p) => (
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

      {svc.faqs.length > 0 && (
        <section className="section-tight">
          <div className="wrap grid-12 gap-y-10">
            <h2 className="t-h2 col-span-12 lg:col-span-4">Questions</h2>
            <div className="col-span-12 lg:col-span-7 lg:col-start-6">
              <FaqList items={svc.faqs} />
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="wrap">
          <div className="grid-12 items-end gap-y-10 border-t border-line pt-14">
            <h2 className="t-h1 col-span-12 max-w-[16ch] lg:col-span-7">Let&apos;s talk about {svc.title.toLowerCase()}.</h2>
            <div className="col-span-12 flex flex-wrap gap-3 lg:col-span-5 lg:justify-end">
              <Link href={ctaHref} className="btn btn-primary">
                {ctaLabel} <ArrowUpRight className="btn-arrow h-4 w-4" aria-hidden />
              </Link>
              {wa && (
                <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                  <WhatsAppIcon className="h-4 w-4" /> WhatsApp
                </a>
              )}
            </div>
          </div>
          {related.length > 0 && (
            <div className="mt-20">
              <h2 className="t-eyebrow mb-6">Related services</h2>
              <ul className="grid grid-cols-1 gap-px border border-line bg-line md:grid-cols-3">
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link href={`/services/${r.slug}`} className="group flex h-full flex-col justify-between gap-6 bg-bg p-6 transition-colors hover:bg-surface">
                      <span className="t-h4">{r.title}</span>
                      <span className="text-sm text-muted">{r.shortDescription}</span>
                      <ArrowUpRight className="h-5 w-5 text-muted group-hover:text-accent" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
