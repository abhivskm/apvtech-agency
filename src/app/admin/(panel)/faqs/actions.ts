"use server";

import { db } from "@/lib/db";
import { adminAction } from "@/lib/admin/action";
import { faqSchema } from "@/lib/validation/content";
import { logActivity } from "@/lib/audit";
import { refresh } from "@/lib/content/revalidate";

export const saveFaq = adminAction("faqs.manage", async (input: Record<string, unknown>, user) => {
  const id = typeof input.id === "string" ? input.id : null;
  const data = faqSchema.parse(input);
  const saved = id ? await db.faq.update({ where: { id }, data }) : await db.faq.create({ data: { ...data, order: await db.faq.count({ where: { group: data.group } }) } });
  await logActivity(user, id ? "faq.update" : "faq.create", "Faq", saved.id, `Saved FAQ “${saved.question.slice(0, 60)}”`, { status: saved.status });
  refresh();
  return { ok: true, message: "FAQ saved", data: id ? undefined : { redirect: `/admin/faqs/${saved.id}` } };
});
