import Link from "next/link";
import { Plus } from "lucide-react";
import type { ContentStatus, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requirePagePermission } from "@/lib/auth/guard";
import { PageHeader, Pagination, SearchFilters, formatDate } from "@/components/admin/ui";
import { ContentList } from "@/components/admin/ContentList";

export const metadata = { title: "Insights" };
const PER_PAGE = 20;

export default async function ArticlesAdmin({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; category?: string; page?: string }> }) {
  await requirePagePermission("articles.manage");
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const where: Prisma.ArticleWhereInput = {};
  if (sp.q) where.OR = [{ title: { contains: sp.q, mode: "insensitive" } }, { excerpt: { contains: sp.q, mode: "insensitive" } }];
  if (["DRAFT", "PUBLISHED", "ARCHIVED"].includes(sp.status ?? "")) where.status = sp.status as ContentStatus;
  if (sp.category) where.categoryId = sp.category;
  const [items, total, categories] = await Promise.all([
    db.article.findMany({ where, orderBy: [{ publishedAt: { sort: "desc", nulls: "first" } }, { updatedAt: "desc" }], skip: (page - 1) * PER_PAGE, take: PER_PAGE, include: { category: true } }),
    db.article.count({ where }),
    db.articleCategory.findMany({ orderBy: { name: "asc" } }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const now = new Date();
  const qs = (p: number) => `/admin/articles?${new URLSearchParams(Object.entries({ ...sp, page: String(p) }).filter(([, v]) => v) as [string, string][])}`;

  return (
    <>
      <PageHeader
        title="Blog / Insights"
        description={`${total} article${total === 1 ? "" : "s"}. Set a future publication date to schedule an article.`}
        actions={
          <Link href="/admin/articles/new" className="a-btn a-btn-primary">
            <Plus className="h-4 w-4" /> New article
          </Link>
        }
      />
      <SearchFilters
        q={sp.q}
        placeholder="Search title or excerpt"
        filters={[
          { name: "status", label: "Status", value: sp.status, options: [{ value: "DRAFT", label: "Draft" }, { value: "PUBLISHED", label: "Published" }, { value: "ARCHIVED", label: "Archived" }] },
          { name: "category", label: "Category", value: sp.category, options: categories.map((c) => ({ value: c.id, label: c.name })) },
        ]}
      />
      <ContentList
        entity="article"
        emptyTitle="No articles found"
        rows={items.map((a) => ({
          id: a.id,
          title: a.title,
          subtitle: `${a.category?.name ?? "Uncategorised"} · ${a.publishedAt ? formatDate(a.publishedAt) : "Not published"} · /insights/${a.slug}`,
          status: a.status,
          scheduled: a.status === "PUBLISHED" && !!a.publishedAt && a.publishedAt > now,
          editHref: `/admin/articles/${a.id}`,
          viewHref: `/insights/${a.slug}`,
        }))}
      />
      <Pagination page={page} pages={pages} href={qs} />
    </>
  );
}
