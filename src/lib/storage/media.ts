import "server-only";
import { fileTypeFromBuffer } from "file-type";
import sharp from "sharp";
import type { MediaKind } from "@prisma/client";
import { getStorage } from "@/lib/storage";
import { env } from "@/lib/env";
import { randomToken } from "@/lib/crypto";
import { head } from "@vercel/blob";
import { BLOB_PATH, isBlobUrl } from "@/lib/storage/blob";
import { logError } from "@/lib/log";

export const IMAGE_MIME = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif", "image/x-icon"] as const;
export const VIDEO_MIME = ["video/mp4", "video/webm"] as const;

export class UploadError extends Error {}

export type StoredFile = {
  kind: MediaKind;
  storageKey: string;
  url: string;
  mime: string;
  size: number;
  width: number | null;
  height: number | null;
  filename: string;
};

/**
 * Validates an uploaded file by sniffing its real bytes (never trusting the declared type or extension),
 * enforces size limits, reads image dimensions, and stores it through the configured adapter.
 * SVG is intentionally not accepted because it can carry scripts.
 */
export async function storeUpload(file: File): Promise<StoredFile> {
  if (!file || file.size === 0) throw new UploadError("No file received.");
  if (file.size > env.maxVideoUploadBytes) throw new UploadError("File is too large.");

  const buffer = Buffer.from(await file.arrayBuffer());
  const info = await inspectFile(buffer, buffer.length);

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(-80) || "file";
  const now = new Date();
  const key = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${randomToken(9)}.${info.ext}`;
  const { url } = await getStorage().put(key, buffer, info.mime);

  return { kind: info.kind, storageKey: key, url, mime: info.mime, size: buffer.length, width: info.width, height: info.height, filename: safeName };
}

/**
 * Registers a file the browser uploaded straight to Vercel Blob. The stored bytes are re-checked
 * exactly like a server upload; anything that fails validation is deleted from the store.
 */
export async function registerBlobUpload(input: { url: string; pathname: string; filename: string }): Promise<StoredFile> {
  if (!isBlobUrl(input.url) || !BLOB_PATH.test(input.pathname) || new URL(input.url).pathname !== `/${input.pathname}`) {
    throw new UploadError("Invalid upload reference.");
  }
  try {
    const meta = await head(input.url, { token: env.blobToken });
    if (meta.size > env.maxVideoUploadBytes) throw new UploadError("File is too large.");
    // Images are read fully (dimensions); for videos the first bytes are enough to identify the format.
    const res = await fetch(input.url, meta.size > env.maxUploadBytes ? { headers: { Range: "bytes=0-65535" } } : undefined);
    if (!res.ok) throw new UploadError("The uploaded file could not be read.");
    const buffer = Buffer.from(await res.arrayBuffer());
    const info = await inspectFile(buffer, meta.size);
    const safeName = input.filename.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(-80) || "file";
    return { kind: info.kind, storageKey: input.pathname, url: input.url, mime: info.mime, size: meta.size, width: info.width, height: info.height, filename: safeName };
  } catch (err) {
    await deleteStoredFile(input.pathname);
    throw err;
  }
}

/** Identifies the real file type from its bytes and enforces type and size rules. */
async function inspectFile(buffer: Buffer, size: number) {
  const detected = await fileTypeFromBuffer(buffer);
  const mime = detected?.mime ?? "";
  const isImage = (IMAGE_MIME as readonly string[]).includes(mime);
  const isVideo = (VIDEO_MIME as readonly string[]).includes(mime);

  if (!isImage && !isVideo) {
    throw new UploadError("Unsupported file type. Upload JPG, PNG, WebP, AVIF, GIF, ICO, MP4 or WebM.");
  }
  if (isImage && size > env.maxUploadBytes) {
    throw new UploadError(`Images must be smaller than ${Math.round(env.maxUploadBytes / 1024 / 1024)} MB.`);
  }

  let width: number | null = null;
  let height: number | null = null;
  if (isImage && mime !== "image/x-icon") {
    try {
      const meta = await sharp(buffer).metadata();
      width = meta.width ?? null;
      height = meta.height ?? null;
    } catch {
      throw new UploadError("The image could not be read. It may be corrupted.");
    }
  }

  return { kind: (isVideo ? "VIDEO" : "IMAGE") as MediaKind, mime, ext: detected?.ext ?? "bin", width, height };
}

export async function deleteStoredFile(key: string | null) {
  if (!key) return;
  try {
    await getStorage().delete(key);
  } catch (err) {
    logError("storage delete failed", err);
  }
}
