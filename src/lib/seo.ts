import "server-only";
import type { Metadata } from "next";
import { env } from "@/lib/env";
import { getSettings, type Media, type Settings } from "@/lib/content/queries";

export function siteUrl(settings?: Settings | null) {
  return (settings?.siteUrl || env.siteUrl).replace(/\/$/, "");
}

export function absoluteUrl(path: string, settings?: Settings | null) {
  if (/^https?:\/\//.test(path)) return path;
  return `${siteUrl(settings)}${path.startsWith("/") ? path : `/${path}`}`;
}

type MetaInput = {
  title?: string | null;
  seoTitle?: string | null;
  description?: string | null;
  path: string;
  image?: Pick<Media, "url" | "alt" | "width" | "height"> | null;
  canonicalUrl?: string | null;
  noindex?: boolean;
  /** Small label on the generated social card, e.g. "Services". */
  ogLabel?: string;
  type?: "website" | "article";
  publishedTime?: Date | null;
  modifiedTime?: Date | null;
};

/** Builds per-page metadata with fallbacks to global SEO settings. */
export async function buildMetadata(input: MetaInput): Promise<Metadata> {
  const settings = await getSettings();
  const title = input.seoTitle || input.title || undefined;
  const description = input.description || settings?.defaultSeoDescription || undefined;
  // Homepage uses the site-wide sharing image (Admin → SEO); other pages without their own image get a branded title card.
  const image = input.image ?? (input.path === "/" ? settings?.ogImage : null) ?? null;
  const canonical = input.canonicalUrl || absoluteUrl(input.path, settings);
  const cardTitle = input.title || title || "";
  const images = image
    ? [{ url: absoluteUrl(image.url, settings), alt: image.alt || title || settings?.brandName, width: image.width ?? undefined, height: image.height ?? undefined }]
    : [
        {
          url: absoluteUrl(`/og?${new URLSearchParams({ title: cardTitle, ...(input.ogLabel ? { label: input.ogLabel } : {}) })}`, settings),
          alt: cardTitle || settings?.brandName,
          width: 1200,
          height: 630,
        },
      ];
  return {
    title: title ?? { absolute: settings?.defaultSeoTitle ?? "" },
    description,
    alternates: { canonical },
    robots: input.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: input.type ?? "website",
      title: title ?? settings?.defaultSeoTitle,
      description,
      url: canonical,
      siteName: settings?.brandName,
      locale: "en_IN",
      images,
      ...(input.type === "article"
        ? { publishedTime: input.publishedTime?.toISOString(), modifiedTime: input.modifiedTime?.toISOString() }
        : {}),
    },
    twitter: { card: "summary_large_image", title: title ?? settings?.defaultSeoTitle, description, images: images?.map((i) => i.url) },
  };
}

/* ───────────── Structured data ───────────── */

/** Configured service areas, or the business country (India by default). */
function areaServed(settings: Settings) {
  const areas = (settings.serviceAreas ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  return areas.length ? areas : [{ "@type": "Country", name: settings.country === "IN" || !settings.country ? "India" : settings.country }];
}

export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
  };
}

export function organizationJsonLd(settings: Settings, socialUrls: string[]) {
  const url = siteUrl(settings);
  const hasAddress = Boolean(settings.address && settings.city);
  const base = {
    "@context": "https://schema.org",
    "@type": hasAddress ? "ProfessionalService" : "Organization",
    "@id": `${url}/#organization`,
    name: settings.brandName,
    url,
    description: settings.defaultSeoDescription,
    ...(settings.logo ? { logo: absoluteUrl(settings.logo.url, settings) } : {}),
    ...(settings.contactEmail ? { email: settings.contactEmail } : {}),
    ...(settings.phone ? { telephone: settings.phone } : {}),
    ...(socialUrls.length ? { sameAs: socialUrls } : {}),
    areaServed: areaServed(settings),
    ...(settings.tagline ? { slogan: settings.tagline } : {}),
  };
  // LocalBusiness-type data is only emitted when a real address has been supplied in settings.
  if (hasAddress) {
    return {
      ...base,
      address: {
        "@type": "PostalAddress",
        streetAddress: settings.address,
        addressLocality: settings.city,
        addressRegion: settings.region ?? undefined,
        postalCode: settings.postalCode ?? undefined,
        addressCountry: settings.country,
      },
    };
  }
  return base;
}

export function websiteJsonLd(settings: Settings) {
  const url = siteUrl(settings);
  return { "@context": "https://schema.org", "@type": "WebSite", "@id": `${url}/#website`, name: settings.brandName, url, publisher: { "@id": `${url}/#organization` } };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[], settings: Settings | null) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: absoluteUrl(it.path, settings) })),
  };
}

export function serviceJsonLd(s: { title: string; shortDescription: string; slug: string }, settings: Settings) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: s.title,
    description: s.shortDescription,
    url: absoluteUrl(`/services/${s.slug}`, settings),
    provider: { "@id": `${siteUrl(settings)}/#organization` },
    areaServed: areaServed(settings),
  };
}

export function articleJsonLd(
  a: { title: string; excerpt: string; slug: string; publishedAt: Date | null; updatedAt: Date; authorName: string; cover?: { url: string } | null },
  settings: Settings,
) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.excerpt,
    mainEntityOfPage: absoluteUrl(`/insights/${a.slug}`, settings),
    datePublished: a.publishedAt?.toISOString(),
    dateModified: a.updatedAt.toISOString(),
    author: a.authorName ? { "@type": "Person", name: a.authorName } : { "@id": `${siteUrl(settings)}/#organization` },
    publisher: { "@id": `${siteUrl(settings)}/#organization` },
    ...(a.cover ? { image: absoluteUrl(a.cover.url, settings) } : {}),
  };
}

export function fillTokens(text: string, settings: Pick<Settings, "brandName"> | null, extra: Record<string, string> = {}) {
  let out = text.replaceAll("{brand}", settings?.brandName ?? "").replaceAll("{year}", String(new Date().getFullYear()));
  for (const [k, v] of Object.entries(extra)) out = out.replaceAll(`{${k}}`, v);
  return out;
}
