"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { adminAction } from "@/lib/admin/action";
import { serviceSchema } from "@/lib/validation/content";
import { sanitizeRichText } from "@/lib/sanitize";
import { logActivity } from "@/lib/audit";
import { refresh } from "@/lib/content/revalidate";

const faqItems = z
  .array(z.object({ question: z.string().trim().min(1, "Question is required").max(300), answer: z.string().trim().min(1, "Answer is required").max(3000) }))
  .max(20)
  .default([]);

export const saveService = adminAction("services.manage", async (input: Record<string, unknown>, user) => {
  const id = typeof input.id === "string" ? input.id : null;
  const data = serviceSchema.parse(input);
  const faqs = faqItems.parse(input.faqs ?? []);
  const { relatedIds, ...fields } = data;
  const existing = id ? await db.service.findUnique({ where: { id } }) : null;
  if (id && !existing) return { ok: false, error: "Service not found." };

  const record = {
    ...fields,
    body: sanitizeRichText(fields.body),
    publishedAt: fields.status === "PUBLISHED" ? existing?.publishedAt ?? new Date() : existing?.publishedAt ?? null,
  };

  const saved = await db.$transaction(async (tx) => {
    const s = existing
      ? await tx.service.update({ where: { id: existing.id }, data: record })
      : await tx.service.create({ data: { ...record, order: await tx.service.count() } });
    await tx.serviceRelation.deleteMany({ where: { fromId: s.id } });
    const related = relatedIds.filter((r) => r !== s.id);
    if (related.length) await tx.serviceRelation.createMany({ data: related.map((toId) => ({ fromId: s.id, toId })), skipDuplicates: true });
    await tx.faq.deleteMany({ where: { serviceId: s.id } });
    if (faqs.length) {
      await tx.faq.createMany({ data: faqs.map((f, i) => ({ question: f.question, answer: f.answer, group: "service", serviceId: s.id, status: "PUBLISHED" as const, order: i })) });
    }
    return s;
  });

  const action = !existing ? "create" : existing.status !== saved.status ? (saved.status === "PUBLISHED" ? "publish" : saved.status === "ARCHIVED" ? "archive" : "unpublish") : "update";
  await logActivity(user, `service.${action}`, "Service", saved.id, `${action === "create" ? "Created" : "Updated"} service “${saved.title}”`, { status: saved.status, slug: saved.slug });
  refresh();
  return { ok: true, message: saved.status === "PUBLISHED" ? "Service saved and published" : "Service saved", data: existing ? undefined : { redirect: `/admin/services/${saved.id}` } };
});
