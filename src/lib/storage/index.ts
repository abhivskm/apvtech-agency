import "server-only";
import { env } from "@/lib/env";
import { LocalStorage } from "@/lib/storage/local";
import { S3Storage } from "@/lib/storage/s3";
import { BlobStorage } from "@/lib/storage/blob";

export interface StorageAdapter {
  readonly name: string;
  put(key: string, body: Buffer, contentType: string): Promise<{ url: string }>;
  delete(key: string): Promise<void>;
  /** Returns true when the adapter has everything it needs to work. */
  isConfigured(): boolean;
}

let adapter: StorageAdapter | null = null;

export function getStorage(): StorageAdapter {
  if (adapter) return adapter;
  adapter =
    env.storageDriver === "s3" ? new S3Storage(env.s3) : env.storageDriver === "blob" ? new BlobStorage(env.blobToken) : new LocalStorage();
  return adapter;
}

/** Human-readable reason uploads are unavailable, for the admin banner. */
export function storageSetupHint(driver: string) {
  if (driver === "blob") return "Vercel Blob is selected but BLOB_READ_WRITE_TOKEN is missing. Connect a Blob store to the project in Vercel → Storage.";
  return "S3/R2 storage is selected but not fully configured. See README → Media storage.";
}

export function storageStatus() {
  const s = getStorage();
  return {
    driver: s.name,
    configured: s.isConfigured(),
    /** Browser uploads straight to storage (needed on Vercel for files over ~4.5 MB). */
    directUpload: s.name === "blob",
    persistentWarning:
      s.name === "local" && process.env.VERCEL
        ? "Local storage is not persistent on Vercel. Configure STORAGE_DRIVER=s3 (Cloudflare R2) before uploading production media."
        : null,
  };
}
