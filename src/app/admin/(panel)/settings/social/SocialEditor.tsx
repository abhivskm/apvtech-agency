"use client";

import { Plus, Trash2 } from "lucide-react";
import { PublishBar, SortableList, Switch, useAdminForm } from "@/components/admin/form";
import { SOCIAL_PLATFORMS } from "@/lib/validation/content";
import { saveSocial } from "../actions";

type Item = { id: string; platform: string; label: string; url: string; visible: boolean };
const LABELS: Record<string, string> = { instagram: "Instagram", facebook: "Facebook", linkedin: "LinkedIn", youtube: "YouTube", pinterest: "Pinterest", x: "X", threads: "Threads", behance: "Behance", dribbble: "Dribbble", "whatsapp-channel": "WhatsApp Channel", other: "Other" };
let n = 0;

export function SocialEditor({ initial }: { initial: Item[] }) {
  const form = useAdminForm({ items: initial }, saveSocial);
  const items: Item[] = form.values.items;
  const patch = (id: string, p: Partial<Item>) => form.set("items", items.map((i) => (i.id === id ? { ...i, ...p } : i)));
  return (
    <form onSubmit={(e) => e.preventDefault()} className="max-w-3xl">
      <div className="a-card">
        {items.length === 0 && <p className="p-6 text-center text-sm text-zinc-500">No social profiles yet.</p>}
        <SortableList
          items={items}
          onReorder={(ids) => form.set("items", ids.map((id) => items.find((i) => i.id === id)!))}
          render={(it, i) => (
            <div className="flex flex-wrap items-start gap-2 py-2 pr-3">
              <select className="a-input w-40" value={it.platform} aria-label="Platform" onChange={(e) => patch(it.id, { platform: e.target.value, label: LABELS[e.target.value] ?? it.label })}>
                {SOCIAL_PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {LABELS[p]}
                  </option>
                ))}
              </select>
              <input className="a-input w-36" value={it.label} aria-label="Label" onChange={(e) => patch(it.id, { label: e.target.value })} />
              <div className="min-w-50 flex-1">
                <input className="a-input" value={it.url} placeholder="https://instagram.com/yourbrand" aria-label="Profile URL" aria-invalid={form.errors[`items.${i}.url`] ? true : undefined} onChange={(e) => patch(it.id, { url: e.target.value })} />
                {form.errors[`items.${i}.url`] && <p className="a-error">{form.errors[`items.${i}.url`]}</p>}
              </div>
              <div className="pt-2">
                <Switch checked={it.visible} onChange={(v) => patch(it.id, { visible: v })} label="Show" />
              </div>
              <button type="button" className="a-btn a-btn-ghost a-btn-sm mt-1 text-red-700" aria-label="Remove" onClick={() => form.set("items", items.filter((x) => x.id !== it.id))}>
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        />
        <div className="border-t border-zinc-100 p-3">
          <button type="button" className="a-btn a-btn-secondary" onClick={() => form.set("items", [...items, { id: `new-${n++}`, platform: "instagram", label: "Instagram", url: "", visible: true }])}>
            <Plus className="h-4 w-4" /> Add profile
          </button>
        </div>
      </div>
      <PublishBar form={form} />
    </form>
  );
}
