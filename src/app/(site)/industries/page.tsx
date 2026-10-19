import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { getPublishedIndustries, getSettings } from "@/lib/content/queries";
import { loadPage, pageMetadata, splitSections } from "@/components/site/CmsPage";
import { SectionRenderer } from "@/components/site/sections";
import { Breadcrumbs, EmptyState, MediaImage } from "@/components/site/ui";

export const revalidate = 300;

export function generateMetadata() {
  return pageMetadata("industries", "/industries");
}

export default async function IndustriesPage() {
  const [page, settings, industries] = await Promise.all([loadPage("industries"), getSettings(), getPublishedIndustries()]);
  if (!settings) notFound();
  const { head, tail } = splitSections(page?.sections ?? []);

  return (
    <>
      {head.length > 0 && <SectionRenderer sections={head} settings={settings} />}
      <section className="section-tight">
        <div className="wrap">
          <div className="mb-12">
            <Breadcrumbs items={[{ name: "Industries", path: "/industries" }]} settings={settings} />
          </div>
          {industries.length === 0 ? (
            <EmptyState title="Industry pages coming soon" text="Get in touch to talk about your sector." action={{ label: "Contact us", href: "/contact" }} />
          ) : (
            <ul className="space-y-24 lg:space-y-32">
              {industries.map((ind, i) => (
                <li key={ind.id} className="grid-12 items-center gap-y-8">
                  <div className={`col-span-12 lg:col-span-6 ${i % 2 ? "lg:order-2 lg:col-start-7" : ""}`} data-reveal="mask">
                    <Link href={`/industries/${ind.slug}`} tabIndex={-1} aria-hidden>
                      <MediaImage media={ind.heroMedia} aspect="aspect-[4/3]" sizes="(min-width: 1024px) 50vw, 100vw" />
                    </Link>
                  </div>
                  <div className={`col-span-12 lg:col-span-5 ${i % 2 ? "lg:order-1" : "lg:col-start-8"}`}>
                    <span className="font-display text-sm text-accent">{String(i + 1).padStart(2, "0")}</span>
                    <h2 className="t-h1 mt-4">
                      <Link href={`/industries/${ind.slug}`} className="hover:text-accent">
                        {ind.title}
                      </Link>
                    </h2>
                    <p className="mt-5 text-muted">{ind.intro}</p>
                    <ul className="mt-8 border-t border-line">
                      {ind.needs.map((n) => (
                        <li key={n} className="border-b border-line py-3 text-[0.9375rem]">
                          {n}
                        </li>
                      ))}
                    </ul>
                    <Link href={`/industries/${ind.slug}`} className="btn btn-ghost mt-8">
                      Explore {ind.shortTitle || "solutions"} <ArrowUpRight className="btn-arrow h-4 w-4" aria-hidden />
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
      {tail.length > 0 && <SectionRenderer sections={tail} settings={settings} />}
    </>
  );
}
