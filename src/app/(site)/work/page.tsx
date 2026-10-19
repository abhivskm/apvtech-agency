import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getProjectCategories, getPublishedProjects, getSettings } from "@/lib/content/queries";
import { loadPage, pageMetadata, splitSections } from "@/components/site/CmsPage";
import { SectionRenderer } from "@/components/site/sections";
import { Breadcrumbs, EmptyState } from "@/components/site/ui";
import { WorkGrid, WorkGridWithQuery } from "@/components/site/WorkGrid";

export function generateMetadata() {
  return pageMetadata("work", "/work");
}

export const revalidate = 300;

export default async function WorkPage() {
  const [page, settings, projects, categories] = await Promise.all([
    loadPage("work"),
    getSettings(),
    getPublishedProjects(),
    getProjectCategories(),
  ]);
  if (!settings) notFound();
  const { head, tail } = splitSections(page?.sections ?? []);
  const gridProps = {
    categories: categories.map((c) => ({ slug: c.slug, name: c.name })),
    items: projects.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      summary: p.summary,
      isConcept: p.isConcept,
      industry: p.industry?.shortTitle || p.industry?.title || null,
      categories: p.categories.map((c) => c.category),
      cover: p.cover ? { url: p.cover.url, alt: p.cover.alt } : null,
    })),
  };

  return (
    <>
      {head.length > 0 && <SectionRenderer sections={head} settings={settings} />}
      <section className="section-tight">
        <div className="wrap">
          <div className="mb-10">
            <Breadcrumbs items={[{ name: "Work", path: "/work" }]} settings={settings} />
          </div>
          {projects.length === 0 ? (
            <EmptyState
              title="Our portfolio is on its way"
              text="We're documenting our first projects now. In the meantime, we'd be happy to talk through our approach."
              action={{ label: "Start a conversation", href: "/contact" }}
            />
          ) : (
            <Suspense fallback={<WorkGrid initial={null} {...gridProps} />}>
              <WorkGridWithQuery {...gridProps} />
            </Suspense>
          )}
        </div>
      </section>
      {tail.length > 0 && <SectionRenderer sections={tail} settings={settings} />}
    </>
  );
}
