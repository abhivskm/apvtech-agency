import { readFile } from "node:fs/promises";
import { db } from "@/lib/db";
import { resolveLocalKey } from "@/lib/storage/local";

/**
 * Serves files written by the LOCAL storage driver (development / single-server deployments).
 * Only files that are registered in the media library are served, with their recorded MIME type.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key } = await params;
  const storageKey = key.join("/");
  const full = resolveLocalKey(storageKey);
  if (!full) return new Response("Not found", { status: 404 });

  const asset = await db.mediaAsset.findUnique({ where: { storageKey }, select: { mime: true } });
  if (!asset?.mime) return new Response("Not found", { status: 404 });

  try {
    const body = await readFile(full);
    return new Response(new Uint8Array(body), {
      headers: {
        "Content-Type": asset.mime,
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        "Content-Disposition": "inline",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
