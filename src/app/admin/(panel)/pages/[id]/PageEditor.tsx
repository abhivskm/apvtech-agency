"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Copy, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { Field, PublishBar, Section, SeoFields, SlugField, SortableList, Switch, TextField, useAdminForm, type FormApi, type Values } from "@/components/admin/form";
import { MediaField, MediaListField } from "@/components/admin/MediaPicker";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { SECTION_TYPES, SECTION_TYPE_KEYS, type FieldSpec, type SectionType } from "@/lib/validation/sections";
import { savePage } from "../actions";

type SectionValue = { id?: string; key?: string | null; type: string; visible: boolean; data: Values; _cid: string };

function istToIso(v: string) {
  return v ? new Date(`${v}:00+05:30`).toISOString() : null;
}
let cidCounter = 0;
const cid = () => `c${Date.now().toString(36)}${(cidCounter++).toString(36)}`;

/** Adapts a nested object (section data / list item) to the FormApi interface so standard fields can edit it. */
function subForm(parent: FormApi, values: Values, onChange: (next: Values) => void, errorPrefix: string): FormApi {
  const errors: Record<string, string> = {};
  for (const [k, v] of Object.entries(parent.errors)) if (k.startsWith(errorPrefix)) errors[k.slice(errorPrefix.length)] = v;
  return { ...parent, values, errors, set: (name, value) => onChange({ ...values, [name]: value }) };
}

function FieldRenderer({ spec, form }: { spec: FieldSpec; form: FormApi }) {
  switch (spec.kind) {
    case "text":
      return <TextField form={form} name={spec.name} label={spec.label} help={spec.help} required={spec.required} maxLength={spec.max} />;
    case "textarea":
      return (
        <Field id={`ta-${spec.name}`} label={spec.label} help={spec.help} error={form.errors[spec.name]} required={spec.required}>
          <textarea id={`ta-${spec.name}`} className="a-input" rows={3} maxLength={spec.max} value={form.values[spec.name] ?? ""} onChange={(e) => form.set(spec.name, e.target.value)} />
        </Field>
      );
    case "richtext":
      return (
        <div>
          <p className="a-label">{spec.label}</p>
          <RichTextEditor value={form.values[spec.name] ?? ""} onChange={(html) => form.set(spec.name, html)} label={spec.label} />
          {spec.help && <p className="a-help">{spec.help}</p>}
        </div>
      );
    case "link": {
      const v = (form.values[spec.name] as { label?: string; href?: string } | undefined) ?? {};
      return (
        <fieldset>
          <legend className="a-label">{spec.label}</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            <input className="a-input" placeholder="Button text" aria-label={`${spec.label} text`} value={v.label ?? ""} onChange={(e) => form.set(spec.name, { ...v, label: e.target.value })} />
            <input className="a-input" placeholder="/contact or https://…" aria-label={`${spec.label} destination`} value={v.href ?? ""} onChange={(e) => form.set(spec.name, { ...v, href: e.target.value })} />
          </div>
          {form.errors[spec.name] && <p className="a-error">{form.errors[spec.name]}</p>}
        </fieldset>
      );
    }
    case "media":
      return <MediaField form={form} name={spec.name} label={spec.label} help={spec.help} />;
    case "mediaList":
      return <MediaListField form={form} name={spec.name} label={spec.label} help={spec.help} max={spec.max} />;
    case "boolean":
      return <Switch checked={Boolean(form.values[spec.name])} onChange={(v) => form.set(spec.name, v)} label={spec.label} help={spec.help} />;
    case "number":
      return <TextField form={form} name={spec.name} label={spec.label} help={spec.help} type="number" />;
    case "select":
      return (
        <Field id={`sel-${spec.name}`} label={spec.label} help={spec.help} error={form.errors[spec.name]}>
          <select id={`sel-${spec.name}`} className="a-input" value={form.values[spec.name] ?? spec.options[0]?.value} onChange={(e) => form.set(spec.name, e.target.value)}>
            {spec.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
      );
    case "list": {
      const items: Values[] = form.values[spec.name] ?? [];
      const setItems = (next: Values[]) => form.set(spec.name, next);
      return (
        <div>
          <p className="a-label">{spec.label}</p>
          <ol className="space-y-2">
            {items.map((item, i) => (
              <li key={i} className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                <div className="mb-2 flex items-center justify-between text-xs text-zinc-500">
                  <span>
                    #{i + 1} {(() => {
                      const name = [item.title, item.label, item.text].find((v) => typeof v === "string" && v);
                      return name ? `— ${String(name).slice(0, 60)}` : "";
                    })()}
                  </span>
                  <span className="flex gap-1">
                    <button type="button" className="a-btn a-btn-ghost a-btn-sm" disabled={i === 0} onClick={() => setItems(items.map((x, j) => (j === i - 1 ? items[i] : j === i ? items[i - 1] : x)))} aria-label="Move up">
                      ↑
                    </button>
                    <button type="button" className="a-btn a-btn-ghost a-btn-sm" disabled={i === items.length - 1} onClick={() => setItems(items.map((x, j) => (j === i + 1 ? items[i] : j === i ? items[i + 1] : x)))} aria-label="Move down">
                      ↓
                    </button>
                    <button type="button" className="a-btn a-btn-ghost a-btn-sm text-red-700" onClick={() => setItems(items.filter((_, j) => j !== i))} aria-label="Remove item">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </span>
                </div>
                <div className="space-y-3">
                  {spec.fields.map((sf) => (
                    <FieldRenderer key={sf.name} spec={sf} form={subForm(form, item, (next) => setItems(items.map((x, j) => (j === i ? next : x))), `${spec.name}.${i}.`)} />
                  ))}
                </div>
              </li>
            ))}
          </ol>
          {(spec.max === undefined || items.length < spec.max) && (
            <button type="button" className="a-btn a-btn-secondary a-btn-sm mt-2" onClick={() => setItems([...items, {}])}>
              <Plus className="h-3.5 w-3.5" /> Add item
            </button>
          )}
          {spec.help && <p className="a-help">{spec.help}</p>}
        </div>
      );
    }
  }
}

function summary(s: SectionValue) {
  const d = s.data;
  const text = (d.heading ?? d.headline ?? d.title ?? "") as string;
  return text.replace(/\n/g, " ").slice(0, 70);
}

export function PageEditor({ initial, isSystem, isHome }: { initial: Values; isSystem: boolean; isHome: boolean }) {
  const startSections = useMemo(() => (initial.sections as Omit<SectionValue, "_cid">[]).map((s) => ({ ...s, _cid: s.id ?? cid() })), [initial.sections]);
  const form = useAdminForm({ ...initial, sections: startSections }, (values) =>
    savePage({ ...values, publishedAt: istToIso(values.publishedAt), sections: (values.sections as SectionValue[]).map(({ _cid, ...s }) => (void _cid, s)) }),
  );
  const sections: SectionValue[] = form.values.sections;
  const [open, setOpen] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const setSections = (next: SectionValue[]) => form.set("sections", next);
  const update = (c: string, patch: Partial<SectionValue>) => setSections(sections.map((s) => (s._cid === c ? { ...s, ...patch } : s)));
  const errorIndexes = new Set(Object.keys(form.errors).filter((k) => k.startsWith("sections.")).map((k) => Number(k.split(".")[1])));

  const add = (type: SectionType) => {
    const s: SectionValue = { type, visible: true, data: structuredClone(SECTION_TYPES[type].defaults), _cid: cid() };
    setSections([...sections, s]);
    setOpen(s._cid);
    setAdding(false);
  };

  const pagePath = isHome ? "/" : `/${form.values.slug}`;

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Sections ({sections.length})</h2>
            <p className="text-xs text-zinc-500">Drag to reorder · eye icon toggles visibility</p>
          </div>
          {sections.length === 0 && <p className="a-card p-6 text-center text-sm text-zinc-500">No sections yet. Add the first one below.</p>}
          <SortableList
            className="space-y-2"
            items={sections.map((s) => ({ ...s, id: s._cid }))}
            onReorder={(ids) => setSections(ids.map((id) => sections.find((s) => s._cid === id)!))}
            render={(s, i) => {
              const def = SECTION_TYPES[s.type as SectionType];
              const isOpen = open === s._cid;
              const hasError = errorIndexes.has(i);
              return (
                <div className={`a-card overflow-hidden ${hasError ? "border-red-300 ring-1 ring-red-200" : ""} ${!s.visible ? "opacity-70" : ""}`}>
                  <div className="flex items-center gap-2 px-3 py-2.5">
                    <button type="button" className="flex min-w-0 flex-1 items-center gap-2 text-left" onClick={() => setOpen(isOpen ? null : s._cid)} aria-expanded={isOpen}>
                      {isOpen ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
                      <span className="a-badge shrink-0 border-zinc-200 bg-zinc-100 text-zinc-700">{def?.label ?? s.type}</span>
                      <span className="truncate text-[13px]">{summary(s) || <em className="text-zinc-400">Untitled</em>}</span>
                      {hasError && <span className="a-badge border-red-200 bg-red-50 text-red-700">Fix errors</span>}
                      {!s.visible && <span className="a-badge border-zinc-200 bg-white text-zinc-500">Hidden</span>}
                    </button>
                    <button type="button" className="a-btn a-btn-ghost a-btn-sm" onClick={() => update(s._cid, { visible: !s.visible })} aria-label={s.visible ? "Hide section" : "Show section"} title={s.visible ? "Hide" : "Show"}>
                      {s.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    <button
                      type="button"
                      className="a-btn a-btn-ghost a-btn-sm"
                      title="Duplicate"
                      aria-label="Duplicate section"
                      onClick={() => {
                        const copy = { ...s, id: undefined, key: null, data: structuredClone(s.data), _cid: cid() };
                        const idx = sections.findIndex((x) => x._cid === s._cid);
                        setSections([...sections.slice(0, idx + 1), copy, ...sections.slice(idx + 1)]);
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="a-btn a-btn-ghost a-btn-sm text-red-700"
                      aria-label="Remove section"
                      title="Remove"
                      onClick={() => window.confirm(`Remove this ${def?.label ?? "section"}? You can undo by leaving without saving.`) && setSections(sections.filter((x) => x._cid !== s._cid))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  {isOpen && def && (
                    <div className="space-y-4 border-t border-zinc-100 bg-white p-4">
                      <p className="text-xs text-zinc-500">{def.description}</p>
                      {def.fields.map((f) => (
                        <FieldRenderer key={f.name} spec={f} form={subForm(form, s.data, (data) => update(s._cid, { data }), `sections.${i}.`)} />
                      ))}
                    </div>
                  )}
                </div>
              );
            }}
          />
          <div className="relative">
            <button type="button" className="a-btn a-btn-secondary w-full" onClick={() => setAdding((a) => !a)} aria-expanded={adding}>
              <Plus className="h-4 w-4" /> Add section
            </button>
            {adding && (
              <ul className="a-card mt-2 grid gap-1 p-2 sm:grid-cols-2">
                {SECTION_TYPE_KEYS.map((t) => (
                  <li key={t}>
                    <button type="button" className="w-full rounded-md p-2 text-left hover:bg-zinc-100" onClick={() => add(t)}>
                      <span className="block text-[13px] font-medium">{SECTION_TYPES[t].label}</span>
                      <span className="block text-xs text-zinc-500">{SECTION_TYPES[t].description}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <Section title="Page settings">
            <TextField form={form} name="title" label="Page title" required maxLength={120} />
            {isSystem ? (
              <p className="text-xs text-zinc-500">
                URL: <code>{pagePath}</code> (fixed)
              </p>
            ) : (
              <SlugField form={form} prefix="/" />
            )}
            {!isHome && (
              <Field id="pg-pub" label="Publish date & time (IST)" help="A future date schedules the page." error={form.errors.publishedAt}>
                <input id="pg-pub" type="datetime-local" className="a-input" value={form.values.publishedAt ?? ""} onChange={(e) => form.set("publishedAt", e.target.value)} />
              </Field>
            )}
          </Section>
          <Section title="SEO & sharing">
            <SeoFields form={form} path={pagePath} />
            <MediaField form={form} name="ogImageId" label="Social sharing image" help="Defaults to the site-wide image." />
          </Section>
        </div>
      </div>
      <PublishBar
        form={form}
        status={isHome ? undefined : form.values.status}
        previewHref={form.values.id && form.values.slug ? `/api/preview?type=page&slug=${form.values.slug}` : undefined}
        extra={isHome ? <a href="/" target="_blank" rel="noopener noreferrer" className="a-btn a-btn-secondary">View homepage</a> : undefined}
      />
    </form>
  );
}
