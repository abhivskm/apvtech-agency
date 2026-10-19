import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { requirePagePermission } from "@/lib/auth/guard";
import { PageHeader } from "@/components/admin/ui";
import { ContentList } from "@/components/admin/ContentList";
import { CategoryManager } from "./CategoryManager";

export const metadata = { title: "Projects" };

export default async function ProjectsAdmin() {
  await requirePagePermission("projects.manage");
  const [projects, categories] = await Promise.all([
    db.project.findMany({ orderBy: [{ order: "asc" }, { createdAt: "desc" }], include: { industry: { select: { title: true } }, _count: { select: { gallery: true } } } }),
    db.projectCategory.findMany({ orderBy: { order: "asc" }, include: { _count: { select: { projects: true } } } }),
  ]);
  return (
    <>
      <PageHeader
        title="Portfolio / Projects"
        description="Published projects appear on /work (with category filters) and, when featured, on the homepage. Mark self-initiated work as a concept — it is labelled publicly."
        actions={
          <Link href="/admin/projects/new" className="a-btn a-btn-primary">
            <Plus className="h-4 w-4" /> New project
          </Link>
        }
      />
      <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
        <ContentList
          entity="project"
          sortable
          emptyTitle="No projects yet"
          emptyText="Add concept work now, and client case studies as projects launch."
          rows={projects.map((p) => ({
            id: p.id,
            title: p.title,
            subtitle: `/work/${p.slug} · ${p.industry?.title ?? "No industry"} · ${p._count.gallery} gallery images`,
            status: p.status,
            editHref: `/admin/projects/${p.id}`,
            viewHref: `/work/${p.slug}`,
            badges: [...(p.isConcept ? ["Concept"] : ["Client work"]), ...(p.featured ? ["Featured"] : [])],
          }))}
        />
        <CategoryManager categories={categories.map((c) => ({ id: c.id, name: c.name, count: c._count.projects }))} />
      </div>
    </>
  );
}
