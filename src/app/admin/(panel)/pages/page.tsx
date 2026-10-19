import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { requirePagePermission } from "@/lib/auth/guard";
import { PageHeader } from "@/components/admin/ui";
import { ContentList } from "@/components/admin/ContentList";

export const metadata = { title: "Pages" };

const SYSTEM_PATH: Record<string, string> = { home: "/" };

export default async function PagesAdmin() {
  await requirePagePermission("pages.manage");
  const pages = await db.page.findMany({ orderBy: [{ isSystem: "desc" }, { title: "asc" }], include: { _count: { select: { sections: true } } } });
  const now = new Date();
  const rows = (system: boolean) =>
    pages
      .filter((p) => p.isSystem === system)
      .map((p) => ({
        id: p.id,
        title: p.title,
        subtitle: `${SYSTEM_PATH[p.slug] ?? `/${p.slug}`} · ${p._count.sections} sections`,
        status: p.status,
        scheduled: p.status === "PUBLISHED" && !!p.publishedAt && p.publishedAt > now,
        editHref: `/admin/pages/${p.id}`,
        viewHref: SYSTEM_PATH[p.slug] ?? `/${p.slug}`,
        deletable: !p.isSystem,
      }));
  return (
    <>
      <PageHeader
        title="Pages"
        description="Build pages from structured sections. Core pages (home, about, contact, legal and listing pages) have fixed URLs and can't be deleted; custom pages live at /[slug]."
        actions={
          <Link href="/admin/pages/new" className="a-btn a-btn-primary">
            <Plus className="h-4 w-4" /> New page
          </Link>
        }
      />
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Core pages</h2>
      <ContentList entity="page" rows={rows(true)} />
      <h2 className="mb-2 mt-8 text-xs font-semibold uppercase tracking-wider text-zinc-500">Custom pages</h2>
      <ContentList entity="page" rows={rows(false)} emptyTitle="No custom pages yet" emptyText="Create landing pages, campaign pages or other content using the section builder." />
    </>
  );
}
