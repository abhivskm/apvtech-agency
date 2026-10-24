import { notFound } from "next/navigation";
import { INTRO_LOADER, INTRO_VARIANTS, type IntroVariant } from "@/lib/intro";

export const metadata = { title: "Loader preview", robots: { index: false, follow: false } };

/** Development-only page for choosing the intro loader. Returns 404 in production. */
export default function LoaderPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();
  const variants = Object.entries(INTRO_VARIANTS) as unknown as [string, (typeof INTRO_VARIANTS)[IntroVariant]][];
  return (
    <section className="section pt-[calc(var(--header-h)+3rem)]">
      <div className="wrap max-w-4xl">
        <p className="t-eyebrow">Local preview only</p>
        <h1 className="t-h1 mt-4">Choose an intro loader</h1>
        <p className="t-lead mt-5 text-muted">
          Each link opens the homepage and plays that loader. On the live site the chosen loader plays once per visit and is skipped for visitors
          who have reduced motion turned on. Currently live: <strong className="text-ink">{INTRO_LOADER ? INTRO_VARIANTS[INTRO_LOADER].name : "none"}</strong>.
        </p>
        <ol className="mt-12 grid gap-4 sm:grid-cols-2">
          {variants.map(([n, v]) => (
            <li key={n} className="flex flex-col border border-line p-6">
              <p className="font-display text-sm text-muted">Option {n}</p>
              <h2 className="t-h3 mt-2">{v.name}</h2>
              <p className="mt-3 flex-1 text-[0.9375rem] text-muted">{v.description}</p>
              <p className="mt-3 text-xs text-muted">Length: {(v.ms / 1000).toFixed(1)} seconds</p>
              <div className="mt-6 flex flex-wrap gap-3">
                {/* Plain links (full page load) so the loader plays exactly as a first visit would. */}
                <a href={`/?loader=${n}`} className="btn btn-primary">
                  Preview on homepage
                </a>
                <a href={`/pricing?loader=${n}`} className="btn btn-ghost">
                  On another page
                </a>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
