"use server";

import { z } from "zod";
import type { MediaKind, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { adminAction } from "@/lib/admin/action";
import { mediaUrlInRichText, mediaUsage } from "@/lib/admin/media";
import { deleteStoredFile } from "@/lib/storage/media";
import { logActivity } from "@/lib/audit";
import { refresh } from "@/lib/content/revalidate";
import { TAGS } from "@/lib/content/tags";
import { embedUrl } from "@/lib/video";

export type MediaItem = {
  id: string;
  url: string;
  alt: string;
  caption: string | null;
  credit: string | null;
  kind: MediaKind;
  mime: string | null;
  size: number | null;
  width: number | null;
  height: number | null;
  filename: string;
  createdAt: string;
};

const PER_PAGE = 30;

export const listMedia = adminAction("media.manage", async (input: { q?: string; kind?: string; page?: number; ids?: string[] }) => {
  const where: Prisma.MediaAssetWhereInput = {};
  if (input.ids?.length) where.id = { in: input.ids.slice(0, 100) };
  if (input.q) where.OR = [{ alt: { contains: input.q, mode: "insensitive" } }, { filename: { contains: input.q, mode: "insensitive" } }, { caption: { contains: input.q, mode: "insensitive" } }];
  if (input.kind === "IMAGE" || input.kind === "VIDEO" || input.kind === "EXTERNAL_VIDEO") where.kind = input.kind;
  const page = Math.max(1, input.page ?? 1);
  const [rows, total] = await Promise.all([
    db.mediaAsset.findMany({ where, orderBy: { createdAt: "desc" }, skip: input.ids ? 0 : (page - 1) * PER_PAGE, take: input.ids ? 100 : PER_PAGE }),
    db.mediaAsset.count({ where }),
  ]);
  const items: MediaItem[] = rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }));
  return { ok: true, data: { items, total, pages: Math.max(1, Math.ceil(total / PER_PAGE)) } };
});

const metaSchema = z.object({
  alt: z.string().trim().max(300),
  caption: z.string().trim().max(300).optional().nullable(),
  credit: z.string().trim().max(200).optional().nullable(),
});

export const updateMediaMeta = adminAction("media.manage", async (input: { id: string; alt: string; caption?: string | null; credit?: string | null }, user) => {
  const data = metaSchema.parse(input);
  await db.mediaAsset.update({ where: { id: input.id }, data: { alt: data.alt, caption: data.caption || null, credit: data.credit || null } });
  await logActivity(user, "media.update", "MediaAsset", input.id, "Updated media details");
  refresh(TAGS.media);
  return { ok: true, message: "Media details saved" };
});

export const getMediaUsage = adminAction("media.manage", async (id: string) => {
  const usage = await mediaUsage(id);
  return { ok: true, data: usage };
});

export const deleteMedia = adminAction("media.manage", async (id: string, user) => {
  const asset = await db.mediaAsset.findUnique({ where: { id } });
  if (!asset) return { ok: false, error: "Media not found." };
  const usage = await mediaUsage(id);
  const inText = await mediaUrlInRichText(asset.url);
  if (usage.total + inText > 0) {
    return { ok: false, error: `This file is used in ${usage.total + inText} place(s). Remove it from those places (or use “Replace file”) before deleting.` };
  }
  await db.mediaAsset.delete({ where: { id } });
  await deleteStoredFile(asset.storageKey);
  await logActivity(user, "media.delete", "MediaAsset", id, `Deleted ${asset.filename}`);
  refresh(TAGS.media);
  return { ok: true, message: "Media deleted" };
});

export const addExternalVideo = adminAction("media.manage", async (input: { url: string; alt: string }, user) => {
  const url = z.url().parse(input.url.trim());
  if (!embedUrl(url)) return { ok: false, error: "Use a YouTube or Vimeo link.", fieldErrors: { url: "Use a YouTube or Vimeo link" } };
  const asset = await db.mediaAsset.create({
    data: { kind: "EXTERNAL_VIDEO", url, filename: new URL(url).hostname, alt: input.alt.trim().slice(0, 300) },
  });
  await logActivity(user, "media.create", "MediaAsset", asset.id, "Added external video link");
  return { ok: true, message: "Video link added" };
});
