import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { requirePagePermission } from "@/lib/auth/guard";
import { PageHeader } from "@/components/admin/ui";
import { ContentList } from "@/components/admin/ContentList";

export const metadata = { title: "Industries" };

export default async function IndustriesAdmin() {
  await requirePagePermission("industries.manage");
  const items = await db.industry.findMany({ orderBy: { order: "asc" }, include: { _count: { select: { services: true } } } });
  return (
    <>
      <PageHeader
        title="Industries"
        description="Industry pages live at /industries/[slug] and appear in the homepage industries section."
        actions={
          <Link href="/admin/industries/new" className="a-btn a-btn-primary">
            <Plus className="h-4 w-4" /> New industry
          </Link>
        }
      />
      <ContentList
        entity="industry"
        sortable
        rows={items.map((i) => ({
          id: i.id,
          title: i.title,
          subtitle: `/industries/${i.slug} · ${i._count.services} linked services`,
          status: i.status,
          editHref: `/admin/industries/${i.id}`,
          viewHref: `/industries/${i.slug}`,
        }))}
      />
    </>
  );
}
