import { del, put } from "@vercel/blob";
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
