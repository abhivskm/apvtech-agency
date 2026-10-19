import { notFound } from "next/navigation";
import { getPublishedPlans, getSettings } from "@/lib/content/queries";
import { loadPage, pageMetadata, splitSections } from "@/components/site/CmsPage";
import { SectionRenderer } from "@/components/site/sections";
import { Breadcrumbs, EmptyState } from "@/components/site/ui";
import { PlanCards } from "@/components/site/PlanCards";
import { JsonLd } from "@/components/site/JsonLd";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 300;

export function generateMetadata() {
  return pageMetadata("pricing", "/pricing");
}

export default async function PricingPage() {
  const [page, settings, plans] = await Promise.all([loadPage("pricing"), getSettings(), getPublishedPlans()]);
  if (!settings) notFound();
  const { head, tail } = splitSections(page?.sections ?? []);

  // Offer structured data for plans with a listed starting price.
  const offers = plans
    .filter((p) => p.setupPrice != null || p.monthlyPrice != null)
    .map((p) => ({
      "@type": "Offer",
      name: `${p.name} plan`,
      description: p.description || p.tagline,
      priceCurrency: "INR",
      price: p.setupPrice ?? p.monthlyPrice,
      url: absoluteUrl(`/contact?plan=${p.slug}`, settings),
    }));

  return (
    <>
      {offers.length > 0 && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "OfferCatalog",
            name: `${settings.brandName} plans`,
            itemListElement: offers,
          }}
        />
      )}
      {head.length > 0 ? (
        <SectionRenderer sections={head} settings={settings} />
      ) : (
        <div className="wrap pt-[calc(var(--header-h)+6rem)]">
          <h1 className="t-display">Pricing</h1>
        </div>
      )}
      <section className="section-tight">
        <div className="wrap">
          <div className="mb-14">
            <Breadcrumbs items={[{ name: "Pricing", path: "/pricing" }]} settings={settings} />
          </div>
          {plans.length === 0 ? (
            <EmptyState title="Plans are being updated" text="Get in touch and we'll put together a scope and quote for you." action={{ label: "Contact us", href: "/contact" }} />
          ) : (
            <PlanCards plans={plans} pricingNote={settings.pricingNote} />
          )}
        </div>
      </section>
      {tail.length > 0 && <SectionRenderer sections={tail} settings={settings} />}
    </>
  );
}
