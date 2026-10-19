"use server";

import { db } from "@/lib/db";
import { adminAction } from "@/lib/admin/action";
import { testimonialSchema } from "@/lib/validation/content";
import { logActivity } from "@/lib/audit";
import { refresh } from "@/lib/content/revalidate";

export const saveTestimonial = adminAction("testimonials.manage", async (input: Record<string, unknown>, user) => {
  const id = typeof input.id === "string" ? input.id : null;
  const data = testimonialSchema.parse(input);
  const saved = id ? await db.testimonial.update({ where: { id }, data }) : await db.testimonial.create({ data: { ...data, order: await db.testimonial.count() } });
  await logActivity(user, id ? "testimonial.update" : "testimonial.create", "Testimonial", saved.id, `Saved testimonial from ${saved.name}`, { status: saved.status });
  refresh();
  return { ok: true, message: "Testimonial saved", data: id ? undefined : { redirect: `/admin/testimonials/${saved.id}` } };
});
