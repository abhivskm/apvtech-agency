"use client";

import { ActionButton, PublishBar, Section, TextArea, TextField, useAdminForm, type Values } from "@/components/admin/form";
import { MediaField } from "@/components/admin/MediaPicker";
import { resetBrandColors, saveBranding } from "../actions";

const COLOR_FIELDS = [
  ["background", "Main background"],
  ["surface", "Secondary background"],
  ["elevated", "Elevated surface"],
  ["text", "Primary text"],
  ["muted", "Secondary text"],
  ["accent", "Signature accent"],
] as const;

function contrast(a: string, b: string) {
  const lum = (hex: string) => {
    const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  if (!/^#[0-9a-f]{6}$/i.test(a) || !/^#[0-9a-f]{6}$/i.test(b)) return 0;
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}

export function BrandingForm({ initial }: { initial: Values }) {
  const form = useAdminForm(initial, saveBranding);
  const colors = form.values.colors as Record<string, string>;
  const setColor = (k: string, v: string) => form.set("colors", { ...colors, [k]: v });
  const textRatio = contrast(colors.text, colors.background);
  const mutedRatio = contrast(colors.muted, colors.background);

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-2">
        <Section title="Identity">
          <TextField form={form} name="brandName" label="Brand name" required maxLength={60} help="“FORM & SIGNAL” is a temporary working name — replace it when your final name is decided." />
          <TextField form={form} name="brandShortName" label="Short name" maxLength={20} />
          <TextField form={form} name="tagline" label="Tagline" required maxLength={120} />
          <TextArea form={form} name="supportingMessage" label="Supporting message" rows={3} maxLength={400} />
          <MediaField form={form} name="logoId" label="Logo" help="Leave empty to use a typographic wordmark of the brand name. PNG/WebP with a transparent background works best on the dark theme." />
          <MediaField form={form} name="faviconId" label="Favicon" help="Square PNG (at least 64 × 64) or .ico." />
        </Section>
        <Section title="Colours" description="Hex values. The accent is used sparingly for primary actions and highlights.">
          <div className="grid gap-3 sm:grid-cols-2">
            {COLOR_FIELDS.map(([k, label]) => (
              <div key={k}>
                <label className="a-label" htmlFor={`c-${k}`}>
                  {label}
                </label>
                <div className="flex gap-2">
                  <input type="color" value={/^#[0-9a-f]{6}$/i.test(colors[k]) ? colors[k] : "#000000"} onChange={(e) => setColor(k, e.target.value.toUpperCase())} className="h-[38px] w-12 cursor-pointer rounded border border-zinc-300" aria-label={`${label} picker`} />
                  <input id={`c-${k}`} className="a-input font-mono text-xs" value={colors[k]} onChange={(e) => setColor(k, e.target.value)} aria-invalid={form.errors[`colors.${k}`] ? true : undefined} />
                </div>
                {form.errors[`colors.${k}`] && <p className="a-error">{form.errors[`colors.${k}`]}</p>}
              </div>
            ))}
          </div>
          <div className="rounded-lg p-5" style={{ background: colors.background, color: colors.text }}>
            <p style={{ fontSize: 22, fontWeight: 600 }}>{String(form.values.brandName)}</p>
            <p style={{ color: colors.muted, fontSize: 13 }}>{String(form.values.tagline)}</p>
            <div className="mt-3 inline-block rounded-full px-4 py-2 text-sm font-medium" style={{ background: colors.accent, color: "#0A0A0A" }}>
              Start a Project
            </div>
            <div className="mt-3 rounded p-3 text-xs" style={{ background: colors.surface, color: colors.muted }}>
              Surface
            </div>
          </div>
          <p className={`text-xs ${textRatio >= 4.5 && mutedRatio >= 4.5 ? "text-emerald-700" : "text-red-700"}`}>
            Contrast — text: {textRatio.toFixed(1)}:1, secondary text: {mutedRatio.toFixed(1)}:1 {textRatio >= 4.5 && mutedRatio >= 4.5 ? "(meets WCAG AA)" : "(below WCAG AA 4.5:1 — adjust for readability)"}
          </p>
          <ActionButton action={() => resetBrandColors(undefined)}>Reset to default palette</ActionButton>
        </Section>
      </div>
      <PublishBar form={form} />
    </form>
  );
}
