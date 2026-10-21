import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import type { Settings } from "@/lib/content/queries";
import { getNav, getSocialProfiles } from "@/lib/content/queries";
import { fillTokens } from "@/lib/seo";
import { Logo } from "@/components/site/Logo";
import { SocialIcon, WhatsAppIcon } from "@/components/site/icons";

type Props = { settings: Settings; whatsappHref: string | null };

export async function Footer({ settings, whatsappHref }: Props) {
  const [services, industries, company, legal, social] = await Promise.all([
    getNav("FOOTER_SERVICES"),
    getNav("FOOTER_INDUSTRIES"),
    getNav("FOOTER_COMPANY"),
    getNav("FOOTER_LEGAL"),
    getSocialProfiles(),
  ]);

  const columns = [
    { title: "Services", items: services },
    { title: "Industries", items: industries },
    { title: "Studio", items: company },
  ].filter((c) => c.items.length);

  return (
    <footer className="relative border-t border-line bg-bg pt-20" aria-labelledby="footer-title">
      <h2 id="footer-title" className="sr-only">
        Site footer
      </h2>
      <div className="wrap">
        <div className="grid-12 gap-y-14">
          <div className="col-span-12 lg:col-span-5">
            <Logo brandName={settings.brandName} logo={settings.logo} />
            <p className="t-h3 mt-8 max-w-[18ch] t-balance">{settings.tagline}</p>
            {settings.footerText && <p className="mt-5 max-w-[42ch] text-muted">{settings.footerText}</p>}

            <ul className="mt-8 space-y-3 text-[0.9375rem]">
              {settings.contactEmail && (
                <li>
                  <a href={`mailto:${settings.contactEmail}`} className="inline-flex items-center gap-3 link-underline">
                    <Mail className="h-4 w-4 text-muted" aria-hidden />
                    {settings.contactEmail}
                  </a>
                </li>
              )}
              {settings.phone && (
                <li>
                  <a href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`} className="inline-flex items-center gap-3 link-underline">
                    <Phone className="h-4 w-4 text-muted" aria-hidden />
                    {settings.phone}
                  </a>
                </li>
              )}
              {whatsappHref && (
                <li>
                  <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 link-underline">
                    <WhatsAppIcon className="h-4 w-4 text-muted" />
                    WhatsApp
                  </a>
                </li>
              )}
              {settings.address && (
                <li className="flex items-start gap-3 text-muted">
                  <MapPin className="mt-1 h-4 w-4 shrink-0" aria-hidden />
                  <span>{[settings.address, settings.city, settings.region, settings.postalCode].filter(Boolean).join(", ")}</span>
                </li>
              )}
            </ul>
          </div>

          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title} className="col-span-6 sm:col-span-4 lg:col-span-2">
              <p className="t-eyebrow mb-5">{col.title}</p>
              <ul className="space-y-0.5 text-[0.9375rem] lg:space-y-2.5">
                {col.items.map((it) => (
                  <li key={it.id}>
                    <Link href={it.href} className="link-underline inline-block py-2 text-ink/80 hover:text-ink lg:py-0" target={it.newTab ? "_blank" : undefined} rel={it.newTab ? "noopener noreferrer" : undefined}>
                      {it.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-20 border-t border-line py-8">
          <Link
            href={settings.defaultCtaHref}
            className="group flex items-end justify-between gap-6"
            aria-label={settings.defaultCtaLabel}
          >
            <span className="t-mega block max-w-[12ch] text-ink transition-colors duration-500 group-hover:text-accent" aria-hidden>
              {settings.defaultCtaLabel}
            </span>
            <ArrowUpRight className="mb-[1vw] h-[8vw] max-h-32 w-[8vw] max-w-32 shrink-0 transition-transform duration-500 group-hover:-translate-y-2 group-hover:translate-x-2" aria-hidden />
          </Link>
        </div>

        <div className="flex flex-col gap-6 border-t border-line py-8 text-sm text-muted md:flex-row md:items-center md:justify-between">
          <p>{fillTokens(settings.copyrightText || "© {year} {brand}", settings)}</p>
          {social.length > 0 && (
            <ul className="flex flex-wrap items-center gap-2" aria-label="Social media">
              {social.map((s) => (
                <li key={s.id}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer me"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-line transition-colors hover:border-ink hover:text-ink"
                    aria-label={`${settings.brandName} on ${s.label} (opens in new tab)`}
                  >
                    <SocialIcon platform={s.platform} className="h-4 w-4" />
                  </a>
                </li>
              ))}
            </ul>
          )}
          <ul className="flex flex-wrap gap-x-6 gap-y-0 lg:gap-y-2">
            {legal.map((l) => (
              <li key={l.id}>
                <Link href={l.href} className="link-underline inline-block py-2 hover:text-ink lg:py-0">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
