import { db } from "@/lib/db";
import { guardRoute } from "@/lib/admin/route-guard";
import { deleteStoredFile, registerBlobUpload, storeUpload, UploadError } from "@/lib/storage/media";
import { logActivity } from "@/lib/audit";
import { refresh } from "@/lib/content/revalidate";
import { TAGS } from "@/lib/content/tags";
import { logError } from "@/lib/log";

export const runtime = "nodejs";

/**
 * Replace the file behind an existing media asset. The asset id is unchanged, so every page,
 * project and setting that references it automatically shows the new file.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await guardRoute(req, "media.manage");
  if (user instanceof Response) return user;
  const { id } = await params;
  const asset = await db.mediaAsset.findUnique({ where: { id } });
  if (!asset) return Response.json({ error: "Media not found." }, { status: 404 });
  if (asset.kind === "EXTERNAL_VIDEO") return Response.json({ error: "External links cannot be replaced with a file." }, { status: 400 });

  let file: File | null = null;
  let blobRef: { url: string; pathname: string; filename: string } | null = null;
  if (req.headers.get("content-type")?.includes("application/json")) {
    const body = (await req.json().catch(() => null)) as { url?: string; pathname?: string; filename?: string } | null;
    if (body?.url && body.pathname) blobRef = { url: body.url, pathname: body.pathname, filename: body.filename ?? "file" };
  } else {
    const f = (await req.formData().catch(() => null))?.get("file");
    if (f instanceof File) file = f;
  }
  if (!file && !blobRef) return Response.json({ error: "No file received." }, { status: 400 });

  try {
    const stored = blobRef ? await registerBlobUpload(blobRef) : await storeUpload(file!);
    if ((asset.kind === "VIDEO") !== (stored.kind === "VIDEO")) {
      await deleteStoredFile(stored.storageKey);
      return Response.json({ error: "Replace images with images and videos with videos." }, { status: 400 });
    }
    await db.mediaAsset.update({ where: { id }, data: { ...stored } });
    await deleteStoredFile(asset.storageKey);
    await logActivity(user, "media.replace", "MediaAsset", id, `Replaced file with ${stored.filename}`);
    refresh(TAGS.media);
    return Response.json({ ok: true });
  } catch (err) {
    if (err instanceof UploadError) return Response.json({ error: err.message }, { status: 400 });
    logError("replace failed", err);
    return Response.json({ error: "Upload failed." }, { status: 500 });
  }
}
