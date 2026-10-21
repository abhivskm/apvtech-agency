"use client";

import { useCallback, useEffect, useId, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { GripVertical, Loader2, Plus, Trash2, X } from "lucide-react";
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ActionResult } from "@/lib/admin/action";
import { slugify } from "@/lib/slug";

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Values = Record<string, any>;

export type FormApi = {
  values: Values;
  errors: Record<string, string>;
  dirty: boolean;
  saving: boolean;
  set: (name: string, value: unknown) => void;
  submit: (overrides?: Values) => Promise<boolean>;
};

/**
 * Admin form state: tracks values, dirty state and server-side field errors, shows toasts,
 * refreshes server data after a successful save and warns before leaving with unsaved changes.
 */
export function useAdminForm(
  initial: Values,
  save: (values: Values) => Promise<ActionResult<{ redirect?: string }>>,
  opts: { successMessage?: string } = {},
): FormApi {
  const router = useRouter();
  const [values, setValues] = useState<Values>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState(false);
  const [saving, startTransition] = useTransition();
  useUnsavedGuard(dirty);

  const set = useCallback((name: string, value: unknown) => {
    setValues((v) => ({ ...v, [name]: value }));
    setDirty(true);
    setErrors((e) => {
      if (!e[name]) return e;
      const { [name]: _removed, ...rest } = e;
      void _removed;
      return rest;
    });
  }, []);

  const submit = useCallback(
    (overrides?: Values) =>
      new Promise<boolean>((resolve) => {
        const payload = { ...values, ...overrides };
        startTransition(async () => {
          const res = await save(payload);
          if (res.ok) {
            setErrors({});
            setDirty(false);
            if (overrides) setValues(payload);
            toast.success(res.message ?? opts.successMessage ?? "Saved");
            if (res.data?.redirect) router.push(res.data.redirect);
            else router.refresh();
            resolve(true);
          } else {
            setErrors(res.fieldErrors ?? {});
            toast.error(res.error);
            resolve(false);
          }
        });
      }),
    [values, save, router, opts.successMessage],
  );

  return { values, errors, dirty, saving, set, submit };
}

export function useUnsavedGuard(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank" || e.metaKey || e.ctrlKey) return;
      if (!window.confirm("You have unsaved changes. Leave this page without saving?")) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [dirty]);
}

/* ───────────── Field primitives ───────────── */

export function Field({ label, help, error, id, children, required }: { label: string; help?: React.ReactNode; error?: string; id: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label htmlFor={id} className="a-label">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-err`} className="a-error">
          {error}
        </p>
      ) : help ? (
        <p className="a-help">{help}</p>
      ) : null}
    </div>
  );
}

type Common = { form: FormApi; name: string; label: string; help?: React.ReactNode; required?: boolean };

export function TextField({ form, name, label, help, required, type = "text", placeholder, maxLength }: Common & { type?: string; placeholder?: string; maxLength?: number }) {
  const id = useId();
  const v = form.values[name] ?? "";
  return (
    <Field id={id} label={label} help={help ?? (maxLength ? `${String(v).length}/${maxLength}` : undefined)} error={form.errors[name]} required={required}>
      <input
        id={id}
        type={type}
        className="a-input"
        value={v}
        placeholder={placeholder}
        maxLength={maxLength}
        aria-invalid={form.errors[name] ? true : undefined}
        onChange={(e) => form.set(name, e.target.value)}
      />
    </Field>
  );
}

export function TextArea({ form, name, label, help, required, rows = 4, maxLength }: Common & { rows?: number; maxLength?: number }) {
  const id = useId();
  const v = form.values[name] ?? "";
  return (
    <Field id={id} label={label} help={help ?? (maxLength ? `${String(v).length}/${maxLength}` : undefined)} error={form.errors[name]} required={required}>
      <textarea id={id} rows={rows} className="a-input" value={v} maxLength={maxLength} aria-invalid={form.errors[name] ? true : undefined} onChange={(e) => form.set(name, e.target.value)} />
    </Field>
  );
}

export function SelectField({ form, name, label, help, options, required, emptyLabel }: Common & { options: { value: string; label: string }[]; emptyLabel?: string }) {
  const id = useId();
  return (
    <Field id={id} label={label} help={help} error={form.errors[name]} required={required}>
      <select id={id} className="a-input" value={form.values[name] ?? ""} onChange={(e) => form.set(name, e.target.value || null)}>
        {emptyLabel !== undefined && <option value="">{emptyLabel}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function Switch({ checked, onChange, label, help, id: idProp }: { checked: boolean; onChange: (v: boolean) => void; label: string; help?: string; id?: string }) {
  const autoId = useId();
  const id = idProp ?? autoId;
  return (
    <div className="flex items-start gap-3">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? "bg-zinc-900" : "bg-zinc-300"}`}
      >
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-[18px]" : "translate-x-0.5"}`} />
      </button>
      <label htmlFor={id} className="cursor-pointer">
        <span className="block text-[13px] font-medium text-zinc-800">{label}</span>
        {help && <span className="block text-xs text-zinc-500">{help}</span>}
      </label>
    </div>
  );
}

export function SwitchField({ form, name, label, help }: Common) {
  return <Switch checked={Boolean(form.values[name])} onChange={(v) => form.set(name, v)} label={label} help={typeof help === "string" ? help : undefined} />;
}

export function SlugField({ form, name = "slug", from = "title", prefix }: { form: FormApi; name?: string; from?: string; prefix: string }) {
  const id = useId();
  return (
    <Field id={id} label="URL slug" required error={form.errors[name]} help={<>Public URL: <code>{prefix}{form.values[name] || "…"}</code></>}>
      <div className="flex gap-2">
        <input id={id} className="a-input font-mono text-xs" value={form.values[name] ?? ""} onChange={(e) => form.set(name, e.target.value.toLowerCase())} aria-invalid={form.errors[name] ? true : undefined} />
        <button type="button" className="a-btn a-btn-secondary" onClick={() => form.set(name, slugify(String(form.values[from] ?? "")))}>
          Generate
        </button>
      </div>
    </Field>
  );
}

export function CheckboxGroup({ form, name, label, options, help }: Common & { options: { value: string; label: string }[] }) {
  const selected: string[] = form.values[name] ?? [];
  const toggle = (v: string) => form.set(name, selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);
  return (
    <fieldset>
      <legend className="a-label">{label}</legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <label key={o.value} className={`cursor-pointer rounded-full border px-2.5 py-1 text-xs ${selected.includes(o.value) ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-300 bg-white hover:bg-zinc-50"}`}>
            <input type="checkbox" className="sr-only" checked={selected.includes(o.value)} onChange={() => toggle(o.value)} />
            {o.label}
          </label>
        ))}
        {options.length === 0 && <span className="text-xs text-zinc-500">No options available yet.</span>}
      </div>
      {help && <p className="a-help">{help}</p>}
      {form.errors[name] && <p className="a-error">{form.errors[name]}</p>}
    </fieldset>
  );
}

/** Editable list of short strings (problems, benefits, deliverables, tags…). */
export function StringListField({ form, name, label, help, placeholder = "Add item" }: Common & { placeholder?: string }) {
  const items: string[] = form.values[name] ?? [];
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (!v) return;
    form.set(name, [...items, v]);
    setDraft("");
  };
  return (
    <div>
      <p className="a-label">{label}</p>
      <ul className="space-y-1.5">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2">
            <input className="a-input" value={it} aria-label={`${label} ${i + 1}`} onChange={(e) => form.set(name, items.map((x, j) => (j === i ? e.target.value : x)))} />
            <button type="button" className="a-btn a-btn-ghost a-btn-sm" aria-label="Move up" disabled={i === 0} onClick={() => form.set(name, arrayMove(items, i, i - 1))}>
              ↑
            </button>
            <button type="button" className="a-btn a-btn-ghost a-btn-sm" aria-label="Remove" onClick={() => form.set(name, items.filter((_, j) => j !== i))}>
              <X className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex gap-2">
        <input
          className="a-input"
          value={draft}
          placeholder={placeholder}
          aria-label={`New ${label}`}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <button type="button" className="a-btn a-btn-secondary" onClick={add}>
          <Plus className="h-3.5 w-3.5" /> Add
        </button>
      </div>
      {help && <p className="a-help">{help}</p>}
    </div>
  );
}

/** Repeater for lists of objects with simple text fields. */
export function RepeaterField({
  form,
  name,
  label,
  fields,
  newItem,
  help,
}: Common & { fields: { key: string; label: string; type?: "text" | "textarea" | "checkbox" }[]; newItem: Values }) {
  const items: Values[] = form.values[name] ?? [];
  const update = (i: number, key: string, v: unknown) => form.set(name, items.map((it, j) => (j === i ? { ...it, [key]: v } : it)));
  return (
    <div>
      <p className="a-label">{label}</p>
      <ol className="space-y-2">
        {items.map((it, i) => (
          <li key={i} className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
            <div className="mb-2 flex items-center justify-between text-xs text-zinc-500">
              <span>#{i + 1}</span>
              <span className="flex gap-1">
                <button type="button" className="a-btn a-btn-ghost a-btn-sm" disabled={i === 0} onClick={() => form.set(name, arrayMove(items, i, i - 1))} aria-label="Move up">
                  ↑
                </button>
                <button type="button" className="a-btn a-btn-ghost a-btn-sm" disabled={i === items.length - 1} onClick={() => form.set(name, arrayMove(items, i, i + 1))} aria-label="Move down">
                  ↓
                </button>
                <button type="button" className="a-btn a-btn-ghost a-btn-sm text-red-700" onClick={() => form.set(name, items.filter((_, j) => j !== i))} aria-label="Remove">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </span>
            </div>
            <div className="grid gap-2">
              {fields.map((f) => (
                <label key={f.key} className={f.type === "checkbox" ? "flex items-center gap-2 text-xs" : "block"}>
                  {f.type === "checkbox" ? (
                    <>
                      <input type="checkbox" checked={Boolean(it[f.key])} onChange={(e) => update(i, f.key, e.target.checked)} /> {f.label}
                    </>
                  ) : (
                    <>
                      <span className="mb-1 block text-xs text-zinc-600">{f.label}</span>
                      {f.type === "textarea" ? (
                        <textarea className="a-input" rows={2} value={it[f.key] ?? ""} onChange={(e) => update(i, f.key, e.target.value)} />
                      ) : (
                        <input className="a-input" value={it[f.key] ?? ""} onChange={(e) => update(i, f.key, e.target.value)} />
                      )}
                    </>
                  )}
                  {form.errors[`${name}.${i}.${f.key}`] && <span className="a-error block">{form.errors[`${name}.${i}.${f.key}`]}</span>}
                </label>
              ))}
            </div>
          </li>
        ))}
      </ol>
      <button type="button" className="a-btn a-btn-secondary a-btn-sm mt-2" onClick={() => form.set(name, [...items, { ...newItem }])}>
        <Plus className="h-3.5 w-3.5" /> Add {label.toLowerCase()}
      </button>
      {help && <p className="a-help">{help}</p>}
    </div>
  );
}

export function SeoFields({ form, path }: { form: FormApi; path: string }) {
  return (
    <div className="space-y-4">
      <TextField form={form} name="seoTitle" label="SEO title" maxLength={70} help="Defaults to the title. Aim for 50–60 characters." />
      <TextArea form={form} name="seoDescription" label="Meta description" rows={3} maxLength={170} help="Defaults to the summary. Aim for 140–160 characters." />
      <TextField form={form} name="canonicalUrl" label="Canonical URL (optional)" placeholder={`https://…${path}`} help="Only set when this content's main version lives at another URL." />
      <SwitchField form={form} name="noindex" label="Hide from search engines (noindex)" help="Also removes it from the sitemap." />
    </div>
  );
}

export function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="a-card p-5">
      <h2 className="text-sm font-semibold text-zinc-900">{title}</h2>
      {description && <p className="mt-0.5 text-xs text-zinc-500">{description}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

/** Sticky save bar with draft / publish controls for content that has a status. */
export function PublishBar({ form, status, previewHref, extra }: { form: FormApi; status?: string; previewHref?: string; extra?: React.ReactNode }) {
  return (
    <div className="sticky bottom-0 z-10 -mx-4 mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur lg:-mx-8 lg:px-8">
      <p className="text-xs text-zinc-500" aria-live="polite">
        {form.saving ? "Saving…" : form.dirty ? "Unsaved changes" : "All changes saved"}
        {status && <> · Status: <strong className="capitalize">{status.toLowerCase()}</strong></>}
      </p>
      <div className="flex flex-wrap gap-2">
        {extra}
        {previewHref && (
          <a href={previewHref} target="_blank" rel="noopener noreferrer" className="a-btn a-btn-secondary">
            Preview
          </a>
        )}
        {status !== undefined ? (
          <>
            {status === "PUBLISHED" ? (
              <button type="button" className="a-btn a-btn-secondary" disabled={form.saving} onClick={() => form.submit({ status: "DRAFT" })}>
                Unpublish
              </button>
            ) : (
              <button type="button" className="a-btn a-btn-secondary" disabled={form.saving} onClick={() => form.submit({ status: status === "ARCHIVED" ? "DRAFT" : status })}>
                {status === "ARCHIVED" ? "Restore as draft" : "Save draft"}
              </button>
            )}
            <button type="button" className="a-btn a-btn-primary" disabled={form.saving} onClick={() => form.submit({ status: "PUBLISHED" })}>
              {form.saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {status === "PUBLISHED" ? "Save & keep published" : "Publish"}
            </button>
          </>
        ) : (
          <button type="button" className="a-btn a-btn-primary" disabled={form.saving || !form.dirty} onClick={() => form.submit()}>
            {form.saving && <Loader2 className="h-4 w-4 animate-spin" />} Save changes
          </button>
        )}
      </div>
    </div>
  );
}

/* ───────────── Confirmations & actions ───────────── */

export function ConfirmButton({
  label,
  title,
  description,
  confirmLabel = "Confirm",
  action,
  danger = true,
  className = "a-btn a-btn-danger a-btn-sm",
  redirectTo,
  children,
}: {
  label?: string;
  title: string;
  description?: string;
  confirmLabel?: string;
  action: () => Promise<ActionResult<unknown>>;
  danger?: boolean;
  className?: string;
  redirectTo?: string;
  children?: React.ReactNode;
}) {
  const router = useRouter();
  const ref = useRef<HTMLDialogElement>(null);
  const [pending, start] = useTransition();
  const run = () =>
    start(async () => {
      const res = await action();
      ref.current?.close();
      if (res.ok) {
        toast.success(res.message ?? "Done");
        if (redirectTo) router.push(redirectTo);
        else router.refresh();
      } else toast.error(res.error);
    });
  return (
    <>
      <button type="button" className={className} onClick={() => ref.current?.showModal()}>
        {children ?? label}
      </button>
      <dialog ref={ref} className="admin m-auto w-[min(420px,92vw)] rounded-xl border border-zinc-200 p-0 shadow-2xl backdrop:bg-black/40" aria-labelledby={`${title}-t`}>
        <div className="p-5">
          <h2 id={`${title}-t`} className="text-base font-semibold">
            {title}
          </h2>
          {description && <p className="mt-2 text-sm text-zinc-600">{description}</p>}
        </div>
        <div className="flex justify-end gap-2 border-t border-zinc-100 bg-zinc-50 px-5 py-3">
          <button type="button" className="a-btn a-btn-secondary" onClick={() => ref.current?.close()} autoFocus>
            Cancel
          </button>
          <button type="button" className={danger ? "a-btn a-btn-danger" : "a-btn a-btn-primary"} disabled={pending} onClick={run}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />} {confirmLabel}
          </button>
        </div>
      </dialog>
    </>
  );
}

export function ActionButton({ action, children, className = "a-btn a-btn-secondary a-btn-sm" }: { action: () => Promise<ActionResult<unknown>>; children: React.ReactNode; className?: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      className={className}
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await action();
          if (res.ok) {
            toast.success(res.message ?? "Done");
            router.refresh();
          } else toast.error(res.error);
        })
      }
    >
      {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {children}
    </button>
  );
}

/* ───────────── Sortable list (drag & drop + keyboard) ───────────── */

function SortableRow({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={`flex items-center gap-2 bg-white ${isDragging ? "relative z-10 shadow-lg" : ""}`}>
      <button type="button" className="cursor-grab touch-none rounded p-2.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 lg:p-1.5" aria-label="Drag to reorder (Space to lift, arrows to move)" {...attributes} {...listeners}>
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="min-w-0 flex-1">{children}</div>
    </li>
  );
}

export function SortableList<T extends { id: string }>({
  items,
  onReorder,
  render,
  className = "divide-y divide-zinc-100",
}: {
  items: T[];
  onReorder: (ids: string[]) => void;
  render: (item: T, index: number) => React.ReactNode;
  className?: string;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const onDragEnd = (e: DragEndEvent) => {
    if (!e.over || e.active.id === e.over.id) return;
    const from = items.findIndex((i) => i.id === e.active.id);
    const to = items.findIndex((i) => i.id === e.over!.id);
    onReorder(arrayMove(items, from, to).map((i) => i.id));
  };
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <ul className={className}>
          {items.map((it, i) => (
            <SortableRow key={it.id} id={it.id}>
              {render(it, i)}
            </SortableRow>
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

/** Sortable list that persists order immediately through a server action. */
export function useReorder<T extends { id: string }>(initial: T[], persist: (ids: string[]) => Promise<ActionResult>) {
  const [items, setItems] = useState(initial);
  const router = useRouter();
  useEffect(() => setItems(initial), [initial]);
  const reorder = async (ids: string[]) => {
    const prev = items;
    setItems(ids.map((id) => items.find((i) => i.id === id)!));
    const res = await persist(ids);
    if (!res.ok) {
      setItems(prev);
      toast.error(res.error);
    } else {
      toast.success("Order saved");
      router.refresh();
    }
  };
  return { items, reorder };
}
