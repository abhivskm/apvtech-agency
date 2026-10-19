import Link from "next/link";
import { Plus } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requirePagePermission } from "@/lib/auth/guard";
import { PageHeader, SearchFilters } from "@/components/admin/ui";
import { ContentList } from "@/components/admin/ContentList";

export const metadata = { title: "FAQs" };

export default async function FaqsAdmin({ searchParams }: { searchParams: Promise<{ q?: string; group?: string }> }) {
  await requirePagePermission("faqs.manage");
  const { q, group } = await searchParams;
  const groups = await db.faq.findMany({ distinct: ["group"], select: { group: true }, orderBy: { group: "asc" } });
  const where: Prisma.FaqWhereInput = {
    ...(q ? { OR: [{ question: { contains: q, mode: "insensitive" } }, { answer: { contains: q, mode: "insensitive" } }] } : {}),
    ...(group ? { group } : {}),
  };
  const faqs = await db.faq.findMany({ where, orderBy: [{ group: "asc" }, { order: "asc" }], include: { service: { select: { title: true } } } });
  return (
    <>
      <PageHeader
        title="FAQs"
        description="General FAQs appear in FAQ sections (by group, e.g. on the contact page). Service-specific FAQs can also be edited on each service."
        actions={
          <Link href="/admin/faqs/new" className="a-btn a-btn-primary">
            <Plus className="h-4 w-4" /> New FAQ
          </Link>
        }
      />
      <SearchFilters q={q} placeholder="Search questions and answers" filters={[{ name: "group", label: "Group", value: group, options: groups.map((g) => ({ value: g.group, label: g.group })) }]} />
      <ContentList
        entity="faq"
        sortable={Boolean(group) && !q}
        emptyTitle="No FAQs found"
        rows={faqs.map((f) => ({
          id: f.id,
          title: f.question,
          subtitle: `Group: ${f.group}${f.service ? ` · Service: ${f.service.title}` : ""}`,
          status: f.status,
          editHref: `/admin/faqs/${f.id}`,
        }))}
      />
      {!group && <p className="mt-2 text-xs text-zinc-500">Filter by a group to reorder its FAQs.</p>}
    </>
  );
}
