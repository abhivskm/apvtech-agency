import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requirePagePermission } from "@/lib/auth/guard";
import { PageHeader } from "@/components/admin/ui";
import { ArticleForm } from "./ArticleForm";

export const metadata = { title: "Edit article" };

/** Format a Date for <input type="datetime-local"> in IST. */
function toLocalInput(d: Date | null) {
  if (!d) return "";
  const ist = new Date(d.getTime() + 330 * 60_000);
  return ist.toISOString().slice(0, 16);
}

export default async function EditArticle({ params }: { params: Promise<{ id: string }> }) {
  await requirePagePermission("articles.manage");
  const { id } = await params;
  const [a, categories] = await Promise.all([
    id === "new" ? null : db.article.findUnique({ where: { id }, include: { tags: { include: { tag: true } } } }),
    db.articleCategory.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (id !== "new" && !a) notFound();
  const initial = a
    ? {
        id: a.id, title: a.title, slug: a.slug, excerpt: a.excerpt, body: a.body, coverId: a.coverId, authorName: a.authorName, authorRole: a.authorRole ?? "",
        categoryId: a.categoryId, tags: a.tags.map((t) => t.tag.name), readingMinutes: a.readingMinutes, status: a.status, publishedAt: toLocalInput(a.publishedAt),
        ogImageId: a.ogImageId, seoTitle: a.seoTitle ?? "", seoDescription: a.seoDescription ?? "", canonicalUrl: a.canonicalUrl ?? "", noindex: a.noindex,
      }
    : {
        title: "", slug: "", excerpt: "", body: "", coverId: null, authorName: "", authorRole: "", categoryId: null, tags: [], readingMinutes: 5, status: "DRAFT",
        publishedAt: "", ogImageId: null, seoTitle: "", seoDescription: "", canonicalUrl: "", noindex: false,
      };
  return (
    <>
      <PageHeader title={a ? `Edit: ${a.title}` : "New article"} back={{ href: "/admin/articles", label: "All articles" }} />
      <ArticleForm initial={initial} categories={categories.map((c) => ({ value: c.id, label: c.name }))} />
    </>
  );
}
