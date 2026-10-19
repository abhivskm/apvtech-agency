import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { notFound } from "next/navigation";
import { getPublishedServices, getSettings } from "@/lib/content/queries";
import { loadPage, pageMetadata, splitSections } from "@/components/site/CmsPage";
import { SectionRenderer } from "@/components/site/sections";
import { Breadcrumbs, EmptyState, MediaImage } from "@/components/site/ui";

export const revalidate = 300;

export function generateMetadata() {
  return pageMetadata("services", "/services");
}

export default async function ServicesPage() {
  const [page, settings, services] = await Promise.all([loadPage("services"), getSettings(), getPublishedServices()]);
  if (!settings) notFound();
  const { head, tail } = splitSections(page?.sections ?? []);

  return (
    <>
      {head.length ? (
        <SectionRenderer sections={head} settings={settings} />
      ) : (
        <div className="wrap pt-[calc(var(--header-h)+6rem)]">
          <h1 className="t-display">Services</h1>
        </div>
      )}
      <section className="section-tight">
        <div className="wrap">
          <div className="mb-12">
            <Breadcrumbs items={[{ name: "Services", path: "/services" }]} settings={settings} />
          </div>
          {services.length === 0 ? (
            <EmptyState title="Services are being updated" text="Please check back shortly, or get in touch to discuss your project." action={{ label: "Contact us", href: "/contact" }} />
          ) : (
            <ol className="border-t border-line">
              {services.map((svc, i) => (
                <li key={svc.id} className="border-b border-line">
                  <Link href={`/services/${svc.slug}`} className="group grid-12 items-center gap-y-6 py-10 lg:py-12">
                    <span className="col-span-2 font-display text-sm text-muted lg:col-span-1">{String(i + 1).padStart(2, "0")}</span>
                    <div className="col-span-10 lg:col-span-6">
                      <p className="text-sm text-muted">{svc.category}</p>
                      <h2 className="t-h2 mt-2 transition-colors duration-300 group-hover:text-accent">{svc.title}</h2>
                      <p className="mt-4 max-w-[54ch] text-muted">{svc.shortDescription}</p>
                    </div>
                    <div className="col-span-10 col-start-3 lg:col-span-4 lg:col-start-8">
                      <MediaImage media={svc.heroMedia} aspect="aspect-[16/10]" sizes="(min-width: 1024px) 30vw, 80vw" />
                    </div>
                    <span className="hidden justify-end lg:col-span-1 lg:flex">
                      <ArrowUpRight className="h-7 w-7 text-muted transition-all duration-500 group-hover:rotate-45 group-hover:text-accent" aria-hidden />
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>
      {tail.length > 0 && <SectionRenderer sections={tail} settings={settings} />}
    </>
  );
}
