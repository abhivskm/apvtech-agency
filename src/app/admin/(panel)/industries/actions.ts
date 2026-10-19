"use server";

import { db } from "@/lib/db";
import { adminAction } from "@/lib/admin/action";
import { industrySchema } from "@/lib/validation/content";
import { sanitizeRichText } from "@/lib/sanitize";
import { logActivity } from "@/lib/audit";
import { refresh } from "@/lib/content/revalidate";

export const saveIndustry = adminAction("industries.manage", async (input: Record<string, unknown>, user) => {
  const id = typeof input.id === "string" ? input.id : null;
  const { serviceIds, ...fields } = industrySchema.parse(input);
  const existing = id ? await db.industry.findUnique({ where: { id } }) : null;
  if (id && !existing) return { ok: false, error: "Industry not found." };
  const record = {
    ...fields,
    body: sanitizeRichText(fields.body),
    publishedAt: fields.status === "PUBLISHED" ? existing?.publishedAt ?? new Date() : existing?.publishedAt ?? null,
  };
  const saved = await db.$transaction(async (tx) => {
    const ind = existing
      ? await tx.industry.update({ where: { id: existing.id }, data: record })
      : await tx.industry.create({ data: { ...record, order: await tx.industry.count() } });
    await tx.industryService.deleteMany({ where: { industryId: ind.id } });
    if (serviceIds.length) await tx.industryService.createMany({ data: serviceIds.map((serviceId) => ({ industryId: ind.id, serviceId })), skipDuplicates: true });
    return ind;
  });
  await logActivity(user, existing ? "industry.update" : "industry.create", "Industry", saved.id, `Saved industry “${saved.title}”`, { status: saved.status });
  refresh();
  return { ok: true, message: "Industry saved", data: existing ? undefined : { redirect: `/admin/industries/${saved.id}` } };
});
