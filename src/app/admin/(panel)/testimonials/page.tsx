import Link from "next/link";
import { Plus } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requirePagePermission } from "@/lib/auth/guard";
import { PageHeader, SearchFilters } from "@/components/admin/ui";
import { ContentList } from "@/components/admin/ContentList";

export const metadata = { title: "Testimonials" };

export default async function TestimonialsAdmin({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requirePagePermission("testimonials.manage");
  const { q } = await searchParams;
  const where: Prisma.TestimonialWhereInput = q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { company: { contains: q, mode: "insensitive" } }, { quote: { contains: q, mode: "insensitive" } }] } : {};
  const items = await db.testimonial.findMany({ where, orderBy: { order: "asc" } });
  return (
    <>
      <PageHeader
        title="Testimonials"
        description="Only add genuine testimonials you have permission to publish. The homepage testimonials section hides itself until at least one is published."
        actions={
          <Link href="/admin/testimonials/new" className="a-btn a-btn-primary">
            <Plus className="h-4 w-4" /> New testimonial
          </Link>
        }
      />
      <SearchFilters q={q} placeholder="Search name, company or quote" />
      <ContentList
        entity="testimonial"
        sortable={!q}
        emptyTitle="No testimonials yet"
        emptyText="When clients share feedback, add it here with their permission."
        rows={items.map((t) => ({
          id: t.id,
          title: t.name,
          subtitle: `${[t.role, t.company].filter(Boolean).join(", ")} — “${t.quote.slice(0, 90)}${t.quote.length > 90 ? "…" : ""}”`,
          status: t.status,
          editHref: `/admin/testimonials/${t.id}`,
        }))}
      />
    </>
  );
}
