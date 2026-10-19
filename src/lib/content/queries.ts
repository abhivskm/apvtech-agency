import "server-only";
import { unstable_cache } from "next/cache";
import type { MediaAsset, NavLocation, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { TAGS } from "@/lib/content/tags";
import { DEFAULT_COLORS, type BrandColors } from "@/lib/brand";

const REVALIDATE = 300; // also bounds how late a scheduled publication can appear

export function publishedWhere() {
  return { status: "PUBLISHED" as const, OR: [{ publishedAt: null }, { publishedAt: { lte: new Date() } }] };
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;

/** unstable_cache JSON-serialises results, turning Dates into strings. Restore them. */
function reviveDates<T>(value: T): T {
  if (typeof value === "string") return (ISO_DATE.test(value) ? new Date(value) : value) as T;
  if (Array.isArray(value)) return value.map(reviveDates) as T;
  if (value && typeof value === "object" && !(value instanceof Date)) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = reviveDates(v);
    return out as T;
  }
  return value;
}

const cached = <A extends unknown[], R>(fn: (...args: A) => Promise<R>, key: string, tags: string[]) => {
  const c = unstable_cache(fn, [key], { tags: [TAGS.all, ...tags], revalidate: REVALIDATE });
  return async (...args: A): Promise<R> => reviveDates(await c(...args));
};

/* ───────────── Settings & chrome ───────────── */

const mediaSelect = { id: true, url: true, alt: true, width: true, height: true, kind: true, mime: true, caption: true, credit: true } as const;
export type Media = Pick<MediaAsset, "id" | "url" | "alt" | "width" | "height" | "kind" | "mime" | "caption" | "credit">;

export const getSettings = cached(
  async () => {
    const s = await db.siteSettings.findUnique({
      where: { id: "singleton" },
      include: { logo: { select: mediaSelect }, favicon: { select: mediaSelect }, ogImage: { select: mediaSelect } },
    });
    if (!s) return null;
    return { ...s, colors: { ...DEFAULT_COLORS, ...((s.colors as Partial<BrandColors>) ?? {}) } };
  },
  "settings",
  [TAGS.settings, TAGS.media],
);
export type Settings = NonNullable<Awaited<ReturnType<typeof getSettings>>>;

export const getNav = cached(
  async (location: NavLocation) =>
    db.navItem.findMany({
      where: { location, visible: true, parentId: null },
      orderBy: { order: "asc" },
      include: { children: { where: { visible: true }, orderBy: { order: "asc" } } },
    }),
  "nav",
  [TAGS.nav],
);

export const getSocialProfiles = cached(
  async () => db.socialProfile.findMany({ where: { visible: true }, orderBy: { order: "asc" } }),
  "social",
  [TAGS.social],
);

export const getRedirects = cached(async () => db.redirect.findMany(), "redirects", [TAGS.redirects]);

/* ───────────── Media ───────────── */

export async function getMediaMap(ids: (string | null | undefined)[]): Promise<Record<string, Media>> {
  const unique = [...new Set(ids.filter((x): x is string => Boolean(x)))].sort();
  if (!unique.length) return {};
  return cachedMediaMap(unique.join(","));
}
const cachedMediaMap = cached(
  async (joined: string) => {
    const rows = await db.mediaAsset.findMany({ where: { id: { in: joined.split(",") } }, select: mediaSelect });
    return Object.fromEntries(rows.map((r) => [r.id, r]));
  },
  "media-map",
  [TAGS.media],
);

/* ───────────── Pages ───────────── */

const pageInclude = {
  sections: { orderBy: { order: "asc" } },
  ogImage: { select: mediaSelect },
} satisfies Prisma.PageInclude;

export const getPublishedPage = cached(
  async (slug: string) => db.page.findFirst({ where: { slug, ...publishedWhere() }, include: pageInclude }),
  "page",
  [TAGS.pages, TAGS.media],
);

export async function getPageForPreview(slug: string) {
  return db.page.findUnique({ where: { slug }, include: pageInclude });
}

export const getPublishedCustomPageSlugs = cached(
  async () =>
    (await db.page.findMany({ where: { isSystem: false, ...publishedWhere() }, select: { slug: true, updatedAt: true, noindex: true } })),
  "page-slugs",
  [TAGS.pages],
);

/* ───────────── Services ───────────── */

const serviceInclude = {
  heroMedia: { select: mediaSelect },
  ogImage: { select: mediaSelect },
  faqs: { where: { status: "PUBLISHED" }, orderBy: { order: "asc" } },
  relatedTo: { include: { to: { select: { slug: true, title: true, shortDescription: true, status: true } } } },
  projects: {
    include: {
      project: {
        select: { slug: true, title: true, summary: true, status: true, isConcept: true, publishedAt: true, cover: { select: mediaSelect } },
      },
    },
  },
} satisfies Prisma.ServiceInclude;

export const getPublishedServices = cached(
  async () =>
    db.service.findMany({
      where: publishedWhere(),
      orderBy: { order: "asc" },
      select: { id: true, slug: true, title: true, category: true, shortDescription: true, featuredLabel: true, showOnHome: true, updatedAt: true, noindex: true, heroMedia: { select: mediaSelect } },
    }),
  "services",
  [TAGS.services, TAGS.media],
);

export const getPublishedService = cached(
  async (slug: string) => db.service.findFirst({ where: { slug, ...publishedWhere() }, include: serviceInclude }),
  "service",
  [TAGS.services, TAGS.projects, TAGS.faqs, TAGS.media],
);

export async function getServiceForPreview(slug: string) {
  return db.service.findUnique({ where: { slug }, include: serviceInclude });
}

/* ───────────── Industries ───────────── */

const industryInclude = {
  heroMedia: { select: mediaSelect },
  services: { include: { service: { select: { slug: true, title: true, shortDescription: true, status: true } } } },
  projects: { where: { status: "PUBLISHED" }, select: { slug: true, title: true, summary: true, isConcept: true, cover: { select: mediaSelect } }, take: 4 },
} satisfies Prisma.IndustryInclude;

export const getPublishedIndustries = cached(
  async () =>
    db.industry.findMany({
      where: publishedWhere(),
      orderBy: { order: "asc" },
      select: { id: true, slug: true, title: true, shortTitle: true, intro: true, needs: true, updatedAt: true, noindex: true, heroMedia: { select: mediaSelect } },
    }),
  "industries",
  [TAGS.industries, TAGS.media],
);

export const getPublishedIndustry = cached(
  async (slug: string) => db.industry.findFirst({ where: { slug, ...publishedWhere() }, include: industryInclude }),
  "industry",
  [TAGS.industries, TAGS.services, TAGS.projects, TAGS.media],
);

export async function getIndustryForPreview(slug: string) {
  return db.industry.findUnique({ where: { slug }, include: industryInclude });
}

/* ───────────── Projects ───────────── */

const projectCardSelect = {
  id: true, slug: true, title: true, summary: true, isConcept: true, client: true, year: true, featured: true, updatedAt: true, noindex: true,
  cover: { select: mediaSelect },
  industry: { select: { title: true, shortTitle: true, slug: true } },
  categories: { select: { category: { select: { slug: true, name: true } } } },
  services: { select: { service: { select: { title: true, slug: true } } } },
} satisfies Prisma.ProjectSelect;

export const getPublishedProjects = cached(
  async () => db.project.findMany({ where: publishedWhere(), orderBy: [{ order: "asc" }, { createdAt: "desc" }], select: projectCardSelect }),
  "projects",
  [TAGS.projects, TAGS.media],
);
export type ProjectCard = Awaited<ReturnType<typeof getPublishedProjects>>[number];

export const getProjectCategories = cached(
  async () =>
    db.projectCategory.findMany({
      where: { projects: { some: { project: publishedWhere() } } },
      orderBy: { order: "asc" },
    }),
  "project-categories",
  [TAGS.projects],
);

const projectInclude = {
  cover: { select: mediaSelect },
  ogImage: { select: mediaSelect },
  industry: { select: { title: true, slug: true } },
  gallery: { orderBy: { order: "asc" }, include: { media: { select: mediaSelect } } },
  services: { include: { service: { select: { title: true, slug: true, status: true } } } },
  categories: { include: { category: true } },
  metrics: { where: { verified: true }, orderBy: { order: "asc" } },
} satisfies Prisma.ProjectInclude;

export const getPublishedProject = cached(
  async (slug: string) => db.project.findFirst({ where: { slug, ...publishedWhere() }, include: projectInclude }),
  "project",
  [TAGS.projects, TAGS.media],
);

export async function getProjectForPreview(slug: string) {
  return db.project.findUnique({ where: { slug }, include: projectInclude });
}

export const getVerifiedResults = cached(
  async () =>
    db.projectMetric.findMany({
      where: { verified: true, project: publishedWhere() },
      orderBy: { order: "asc" },
      take: 6,
      include: { project: { select: { slug: true, title: true, isConcept: true } } },
    }),
  "results",
  [TAGS.projects],
);

/* ───────────── Articles ───────────── */

const articleCardSelect = {
  id: true, slug: true, title: true, excerpt: true, publishedAt: true, readingMinutes: true, updatedAt: true, noindex: true, authorName: true,
  cover: { select: mediaSelect },
  category: { select: { name: true, slug: true } },
} satisfies Prisma.ArticleSelect;

export const getPublishedArticles = cached(
  async (page: number, perPage: number, category?: string) => {
    const where = { ...publishedWhere(), ...(category ? { category: { slug: category } } : {}) };
    const [items, total] = await Promise.all([
      db.article.findMany({ where, orderBy: { publishedAt: "desc" }, skip: (page - 1) * perPage, take: perPage, select: articleCardSelect }),
      db.article.count({ where }),
    ]);
    return { items, total, pages: Math.max(1, Math.ceil(total / perPage)) };
  },
  "articles",
  [TAGS.articles, TAGS.media],
);
export type ArticleCard = Awaited<ReturnType<typeof getPublishedArticles>>["items"][number];

export const getAllPublishedArticleSlugs = cached(
  async () => db.article.findMany({ where: publishedWhere(), select: { slug: true, updatedAt: true, noindex: true } }),
  "article-slugs",
  [TAGS.articles],
);

export const getArticleCategories = cached(
  async () => db.articleCategory.findMany({ where: { articles: { some: publishedWhere() } }, orderBy: { name: "asc" } }),
  "article-categories",
  [TAGS.articles],
);

const articleInclude = {
  cover: { select: mediaSelect },
  ogImage: { select: mediaSelect },
  category: true,
  tags: { include: { tag: true } },
} satisfies Prisma.ArticleInclude;

export const getPublishedArticle = cached(
  async (slug: string) => db.article.findFirst({ where: { slug, ...publishedWhere() }, include: articleInclude }),
  "article",
  [TAGS.articles, TAGS.media],
);

export async function getArticleForPreview(slug: string) {
  return db.article.findUnique({ where: { slug }, include: articleInclude });
}

/* ───────────── Social proof ───────────── */

export const getPublishedTestimonials = cached(
  async () => db.testimonial.findMany({ where: { status: "PUBLISHED" }, orderBy: { order: "asc" }, include: { photo: { select: mediaSelect } } }),
  "testimonials",
  [TAGS.testimonials, TAGS.media],
);

export const getPublishedFaqs = cached(
  async (group: string) => db.faq.findMany({ where: { status: "PUBLISHED", group, serviceId: null }, orderBy: { order: "asc" } }),
  "faqs",
  [TAGS.faqs],
);
