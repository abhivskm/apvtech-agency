import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requirePagePermission } from "@/lib/auth/guard";
import { storageSetupHint, storageStatus } from "@/lib/storage";
import { env } from "@/lib/env";
import { PageHeader, Pagination, SearchFilters } from "@/components/admin/ui";
import { MediaLibrary } from "./MediaLibrary";

export const metadata = { title: "Media Library" };
const PER_PAGE = 40;

export default async function MediaPage({ searchParams }: { searchParams: Promise<{ q?: string; kind?: string; page?: string }> }) {
  await requirePagePermission("media.manage");
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const where: Prisma.MediaAssetWhereInput = {};
  if (sp.q) where.OR = [{ alt: { contains: sp.q, mode: "insensitive" } }, { filename: { contains: sp.q, mode: "insensitive" } }, { caption: { contains: sp.q, mode: "insensitive" } }];
  if (sp.kind === "IMAGE" || sp.kind === "VIDEO" || sp.kind === "EXTERNAL_VIDEO") where.kind = sp.kind;
  const [rows, total] = await Promise.all([
    db.mediaAsset.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PER_PAGE, take: PER_PAGE }),
    db.mediaAsset.count({ where }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const storage = storageStatus();
  const qs = (p: number) => `/admin/media?${new URLSearchParams({ ...(sp.q ? { q: sp.q } : {}), ...(sp.kind ? { kind: sp.kind } : {}), page: String(p) })}`;

  return (
    <>
      <PageHeader
        title="Media Library"
        description={`${total} file${total === 1 ? "" : "s"}. Images: JPG, PNG, WebP, AVIF, GIF up to ${Math.round(env.maxUploadBytes / 1048576)} MB. Video: MP4/WebM up to ${Math.round(env.maxVideoUploadBytes / 1048576)} MB.`}
      />
      {storage.persistentWarning && <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{storage.persistentWarning}</p>}
      {!storage.configured && (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          Uploads are disabled: {storageSetupHint(storage.driver)}
        </p>
      )}
      <SearchFilters
        q={sp.q}
        placeholder="Search alt text, filename or caption"
        filters={[{ name: "kind", label: "Type", value: sp.kind, options: [{ value: "IMAGE", label: "Images" }, { value: "VIDEO", label: "Uploaded videos" }, { value: "EXTERNAL_VIDEO", label: "Video links" }] }]}
      />
      <MediaLibrary items={rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }))} storageDriver={storage.driver} />
      <Pagination page={page} pages={pages} href={qs} />
    </>
  );
}
