import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { requirePagePermission } from "@/lib/auth/guard";
import { PageHeader } from "@/components/admin/ui";
import { ContentList } from "@/components/admin/ContentList";

export const metadata = { title: "Services" };

export default async function ServicesAdmin() {
  await requirePagePermission("services.manage");
  const services = await db.service.findMany({ orderBy: { order: "asc" }, include: { _count: { select: { faqs: true } } } });
  return (
    <>
      <PageHeader
        title="Services"
        description="Each published service gets its own page at /services/[slug]. Services marked “Show on homepage” appear in the homepage services section, grouped by category."
        actions={
          <Link href="/admin/services/new" className="a-btn a-btn-primary">
            <Plus className="h-4 w-4" /> New service
          </Link>
        }
      />
      <ContentList
        entity="service"
        sortable
        emptyTitle="No services yet"
        rows={services.map((s) => ({
          id: s.id,
          title: s.title,
          subtitle: `/services/${s.slug} · ${s.category || "No category"} · ${s._count.faqs} FAQs`,
          status: s.status,
          editHref: `/admin/services/${s.id}`,
          viewHref: `/services/${s.slug}`,
          badges: [...(s.showOnHome ? ["Homepage"] : []), ...(s.featuredLabel ? [s.featuredLabel] : [])],
        }))}
      />
    </>
  );
}
