"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Check, Film, ImagePlus, Link2, Loader2, Search, Upload, X } from "lucide-react";
import { listMedia, type MediaItem } from "@/app/admin/(panel)/media/actions";
import type { FormApi } from "@/components/admin/form";
import { thumbUrl } from "@/lib/media-thumb";

export async function uploadFiles(files: FileList | File[]): Promise<{ created: { id: string }[]; errors: string[] }> {
  const fd = new FormData();
  for (const f of Array.from(files)) fd.append("file", f);
  const res = await fetch("/api/admin/media", { method: "POST", body: fd });
  const json = await res.json().catch(() => ({ created: [], errors: ["Upload failed"] }));
  if (json.error) return { created: [], errors: [json.error] };
  return json;
}

function Thumb({ item, className = "" }: { item: MediaItem; className?: string }) {
  if (item.kind === "IMAGE") {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={thumbUrl(item.url)} alt={item.alt} className={`h-full w-full object-cover ${className}`} loading="lazy" decoding="async" />;
  }
  return (
    <div className={`flex h-full w-full flex-col items-center justify-center gap-1 bg-zinc-800 text-xs text-zinc-200 ${className}`}>
      {item.kind === "EXTERNAL_VIDEO" ? <Link2 className="h-5 w-5" /> : <Film className="h-5 w-5" />}
      <span className="max-w-full truncate px-2">{item.filename}</span>
    </div>
  );
}

/** Media library dialog: search, filter, upload and select one or many assets. */
export function MediaPickerDialog({
  open,
  onClose,
  onSelect,
  multiple = false,
  kind,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (items: MediaItem[]) => void;
  multiple?: boolean;
  kind?: "IMAGE" | "VIDEO";
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ items: MediaItem[]; pages: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [picked, setPicked] = useState<MediaItem[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await listMedia({ q, kind, page });
    setLoading(false);
    if (res.ok && res.data) setData(res.data);
    else if (!res.ok) toast.error(res.error);
  }, [q, kind, page]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      setPicked([]);
      void load();
    } else if (!open && d.open) d.close();
  }, [open, load]);

  const toggle = (item: MediaItem) => {
    if (!multiple) {
      onSelect([item]);
      onClose();
      return;
    }
    setPicked((p) => (p.some((x) => x.id === item.id) ? p.filter((x) => x.id !== item.id) : [...p, item]));
  };

  const onUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    const res = await uploadFiles(files);
    setUploading(false);
    res.errors.forEach((e) => toast.error(e));
    if (res.created.length) {
      toast.success(`${res.created.length} file(s) uploaded`);
      setPage(1);
      setQ("");
      const fresh = await listMedia({ ids: res.created.map((c) => c.id) });
      if (fresh.ok && fresh.data) {
        if (!multiple && fresh.data.items[0]) {
          onSelect([fresh.data.items[0]]);
          onClose();
          return;
        }
        setPicked((p) => [...p, ...fresh.data!.items]);
      }
      void load();
    }
  };

  return (
    <dialog ref={ref} onClose={onClose} className="admin m-auto h-[min(760px,92vh)] w-[min(1000px,95vw)] rounded-xl border border-zinc-200 p-0 shadow-2xl backdrop:bg-black/50" aria-label="Media library">
      <div className="flex h-full flex-col">
        <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 p-3">
          <h2 className="mr-2 text-sm font-semibold">Media library</h2>
          <div className="relative min-w-50 flex-1" role="search">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" aria-hidden />
            <input
              className="a-input pl-8"
              placeholder="Search alt text, filename… (Enter)"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  setPage(1);
                  void load();
                }
              }}
              aria-label="Search media"
            />
          </div>
          <input ref={fileRef} type="file" multiple accept={kind === "VIDEO" ? "video/mp4,video/webm" : "image/jpeg,image/png,image/webp,image/avif,image/gif,video/mp4,video/webm"} className="sr-only" onChange={(e) => onUpload(e.target.files)} />
          <button type="button" className="a-btn a-btn-secondary" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload
          </button>
          <button type="button" className="a-btn a-btn-ghost" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          {loading && !data ? (
            <p className="p-8 text-center text-zinc-500">Loading…</p>
          ) : data?.items.length ? (
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-5">
              {data.items.map((m) => {
                const sel = picked.some((p) => p.id === m.id);
                return (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => toggle(m)}
                      aria-pressed={multiple ? sel : undefined}
                      className={`group relative block aspect-square w-full overflow-hidden rounded-lg border-2 ${sel ? "border-blue-600" : "border-transparent hover:border-zinc-300"}`}
                      title={m.alt || m.filename}
                    >
                      <Thumb item={m} />
                      {sel && (
                        <span className="absolute right-1.5 top-1.5 rounded-full bg-blue-600 p-0.5 text-white">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                      )}
                      {!m.alt && m.kind === "IMAGE" && <span className="absolute bottom-1 left-1 rounded bg-amber-500 px-1 text-[10px] text-white">No alt</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 p-12 text-center text-zinc-500">
              <ImagePlus className="h-8 w-8" />
              <p>No media found. Upload files to get started.</p>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-zinc-200 p-3">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <button type="button" className="a-btn a-btn-secondary a-btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Prev
            </button>
            <span>
              Page {page} / {data?.pages ?? 1}
            </span>
            <button type="button" className="a-btn a-btn-secondary a-btn-sm" disabled={page >= (data?.pages ?? 1)} onClick={() => setPage((p) => p + 1)}>
              Next
            </button>
          </div>
          {multiple && (
            <button
              type="button"
              className="a-btn a-btn-primary"
              disabled={!picked.length}
              onClick={() => {
                onSelect(picked);
                onClose();
              }}
            >
              Add {picked.length || ""} selected
            </button>
          )}
        </div>
      </div>
    </dialog>
  );
}

function useMediaLookup(ids: string[]) {
  const [map, setMap] = useState<Record<string, MediaItem>>({});
  const key = ids.join(",");
  useEffect(() => {
    const missing = ids.filter((id) => id && !map[id]);
    if (!missing.length) return;
    listMedia({ ids: missing }).then((res) => {
      if (res.ok && res.data) setMap((m) => ({ ...m, ...Object.fromEntries(res.data!.items.map((i) => [i.id, i])) }));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const remember = (items: MediaItem[]) => setMap((m) => ({ ...m, ...Object.fromEntries(items.map((i) => [i.id, i])) }));
  return { map, remember };
}

/** Single media reference field (stores the media id). */
export function MediaField({ form, name, label, help, kind }: { form: FormApi; name: string; label: string; help?: string; kind?: "IMAGE" | "VIDEO" }) {
  const id: string | null = form.values[name] ?? null;
  const { map, remember } = useMediaLookup(id ? [id] : []);
  const [open, setOpen] = useState(false);
  const item = id ? map[id] : null;
  return (
    <div>
      <p className="a-label">{label}</p>
      <div className="flex items-center gap-3">
        <div className="h-20 w-28 shrink-0 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100">
          {item ? <Thumb item={item} /> : <div className="flex h-full items-center justify-center text-xs text-zinc-400">{id ? "Loading…" : "None"}</div>}
        </div>
        <div className="flex flex-col gap-1.5">
          <button type="button" className="a-btn a-btn-secondary a-btn-sm" onClick={() => setOpen(true)}>
            {id ? "Change" : "Choose"}
          </button>
          {id && (
            <button type="button" className="a-btn a-btn-ghost a-btn-sm" onClick={() => form.set(name, null)}>
              Remove
            </button>
          )}
        </div>
      </div>
      {help && <p className="a-help">{help}</p>}
      {form.errors[name] && <p className="a-error">{form.errors[name]}</p>}
      <MediaPickerDialog
        open={open}
        kind={kind}
        onClose={() => setOpen(false)}
        onSelect={(items) => {
          remember(items);
          form.set(name, items[0]?.id ?? null);
        }}
      />
    </div>
  );
}

/** Ordered list of media references (galleries, hero collages, logo strips). */
export function MediaListField({ form, name, label, help, max = 50 }: { form: FormApi; name: string; label: string; help?: string; max?: number }) {
  const ids: string[] = form.values[name] ?? [];
  const { map, remember } = useMediaLookup(ids);
  const [open, setOpen] = useState(false);
  const move = (i: number, d: number) => {
    const next = [...ids];
    const [x] = next.splice(i, 1);
    next.splice(i + d, 0, x);
    form.set(name, next);
  };
  return (
    <div>
      <p className="a-label">{label}</p>
      <ul className="flex flex-wrap gap-2">
        {ids.map((id, i) => (
          <li key={`${id}-${i}`} className="relative h-24 w-32 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100">
            {map[id] ? <Thumb item={map[id]} /> : <div className="flex h-full items-center justify-center text-xs text-zinc-400">…</div>}
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/55 p-1">
              <span className="flex gap-1">
                <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="rounded px-1 text-xs text-white disabled:opacity-30" aria-label="Move left">
                  ←
                </button>
                <button type="button" disabled={i === ids.length - 1} onClick={() => move(i, 1)} className="rounded px-1 text-xs text-white disabled:opacity-30" aria-label="Move right">
                  →
                </button>
              </span>
              <button type="button" onClick={() => form.set(name, ids.filter((_, j) => j !== i))} className="rounded px-1 text-white" aria-label="Remove">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </li>
        ))}
        {ids.length < max && (
          <li>
            <button type="button" onClick={() => setOpen(true)} className="flex h-24 w-32 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-zinc-300 text-xs text-zinc-500 hover:border-zinc-400 hover:text-zinc-700">
              <ImagePlus className="h-5 w-5" /> Add
            </button>
          </li>
        )}
      </ul>
      {help && <p className="a-help">{help}</p>}
      <MediaPickerDialog
        open={open}
        multiple
        onClose={() => setOpen(false)}
        onSelect={(items) => {
          remember(items);
          form.set(name, [...ids, ...items.map((i) => i.id).filter((id) => !ids.includes(id))].slice(0, max));
        }}
      />
    </div>
  );
}
