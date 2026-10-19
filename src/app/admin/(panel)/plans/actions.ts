"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { adminAction } from "@/lib/admin/action";
import { planSchema } from "@/lib/validation/content";
import { logActivity } from "@/lib/audit";
import { refresh } from "@/lib/content/revalidate";
import { TAGS } from "@/lib/content/tags";

export const savePlan = adminAction("plans.manage", async (input: Record<string, unknown>, user) => {
  const id = typeof input.id === "string" ? input.id : null;
  const data = planSchema.parse(input);
  const existing = id ? await db.plan.findUnique({ where: { id } }) : null;
  if (id && !existing) return { ok: false, error: "Plan not found." };
  const record = { ...data, publishedAt: data.status === "PUBLISHED" ? existing?.publishedAt ?? new Date() : existing?.publishedAt ?? null };

  const saved = existing
    ? await db.plan.update({ where: { id: existing.id }, data: record })
    : await db.plan.create({ data: { ...record, order: await db.plan.count() } });

  // Only one plan should carry the "highlighted" emphasis at a time.
  if (saved.highlighted) await db.plan.updateMany({ where: { id: { not: saved.id }, highlighted: true }, data: { highlighted: false } });

  const priceChanged = existing && (existing.setupPrice !== saved.setupPrice || existing.monthlyPrice !== saved.monthlyPrice);
  await logActivity(user, existing ? (priceChanged ? "plan.price_change" : "plan.update") : "plan.create", "Plan", saved.id, `Saved plan “${saved.name}”`, {
    status: saved.status,
    setupPrice: saved.setupPrice,
    monthlyPrice: saved.monthlyPrice,
  });
  refresh(TAGS.plans);
  return { ok: true, message: saved.status === "PUBLISHED" ? "Plan saved — live on the pricing page" : "Plan saved", data: existing ? undefined : { redirect: `/admin/plans/${saved.id}` } };
});

export const savePricingNote = adminAction("plans.manage", async (note: string, user) => {
  const pricingNote = z.string().trim().max(120).parse(note);
  await db.siteSettings.update({ where: { id: "singleton" }, data: { pricingNote } });
  await logActivity(user, "settings.pricing_note", "SiteSettings", "singleton", `Pricing note set to “${pricingNote}”`);
  refresh(TAGS.settings, TAGS.plans);
  return { ok: true, message: "Pricing note saved" };
});
