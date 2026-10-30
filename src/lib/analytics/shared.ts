/** Definitions shared by the browser tracker and the server. Keep this file small: it ships to visitors. */
export const EVENT_TYPES = [
  "pageview",
  "404",
  "scroll",
  "outbound",
  "cta",
  "nav",
  "card",
  "form_view",
  "form_start",
  "form_submit",
  "form_success",
  "form_error",
  "contact_click",
  "js_error",
  "vital",
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

const SECTIONS: Record<string, string> = {
  services: "service",
  work: "work",
  industries: "industry",
  insights: "insight",
};
const PAGES: Record<string, string> = {
  pricing: "pricing",
  about: "about",
  contact: "contact",
  "privacy-policy": "legal",
  "terms-and-conditions": "legal",
};

/** Content group and slug of a site path. */
export function contentGroup(path: string): { group: string; slug: string | null } {
  const parts = path.split(/[?#]/)[0].split("/").filter(Boolean);
  if (!parts.length) return { group: "home", slug: null };
  const section = SECTIONS[parts[0]];
  if (section) return { group: section, slug: parts[1] ?? null };
  if (PAGES[parts[0]]) return { group: PAGES[parts[0]], slug: PAGES[parts[0]] === "legal" ? parts[0] : null };
  return { group: "other", slug: parts[parts.length - 1] };
}
