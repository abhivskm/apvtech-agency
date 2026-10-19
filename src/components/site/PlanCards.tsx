import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import type { PlanCard } from "@/lib/content/queries";
import { planPriceLines } from "@/lib/pricing";

/** Side-by-side plan cards. `compact` hides the long feature lists (used on the homepage). */
export function PlanCards({ plans, pricingNote, compact = false }: { plans: PlanCard[]; pricingNote: string; compact?: boolean }) {
  return (
    <ul className={`grid grid-cols-1 gap-4 md:grid-cols-2 ${plans.length >= 4 ? "xl:grid-cols-4" : "xl:grid-cols-3"}`}>
      {plans.map((plan, i) => {
        const price = planPriceLines(plan);
        return (
          <li
            key={plan.id}
            data-reveal
            style={{ ["--reveal-delay" as string]: `${i * 80}ms` }}
            className={`relative flex flex-col border p-6 lg:p-7 ${plan.highlighted ? "border-accent bg-surface" : "border-line bg-bg"}`}
          >
            {plan.badge && (
              <span className="absolute -top-3 left-6 rounded-full bg-accent px-3 py-1 font-display text-xs font-medium text-on-accent">{plan.badge}</span>
            )}
            <h3 className="t-h3">{plan.name}</h3>
            {plan.tagline && <p className="mt-2 text-muted xl:min-h-[3.25rem]">{plan.tagline}</p>}

            <div className="mt-7 border-t border-line pt-6">
              <p className="text-sm text-muted">{plan.pricePrefix}</p>
              {price ? (
                <>
                  <p className="mt-1 flex flex-wrap items-baseline gap-x-2">
                    <span className="t-h2">{price.main}</span>
                    <span className="text-sm text-muted">{price.unit}</span>
                  </p>
                  {price.secondary && <p className="mt-1 font-display text-lg">{price.secondary}</p>}
                </>
              ) : (
                <p className="t-h2 mt-1">Let&apos;s talk</p>
              )}
              {price && pricingNote && <p className="mt-2 text-xs text-muted">{pricingNote}</p>}
            </div>

            {plan.bestFor && <p className="mt-6 text-[0.9375rem] text-ink/85">{plan.bestFor}</p>}

            {!compact && plan.features.length > 0 && (
              <div className="mt-6">
                {plan.includesLabel && <p className="mb-3 text-sm font-medium">{plan.includesLabel}</p>}
                <ul className="space-y-2.5 text-[0.9375rem]">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-3">
                      <Check className="mt-1 h-4 w-4 shrink-0 text-accent" aria-hidden />
                      <span className="text-ink/90">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {!compact && plan.notes.length > 0 && (
              <ul className="mt-5 space-y-1 text-xs text-muted">
                {plan.notes.map((n) => (
                  <li key={n}>* {n}</li>
                ))}
              </ul>
            )}

            <div className="mt-auto pt-8">
              <Link
                href={`/contact?plan=${encodeURIComponent(plan.slug)}`}
                className={`btn w-full ${plan.highlighted ? "btn-primary" : "btn-ghost"}`}
                aria-label={`${plan.ctaLabel} — ${plan.name} plan`}
              >
                {plan.ctaLabel} <ArrowUpRight className="btn-arrow h-4 w-4" aria-hidden />
              </Link>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
