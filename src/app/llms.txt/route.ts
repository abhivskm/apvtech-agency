import { getPublishedIndustries, getPublishedPlans, getPublishedServices, getSettings } from "@/lib/content/queries";
import { absoluteUrl } from "@/lib/seo";
import { planPriceLines } from "@/lib/pricing";

export const revalidate = 3600;

/** /llms.txt — a plain-language summary of the site for AI assistants and answer engines (llmstxt.org). */
export async function GET() {
  const [settings, services, industries, plans] = await Promise.all([getSettings(), getPublishedServices(), getPublishedIndustries(), getPublishedPlans()]);
  const u = (p: string) => absoluteUrl(p, settings);
  const lines: string[] = [
    `# ${settings?.brandName ?? ""}`,
    "",
    `> ${settings?.defaultSeoDescription ?? settings?.tagline ?? ""}`,
    "",
    "## Key pages",
    `- [Services](${u("/services")}): everything we offer`,
    `- [Pricing](${u("/pricing")}): plans with starting prices`,
    `- [Work](${u("/work")}): projects and concept work (concept projects are labelled as such)`,
    `- [Industries](${u("/industries")}): who we work with`,
    `- [Insights](${u("/insights")}): practical guides`,
    `- [About](${u("/about")})`,
    `- [Contact](${u("/contact")}): start a project`,
    "",
    "## Services",
    ...services.map((s) => `- [${s.title}](${u(`/services/${s.slug}`)}): ${s.shortDescription}`),
  ];
  if (industries.length) lines.push("", "## Industries", ...industries.map((i) => `- [${i.title}](${u(`/industries/${i.slug}`)})`));
  if (plans.length) {
    lines.push("", "## Plans");
    for (const p of plans) {
      const price = planPriceLines(p);
      lines.push(`- ${p.name}: ${p.pricePrefix}${price ? ` ${price.main} ${price.unit}${price.secondary ? `, ${price.secondary}` : ""}` : ""}${p.bestFor ? ` — ${p.bestFor}` : ""}`);
    }
    if (settings?.pricingNote) lines.push("", settings.pricingNote);
  }
  return new Response(lines.join("\n") + "\n", {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
