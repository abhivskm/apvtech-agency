import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";

export const metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <SiteShell>
      <section data-analytics-404 className="flex min-h-[80svh] items-center pt-[var(--header-h)]">
        <div className="wrap">
          <p className="t-eyebrow flex items-center gap-3">
            <span className="signal-dot" aria-hidden /> Error 404 — signal lost
          </p>
          <h1 className="t-mega mt-8 max-w-[12ch]">This page has moved on.</h1>
          <p className="t-lead mt-8 max-w-[46ch] text-muted">
            The link may be outdated, or the page may have been renamed. Try one of these instead.
          </p>
          <ul className="mt-10 flex flex-wrap gap-3">
            <li>
              <Link href="/" className="btn btn-primary">
                Back to home <ArrowUpRight className="btn-arrow h-4 w-4" aria-hidden />
              </Link>
            </li>
            <li>
              <Link href="/services" className="btn btn-ghost">
                Services
              </Link>
            </li>
            <li>
              <Link href="/work" className="btn btn-ghost">
                Work
              </Link>
            </li>
            <li>
              <Link href="/contact" className="btn btn-ghost">
                Contact
              </Link>
            </li>
          </ul>
        </div>
      </section>
    </SiteShell>
  );
}
