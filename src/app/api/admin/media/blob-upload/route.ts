import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { guardRoute } from "@/lib/admin/route-guard";
import { env } from "@/lib/env";
import { storageStatus } from "@/lib/storage";
import { BLOB_PATH } from "@/lib/storage/blob";
import { IMAGE_MIME, VIDEO_MIME } from "@/lib/storage/media";

export const runtime = "nodejs";

/**
 * Issues short-lived tokens so the browser can upload a file straight to Vercel Blob
 * (Vercel functions cannot receive bodies over ~4.5 MB). Only signed-in users with
 * media.manage get a token; the file is validated again when it is registered.
 */
export async function POST(req: Request) {
  const user = await guardRoute(req, "media.manage");
  if (user instanceof Response) return user;
  if (!storageStatus().directUpload || !env.blobToken) {
    return Response.json({ error: "Direct uploads are not enabled." }, { status: 400 });
  }

  let body: HandleUploadBody;
  try {
    body = (await req.json()) as HandleUploadBody;
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  if (body.type !== "blob.generate-client-token") return Response.json({ error: "Unsupported request." }, { status: 400 });

  try {
    const result = await handleUpload({
      body,
      request: req,
      token: env.blobToken,
      onBeforeGenerateToken: async (pathname) => {
        if (!BLOB_PATH.test(pathname)) throw new Error("Invalid file name.");
        return {
          allowedContentTypes: [...IMAGE_MIME, ...VIDEO_MIME],
          maximumSizeInBytes: env.maxVideoUploadBytes,
          addRandomSuffix: true,
          cacheControlMaxAge: 31536000,
        };
      },
    });
    return Response.json(result);
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Upload could not start." }, { status: 400 });
  }
}
