export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Slugs reserved by dedicated routes – CMS pages may not use them. */
export const RESERVED_PAGE_SLUGS = new Set([
  "admin", "api", "services", "work", "industries", "insights", "contact", "about",
  "privacy-policy", "terms-and-conditions", "uploads", "sitemap.xml", "robots.txt", "home",
  "_next", "preview", "404",
]);
