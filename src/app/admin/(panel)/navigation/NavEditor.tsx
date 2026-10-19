"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
import { PublishBar, SortableList, Switch, useAdminForm } from "@/components/admin/form";
import { saveNavigation } from "./actions";

type Child = { id: string; label: string; href: string; visible: boolean; newTab: boolean };
type Item = Child & { children: Child[] };

let n = 0;
const tmp = () => `new-${Date.now()}-${n++}`;

export function NavEditor({
  location,
  title,
  help,
  nested,
  initial,
  suggestions,
}: {
  location: string;
  title: string;
  help: string;
  nested: boolean;
  initial: Item[];
  suggestions: { label: string; href: string }[];
}) {
  const form = useAdminForm({ items: initial }, (v) =>
    saveNavigation({ location, items: (v.items as Item[]).map(({ id, children, ...rest }) => ({ ...rest, id: id.startsWith("new-") ? undefined : id, children: children.map(({ id: cid, ...c }) => ({ ...c, id: cid.startsWith("new-") ? undefined : cid })) })) }),
  );
  const items: Item[] = form.values.items;
  const [open, setOpen] = useState<string | null>(null);
  const setItems = (next: Item[]) => form.set("items", next);
  const patch = (id: string, p: Partial<Item>) => setItems(items.map((i) => (i.id === id ? { ...i, ...p } : i)));
  const err = (i: number, field: string, c?: number) => form.errors[c === undefined ? `items.${i}.${field}` : `items.${i}.children.${c}.${field}`];

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <div className="a-card">
        <div className="border-b border-zinc-100 px-4 py-3">
          <h2 className="text-sm font-semibold">{title}</h2>
          {help && <p className="text-xs text-zinc-500">{help}</p>}
        </div>
        <datalist id="nav-suggestions">
          {suggestions.map((s) => (
            <option key={s.href} value={s.href}>
              {s.label}
            </option>
          ))}
        </datalist>
        <SortableList
          items={items}
          onReorder={(ids) => setItems(ids.map((id) => items.find((i) => i.id === id)!))}
          render={(it, i) => (
            <div className="py-2 pr-3">
              <div className="flex flex-wrap items-start gap-2">
                {nested && (
                  <button type="button" className="a-btn a-btn-ghost a-btn-sm mt-1" onClick={() => setOpen(open === it.id ? null : it.id)} aria-expanded={open === it.id} aria-label="Show dropdown items">
                    {open === it.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                )}
                <div className="min-w-35 flex-1">
                  <input className="a-input" value={it.label} aria-label="Label" placeholder="Label" aria-invalid={err(i, "label") ? true : undefined} onChange={(e) => patch(it.id, { label: e.target.value })} />
                  {err(i, "label") && <p className="a-error">{err(i, "label")}</p>}
                </div>
                <div className="min-w-45 flex-1">
                  <input className="a-input font-mono text-xs" list="nav-suggestions" value={it.href} aria-label="Destination" placeholder="/page or https://" aria-invalid={err(i, "href") ? true : undefined} onChange={(e) => patch(it.id, { href: e.target.value })} />
                  {err(i, "href") && <p className="a-error">{err(i, "href")}</p>}
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <Switch checked={it.visible} onChange={(v) => patch(it.id, { visible: v })} label="Visible" />
                  <label className="flex items-center gap-1 text-xs">
                    <input type="checkbox" checked={it.newTab} onChange={(e) => patch(it.id, { newTab: e.target.checked })} /> New tab
                  </label>
                  <button type="button" className="a-btn a-btn-ghost a-btn-sm text-red-700" aria-label={`Remove ${it.label}`} onClick={() => setItems(items.filter((x) => x.id !== it.id))}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {nested && open === it.id && (
                <div className="ml-10 mt-2 space-y-2 rounded-lg bg-zinc-50 p-3">
                  <p className="text-xs text-zinc-500">Dropdown items ({it.children.length})</p>
                  {it.children.map((c, ci) => (
                    <div key={c.id} className="flex flex-wrap gap-2">
                      <input className="a-input min-w-35 flex-1" value={c.label} aria-label="Child label" onChange={(e) => patch(it.id, { children: it.children.map((x) => (x.id === c.id ? { ...x, label: e.target.value } : x)) })} />
                      <input className="a-input min-w-45 flex-1 font-mono text-xs" list="nav-suggestions" value={c.href} aria-label="Child destination" aria-invalid={err(i, "href", ci) ? true : undefined} onChange={(e) => patch(it.id, { children: it.children.map((x) => (x.id === c.id ? { ...x, href: e.target.value } : x)) })} />
                      <button type="button" className="a-btn a-btn-ghost a-btn-sm" disabled={ci === 0} aria-label="Move up" onClick={() => { const ch = [...it.children]; [ch[ci - 1], ch[ci]] = [ch[ci], ch[ci - 1]]; patch(it.id, { children: ch }); }}>
                        ↑
                      </button>
                      <button type="button" className="a-btn a-btn-ghost a-btn-sm text-red-700" aria-label="Remove child" onClick={() => patch(it.id, { children: it.children.filter((x) => x.id !== c.id) })}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                      {(err(i, "href", ci) || err(i, "label", ci)) && <p className="a-error w-full">{err(i, "href", ci) ?? err(i, "label", ci)}</p>}
                    </div>
                  ))}
                  <button type="button" className="a-btn a-btn-secondary a-btn-sm" onClick={() => patch(it.id, { children: [...it.children, { id: tmp(), label: "", href: "/", visible: true, newTab: false }] })}>
                    <Plus className="h-3.5 w-3.5" /> Add dropdown item
                  </button>
                </div>
              )}
            </div>
          )}
        />
        <div className="border-t border-zinc-100 p-3">
          <button type="button" className="a-btn a-btn-secondary" onClick={() => setItems([...items, { id: tmp(), label: "", href: "/", visible: true, newTab: false, children: [] }])}>
            <Plus className="h-4 w-4" /> Add link
          </button>
        </div>
      </div>
      <PublishBar form={form} />
    </form>
  );
}
