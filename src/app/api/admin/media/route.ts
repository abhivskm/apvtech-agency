import { db } from "@/lib/db";
import { guardRoute } from "@/lib/admin/route-guard";
import { storeUpload, UploadError } from "@/lib/storage/media";
import { storageStatus } from "@/lib/storage";
import { logActivity } from "@/lib/audit";
import { refresh } from "@/lib/content/revalidate";
import { TAGS } from "@/lib/content/tags";

export const runtime = "nodejs";

/** Upload one or more files to the media library (multipart field "file"). */
export async function POST(req: Request) {
  const user = await guardRoute(req, "media.manage");
  if (user instanceof Response) return user;

  const status = storageStatus();
  if (!status.configured) {
    return Response.json({ error: "Media storage is not configured. Set the S3_* environment variables (see README → Media storage)." }, { status: 503 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ error: "Invalid upload." }, { status: 400 });
  }
  const files = form.getAll("file").filter((f): f is File => f instanceof File).slice(0, 20);
  if (!files.length) return Response.json({ error: "No file received." }, { status: 400 });

  const created: { id: string; url: string; filename: string }[] = [];
  const errors: string[] = [];
  for (const file of files) {
    try {
      const stored = await storeUpload(file);
      const asset = await db.mediaAsset.create({
        data: { ...stored, alt: String(form.get("alt") ?? "").slice(0, 300) },
      });
      created.push({ id: asset.id, url: asset.url, filename: asset.filename });
      await logActivity(user, "media.upload", "MediaAsset", asset.id, `Uploaded ${asset.filename}`, { size: asset.size, mime: asset.mime });
    } catch (err) {
      errors.push(`${file.name}: ${err instanceof UploadError ? err.message : "upload failed"}`);
      if (!(err instanceof UploadError)) console.error("upload failed", err);
    }
  }
  if (created.length) refresh(TAGS.media);
  return Response.json({ created, errors }, { status: created.length ? 201 : 400 });
}
