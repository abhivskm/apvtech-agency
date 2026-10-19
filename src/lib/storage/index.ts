import "server-only";
import { env } from "@/lib/env";
import { LocalStorage } from "@/lib/storage/local";
import { S3Storage } from "@/lib/storage/s3";

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
  adapter = env.storageDriver === "s3" ? new S3Storage(env.s3) : new LocalStorage();
  return adapter;
}

export function storageStatus() {
  const s = getStorage();
  return {
    driver: s.name,
    configured: s.isConfigured(),
    persistentWarning:
      s.name === "local" && process.env.VERCEL
        ? "Local storage is not persistent on Vercel. Configure STORAGE_DRIVER=s3 (Cloudflare R2) before uploading production media."
        : null,
  };
}
