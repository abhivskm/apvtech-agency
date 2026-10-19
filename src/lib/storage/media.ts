import "server-only";
import { fileTypeFromBuffer } from "file-type";
import sharp from "sharp";
import type { MediaKind } from "@prisma/client";
import { getStorage } from "@/lib/storage";
import { env } from "@/lib/env";
import { randomToken } from "@/lib/crypto";

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
  const detected = await fileTypeFromBuffer(buffer);
  const mime = detected?.mime ?? "";
  const isImage = (IMAGE_MIME as readonly string[]).includes(mime);
  const isVideo = (VIDEO_MIME as readonly string[]).includes(mime);

  if (!isImage && !isVideo) {
    throw new UploadError("Unsupported file type. Upload JPG, PNG, WebP, AVIF, GIF, ICO, MP4 or WebM.");
  }
  if (isImage && buffer.length > env.maxUploadBytes) {
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

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(-80) || "file";
  const ext = detected?.ext ?? "bin";
  const now = new Date();
  const key = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${randomToken(9)}.${ext}`;
  const { url } = await getStorage().put(key, buffer, mime);

  return {
    kind: isVideo ? "VIDEO" : "IMAGE",
    storageKey: key,
    url,
    mime,
    size: buffer.length,
    width,
    height,
    filename: safeName,
  };
}

export async function deleteStoredFile(key: string | null) {
  if (!key) return;
  try {
    await getStorage().delete(key);
  } catch (err) {
    console.error("storage delete failed", err);
  }
}
