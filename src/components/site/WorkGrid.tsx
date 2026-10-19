"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

export type WorkItem = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  isConcept: boolean;
  industry: string | null;
  categories: { slug: string; name: string }[];
  cover: { url: string; alt: string } | null;
};

type GridProps = { items: WorkItem[]; categories: { slug: string; name: string }[] };

/** Reads ?category= in the browser so /work stays statically cacheable. Render inside <Suspense>. */
export function WorkGridWithQuery(props: GridProps) {
  return <WorkGrid {...props} initial={useSearchParams().get("category")} />;
}

/** Filterable portfolio grid. Filter state is mirrored to ?category= so filtered views are linkable. */
export function WorkGrid({ items, categories, initial }: GridProps & { initial: string | null }) {
  const [active, setActive] = useState<string | null>(categories.some((c) => c.slug === initial) ? initial : null);
  const filtered = useMemo(() => (active ? items.filter((p) => p.categories.some((c) => c.slug === active)) : items), [items, active]);

  const select = (slug: string | null) => {
    setActive(slug);
    const url = new URL(window.location.href);
    if (slug) url.searchParams.set("category", slug);
    else url.searchParams.delete("category");
    window.history.replaceState(null, "", url);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter projects by category">
        <button type="button" className="chip" aria-pressed={active === null} onClick={() => select(null)}>
          All <span className="text-xs opacity-60">{items.length}</span>
        </button>
        {categories.map((c) => {
          const count = items.filter((p) => p.categories.some((x) => x.slug === c.slug)).length;
          return (
            <button key={c.slug} type="button" className="chip" aria-pressed={active === c.slug} onClick={() => select(c.slug)}>
              {c.name} <span className="text-xs opacity-60">{count}</span>
            </button>
          );
        })}
      </div>

      <p className="sr-only" aria-live="polite">
        Showing {filtered.length} project{filtered.length === 1 ? "" : "s"}
      </p>

      {filtered.length === 0 ? (
        <p className="mt-16 text-muted">No projects in this category yet.</p>
      ) : (
        <ul className="mt-14 grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2">
          {filtered.map((p, i) => (
            <li key={p.id} className={i % 4 === 1 ? "md:mt-32" : i % 4 === 3 ? "md:-mt-32" : ""}>
              <Link href={`/work/${p.slug}`} className="group block" aria-label={`${p.title}${p.isConcept ? " (concept project)" : ""}`}>
                <div className="frame relative aspect-[4/5]">
                  {p.cover && (
                    <Image src={p.cover.url} alt={p.cover.alt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" priority={i < 2} />
                  )}
                  {p.isConcept && (
                    <span className="tag-concept absolute left-3 top-3">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
                      Concept
                    </span>
                  )}
                  <span className="absolute bottom-3 right-3 flex h-11 w-11 translate-y-2 items-center justify-center rounded-full bg-accent text-on-accent opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100" aria-hidden>
                    <ArrowUpRight className="h-5 w-5" />
                  </span>
                </div>
                <div className="mt-5 flex items-start justify-between gap-6">
                  <div>
                    <h2 className="t-h3 max-w-[24ch] t-balance">{p.title}</h2>
                    <p className="mt-2 text-sm text-muted">{[...new Set([p.industry, ...p.categories.map((c) => c.name)].filter(Boolean))].join(" · ")}</p>
                  </div>
                  <span className="font-display text-sm text-muted">{String(i + 1).padStart(2, "0")}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
