import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import type { ArticleCard as ArticleCardData, Media, ProjectCard as ProjectCardData } from "@/lib/content/queries";
import { JsonLd } from "@/components/site/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo";
import type { Settings } from "@/lib/content/queries";

export function Lines({ text }: { text: string }) {
  const parts = text.split("\n");
  return (
    <>
      {parts.map((p, i) => (
        <span key={i}>
          {p}
          {i < parts.length - 1 && <br className="hidden md:block" />}
          {i < parts.length - 1 && <span className="md:hidden"> </span>}
        </span>
      ))}
    </>
  );
}

export function SectionHeading({
  eyebrow,
  heading,
  description,
  as: Tag = "h2",
  className = "",
  size = "t-h1",
}: {
  eyebrow?: string;
  heading?: string;
  description?: string;
  as?: "h1" | "h2";
  className?: string;
  size?: string;
}) {
  return (
    <div className={`grid-12 gap-y-6 ${className}`}>
      {eyebrow && (
        <p className="t-eyebrow col-span-12 flex items-center gap-3 lg:col-span-3 lg:pt-3" data-reveal>
          <span className="h-px w-6 bg-accent" aria-hidden />
          {eyebrow}
        </p>
      )}
      <div className={`col-span-12 ${eyebrow ? "lg:col-span-9" : "lg:col-span-10"}`}>
        {heading && (
          <Tag className={`${size} max-w-[18ch] t-balance`} data-reveal>
            <Lines text={heading} />
          </Tag>
        )}
        {description && (
          <p className="t-lead mt-6 max-w-[52ch] text-muted t-pretty" data-reveal style={{ ["--reveal-delay" as string]: "120ms" }}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

export function MediaImage({
  media,
  sizes,
  className = "",
  priority = false,
  aspect = "aspect-[3/2]",
}: {
  media: Pick<Media, "url" | "alt"> | null | undefined;
  sizes: string;
  className?: string;
  priority?: boolean;
  aspect?: string;
}) {
  return (
    <div className={`frame ${aspect} ${className}`}>
      {media ? (
        <Image src={media.url} alt={media.alt} fill sizes={sizes} priority={priority} className="object-cover" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-muted" role="img" aria-label="Image coming soon">
          <span className="signal-dot" aria-hidden />
        </div>
      )}
    </div>
  );
}

export function ProjectCard({ project, size = "md", index }: { project: ProjectCardData; size?: "lg" | "md"; index?: number }) {
  const cats = project.categories.map((c) => c.category.name);
  return (
    <article className="group relative">
      <Link href={`/work/${project.slug}`} className="block" aria-label={`${project.title}${project.isConcept ? " (concept project)" : ""}`}>
        <div className="relative" data-reveal="mask">
          <MediaImage
            media={project.cover}
            aspect={size === "lg" ? "aspect-[4/3]" : "aspect-[4/5]"}
            sizes={size === "lg" ? "(min-width: 1024px) 58vw, 100vw" : "(min-width: 1024px) 40vw, 100vw"}
          />
          {project.isConcept && (
            <span className="tag-concept absolute left-3 top-3">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
              Concept
            </span>
          )}
          <span className="absolute bottom-3 right-3 flex h-11 w-11 translate-y-2 items-center justify-center rounded-full bg-accent text-on-accent opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100" aria-hidden>
            <ArrowUpRight className="h-5 w-5" />
          </span>
        </div>
        <div className="mt-5 flex items-start justify-between gap-6" data-reveal>
          <div>
            <h3 className="t-h3 max-w-[24ch] t-balance">{project.title}</h3>
            <p className="mt-2 text-sm text-muted">{[...new Set([project.industry?.shortTitle || project.industry?.title, ...cats.slice(0, 2)].filter(Boolean))].join(" · ")}</p>
          </div>
          {typeof index === "number" && <span className="t-small font-display text-muted">{String(index + 1).padStart(2, "0")}</span>}
        </div>
      </Link>
    </article>
  );
}

export function ArticleCard({ article, priority = false }: { article: ArticleCardData; priority?: boolean }) {
  return (
    <article className="group">
      <Link href={`/insights/${article.slug}`} className="block">
        <MediaImage media={article.cover} sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw" priority={priority} />
        <div className="mt-5">
          <p className="flex flex-wrap items-center gap-x-3 text-sm text-muted">
            {article.category && <span>{article.category.name}</span>}
            {article.publishedAt && (
              <time dateTime={article.publishedAt.toISOString()}>
                {article.publishedAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </time>
            )}
            <span>{article.readingMinutes} min read</span>
          </p>
          <h3 className="t-h4 mt-3 t-balance transition-colors group-hover:text-accent">{article.title}</h3>
          <p className="mt-3 line-clamp-3 text-[0.9375rem] text-muted">{article.excerpt}</p>
        </div>
      </Link>
    </article>
  );
}

export function Breadcrumbs({ items, settings }: { items: { name: string; path: string }[]; settings: Settings | null }) {
  const all = [{ name: "Home", path: "/" }, ...items];
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(all, settings)} />
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-1.5">
          {all.map((it, i) => (
            <li key={it.path} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5" aria-hidden />}
              {i === all.length - 1 ? (
                <span aria-current="page" className="text-ink/80">
                  {it.name}
                </span>
              ) : (
                <Link href={it.path} className="link-underline hover:text-ink">
                  {it.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}

export function EmptyState({ title, text, action }: { title: string; text: string; action?: { label: string; href: string } }) {
  return (
    <div className="border border-dashed border-line px-6 py-16 text-center">
      <p className="t-h4">{title}</p>
      <p className="mx-auto mt-3 max-w-[48ch] text-muted">{text}</p>
      {action && (
        <Link href={action.href} className="btn btn-ghost mt-6">
          {action.label}
        </Link>
      )}
    </div>
  );
}

export function RichText({ html, className = "" }: { html: string; className?: string }) {
  // `html` must already be sanitised (sanitizeRichText) – enforced at every call site.
  return <div className={`prose-site ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}
