import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Plus, Quote } from "lucide-react";
import type { PageSection } from "@prisma/client";
import {
  getMediaMap,
  getPublishedArticles,
  getPublishedFaqs,
  getPublishedIndustries,
  getPublishedProjects,
  getPublishedServices,
  getPublishedTestimonials,
  getVerifiedResults,
  type Media,
  type Settings,
} from "@/lib/content/queries";
import { SECTION_TYPES, isSectionType, type LinkValue } from "@/lib/validation/sections";
import { sanitizeRichText } from "@/lib/sanitize";
import { fillTokens } from "@/lib/seo";
import { whatsappLink } from "@/lib/whatsapp";
import { isSafeHref } from "@/lib/url-safety";
import { embedUrl } from "@/lib/video";
export { embedUrl };
import { HeroSignature } from "@/components/site/HeroSignature";
import { ServiceIndex, type ServiceGroup } from "@/components/site/ServiceIndex";
import { ArticleCard, Lines, MediaImage, ProjectCard, RichText, SectionHeading } from "@/components/site/ui";
import { WhatsAppIcon } from "@/components/site/icons";

type Data = Record<string, unknown>;
type Ctx = { settings: Settings; media: Record<string, Media>; isFirst: boolean; updatedAt?: Date };

const s = (d: Data, k: string) => (typeof d[k] === "string" ? (d[k] as string) : "");
const arr = <T,>(d: Data, k: string) => (Array.isArray(d[k]) ? (d[k] as T[]) : []);
const link = (d: Data, k: string): { label: string; href: string } | null => {
  const v = d[k] as LinkValue | undefined;
  return v?.label && v?.href && isSafeHref(v.href) ? { label: v.label, href: v.href } : null;
};

/** Collects every media id referenced by the given sections so they can be fetched in one query. */
function mediaIds(sections: Pick<PageSection, "type" | "data">[]) {
  const ids: string[] = [];
  for (const sec of sections) {
    if (!isSectionType(sec.type)) continue;
    const d = (sec.data ?? {}) as Data;
    for (const f of SECTION_TYPES[sec.type].fields) {
      if (f.kind === "media" && typeof d[f.name] === "string") ids.push(d[f.name] as string);
      if (f.kind === "mediaList") ids.push(...arr<string>(d, f.name));
    }
  }
  return ids;
}

export async function SectionRenderer({
  sections,
  settings,
  updatedAt,
}: {
  sections: Pick<PageSection, "id" | "type" | "data" | "visible">[];
  settings: Settings;
  updatedAt?: Date;
}) {
  const visible = sections.filter((x) => x.visible && isSectionType(x.type));
  const media = await getMediaMap(mediaIds(visible));
  return (
    <>
      {visible.map((sec, i) => (
        <Section key={sec.id} type={sec.type} data={(sec.data ?? {}) as Data} ctx={{ settings, media, isFirst: i === 0, updatedAt }} />
      ))}
    </>
  );
}

async function Section({ type, data, ctx }: { type: string; data: Data; ctx: Ctx }) {
  switch (type) {
    case "hero":
      return <HeroSection d={data} ctx={ctx} />;
    case "positioning":
      return <PositioningSection d={data} />;
    case "services":
      return <ServicesSection d={data} />;
    case "work":
      return <WorkSection d={data} />;
    case "process":
      return <ProcessSection d={data} />;
    case "industries":
      return <IndustriesSection d={data} />;
    case "why":
      return <WhySection d={data} />;
    case "results":
      return <ResultsSection d={data} />;
    case "testimonials":
      return <TestimonialsSection d={data} />;
    case "insights":
      return <InsightsSection d={data} />;
    case "cta":
      return <CtaSection d={data} ctx={ctx} />;
    case "richText":
      return <RichTextSection d={data} ctx={ctx} />;
    case "imageText":
      return <ImageTextSection d={data} ctx={ctx} />;
    case "gallery":
      return <GallerySection d={data} ctx={ctx} />;
    case "video":
      return <VideoSection d={data} ctx={ctx} />;
    case "faq":
      return <FaqSection d={data} />;
    case "stats":
      return <StatsSection d={data} />;
    case "logoStrip":
      return <LogoStripSection d={data} ctx={ctx} />;
    case "custom":
      return <CustomSection d={data} />;
    default:
      return null;
  }
}

/* ───────────────────────── Hero ───────────────────────── */

function HeroSection({ d, ctx }: { d: Data; ctx: Ctx }) {
  const images = arr<string>(d, "media").map((id) => ctx.media[id]).filter(Boolean);
  const primary = link(d, "primaryCta");
  const secondary = link(d, "secondaryCta");
  const Tag = ctx.isFirst ? "h1" : "h2";

  if (s(d, "variant") === "signature") {
    return (
      <HeroSignature
        eyebrow={s(d, "eyebrow")}
        headline={s(d, "headline")}
        subheadline={s(d, "subheadline")}
        description={s(d, "description")}
        primaryCta={primary ?? undefined}
        secondaryCta={secondary ?? undefined}
        images={images.map((m) => ({ id: m.id, url: m.url, alt: m.alt }))}
        labels={s(d, "mediaLabels").split(",").map((x) => x.trim()).filter(Boolean)}
      />
    );
  }

  const lines = s(d, "headline").split("\n").filter(Boolean);
  return (
    <section className="relative pt-[calc(var(--header-h)+clamp(3rem,10vw,9rem))]">
      <div className="wrap">
        {s(d, "eyebrow") && (
          <p className="t-eyebrow fade-in mb-8 flex items-center gap-3" style={{ ["--d" as string]: "50ms" }}>
            <span className="signal-dot" aria-hidden />
            {s(d, "eyebrow")}
          </p>
        )}
        <Tag className="t-display max-w-[16ch]" aria-label={lines.join(" ")}>
          {lines.map((line, i) => (
            <span key={i} className="hero-line" aria-hidden>
              <span style={{ ["--i" as string]: i }}>{line}</span>
            </span>
          ))}
        </Tag>
        <div className="grid-12 mt-10 gap-y-8">
          <div className="col-span-12 lg:col-span-6 lg:col-start-7">
            {s(d, "subheadline") && <p className="t-h4 fade-in mb-5" style={{ ["--d" as string]: "350ms" }}>{s(d, "subheadline")}</p>}
            {s(d, "description") && (
              <p className="t-lead fade-in text-muted t-pretty" style={{ ["--d" as string]: "420ms" }}>
                {s(d, "description")}
              </p>
            )}
            {(primary || secondary) && (
              <div className="fade-in mt-8 flex flex-wrap gap-3" style={{ ["--d" as string]: "500ms" }}>
                {primary && (
                  <Link href={primary.href} className="btn btn-primary">
                    {primary.label} <ArrowUpRight className="btn-arrow h-4 w-4" aria-hidden />
                  </Link>
                )}
                {secondary && (
                  <Link href={secondary.href} className="btn btn-ghost">
                    {secondary.label}
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
        {images[0] && (
          <div className="mt-[clamp(3rem,8vw,7rem)]" data-reveal="mask">
            <MediaImage media={images[0]} aspect="aspect-[16/9] lg:aspect-[21/9]" sizes="100vw" priority />
          </div>
        )}
      </div>
      {!images[0] && <div className="wrap"><div className="rule mt-[clamp(3rem,8vw,6rem)]" /></div>}
    </section>
  );
}

/* ───────────────────────── Positioning ───────────────────────── */

function PositioningSection({ d }: { d: Data }) {
  const points = arr<{ title: string; text?: string }>(d, "points");
  return (
    <section className="section">
      <div className="wrap">
        <SectionHeading eyebrow={s(d, "eyebrow")} heading={s(d, "heading")} size="t-display" />
        <div className="grid-12 mt-14 gap-y-10">
          {s(d, "body") && (
            <p className="t-lead col-span-12 text-ink/85 t-pretty lg:col-span-6 lg:col-start-4" data-reveal>
              {s(d, "body")}
            </p>
          )}
        </div>
        {points.length > 0 && (
          <ol className="mt-16 grid grid-cols-1 border-t border-line sm:grid-cols-2 lg:mt-24 lg:grid-cols-4">
            {points.map((p, i) => (
              <li
                key={i}
                className="border-b border-line py-8 sm:pr-8 lg:border-b-0 lg:border-r lg:px-8 lg:first:pl-0 lg:last:border-r-0"
                data-reveal
                style={{ ["--reveal-delay" as string]: `${i * 90}ms` }}
              >
                <span className="font-display text-sm text-accent">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="t-h3 mt-6">{p.title}</h3>
                {p.text && <p className="mt-3 text-[0.9375rem] text-muted">{p.text}</p>}
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}

/* ───────────────────────── Services ───────────────────────── */

async function ServicesSection({ d }: { d: Data }) {
  const services = (await getPublishedServices()).filter((x) => x.showOnHome);
  const map = new Map<string, ServiceGroup>();
  for (const svc of services) {
    const key = svc.category || svc.title;
    if (!map.has(key)) map.set(key, { category: key, services: [], image: svc.heroMedia ? { url: svc.heroMedia.url, alt: svc.heroMedia.alt } : null });
    map.get(key)!.services.push({ slug: svc.slug, title: svc.title, shortDescription: svc.shortDescription, featuredLabel: svc.featuredLabel });
  }
  const groups = [...map.values()];
  if (!groups.length) return null;
  return (
    <section className="section bg-surface/40" id="services">
      <div className="wrap">
        <SectionHeading eyebrow={s(d, "eyebrow")} heading={s(d, "heading")} description={s(d, "description")} />
        <div className="mt-16 lg:mt-24">
          <ServiceIndex groups={groups} />
        </div>
        <div className="mt-10 flex justify-end">
          <Link href="/services" className="btn btn-ghost">
            All services <ArrowUpRight className="btn-arrow h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Work ───────────────────────── */

async function WorkSection({ d }: { d: Data }) {
  const limit = Number(d.limit ?? 4) || 4;
  const all = await getPublishedProjects();
  const featured = all.filter((p) => p.featured);
  const projects = (featured.length ? featured : all).slice(0, limit);
  return (
    <section className="section" id="work">
      <div className="wrap">
        <SectionHeading eyebrow={s(d, "eyebrow")} heading={s(d, "heading")} description={s(d, "description")} size="t-display" />
        {projects.length === 0 ? (
          <p className="mt-16 text-muted">Projects will be published here soon.</p>
        ) : (
          <div className="grid-12 mt-16 gap-y-20 lg:mt-24">
            {projects.map((p, i) => {
              const pattern = [
                "col-span-12 lg:col-span-7",
                "col-span-12 lg:col-span-4 lg:col-start-9 lg:mt-48",
                "col-span-12 lg:col-span-5 lg:col-start-2",
                "col-span-12 lg:col-span-6 lg:col-start-7 lg:-mt-24",
              ];
              return (
                <div key={p.id} className={pattern[i % pattern.length]}>
                  <ProjectCard project={p} size={i % 4 === 0 || i % 4 === 3 ? "lg" : "md"} index={i} />
                </div>
              );
            })}
          </div>
        )}
        <div className="mt-20 flex justify-center">
          <Link href="/work" className="btn btn-ghost">
            View all work <ArrowUpRight className="btn-arrow h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Process ───────────────────────── */

function ProcessSection({ d }: { d: Data }) {
  const steps = arr<{ title: string; text?: string }>(d, "steps");
  return (
    <section className="section bg-surface/40">
      <div className="wrap">
        <SectionHeading eyebrow={s(d, "eyebrow")} heading={s(d, "heading")} description={s(d, "description")} />
        <div className="relative mt-16 lg:mt-24">
          <div className="absolute left-0 right-0 top-0 h-px bg-line" aria-hidden />
          <div className="progress-line absolute left-0 right-0 top-0 h-px bg-accent" data-reveal aria-hidden />
          <ol className="grid grid-cols-1 gap-y-10 pt-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-10">
            {steps.map((st, i) => (
              <li key={i} className="relative" data-reveal style={{ ["--reveal-delay" as string]: `${i * 140}ms` }}>
                <span className="absolute -top-[2.65rem] left-0 h-3 w-3 rounded-full border border-accent bg-bg" aria-hidden />
                <p className="font-display text-sm text-muted">Stage {String(i + 1).padStart(2, "0")}</p>
                <h3 className="t-h2 mt-3">{st.title}</h3>
                {st.text && <p className="mt-4 max-w-[34ch] text-[0.9375rem] text-muted">{st.text}</p>}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Industries ───────────────────────── */

async function IndustriesSection({ d }: { d: Data }) {
  const industries = await getPublishedIndustries();
  if (!industries.length) return null;
  return (
    <section className="section">
      <div className="wrap">
        <SectionHeading eyebrow={s(d, "eyebrow")} heading={s(d, "heading")} description={s(d, "description")} />
        <div className="mt-16 grid grid-cols-1 gap-px border border-line bg-line md:grid-cols-2 lg:mt-24">
          {industries.map((ind, i) => (
            <Link key={ind.id} href={`/industries/${ind.slug}`} className="group relative flex min-h-[420px] flex-col justify-between overflow-hidden bg-bg p-6 sm:p-10">
              {ind.heroMedia && (
                <Image
                  src={ind.heroMedia.url}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover opacity-0 transition-[opacity,transform] duration-700 group-hover:scale-105 group-hover:opacity-25 group-focus-visible:opacity-25"
                />
              )}
              <div className="relative flex items-start justify-between gap-6">
                <span className="font-display text-sm text-muted">{String(i + 1).padStart(2, "0")}</span>
                <ArrowUpRight className="h-6 w-6 text-muted transition-all duration-500 group-hover:rotate-45 group-hover:text-accent" aria-hidden />
              </div>
              <div className="relative">
                <h3 className="t-h2 max-w-[14ch]">{ind.title}</h3>
                <p className="mt-4 max-w-[46ch] text-[0.9375rem] text-muted">{ind.intro}</p>
                {ind.needs.length > 0 && (
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {ind.needs.slice(0, 3).map((n) => (
                      <li key={n} className="rounded-full border border-line px-3 py-1 text-xs text-ink/80">
                        {n}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Why ───────────────────────── */

function WhySection({ d }: { d: Data }) {
  const points = arr<{ title: string; text?: string }>(d, "points");
  return (
    <section className="section bg-surface/40">
      <div className="wrap grid-12 gap-y-14">
        <div className="col-span-12 lg:col-span-5">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+3rem)]">
            {s(d, "eyebrow") && (
              <p className="t-eyebrow mb-6 flex items-center gap-3" data-reveal>
                <span className="h-px w-6 bg-accent" aria-hidden />
                {s(d, "eyebrow")}
              </p>
            )}
            <h2 className="t-h1 max-w-[14ch] t-balance" data-reveal>
              <Lines text={s(d, "heading")} />
            </h2>
            {s(d, "description") && <p className="t-lead mt-6 text-muted">{s(d, "description")}</p>}
          </div>
        </div>
        <ol className="col-span-12 lg:col-span-6 lg:col-start-7">
          {points.map((p, i) => (
            <li key={i} className="grid grid-cols-[3rem_1fr] gap-4 border-t border-line py-7 last:border-b" data-reveal>
              <span className="font-display text-sm text-accent">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="t-h4">{p.title}</h3>
                {p.text && <p className="mt-2 text-[0.9375rem] text-muted">{p.text}</p>}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ───────────────────────── Results (verified only) ───────────────────────── */

async function ResultsSection({ d }: { d: Data }) {
  const metrics = await getVerifiedResults();
  if (metrics.length) {
    return (
      <section className="section">
        <div className="wrap">
          <SectionHeading eyebrow={s(d, "eyebrow")} heading={s(d, "heading")} description={s(d, "description")} />
          <ul className="mt-16 grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {metrics.map((m) => (
              <li key={m.id} className="bg-bg p-8">
                <p className="t-display text-accent">{m.value}</p>
                <p className="mt-4 t-h4">{m.label}</p>
                {m.note && <p className="mt-2 text-sm text-muted">{m.note}</p>}
                <Link href={`/work/${m.project.slug}`} className="mt-6 inline-flex items-center gap-2 text-sm link-underline">
                  {m.project.title} <ArrowUpRight className="h-4 w-4" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  }
  const points = arr<{ title: string; text?: string }>(d, "fallbackPoints");
  if (!points.length) return null;
  return (
    <section className="section">
      <div className="wrap">
        <SectionHeading eyebrow={s(d, "eyebrow")} heading={s(d, "fallbackHeading") || s(d, "heading")} />
        <ul className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-3">
          {points.map((p, i) => (
            <li key={i} className="border-t border-line pt-6" data-reveal style={{ ["--reveal-delay" as string]: `${i * 100}ms` }}>
              <h3 className="t-h3">{p.title}</h3>
              {p.text && <p className="mt-3 text-[0.9375rem] text-muted">{p.text}</p>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ───────────────────────── Testimonials ───────────────────────── */

async function TestimonialsSection({ d }: { d: Data }) {
  const items = (await getPublishedTestimonials()).filter((t) => t.quote.trim() && t.name.trim());
  if (!items.length) return null;
  return (
    <section className="section">
      <div className="wrap">
        <SectionHeading eyebrow={s(d, "eyebrow")} heading={s(d, "heading")} />
        <ul className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {items.map((t) => (
            <li key={t.id} className="flex flex-col justify-between border border-line p-8 lg:p-10" data-reveal>
              <Quote className="h-8 w-8 text-accent" aria-hidden />
              <blockquote className="t-h4 mt-6 font-normal t-pretty">“{t.quote}”</blockquote>
              <figcaption className="mt-8 flex items-center gap-4">
                {t.photo && <Image src={t.photo.url} alt="" width={48} height={48} className="h-12 w-12 rounded-full object-cover" />}
                <span>
                  <span className="block font-medium">{t.name}</span>
                  <span className="block text-sm text-muted">{[t.role, t.company].filter(Boolean).join(", ")}</span>
                </span>
              </figcaption>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ───────────────────────── Insights ───────────────────────── */

async function InsightsSection({ d }: { d: Data }) {
  const limit = Number(d.limit ?? 3) || 3;
  const { items } = await getPublishedArticles(1, limit);
  if (!items.length) return null;
  return (
    <section className="section">
      <div className="wrap">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading eyebrow={s(d, "eyebrow")} heading={s(d, "heading")} description={s(d, "description")} className="flex-1" />
          <Link href="/insights" className="btn btn-ghost self-start lg:self-end">
            All insights <ArrowUpRight className="btn-arrow h-4 w-4" aria-hidden />
          </Link>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((a) => (
            <div key={a.id} data-reveal>
              <ArticleCard article={a} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── CTA ───────────────────────── */

function CtaSection({ d, ctx }: { d: Data; ctx: Ctx }) {
  const primary = link(d, "primaryCta");
  const wa = d.showWhatsapp ? whatsappLink(ctx.settings.whatsappNumber, ctx.settings.whatsappMessage) : null;
  return (
    <section className="section relative overflow-hidden">
      <div className="wrap">
        <div className="relative border-t border-line pt-16">
          <h2 className="t-mega max-w-[13ch] t-balance" data-reveal>
            <Lines text={s(d, "heading")} />
          </h2>
          <div className="grid-12 mt-12 gap-y-8">
            {s(d, "body") && (
              <p className="t-lead col-span-12 text-muted lg:col-span-5" data-reveal>
                {s(d, "body")}
              </p>
            )}
            <div className="col-span-12 flex flex-wrap items-start gap-3 lg:col-span-6 lg:col-start-7 lg:justify-end" data-reveal>
              {primary && (
                <Link href={primary.href} className="btn btn-primary !min-h-14 !px-7 text-lg">
                  {primary.label} <ArrowUpRight className="btn-arrow h-5 w-5" aria-hidden />
                </Link>
              )}
              {wa && (
                <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-ghost !min-h-14 !px-7 text-lg">
                  <WhatsAppIcon className="h-5 w-5" /> WhatsApp Us
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Generic blocks ───────────────────────── */

function RichTextSection({ d, ctx }: { d: Data; ctx: Ctx }) {
  const date = (ctx.updatedAt ?? new Date()).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const html = sanitizeRichText(fillTokens(s(d, "html"), ctx.settings, { date }));
  return (
    <section className={ctx.isFirst ? "pb-24 pt-[calc(var(--header-h)+clamp(3rem,8vw,7rem))]" : "section-tight"}>
      <div className="wrap grid-12">
        <div className="col-span-12 lg:col-span-8 lg:col-start-3">
          {s(d, "heading") &&
            (ctx.isFirst ? <h1 className="t-h1 mb-12">{s(d, "heading")}</h1> : <h2 className="t-h2 mb-10">{s(d, "heading")}</h2>)}
          <RichText html={html} />
        </div>
      </div>
    </section>
  );
}

function ImageTextSection({ d, ctx }: { d: Data; ctx: Ctx }) {
  const img = ctx.media[s(d, "image")];
  const right = s(d, "imagePosition") !== "left";
  const cta = link(d, "cta");
  return (
    <section className="section">
      <div className="wrap grid-12 items-center gap-y-12">
        <div className={`col-span-12 lg:col-span-6 ${right ? "lg:order-2 lg:col-start-7" : ""}`} data-reveal="mask">
          <MediaImage media={img} aspect="aspect-[4/5]" sizes="(min-width: 1024px) 50vw, 100vw" />
        </div>
        <div className={`col-span-12 lg:col-span-5 ${right ? "lg:order-1" : "lg:col-start-8"}`}>
          {s(d, "heading") && <h2 className="t-h2 mb-8" data-reveal>{s(d, "heading")}</h2>}
          <div data-reveal>
            <RichText html={sanitizeRichText(fillTokens(s(d, "html"), ctx.settings))} />
          </div>
          {cta && (
            <Link href={cta.href} className="btn btn-ghost mt-8">
              {cta.label} <ArrowUpRight className="btn-arrow h-4 w-4" aria-hidden />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

function GallerySection({ d, ctx }: { d: Data; ctx: Ctx }) {
  const imgs = arr<string>(d, "media").map((id) => ctx.media[id]).filter(Boolean);
  if (!imgs.length) return null;
  return (
    <section className="section-tight">
      <div className="wrap">
        {s(d, "heading") && <h2 className="t-h2 mb-12">{s(d, "heading")}</h2>}
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {imgs.map((m, i) => (
            <li key={m.id} className={i % 5 === 0 ? "col-span-2 row-span-2" : ""} data-reveal="mask">
              <MediaImage media={m} aspect={i % 5 === 0 ? "aspect-square" : "aspect-[4/5]"} sizes="(min-width: 768px) 33vw, 50vw" />
              {m.caption && !m.caption.startsWith("Temporary") && <p className="mt-2 text-sm text-muted">{m.caption}</p>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function VideoSection({ d, ctx }: { d: Data; ctx: Ctx }) {
  const embed = s(d, "url") ? embedUrl(s(d, "url")) : null;
  const file = ctx.media[s(d, "video")];
  if (!embed && !file) return null;
  return (
    <section className="section-tight">
      <div className="wrap">
        {s(d, "heading") && <h2 className="t-h2 mb-10">{s(d, "heading")}</h2>}
        <figure>
          <div className="relative aspect-video overflow-hidden bg-surface">
            {embed ? (
              <iframe
                src={embed}
                title={s(d, "heading") || "Video"}
                loading="lazy"
                allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                className="absolute inset-0 h-full w-full"
              />
            ) : (
              <video src={file!.url} controls preload="metadata" playsInline className="absolute inset-0 h-full w-full object-cover">
                <track kind="captions" />
              </video>
            )}
          </div>
          {s(d, "caption") && <figcaption className="mt-3 text-sm text-muted">{s(d, "caption")}</figcaption>}
        </figure>
      </div>
    </section>
  );
}

export function FaqList({ items }: { items: { id: string; question: string; answer: string }[] }) {
  return (
    <div className="border-t border-line">
      {items.map((f) => (
        <details key={f.id} className="faq group border-b border-line">
          <summary className="flex items-start justify-between gap-6 py-6">
            <span className="t-h4">{f.question}</span>
            <Plus className="faq-icon mt-1 h-5 w-5 shrink-0 text-accent transition-transform duration-300" aria-hidden />
          </summary>
          <p className="max-w-[68ch] pb-7 text-muted">{f.answer}</p>
        </details>
      ))}
    </div>
  );
}

async function FaqSection({ d }: { d: Data }) {
  const items = await getPublishedFaqs(s(d, "group") || "general");
  if (!items.length) return null;
  return (
    <section className="section-tight">
      <div className="wrap grid-12 gap-y-10">
        <h2 className="t-h2 col-span-12 lg:col-span-4">{s(d, "heading") || "FAQs"}</h2>
        <div className="col-span-12 lg:col-span-7 lg:col-start-6">
          <FaqList items={items} />
        </div>
      </div>
    </section>
  );
}

function StatsSection({ d }: { d: Data }) {
  // Never display figures unless an admin has explicitly confirmed they are verified.
  if (!d.verified) return null;
  const items = arr<{ value: string; label: string; note?: string }>(d, "items");
  if (!items.length) return null;
  return (
    <section className="section-tight">
      <div className="wrap">
        {s(d, "heading") && <h2 className="t-h2 mb-12">{s(d, "heading")}</h2>}
        <ul className="grid grid-cols-2 gap-px border border-line bg-line lg:grid-cols-4">
          {items.map((it, i) => (
            <li key={i} className="bg-bg p-6 lg:p-8">
              <p className="t-h1 text-accent">{it.value}</p>
              <p className="mt-3">{it.label}</p>
              {it.note && <p className="mt-1 text-xs text-muted">{it.note}</p>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function LogoStripSection({ d, ctx }: { d: Data; ctx: Ctx }) {
  const logos = arr<string>(d, "media").map((id) => ctx.media[id]).filter(Boolean);
  if (!logos.length) return null;
  return (
    <section className="section-tight border-y border-line">
      <div className="wrap">
        {s(d, "heading") && <h2 className="t-eyebrow mb-8 text-center">{s(d, "heading")}</h2>}
        <ul className="flex flex-wrap items-center justify-center gap-x-14 gap-y-8">
          {logos.map((m) => (
            <li key={m.id} className="relative h-10 w-32 opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0">
              <Image src={m.url} alt={m.alt} fill sizes="128px" className="object-contain" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function CustomSection({ d }: { d: Data }) {
  const items = arr<{ title: string; text?: string; link?: LinkValue }>(d, "items");
  return (
    <section className="section">
      <div className="wrap">
        <SectionHeading eyebrow={s(d, "eyebrow")} heading={s(d, "heading")} />
        <ul className="mt-14 grid grid-cols-1 gap-px border border-line bg-line md:grid-cols-2">
          {items.map((it, i) => {
            const l = it.link?.href && it.link.label && isSafeHref(it.link.href) ? it.link : null;
            return (
              <li key={i} className="bg-bg p-8 lg:p-10" data-reveal>
                <span className="font-display text-sm text-accent">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="t-h3 mt-6">{it.title}</h3>
                {it.text && <p className="mt-3 text-muted">{it.text}</p>}
                {l && (
                  <Link href={l.href!} className="mt-6 inline-flex items-center gap-2 link-underline">
                    {l.label} <ArrowUpRight className="h-4 w-4" aria-hidden />
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
