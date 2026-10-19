"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { requirePermission, AuthError } from "@/lib/auth/guard";
import type { Permission } from "@/lib/auth/permissions";
import type { ActionResult } from "@/lib/admin/action";
import { logActivity } from "@/lib/audit";
import { refresh } from "@/lib/content/revalidate";

const ENTITY = z.enum(["service", "project", "industry", "article", "page", "testimonial", "faq", "plan"]);
type Entity = z.infer<typeof ENTITY>;

const PERMS: Record<Entity, Permission> = {
  service: "services.manage",
  project: "projects.manage",
  industry: "industries.manage",
  article: "articles.manage",
  page: "pages.manage",
  testimonial: "testimonials.manage",
  faq: "faqs.manage",
  plan: "plans.manage",
};
const LABEL: Record<Entity, string> = { service: "Service", project: "Project", industry: "Industry", article: "Article", page: "Page", testimonial: "Testimonial", faq: "FAQ", plan: "Plan" };

async function guard(entity: unknown) {
  const e = ENTITY.parse(entity);
  const user = await requirePermission(PERMS[e]);
  return { e, user };
}

function fail(err: unknown): ActionResult {
  if (err instanceof AuthError) return { ok: false, error: err.message };
  if (err instanceof z.ZodError) return { ok: false, error: "Invalid request." };
  console.error(err);
  return { ok: false, error: "Something went wrong. Please try again." };
}

export async function reorderItems(entity: Entity, ids: string[]): Promise<ActionResult> {
  try {
    const { e, user } = await guard(entity);
    const list = z.array(z.string().max(40)).max(500).parse(ids);
    await db.$transaction(
      list.map((id, order) => {
        switch (e) {
          case "service": return db.service.update({ where: { id }, data: { order } });
          case "project": return db.project.update({ where: { id }, data: { order } });
          case "industry": return db.industry.update({ where: { id }, data: { order } });
          case "testimonial": return db.testimonial.update({ where: { id }, data: { order } });
          case "faq": return db.faq.update({ where: { id }, data: { order } });
          case "plan": return db.plan.update({ where: { id }, data: { order } });
          default: throw new Error("Not sortable");
        }
      }),
    );
    await logActivity(user, `${e}.reorder`, LABEL[e], null, `Reordered ${list.length} ${LABEL[e].toLowerCase()} items`);
    refresh();
    return { ok: true, message: "Order saved" };
  } catch (err) {
    return fail(err);
  }
}

export async function setItemStatus(entity: Entity, id: string, status: "DRAFT" | "PUBLISHED" | "ARCHIVED"): Promise<ActionResult> {
  try {
    const { e, user } = await guard(entity);
    const s = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).parse(status);
    const now = new Date();
    const pub = async <T extends { publishedAt: Date | null } | null>(current: T) => (s === "PUBLISHED" && !current?.publishedAt ? { publishedAt: now } : {});
    switch (e) {
      case "service": await db.service.update({ where: { id }, data: { status: s, ...(await pub(await db.service.findUnique({ where: { id } }))) } }); break;
      case "project": await db.project.update({ where: { id }, data: { status: s, ...(await pub(await db.project.findUnique({ where: { id } }))) } }); break;
      case "industry": await db.industry.update({ where: { id }, data: { status: s, ...(await pub(await db.industry.findUnique({ where: { id } }))) } }); break;
      case "article": await db.article.update({ where: { id }, data: { status: s, ...(await pub(await db.article.findUnique({ where: { id } }))) } }); break;
      case "page": {
        const page = await db.page.findUnique({ where: { id } });
        if (page?.slug === "home" && s !== "PUBLISHED") return { ok: false, error: "The homepage must stay published." };
        await db.page.update({ where: { id }, data: { status: s, ...(await pub(page)) } });
        break;
      }
      case "testimonial": await db.testimonial.update({ where: { id }, data: { status: s } }); break;
      case "faq": await db.faq.update({ where: { id }, data: { status: s } }); break;
      case "plan": await db.plan.update({ where: { id }, data: { status: s, ...(await pub(await db.plan.findUnique({ where: { id } }))) } }); break;
    }
    const verb = s === "PUBLISHED" ? "publish" : s === "ARCHIVED" ? "archive" : "unpublish";
    await logActivity(user, `${e}.${verb}`, LABEL[e], id, `${LABEL[e]} set to ${s.toLowerCase()}`);
    refresh();
    return { ok: true, message: `${LABEL[e]} ${s === "PUBLISHED" ? "published" : s === "ARCHIVED" ? "archived" : "moved to draft"}` };
  } catch (err) {
    return fail(err);
  }
}

export async function deleteItem(entity: Entity, id: string): Promise<ActionResult> {
  try {
    const { e, user } = await guard(entity);
    let name = id;
    switch (e) {
      case "service": name = (await db.service.delete({ where: { id } })).title; break;
      case "project": name = (await db.project.delete({ where: { id } })).title; break;
      case "industry": name = (await db.industry.delete({ where: { id } })).title; break;
      case "article": name = (await db.article.delete({ where: { id } })).title; break;
      case "page": {
        const page = await db.page.findUnique({ where: { id } });
        if (!page) return { ok: false, error: "Page not found." };
        if (page.isSystem) return { ok: false, error: "System pages can be edited or unpublished, but not deleted." };
        name = (await db.page.delete({ where: { id } })).title;
        break;
      }
      case "testimonial": name = (await db.testimonial.delete({ where: { id } })).name; break;
      case "faq": name = (await db.faq.delete({ where: { id } })).question; break;
      case "plan": name = (await db.plan.delete({ where: { id } })).name; break;
    }
    await logActivity(user, `${e}.delete`, LABEL[e], id, `Deleted ${LABEL[e].toLowerCase()} “${name}”`);
    refresh();
    return { ok: true, message: `${LABEL[e]} deleted` };
  } catch (err) {
    return fail(err);
  }
}
