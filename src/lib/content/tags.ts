/** Cache tags used by public queries. Every admin mutation revalidates the matching tag(s). */
export const TAGS = {
  all: "content",
  settings: "settings",
  nav: "nav",
  social: "social",
  pages: "pages",
  services: "services",
  projects: "projects",
  industries: "industries",
  articles: "articles",
  testimonials: "testimonials",
  faqs: "faqs",
  plans: "plans",
  media: "media",
  redirects: "redirects",
} as const;

export type Tag = (typeof TAGS)[keyof typeof TAGS];
