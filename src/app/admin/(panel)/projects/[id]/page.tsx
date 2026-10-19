import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requirePagePermission } from "@/lib/auth/guard";
import { PageHeader } from "@/components/admin/ui";
import { ProjectForm } from "./ProjectForm";

export const metadata = { title: "Edit project" };

export default async function EditProject({ params }: { params: Promise<{ id: string }> }) {
  await requirePagePermission("projects.manage");
  const { id } = await params;
  const [p, services, industries, categories] = await Promise.all([
    id === "new"
      ? null
      : db.project.findUnique({ where: { id }, include: { gallery: { orderBy: { order: "asc" } }, services: true, categories: true, metrics: { orderBy: { order: "asc" } } } }),
    db.service.findMany({ orderBy: { order: "asc" }, select: { id: true, title: true } }),
    db.industry.findMany({ orderBy: { order: "asc" }, select: { id: true, title: true } }),
    db.projectCategory.findMany({ orderBy: { order: "asc" } }),
  ]);
  if (id !== "new" && !p) notFound();

  const initial = p
    ? {
        id: p.id, title: p.title, slug: p.slug, client: p.client ?? "", isConcept: p.isConcept, year: p.year ?? "", summary: p.summary, description: p.description,
        challenge: p.challenge, solution: p.solution, outcome: p.outcome, coverId: p.coverId, videoUrl: p.videoUrl ?? "", industryId: p.industryId, featured: p.featured,
        status: p.status, galleryIds: p.gallery.map((g) => g.mediaId), serviceIds: p.services.map((s) => s.serviceId), categoryIds: p.categories.map((c) => c.categoryId),
        metrics: p.metrics.map((m) => ({ label: m.label, value: m.value, note: m.note ?? "", verified: m.verified })),
        ogImageId: p.ogImageId, seoTitle: p.seoTitle ?? "", seoDescription: p.seoDescription ?? "", canonicalUrl: p.canonicalUrl ?? "", noindex: p.noindex,
      }
    : {
        title: "", slug: "", client: "", isConcept: true, year: "", summary: "", description: "", challenge: "", solution: "", outcome: "", coverId: null, videoUrl: "",
        industryId: null, featured: false, status: "DRAFT", galleryIds: [], serviceIds: [], categoryIds: [], metrics: [], ogImageId: null, seoTitle: "", seoDescription: "",
        canonicalUrl: "", noindex: false,
      };

  return (
    <>
      <PageHeader title={p ? `Edit: ${p.title}` : "New project"} back={{ href: "/admin/projects", label: "All projects" }} />
      <ProjectForm
        initial={initial}
        services={services.map((s) => ({ value: s.id, label: s.title }))}
        industries={industries.map((i) => ({ value: i.id, label: i.title }))}
        categories={categories.map((c) => ({ value: c.id, label: c.name }))}
      />
    </>
  );
}
