"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Copy, Film, Link2, Loader2, RefreshCw, Upload, X } from "lucide-react";
import { addExternalVideo, deleteMedia, getMediaUsage, updateMediaMeta, type MediaItem } from "./actions";
import { uploadFiles } from "@/components/admin/MediaPicker";
import { ConfirmButton } from "@/components/admin/form";
import { EmptyState } from "@/components/admin/ui";

function fmtSize(n: number | null) {
  if (!n) return "—";
  return n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`;
}

export function MediaLibrary({ items, storageDriver }: { items: MediaItem[]; storageDriver: string }) {
  const router = useRouter();
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selected) setSelected(items.find((i) => i.id === selected.id) ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const upload = async (files: FileList | File[] | null) => {
    if (!files || !files.length) return;
    setUploading(true);
    const res = await uploadFiles(files);
    setUploading(false);
    res.errors.forEach((e) => toast.error(e));
    if (res.created.length) {
      toast.success(`${res.created.length} file(s) uploaded. Add alt text so images are accessible.`);
      router.refresh();
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            void upload(e.dataTransfer.files);
          }}
          className={`mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-dashed p-4 ${dragOver ? "border-blue-500 bg-blue-50" : "border-zinc-300 bg-white"}`}
        >
          <p className="text-sm text-zinc-600">
            Drag files here, or
            <span className="ml-1 text-xs text-zinc-400">(storage: {storageDriver})</span>
          </p>
          <div className="flex gap-2">
            <ExternalVideoButton />
            <input ref={fileRef} type="file" multiple className="sr-only" accept="image/jpeg,image/png,image/webp,image/avif,image/gif,image/x-icon,video/mp4,video/webm" onChange={(e) => upload(e.target.files)} aria-label="Upload files" />
            <button type="button" className="a-btn a-btn-primary" onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload files
            </button>
          </div>
        </div>
        {items.length === 0 ? (
          <EmptyState title="No media yet" text="Upload images and videos to reuse them across pages, services and projects." />
        ) : (
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
            {items.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => setSelected(m)}
                  aria-pressed={selected?.id === m.id}
                  className={`relative block aspect-square w-full overflow-hidden rounded-lg border-2 bg-zinc-100 ${selected?.id === m.id ? "border-blue-600" : "border-transparent hover:border-zinc-300"}`}
                >
                  {m.kind === "IMAGE" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.url} alt={m.alt} className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <span className="flex h-full flex-col items-center justify-center gap-1 bg-zinc-800 text-xs text-zinc-200">
                      {m.kind === "EXTERNAL_VIDEO" ? <Link2 className="h-5 w-5" /> : <Film className="h-5 w-5" />}
                      <span className="max-w-full truncate px-2">{m.filename}</span>
                    </span>
                  )}
                  {!m.alt && m.kind === "IMAGE" && <span className="absolute bottom-1 left-1 rounded bg-amber-500 px-1 text-[10px] text-white">No alt text</span>}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <aside className="lg:sticky lg:top-6 lg:self-start">{selected ? <MediaDetails key={selected.id} item={selected} onClose={() => setSelected(null)} /> : <div className="a-card p-5 text-sm text-zinc-500">Select a file to edit its details, replace it or delete it.</div>}</aside>
    </div>
  );
}

function MediaDetails({ item, onClose }: { item: MediaItem; onClose: () => void }) {
  const router = useRouter();
  const [alt, setAlt] = useState(item.alt);
  const [caption, setCaption] = useState(item.caption ?? "");
  const [credit, setCredit] = useState(item.credit ?? "");
  const [usage, setUsage] = useState<{ total: number; breakdown: Record<string, number> } | null>(null);
  const [saving, start] = useTransition();
  const [replacing, setReplacing] = useState(false);
  const replaceRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getMediaUsage(item.id).then((r) => r.ok && r.data && setUsage(r.data));
  }, [item.id]);

  const save = () =>
    start(async () => {
      const res = await updateMediaMeta({ id: item.id, alt, caption, credit });
      if (res.ok) {
        toast.success(res.message ?? "Saved");
        router.refresh();
      } else toast.error(res.error);
    });

  const replace = async (files: FileList | null) => {
    const f = files?.[0];
    if (!f) return;
    setReplacing(true);
    const fd = new FormData();
    fd.append("file", f);
    const res = await fetch(`/api/admin/media/${item.id}`, { method: "POST", body: fd });
    const json = await res.json().catch(() => ({}));
    setReplacing(false);
    if (res.ok) {
      toast.success("File replaced everywhere it is used");
      router.refresh();
    } else toast.error(json.error ?? "Replace failed");
  };

  return (
    <div className="a-card overflow-hidden">
      <div className="relative aspect-video bg-zinc-100">
        {item.kind === "IMAGE" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.url} alt={item.alt} className="h-full w-full object-contain" />
        ) : item.kind === "VIDEO" ? (
          <video src={item.url} controls className="h-full w-full" />
        ) : (
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex h-full items-center justify-center text-sm text-blue-700 underline">
            Open video link
          </a>
        )}
        <button type="button" onClick={onClose} className="absolute right-2 top-2 rounded-full bg-white/90 p-1" aria-label="Close details">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-3 p-4">
        <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-zinc-600">
          <dt>File</dt>
          <dd className="truncate">{item.filename}</dd>
          <dt>Type</dt>
          <dd>{item.mime ?? item.kind}</dd>
          <dt>Size</dt>
          <dd>{fmtSize(item.size)}</dd>
          <dt>Dimensions</dt>
          <dd>{item.width && item.height ? `${item.width} × ${item.height}` : "—"}</dd>
          <dt>Used in</dt>
          <dd>{usage ? `${usage.total} place(s)` : "…"}</dd>
        </dl>
        {usage && usage.total > 0 && (
          <ul className="rounded-md bg-zinc-50 p-2 text-xs text-zinc-600">
            {Object.entries(usage.breakdown)
              .filter(([, n]) => n > 0)
              .map(([k, n]) => (
                <li key={k}>
                  {k}: {n}
                </li>
              ))}
          </ul>
        )}
        <div>
          <label className="a-label" htmlFor="m-alt">
            Alt text
          </label>
          <textarea id="m-alt" rows={2} className="a-input" value={alt} onChange={(e) => setAlt(e.target.value)} />
          <p className="a-help">Describe the image for people using screen readers. Leave empty only for purely decorative images.</p>
        </div>
        <div>
          <label className="a-label" htmlFor="m-cap">
            Caption
          </label>
          <input id="m-cap" className="a-input" value={caption} onChange={(e) => setCaption(e.target.value)} />
        </div>
        <div>
          <label className="a-label" htmlFor="m-cred">
            Credit / licence
          </label>
          <input id="m-cred" className="a-input" value={credit} onChange={(e) => setCredit(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="a-btn a-btn-primary" onClick={save} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save details
          </button>
          <button type="button" className="a-btn a-btn-secondary" onClick={() => navigator.clipboard.writeText(item.url).then(() => toast.success("URL copied"))}>
            <Copy className="h-4 w-4" /> Copy URL
          </button>
        </div>
        {item.kind !== "EXTERNAL_VIDEO" && (
          <div className="border-t border-zinc-100 pt-3">
            <input ref={replaceRef} type="file" className="sr-only" accept={item.kind === "VIDEO" ? "video/mp4,video/webm" : "image/*"} onChange={(e) => replace(e.target.files)} aria-label="Replacement file" />
            <button type="button" className="a-btn a-btn-secondary w-full" onClick={() => replaceRef.current?.click()} disabled={replacing}>
              {replacing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Replace file
            </button>
            <p className="a-help">Keeps every reference working — the new file appears wherever this one is used.</p>
          </div>
        )}
        <div className="border-t border-zinc-100 pt-3">
          <ConfirmButton
            label="Delete file"
            className="a-btn a-btn-danger w-full"
            title="Delete this file?"
            description={usage && usage.total > 0 ? `It is used in ${usage.total} place(s) and cannot be deleted until those references are removed.` : "This permanently removes the file. This cannot be undone."}
            confirmLabel="Delete"
            action={() => deleteMedia(item.id)}
          />
        </div>
      </div>
    </div>
  );
}

function ExternalVideoButton() {
  const ref = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [pending, start] = useTransition();
  return (
    <>
      <button type="button" className="a-btn a-btn-secondary" onClick={() => ref.current?.showModal()}>
        <Link2 className="h-4 w-4" /> Add video link
      </button>
      <dialog ref={ref} className="admin m-auto w-[min(440px,92vw)] rounded-xl border p-0 shadow-2xl backdrop:bg-black/40" aria-label="Add video link">
        <form
          className="space-y-3 p-5"
          onSubmit={(e) => {
            e.preventDefault();
            start(async () => {
              const res = await addExternalVideo({ url, alt });
              if (res.ok) {
                toast.success(res.message ?? "Added");
                ref.current?.close();
                setUrl("");
                setAlt("");
                router.refresh();
              } else toast.error(res.error);
            });
          }}
        >
          <h2 className="font-semibold">Add a YouTube or Vimeo link</h2>
          <div>
            <label className="a-label" htmlFor="v-url">
              Video URL
            </label>
            <input id="v-url" className="a-input" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=…" required />
          </div>
          <div>
            <label className="a-label" htmlFor="v-alt">
              Description
            </label>
            <input id="v-alt" className="a-input" value={alt} onChange={(e) => setAlt(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="a-btn a-btn-secondary" onClick={() => ref.current?.close()}>
              Cancel
            </button>
            <button type="submit" className="a-btn a-btn-primary" disabled={pending}>
              Add link
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
