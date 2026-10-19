/**
 * Brand defaults. These are only fallbacks – the live values are stored in SiteSettings
 * and edited in Admin → Branding & Theme. Change the brand there, not in code.
 */
export type BrandColors = {
  background: string;
  surface: string;
  elevated: string;
  text: string;
  muted: string;
  accent: string;
};

export const DEFAULT_COLORS: BrandColors = {
  background: "#0A0A0A",
  surface: "#141414",
  elevated: "#1B1B1B",
  text: "#F4F4EF",
  muted: "#A4A49D",
  accent: "#C8F169",
};

export const DEFAULT_BRAND = {
  brandName: "FORM & SIGNAL",
  brandShortName: "F&S",
  tagline: "One partner. Every digital touchpoint.",
  supportingMessage:
    "From websites and search visibility to social content, product photography, and digital campaigns, we bring everything your brand needs to grow online under one roof.",
};

export function applyBrand(template: string, brandName: string) {
  return template.replaceAll("{brand}", brandName);
}
