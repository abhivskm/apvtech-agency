"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { adminAction } from "@/lib/admin/action";
import { articleSchema } from "@/lib/validation/content";
import { sanitizeRichText, stripHtml } from "@/lib/sanitize";
import { slugify } from "@/lib/slug";
import { logActivity } from "@/lib/audit";
import { refresh } from "@/lib/content/revalidate";

export const saveArticle = adminAction("articles.manage", async (input: Record<string, unknown>, user) => {
  const id = typeof input.id === "string" ? input.id : null;
  const { tags, publishedAt, ...fields } = articleSchema.parse(input);
  const existing = id ? await db.article.findUnique({ where: { id } }) : null;
  if (id && !existing) return { ok: false, error: "Article not found." };

  const body = sanitizeRichText(fields.body);
  const words = stripHtml(body).split(/\s+/).filter(Boolean).length;
  const record = {
    ...fields,
    body,
    readingMinutes: Math.max(1, Math.round(words / 220)) || fields.readingMinutes,
    // A future publication date schedules the article: it stays hidden publicly until then.
    publishedAt: publishedAt ?? (fields.status === "PUBLISHED" ? existing?.publishedAt ?? new Date() : existing?.publishedAt ?? null),
  };

  const saved = await db.$transaction(async (tx) => {
    const a = existing ? await tx.article.update({ where: { id: existing.id }, data: record }) : await tx.article.create({ data: record });
    await tx.articleTag.deleteMany({ where: { articleId: a.id } });
    for (const name of [...new Set(tags.map((t) => t.trim()).filter(Boolean))]) {
      const slug = slugify(name);
      if (!slug) continue;
      const tag = await tx.tag.upsert({ where: { slug }, create: { slug, name }, update: {} });
      await tx.articleTag.create({ data: { articleId: a.id, tagId: tag.id } });
    }
    return a;
  });
  const scheduled = saved.status === "PUBLISHED" && saved.publishedAt && saved.publishedAt > new Date();
  await logActivity(user, existing ? (existing.status !== saved.status && saved.status === "PUBLISHED" ? "article.publish" : "article.update") : "article.create", "Article", saved.id, `Saved article “${saved.title}”`, { status: saved.status, scheduled: Boolean(scheduled) });
  refresh();
  return {
    ok: true,
    message: scheduled ? `Scheduled for ${saved.publishedAt!.toLocaleString("en-IN")}` : saved.status === "PUBLISHED" ? "Article published" : "Draft saved",
    data: existing ? undefined : { redirect: `/admin/articles/${saved.id}` },
  };
});

export const createArticleCategory = adminAction("articles.manage", async (name: string, user) => {
  const clean = z.string().trim().min(2).max(60).parse(name);
  const cat = await db.articleCategory.create({ data: { name: clean, slug: slugify(clean) } });
  await logActivity(user, "articleCategory.create", "ArticleCategory", cat.id, `Created category “${clean}”`);
  return { ok: true, message: "Category created", data: { id: cat.id, name: cat.name } };
});
