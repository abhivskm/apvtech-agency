import type { MetadataRoute } from "next";
import {
  getAllPublishedArticleSlugs,
  getPublishedCustomPageSlugs,
  getPublishedIndustries,
  getPublishedPage,
  getPublishedProjects,
  getPublishedServices,
  getSettings,
} from "@/lib/content/queries";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 3600;

/** Only published, indexable content. Admin, API, drafts and noindex pages are excluded. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getSettings();
  const u = (p: string) => absoluteUrl(p, settings);

  const systemPages = ["home", "services", "work", "industries", "pricing", "about", "insights", "contact", "privacy-policy", "terms-and-conditions"];
  const pagePaths: Record<string, string> = { home: "/" };
  const system = await Promise.all(systemPages.map((slug) => getPublishedPage(slug)));
  const entries: MetadataRoute.Sitemap = system
    .filter((p): p is NonNullable<typeof p> => Boolean(p) && !p!.noindex && !p!.canonicalUrl)
    .map((p) => ({ url: u(pagePaths[p.slug] ?? `/${p.slug}`), lastModified: p.updatedAt, priority: p.slug === "home" ? 1 : 0.7 }));

  const [custom, services, projects, industries, articles] = await Promise.all([
    getPublishedCustomPageSlugs(),
    getPublishedServices(),
    getPublishedProjects(),
    getPublishedIndustries(),
    getAllPublishedArticleSlugs(),
  ]);

  const add = (items: { slug: string; updatedAt: Date; noindex: boolean }[], base: string, priority: number) =>
    items.filter((i) => !i.noindex).forEach((i) => entries.push({ url: u(`${base}/${i.slug}`), lastModified: i.updatedAt, priority }));

  add(custom, "", 0.5);
  add(services, "/services", 0.9);
  add(industries, "/industries", 0.8);
  add(projects, "/work", 0.6);
  add(articles, "/insights", 0.6);
  return entries;
}
