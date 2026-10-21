import { db } from "@/lib/db";
import { guardRoute } from "@/lib/admin/route-guard";
import { registerBlobUpload, storeUpload, UploadError } from "@/lib/storage/media";
import { storageSetupHint, storageStatus } from "@/lib/storage";
import { logActivity } from "@/lib/audit";
import { refresh } from "@/lib/content/revalidate";
import { TAGS } from "@/lib/content/tags";
import { logError } from "@/lib/log";

export const runtime = "nodejs";

/** How the admin should upload: through this route, or straight from the browser to Vercel Blob. */
export async function GET(req: Request) {
  const user = await guardRoute(req, "media.manage");
  if (user instanceof Response) return user;
  const status = storageStatus();
  return Response.json({ configured: status.configured, direct: status.directUpload && status.configured });
}

/** Upload one or more files to the media library (multipart field "file", or JSON for a direct Blob upload). */
export async function POST(req: Request) {
  const user = await guardRoute(req, "media.manage");
  if (user instanceof Response) return user;

  const status = storageStatus();
  if (!status.configured) {
    return Response.json({ error: `Media storage is not configured. ${storageSetupHint(status.driver)}` }, { status: 503 });
  }

  // Browser uploaded straight to Vercel Blob: validate the stored file and add it to the library.
  if (req.headers.get("content-type")?.includes("application/json")) {
    const body = (await req.json().catch(() => null)) as { url?: string; pathname?: string; filename?: string; alt?: string } | null;
    if (!body?.url || !body.pathname) return Response.json({ error: "Invalid upload." }, { status: 400 });
    try {
      const stored = await registerBlobUpload({ url: body.url, pathname: body.pathname, filename: body.filename ?? "file" });
      const asset = await db.mediaAsset.create({ data: { ...stored, alt: String(body.alt ?? "").slice(0, 300) } });
      await logActivity(user, "media.upload", "MediaAsset", asset.id, `Uploaded ${asset.filename}`, { size: asset.size, mime: asset.mime });
      refresh(TAGS.media);
      return Response.json({ created: [{ id: asset.id, url: asset.url, filename: asset.filename }], errors: [] }, { status: 201 });
    } catch (err) {
      if (!(err instanceof UploadError)) logError("blob register failed", err);
      return Response.json({ created: [], errors: [`${body.filename ?? "File"}: ${err instanceof UploadError ? err.message : "upload failed"}`] }, { status: 400 });
    }
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
      if (!(err instanceof UploadError)) logError("upload failed", err);
    }
  }
  if (created.length) refresh(TAGS.media);
  return Response.json({ created, errors }, { status: created.length ? 201 : 400 });
}
