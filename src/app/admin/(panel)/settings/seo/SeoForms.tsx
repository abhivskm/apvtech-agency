"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ConfirmButton, PublishBar, Section, TextArea, TextField, useAdminForm, type Values } from "@/components/admin/form";
import { MediaField } from "@/components/admin/MediaPicker";
import { deleteRedirect, saveRedirect, saveSeo } from "../actions";

export function SeoForm({ initial, brandName }: { initial: Values; brandName: string }) {
  const form = useAdminForm(initial, saveSeo);
  const preview = String(form.values.titleTemplate || "%s").replace("%s", "Website Design & Development").replace("{brand}", brandName);
  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <Section title="Defaults">
        <TextField form={form} name="defaultSeoTitle" label="Homepage / default title" required maxLength={70} />
        <TextArea form={form} name="defaultSeoDescription" label="Default meta description" required rows={3} maxLength={170} />
        <TextField form={form} name="titleTemplate" label="Title template" help={<>Use %s for the page title and {"{brand}"} for the brand name. Example: <em>{preview}</em></>} />
        <MediaField form={form} name="ogImageId" label="Default social sharing image" help="Recommended 1200 × 630 px." />
        <TextField
          form={form}
          name="gscVerification"
          label="Google Search Console verification code"
          help={<>From the HTML-tag method, paste only the <code>content</code> value — e.g. <code>abc123XYZ</code>.</>}
        />
      </Section>
      <PublishBar form={form} />
    </form>
  );
}

type R = { id: string; fromPath: string; toPath: string; permanent: boolean };

export function RedirectsManager({ redirects }: { redirects: R[] }) {
  const router = useRouter();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [permanent, setPermanent] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, start] = useTransition();
  return (
    <section className="a-card p-5">
      <h2 className="text-sm font-semibold">Redirects</h2>
      <p className="text-xs text-zinc-500">Send visitors from an old URL to a new one (e.g. after renaming a page). Applied whenever the old URL would otherwise show “not found”.</p>
      <form
        className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto]"
        onSubmit={(e) => {
          e.preventDefault();
          start(async () => {
            const res = await saveRedirect({ fromPath: from, toPath: to, permanent });
            if (res.ok) {
              setFrom("");
              setTo("");
              setErrors({});
              toast.success(res.message ?? "Saved");
              router.refresh();
            } else {
              setErrors(res.fieldErrors ?? {});
              toast.error(res.error);
            }
          });
        }}
      >
        <div>
          <input className="a-input font-mono text-xs" placeholder="/old-page" value={from} onChange={(e) => setFrom(e.target.value)} aria-label="From path" aria-invalid={errors.fromPath ? true : undefined} />
          {errors.fromPath && <p className="a-error">{errors.fromPath}</p>}
        </div>
        <div>
          <input className="a-input font-mono text-xs" placeholder="/new-page or https://…" value={to} onChange={(e) => setTo(e.target.value)} aria-label="To" aria-invalid={errors.toPath ? true : undefined} />
          {errors.toPath && <p className="a-error">{errors.toPath}</p>}
        </div>
        <button type="submit" className="a-btn a-btn-primary" disabled={pending}>
          Add
        </button>
        <label className="flex items-center gap-2 text-xs sm:col-span-3">
          <input type="checkbox" checked={permanent} onChange={(e) => setPermanent(e.target.checked)} /> Permanent (308) — use for pages that have moved for good
        </label>
      </form>
      <ul className="mt-4 divide-y divide-zinc-100 text-sm">
        {redirects.map((r) => (
          <li key={r.id} className="flex items-center justify-between gap-2 py-2">
            <span className="min-w-0 truncate font-mono text-xs">
              {r.fromPath} → {r.toPath} <span className="text-zinc-400">({r.permanent ? "permanent" : "temporary"})</span>
            </span>
            <ConfirmButton label="Remove" title="Remove this redirect?" action={() => deleteRedirect(r.id)} className="a-btn a-btn-ghost a-btn-sm text-red-700" />
          </li>
        ))}
        {redirects.length === 0 && <li className="py-2 text-xs text-zinc-400">No redirects.</li>}
      </ul>
    </section>
  );
}
