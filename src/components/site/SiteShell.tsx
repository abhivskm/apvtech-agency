import { draftMode } from "next/headers";
import Link from "next/link";
import { getNav, getSettings, getSocialProfiles } from "@/lib/content/queries";
import { whatsappLink } from "@/lib/whatsapp";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { DEFAULT_COLORS } from "@/lib/brand";
import { BrandStyle } from "@/components/site/BrandStyle";
import { Header, type NavLink } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Logo } from "@/components/site/Logo";
import { MotionInit } from "@/components/site/MotionInit";
import { WhatsAppFab } from "@/components/site/WhatsAppFab";
import { Analytics } from "@/components/site/Analytics";
import { JsonLd } from "@/components/site/JsonLd";
import { IntroLoader } from "@/components/site/IntroLoader";

/** Shared public chrome (header, footer, WhatsApp, analytics) used by the site layout and the 404 page. */
export async function SiteShell({ children }: { children: React.ReactNode }) {
  const [settings, header, social, draft] = await Promise.all([getSettings(), getNav("HEADER"), getSocialProfiles(), draftMode()]);

  if (!settings) {
    return (
      <div className="site flex min-h-screen items-center justify-center p-8 text-center">
        <BrandStyle colors={DEFAULT_COLORS} />
        <div>
          <p className="t-h2">Site not initialised</p>
          <p className="mt-4 text-muted">Run the database migrations and seed (see README → Setup).</p>
        </div>
      </div>
    );
  }

  const wa = whatsappLink(settings.whatsappNumber, settings.whatsappMessage);
  const items: NavLink[] = header.map((h) => ({
    id: h.id,
    label: h.label,
    href: h.href,
    newTab: h.newTab,
    children: h.children.map((c) => ({ id: c.id, label: c.label, href: c.href, newTab: c.newTab })),
  }));

  return (
    <div className="site min-h-screen">
      <BrandStyle colors={settings.colors} />
      <IntroLoader brandName={settings.brandName} />
      <JsonLd data={[organizationJsonLd(settings, social.map((s) => s.url)), websiteJsonLd(settings)]} />
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      {draft.isEnabled && (
        <div className="fixed inset-x-0 bottom-0 z-[60] flex items-center justify-center gap-4 bg-accent px-4 py-2 text-sm text-on-accent">
          <span>Preview mode — you are viewing unpublished content.</span>
          <Link href="/api/preview/exit" prefetch={false} className="font-semibold underline">
            Exit preview
          </Link>
        </div>
      )}
      <Header
        logo={<Logo brandName={settings.brandName} logo={settings.logo} />}
        items={items}
        cta={{ label: settings.defaultCtaLabel, href: settings.defaultCtaHref }}
        whatsappHref={wa}
      />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Footer settings={settings} whatsappHref={wa} />
      {wa && <WhatsAppFab href={wa} />}
      <MotionInit />
      <Analytics
        gaId={settings.gaMeasurementId}
        gtmId={settings.gtmContainerId}
        consentEnabled={settings.consentEnabled}
        consentMessage={settings.consentMessage}
      />
    </div>
  );
}
