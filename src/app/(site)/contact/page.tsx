import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { getPublishedServices, getSettings } from "@/lib/content/queries";
import { whatsappLink } from "@/lib/whatsapp";
import { loadPage, pageMetadata, splitSections } from "@/components/site/CmsPage";
import { SectionRenderer } from "@/components/site/sections";
import { Breadcrumbs } from "@/components/site/ui";
import { EnquiryForm, EnquiryFormWithQuery } from "@/components/site/EnquiryForm";
import { WhatsAppIcon } from "@/components/site/icons";

export function generateMetadata() {
  return pageMetadata("contact", "/contact");
}

export const revalidate = 300;

export default async function ContactPage() {
  const [page, settings, services] = await Promise.all([loadPage("contact"), getSettings(), getPublishedServices()]);
  if (!settings) notFound();
  const { head, tail } = splitSections(page?.sections ?? []);
  const wa = whatsappLink(settings.whatsappNumber, settings.whatsappMessage);
  const serviceOptions = services.map((s) => ({ slug: s.slug, title: s.title }));
  const hasDirect = settings.contactEmail || settings.phone || wa || settings.address;

  return (
    <>
      {head.length > 0 && <SectionRenderer sections={head} settings={settings} />}
      <section className="section-tight">
        <div className="wrap">
          <div className="mb-12">
            <Breadcrumbs items={[{ name: "Contact", path: "/contact" }]} settings={settings} />
          </div>
          <div className="grid-12 gap-y-16">
            <div className="col-span-12 lg:col-span-7">
              <Suspense fallback={<EnquiryForm services={serviceOptions} whatsappHref={wa} />}>
                <EnquiryFormWithQuery services={serviceOptions} whatsappHref={wa} />
              </Suspense>
            </div>
            <aside className="col-span-12 lg:col-span-4 lg:col-start-9" aria-label="Other ways to reach us">
              <div className="space-y-8 lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
                {wa && (
                  <a href={wa} target="_blank" rel="noopener noreferrer" className="group block border border-line p-6 transition-colors hover:border-[#25D366]">
                    <WhatsAppIcon className="h-7 w-7 text-[#25D366]" />
                    <p className="t-h3 mt-5">Prefer WhatsApp?</p>
                    <p className="mt-2 text-sm text-muted">Start a chat with a pre-filled message. Opens WhatsApp on your device.</p>
                  </a>
                )}
                {hasDirect ? (
                  <ul className="space-y-4 border-t border-line pt-8 text-[0.9375rem]">
                    {settings.contactEmail && (
                      <li className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted" aria-hidden />
                        <a href={`mailto:${settings.contactEmail}`} className="link-underline">
                          {settings.contactEmail}
                        </a>
                      </li>
                    )}
                    {settings.phone && (
                      <li className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted" aria-hidden />
                        <a href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`} className="link-underline">
                          {settings.phone}
                        </a>
                      </li>
                    )}
                    {settings.address && (
                      <li className="flex items-start gap-3">
                        <MapPin className="mt-1 h-4 w-4 text-muted" aria-hidden />
                        <span>{[settings.address, settings.city, settings.region, settings.postalCode].filter(Boolean).join(", ")}</span>
                      </li>
                    )}
                    {settings.businessHours && (
                      <li className="flex items-start gap-3">
                        <Clock className="mt-1 h-4 w-4 text-muted" aria-hidden />
                        <span>{settings.businessHours}</span>
                      </li>
                    )}
                  </ul>
                ) : null}
                {settings.serviceAreas && (
                  <div className="border-t border-line pt-8">
                    <p className="t-eyebrow">Service areas</p>
                    <p className="mt-3 text-[0.9375rem]">{settings.serviceAreas}</p>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </section>
      {tail.length > 0 && <SectionRenderer sections={tail} settings={settings} />}
    </>
  );
}
