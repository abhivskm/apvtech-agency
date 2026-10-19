import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPageForPreview, getPublishedPage, getSettings } from "@/lib/content/queries";
import { withPreview } from "@/lib/content/preview";
import { buildMetadata } from "@/lib/seo";
import { SectionRenderer } from "@/components/site/sections";

export async function loadPage(slug: string) {
  return withPreview(slug, getPublishedPage, getPageForPreview);
}

export async function pageMetadata(slug: string, path: string): Promise<Metadata> {
  const page = await loadPage(slug);
  if (!page) return {};
  return buildMetadata({
    title: slug === "home" ? null : page.title,
    seoTitle: page.seoTitle,
    description: page.seoDescription,
    path,
    image: page.ogImage,
    canonicalUrl: page.canonicalUrl,
    noindex: page.noindex || page.status !== "PUBLISHED",
  });
}

/** Leading hero sections and the remaining sections, for index pages that inject listings between them. */
export function splitSections<T extends { type: string }>(sections: T[]) {
  let i = 0;
  while (i < sections.length && sections[i].type === "hero") i++;
  return { head: sections.slice(0, i), tail: sections.slice(i) };
}

/** Renders a CMS page entirely from its sections (about, legal, custom pages). */
export async function CmsPage({ slug }: { slug: string }) {
  const [page, settings] = await Promise.all([loadPage(slug), getSettings()]);
  if (!page || !settings) notFound();
  return <SectionRenderer sections={page.sections} settings={settings} updatedAt={page.updatedAt} />;
}
