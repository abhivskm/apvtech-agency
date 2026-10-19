"use client";

import { PublishBar, Section, SlugField, StringListField, SwitchField, TextArea, TextField, useAdminForm, type Values } from "@/components/admin/form";
import { planPriceLines } from "@/lib/pricing";
import { savePlan } from "../actions";

const toNum = (v: unknown) => {
  const n = Number(String(v ?? "").replace(/[₹,\s]/g, ""));
  return String(v ?? "").trim() === "" || !Number.isFinite(n) ? null : Math.round(n);
};

export function PlanForm({ initial, pricingNote }: { initial: Values; pricingNote: string }) {
  const form = useAdminForm(initial, savePlan);
  const v = form.values;
  const price = planPriceLines({ setupPrice: toNum(v.setupPrice), monthlyPrice: toNum(v.monthlyPrice), pricePrefix: v.pricePrefix });

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <Section title="Plan">
            <TextField form={form} name="name" label="Plan name" required maxLength={60} />
            <SlugField form={form} from="name" prefix="/contact?plan=" />
            <TextField form={form} name="tagline" label="Tagline" maxLength={120} help="One short line under the name, e.g. “Show up and stay visible.”" />
            <TextArea form={form} name="bestFor" label="Best for" rows={2} maxLength={300} help="Who this plan suits." />
            <TextArea form={form} name="description" label="Short description" rows={2} maxLength={600} help="Used in search-engine data for the plan." />
          </Section>
          <Section title="What's included">
            <TextField form={form} name="includesLabel" label="Intro line (optional)" placeholder="Everything in Starter, plus:" maxLength={80} />
            <StringListField form={form} name="features" label="Features" placeholder="e.g. Up to 10 pages with CMS" />
            <StringListField form={form} name="notes" label="Small-print notes" placeholder="e.g. Ad spend not included" help="Shown in small text under the features." />
          </Section>
        </div>
        <div className="space-y-5">
          <Section title="Price" description="Whole rupees, excluding GST. Fill one or both. Leave both empty for a custom-quote plan.">
            <TextField form={form} name="setupPrice" label="One-time setup / project fee (₹)" placeholder="24999" />
            <TextField form={form} name="monthlyPrice" label="Monthly fee (₹)" placeholder="4999" />
            <TextField form={form} name="pricePrefix" label="Text before the price" help="e.g. “Starting from”, or “Custom quote” when there is no price." />
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm">
              <p className="text-xs text-zinc-500">Preview</p>
              <p className="text-xs text-zinc-500">{v.pricePrefix}</p>
              {price ? (
                <>
                  <p className="text-lg font-semibold">
                    {price.main} <span className="text-xs font-normal text-zinc-500">{price.unit}</span>
                  </p>
                  {price.secondary && <p className="font-medium">{price.secondary}</p>}
                  {pricingNote && <p className="text-xs text-zinc-500">{pricingNote}</p>}
                </>
              ) : (
                <p className="text-lg font-semibold">Let&apos;s talk</p>
              )}
            </div>
          </Section>
          <Section title="Presentation">
            <SwitchField form={form} name="highlighted" label="Highlight this plan" help="Accent border and primary button. Only one plan is highlighted at a time." />
            <TextField form={form} name="badge" label="Badge (optional)" placeholder="Most popular" maxLength={30} />
            <TextField form={form} name="ctaLabel" label="Button text" required maxLength={40} />
          </Section>
        </div>
      </div>
      <PublishBar form={form} status={v.status} previewHref={v.status !== "PUBLISHED" ? undefined : "/pricing"} />
    </form>
  );
}
