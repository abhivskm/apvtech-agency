/**
 * Link/URL safety helpers shared by admin validation and public rendering.
 * Allowed: site-relative paths, #anchors, http(s), mailto:, tel:. Everything else (javascript:, data:, vbscript:, //host) is rejected.
 */
export function isSafeHref(href: string): boolean {
  const value = href.trim();
  if (!value) return false;
  if (/[\u0000-\u001F\u007F]/.test(value)) return false;
  if (value.startsWith("/")) return !value.startsWith("//") && !value.startsWith("/\\");
  if (value.startsWith("#")) return true;
  try {
    const url = new URL(value);
    return ["http:", "https:", "mailto:", "tel:"].includes(url.protocol);
  } catch {
    return false;
  }
}

export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

/** Normalise a redirect source path: leading slash, no trailing slash, no query. */
export function normalisePath(path: string): string {
  let p = path.trim().split("?")[0].split("#")[0];
  if (!p.startsWith("/")) p = "/" + p;
  if (p.length > 1) p = p.replace(/\/+$/, "");
  return p.toLowerCase();
}
