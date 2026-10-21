import { del, list, put } from "@vercel/blob";
import type { StorageAdapter } from "@/lib/storage";

/**
 * Vercel Blob storage. Large files are uploaded directly from the browser (see
 * /api/admin/media/blob-upload) because Vercel functions reject request bodies over ~4.5 MB;
 * `put` here covers server-side uploads. Storage keys are blob pathnames.
 */
export class BlobStorage implements StorageAdapter {
  readonly name = "blob";

  constructor(private token: string) {}

  isConfigured() {
    return Boolean(this.token);
  }

  async put(key: string, body: Buffer, contentType: string) {
    const blob = await put(key, body, { access: "public", contentType, token: this.token, addRandomSuffix: false, cacheControlMaxAge: 31536000 });
    return { url: blob.url };
  }

  async delete(key: string) {
    await del(key, { token: this.token });
  }
}

/** Only accept blob URLs from a public Vercel Blob store. */
export function isBlobUrl(url: string) {
  try {
    const u = new URL(url);
    return u.protocol === "https:" && u.hostname.endsWith(".public.blob.vercel-storage.com");
  } catch {
    return false;
  }
}

/** Pathnames the browser may upload to: media/YYYY/MM/<safe-name>. */
export const BLOB_PATH = /^media\/\d{4}\/\d{2}\/[a-zA-Z0-9._-]{1,120}$/;

/**
 * Deletes browser uploads that were never added to the media library (e.g. the tab closed mid-upload
 * or the file failed validation after upload). Only files older than a day under media/ are touched.
 */
export async function cleanupOrphanBlobs(token: string, isRegistered: (pathnames: string[]) => Promise<Set<string>>) {
  const cutoff = Date.now() - 24 * 3600_000;
  let cursor: string | undefined;
  let deleted = 0;
  for (let page = 0; page < 20; page++) {
    const res = await list({ prefix: "media/", limit: 500, cursor, token });
    const old = res.blobs.filter((b) => new Date(b.uploadedAt).getTime() < cutoff);
    const known = await isRegistered(old.map((b) => b.pathname));
    const orphans = old.filter((b) => !known.has(b.pathname)).map((b) => b.url);
    if (orphans.length) {
      await del(orphans, { token });
      deleted += orphans.length;
    }
    if (!res.hasMore) break;
    cursor = res.cursor;
  }
  return deleted;
}
