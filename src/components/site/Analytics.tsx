"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

const KEY = "analytics-consent";

type Props = { gaId: string | null; gtmId: string | null; consentEnabled: boolean; consentMessage: string };

/**
 * Loads GA4 / GTM only when IDs are configured in Admin → Global settings.
 * When consent is enabled, nothing loads until the visitor accepts.
 * IDs are validated server-side (format G-XXXX / GTM-XXXX) before they reach this component.
 */
export function Analytics({ gaId, gtmId, consentEnabled, consentMessage }: Props) {
  const [consent, setConsent] = useState<"granted" | "denied" | null>(null);

  useEffect(() => {
    try {
      const v = localStorage.getItem(KEY);
      if (v === "granted" || v === "denied") setConsent(v);
    } catch {
      /* storage unavailable */
    }
  }, []);

  if (!gaId && !gtmId) return null;
  const allowed = !consentEnabled || consent === "granted";

  const choose = (v: "granted" | "denied") => {
    setConsent(v);
    try {
      localStorage.setItem(KEY, v);
    } catch {
      /* ignore */
    }
  };

  return (
    <>
      {allowed && gaId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${gaId}',{anonymize_ip:true});`}
          </Script>
        </>
      )}
      {allowed && gtmId && (
        <Script id="gtm-init" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}
        </Script>
      )}
      {consentEnabled && consent === null && (
        <div role="region" aria-label="Cookie consent" className="fixed bottom-4 left-4 right-4 z-50 max-w-md border border-line bg-surface p-5 shadow-2xl sm:right-auto">
          <p className="text-sm text-ink/90">{consentMessage}</p>
          <div className="mt-4 flex gap-2">
            <button type="button" onClick={() => choose("granted")} className="btn btn-primary min-h-10! py-2! text-sm">
              Accept
            </button>
            <button type="button" onClick={() => choose("denied")} className="btn btn-ghost min-h-10! py-2! text-sm">
              Decline
            </button>
          </div>
        </div>
      )}
    </>
  );
}
