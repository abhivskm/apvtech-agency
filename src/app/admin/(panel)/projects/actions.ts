"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { adminAction } from "@/lib/admin/action";
import { projectSchema } from "@/lib/validation/content";
import { sanitizeRichText } from "@/lib/sanitize";
import { slugify } from "@/lib/slug";
import { logActivity } from "@/lib/audit";
import { refresh } from "@/lib/content/revalidate";

export const saveProject = adminAction("projects.manage", async (input: Record<string, unknown>, user) => {
  const id = typeof input.id === "string" ? input.id : null;
  const data = projectSchema.parse(input);
  const { galleryIds, serviceIds, categoryIds, metrics, ...fields } = data;
  const existing = id ? await db.project.findUnique({ where: { id } }) : null;
  if (id && !existing) return { ok: false, error: "Project not found." };

  const record = {
    ...fields,
    description: sanitizeRichText(fields.description),
    publishedAt: fields.status === "PUBLISHED" ? existing?.publishedAt ?? new Date() : existing?.publishedAt ?? null,
  };

  const saved = await db.$transaction(async (tx) => {
    const p = existing
      ? await tx.project.update({ where: { id: existing.id }, data: record })
      : await tx.project.create({ data: { ...record, order: await tx.project.count() } });
    await tx.projectMedia.deleteMany({ where: { projectId: p.id } });
    if (galleryIds.length) await tx.projectMedia.createMany({ data: galleryIds.map((mediaId, order) => ({ projectId: p.id, mediaId, order })) });
    await tx.projectService.deleteMany({ where: { projectId: p.id } });
    if (serviceIds.length) await tx.projectService.createMany({ data: serviceIds.map((serviceId) => ({ projectId: p.id, serviceId })), skipDuplicates: true });
    await tx.projectCategoryLink.deleteMany({ where: { projectId: p.id } });
    if (categoryIds.length) await tx.projectCategoryLink.createMany({ data: categoryIds.map((categoryId) => ({ projectId: p.id, categoryId })), skipDuplicates: true });
    await tx.projectMetric.deleteMany({ where: { projectId: p.id } });
    if (metrics.length) await tx.projectMetric.createMany({ data: metrics.map((m, order) => ({ ...m, projectId: p.id, order })) });
    return p;
  });

  await logActivity(user, existing ? (existing.status !== saved.status && saved.status === "PUBLISHED" ? "project.publish" : "project.update") : "project.create", "Project", saved.id, `Saved project “${saved.title}”`, {
    status: saved.status,
    verifiedMetrics: metrics.filter((m) => m.verified).length,
  });
  refresh();
  return { ok: true, message: "Project saved", data: existing ? undefined : { redirect: `/admin/projects/${saved.id}` } };
});

export const createProjectCategory = adminAction("projects.manage", async (name: string, user) => {
  const clean = z.string().trim().min(2, "Name is too short").max(60).parse(name);
  const slug = slugify(clean);
  const cat = await db.projectCategory.create({ data: { name: clean, slug, order: await db.projectCategory.count() } });
  await logActivity(user, "projectCategory.create", "ProjectCategory", cat.id, `Created category “${clean}”`);
  refresh();
  return { ok: true, message: "Category added" };
});

export const deleteProjectCategory = adminAction("projects.manage", async (id: string, user) => {
  const cat = await db.projectCategory.delete({ where: { id } });
  await logActivity(user, "projectCategory.delete", "ProjectCategory", id, `Deleted category “${cat.name}”`);
  refresh();
  return { ok: true, message: "Category deleted" };
});
