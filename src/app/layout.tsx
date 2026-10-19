import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { getSettings } from "@/lib/content/queries";
import { absoluteUrl, siteUrl } from "@/lib/seo";
import { applyBrand, DEFAULT_BRAND } from "@/lib/brand";
import "./globals.css";

const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display-face", display: "swap" });
const body = Inter({ subsets: ["latin"], variable: "--font-body-face", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings().catch(() => null);
  const brand = s?.brandName ?? DEFAULT_BRAND.brandName;
  return {
    metadataBase: new URL(siteUrl(s)),
    title: {
      default: s?.defaultSeoTitle ?? brand,
      template: applyBrand(s?.titleTemplate ?? "%s | {brand}", brand),
    },
    description: s?.defaultSeoDescription,
    applicationName: brand,
    icons: s?.favicon ? { icon: absoluteUrl(s.favicon.url, s) } : undefined,
    verification: s?.gscVerification ? { google: s.gscVerification } : undefined,
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
  width: "device-width",
  initialScale: 1,
};

// Adds `motion-ok` before first paint when the visitor allows motion. If client JS fails to
// initialise reveals within 2.5s, the class is removed so no content can stay hidden.
const motionBootstrap = `(function(){try{var d=document.documentElement;if(window.matchMedia&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('motion-ok');setTimeout(function(){if(!window.__motionReady)d.classList.remove('motion-ok')},2500)}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionBootstrap }} />
      </head>
      {/* Browser extensions (e.g. ColorZilla, Grammarly) add attributes to <body>; don't treat that as a hydration error. */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
