import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import type { StorageAdapter } from "@/lib/storage";

export const LOCAL_STORAGE_ROOT = path.join(process.cwd(), "storage", "uploads");

/** Resolve a storage key to a path inside the storage root, refusing traversal. */
export function resolveLocalKey(key: string): string | null {
  if (!/^[a-zA-Z0-9/_.-]+$/.test(key) || key.includes("..")) return null;
  const full = path.resolve(LOCAL_STORAGE_ROOT, key);
  if (!full.startsWith(LOCAL_STORAGE_ROOT + path.sep)) return null;
  return full;
}

/** Development storage: files on disk under ./storage/uploads, served by /uploads/[...key]. */
export class LocalStorage implements StorageAdapter {
  readonly name = "local";

  isConfigured() {
    return true;
  }

  async put(key: string, body: Buffer) {
    const full = resolveLocalKey(key);
    if (!full) throw new Error("Invalid storage key");
    await mkdir(path.dirname(full), { recursive: true });
    await writeFile(full, body);
    return { url: `/uploads/${key}` };
  }

  async delete(key: string) {
    const full = resolveLocalKey(key);
    if (!full) return;
    await unlink(full).catch(() => {});
  }
}
