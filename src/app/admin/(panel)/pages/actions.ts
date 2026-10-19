"use server";

import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { adminAction, zodFieldErrors } from "@/lib/admin/action";
import { requirePermission } from "@/lib/auth/guard";
import { pageMetaSchema } from "@/lib/validation/content";
import { SECTION_TYPES, isSectionType, sectionSchema, type FieldSpec } from "@/lib/validation/sections";
import { sanitizeRichText } from "@/lib/sanitize";
import { RESERVED_PAGE_SLUGS } from "@/lib/slug";
import { logActivity } from "@/lib/audit";
import { refresh } from "@/lib/content/revalidate";

const sectionInput = z.object({
  id: z.string().max(40).optional(),
  key: z.string().max(60).nullable().optional(),
  type: z.string().refine(isSectionType, "Unknown section type"),
  visible: z.boolean().default(true),
  data: z.record(z.string(), z.unknown()).default({}),
});

/** Sanitise any rich-text fields (including inside lists) before storing. */
function sanitizeFields(fields: FieldSpec[], data: Record<string, unknown>): Record<string, unknown> {
  const out = { ...data };
  for (const f of fields) {
    if (f.kind === "richtext" && typeof out[f.name] === "string") out[f.name] = sanitizeRichText(out[f.name] as string);
    if (f.kind === "list" && Array.isArray(out[f.name])) out[f.name] = (out[f.name] as Record<string, unknown>[]).map((item) => sanitizeFields(f.fields, item));
  }
  return out;
}

/** Pages are edited by Editors/Super Admins; the homepage is also editable by Marketing Managers. */
async function permissionFor(pageId: string | null) {
  if (pageId) {
    const page = await db.page.findUnique({ where: { id: pageId }, select: { slug: true } });
    if (page?.slug === "home") return requirePermission("homepage.manage");
  }
  return requirePermission("pages.manage");
}

export const savePage = adminAction("dashboard.view", async (input: Record<string, unknown>) => {
  const id = typeof input.id === "string" ? input.id : null;
  const user = await permissionFor(id);
  const meta = pageMetaSchema.parse(input);
  const existing = id ? await db.page.findUnique({ where: { id } }) : null;
  if (id && !existing) return { ok: false, error: "Page not found." };

  if (existing?.isSystem) {
    meta.slug = existing.slug; // system page URLs are fixed
    if (existing.slug === "home") meta.status = "PUBLISHED";
  } else if (RESERVED_PAGE_SLUGS.has(meta.slug)) {
    return { ok: false, error: "That URL is reserved by the website.", fieldErrors: { slug: "Reserved — choose another slug" } };
  }

  const rawSections = z.array(sectionInput).max(40).parse(input.sections ?? []);
  const sections: { id?: string; key?: string | null; type: string; visible: boolean; data: Record<string, unknown> }[] = [];
  const fieldErrors: Record<string, string> = {};
  rawSections.forEach((s, i) => {
    if (!isSectionType(s.type)) return;
    const parsed = sectionSchema(s.type).safeParse(s.data);
    if (!parsed.success) {
      for (const [k, v] of Object.entries(zodFieldErrors(parsed.error))) fieldErrors[`sections.${i}.${k}`] = v;
      return;
    }
    sections.push({ ...s, data: sanitizeFields(SECTION_TYPES[s.type].fields, parsed.data as Record<string, unknown>) });
  });
  if (Object.keys(fieldErrors).length) return { ok: false, error: "Some sections have errors. Open the highlighted sections to fix them.", fieldErrors };

  const record = {
    title: meta.title,
    slug: meta.slug,
    status: meta.status,
    publishedAt: meta.publishedAt ?? (meta.status === "PUBLISHED" ? existing?.publishedAt ?? new Date() : existing?.publishedAt ?? null),
    seoTitle: meta.seoTitle,
    seoDescription: meta.seoDescription,
    canonicalUrl: meta.canonicalUrl,
    noindex: meta.noindex,
    ogImageId: meta.ogImageId,
  };

  const saved = await db.$transaction(async (tx) => {
    const page = existing ? await tx.page.update({ where: { id: existing.id }, data: record }) : await tx.page.create({ data: record });
    const keepIds = sections.map((s) => s.id).filter((x): x is string => Boolean(x));
    await tx.pageSection.deleteMany({ where: { pageId: page.id, id: { notIn: keepIds } } });
    for (const [order, s] of sections.entries()) {
      const data = { type: s.type, order, visible: s.visible, data: s.data as Prisma.InputJsonValue };
      const owned = s.id ? await tx.pageSection.findFirst({ where: { id: s.id, pageId: page.id }, select: { id: true } }) : null;
      if (owned) await tx.pageSection.update({ where: { id: owned.id }, data });
      else await tx.pageSection.create({ data: { ...data, pageId: page.id } });
    }
    return page;
  });

  await logActivity(user, existing ? (existing.status !== saved.status && saved.status === "PUBLISHED" ? "page.publish" : "page.update") : "page.create", "Page", saved.id, `Saved page “${saved.title}” (${sections.length} sections)`, { status: saved.status, slug: saved.slug });
  refresh();
  return { ok: true, message: saved.status === "PUBLISHED" ? "Page saved — live on the website" : "Draft saved", data: existing ? undefined : { redirect: `/admin/pages/${saved.id}` } };
});
