import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Info } from "lucide-react";
import { getProjectForPreview, getPublishedProject, getPublishedProjects, getSettings } from "@/lib/content/queries";
import { withPreview } from "@/lib/content/preview";
import { notFoundOrRedirect } from "@/lib/content/redirects";
import { buildMetadata } from "@/lib/seo";
import { sanitizeRichText } from "@/lib/sanitize";
import { Breadcrumbs, MediaImage, RichText } from "@/components/site/ui";
import { embedUrl } from "@/lib/video";

export const revalidate = 300;
export const dynamicParams = true;

type Props = { params: Promise<{ slug: string }> };
const load = (slug: string) => withPreview(slug, getPublishedProject, getProjectForPreview);

export async function generateStaticParams() {
  return (await getPublishedProjects()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const p = await load(slug);
  if (!p) return {};
  return buildMetadata({
    ogLabel: "Work",
    title: p.title,
    seoTitle: p.seoTitle,
    description: p.seoDescription || p.summary,
    path: `/work/${p.slug}`,
    image: p.ogImage ?? p.cover,
    canonicalUrl: p.canonicalUrl,
    noindex: p.noindex || p.status !== "PUBLISHED",
  });
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const [p, settings, all] = await Promise.all([load(slug), getSettings(), getPublishedProjects()]);
  if (!settings) notFound();
  if (!p) return notFoundOrRedirect(`/work/${slug}`);

  const idx = all.findIndex((x) => x.slug === p.slug);
  const next = all.length > 1 ? all[(idx + 1) % all.length] : null;
  const video = p.videoUrl ? embedUrl(p.videoUrl) : null;
  const services = p.services.filter((s) => s.service.status === "PUBLISHED");

  const facts = [
    p.client && !p.isConcept ? { k: "Client", v: p.client } : null,
    p.industry ? { k: "Industry", v: p.industry.title, href: `/industries/${p.industry.slug}` } : null,
    p.year ? { k: "Year", v: String(p.year) } : null,
    p.categories.length ? { k: "Type", v: p.categories.map((c) => c.category.name).join(", ") } : null,
  ].filter(Boolean) as { k: string; v: string; href?: string }[];

  return (
    <article>
      <header className="pt-[calc(var(--header-h)+clamp(2.5rem,7vw,6rem))]">
        <div className="wrap">
          <Breadcrumbs items={[{ name: "Work", path: "/work" }, { name: p.title, path: `/work/${p.slug}` }]} settings={settings} />
          {p.isConcept && (
            <p className="mt-10 inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-sm text-muted">
              <Info className="h-4 w-4 text-accent" aria-hidden />
              Concept project — self-initiated work, not commissioned by a client.
            </p>
          )}
          <h1 className="t-display mt-8 max-w-[18ch] t-balance">
            <span className="hero-line">
              <span>{p.title}</span>
            </span>
          </h1>
          <div className="grid-12 mt-10 gap-y-10">
            <p className="t-lead fade-in col-span-12 text-muted lg:col-span-6" style={{ ["--d" as string]: "300ms" }}>
              {p.summary}
            </p>
            <dl className="col-span-12 grid grid-cols-2 gap-6 border-t border-line pt-6 text-sm lg:col-span-5 lg:col-start-8">
              {facts.map((f) => (
                <div key={f.k}>
                  <dt className="text-muted">{f.k}</dt>
                  <dd className="mt-1">{f.href ? <Link href={f.href} className="link-underline">{f.v}</Link> : f.v}</dd>
                </div>
              ))}
              {services.length > 0 && (
                <div className="col-span-2">
                  <dt className="text-muted">Services</dt>
                  <dd className="mt-2 flex flex-wrap gap-2">
                    {services.map((s) => (
                      <Link key={s.service.slug} href={`/services/${s.service.slug}`} className="chip min-h-8! py-1! text-sm">
                        {s.service.title}
                      </Link>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          </div>
          <div className="mt-[clamp(3rem,7vw,6rem)]" data-reveal="mask">
            <MediaImage media={p.cover} aspect="aspect-[16/10] lg:aspect-[21/10]" sizes="100vw" priority />
          </div>
        </div>
      </header>

      {[
        { title: "The challenge", text: p.challenge },
        { title: "Our approach", text: p.solution },
        { title: "Outcome", text: p.outcome },
      ]
        .filter((b) => b.text)
        .map((b) => (
          <section key={b.title} className="section-tight">
            <div className="wrap grid-12 gap-y-6">
              <h2 className="t-h3 col-span-12 lg:col-span-3">{b.title}</h2>
              <p className="t-lead col-span-12 text-ink/85 lg:col-span-7 lg:col-start-5" data-reveal>
                {b.text}
              </p>
            </div>
          </section>
        ))}

      {p.metrics.length > 0 && (
        <section className="section-tight">
          <div className="wrap">
            <h2 className="t-eyebrow mb-6">Verified results</h2>
            <ul className="grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
              {p.metrics.map((m) => (
                <li key={m.id} className="bg-bg p-6">
                  <p className="t-h1 text-accent">{m.value}</p>
                  <p className="mt-3">{m.label}</p>
                  {m.note && <p className="mt-1 text-xs text-muted">{m.note}</p>}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {p.description && p.description.replace(/<[^>]+>/g, "").trim() !== p.summary.trim() && (
        <section className="section-tight">
          <div className="wrap grid-12">
            <div className="col-span-12 lg:col-span-7 lg:col-start-5">
              <RichText html={sanitizeRichText(p.description)} />
            </div>
          </div>
        </section>
      )}

      {video && (
        <section className="section-tight">
          <div className="wrap">
            <div className="relative aspect-video overflow-hidden bg-surface">
              <iframe src={video} title={`${p.title} video`} loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" className="absolute inset-0 h-full w-full" />
            </div>
          </div>
        </section>
      )}

      {p.gallery.length > 0 && (
        <section className="section-tight">
          <div className="wrap">
            <h2 className="sr-only">Gallery</h2>
            <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {p.gallery.map((g, i) => (
                <li key={g.id} className={i % 3 === 0 ? "md:col-span-2" : ""} data-reveal="mask">
                  <MediaImage media={g.media} aspect={i % 3 === 0 ? "aspect-[16/9]" : "aspect-[4/5]"} sizes={i % 3 === 0 ? "100vw" : "(min-width: 768px) 50vw, 100vw"} />
                  {g.media.credit && <p className="mt-2 text-xs text-muted">Photo: {g.media.credit}</p>}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {next && next.slug !== p.slug && (
        <section className="section">
          <div className="wrap">
            <Link href={`/work/${next.slug}`} className="group block border-t border-line pt-10">
              <p className="t-eyebrow">Next project</p>
              <p className="t-display mt-6 flex items-end justify-between gap-6 transition-colors group-hover:text-accent">
                <span className="max-w-[16ch] t-balance">{next.title}</span>
                <ArrowUpRight className="h-[6vw] max-h-24 w-[6vw] max-w-24 shrink-0 transition-transform duration-500 group-hover:-translate-y-2 group-hover:translate-x-2" aria-hidden />
              </p>
            </Link>
          </div>
        </section>
      )}
    </article>
  );
}
