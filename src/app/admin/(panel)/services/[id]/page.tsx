import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requirePagePermission } from "@/lib/auth/guard";
import { PageHeader } from "@/components/admin/ui";
import { ServiceForm } from "./ServiceForm";

export const metadata = { title: "Edit service" };

export default async function EditService({ params }: { params: Promise<{ id: string }> }) {
  await requirePagePermission("services.manage");
  const { id } = await params;
  const [service, all] = await Promise.all([
    id === "new" ? null : db.service.findUnique({ where: { id }, include: { relatedTo: true, faqs: { orderBy: { order: "asc" } } } }),
    db.service.findMany({ orderBy: { order: "asc" }, select: { id: true, title: true } }),
  ]);
  if (id !== "new" && !service) notFound();

  const initial = service
    ? {
        id: service.id,
        title: service.title,
        slug: service.slug,
        category: service.category,
        shortDescription: service.shortDescription,
        featuredLabel: service.featuredLabel ?? "",
        heroHeadline: service.heroHeadline,
        heroText: service.heroText,
        heroMediaId: service.heroMediaId,
        body: service.body,
        problems: service.problems,
        benefits: service.benefits,
        deliverables: service.deliverables,
        process: service.process,
        ctaLabel: service.ctaLabel ?? "",
        ctaHref: service.ctaHref ?? "",
        whatsappMessage: service.whatsappMessage ?? "",
        showOnHome: service.showOnHome,
        status: service.status,
        relatedIds: service.relatedTo.map((r) => r.toId),
        faqs: service.faqs.map((f) => ({ question: f.question, answer: f.answer })),
        ogImageId: service.ogImageId,
        seoTitle: service.seoTitle ?? "",
        seoDescription: service.seoDescription ?? "",
        canonicalUrl: service.canonicalUrl ?? "",
        noindex: service.noindex,
      }
    : {
        title: "", slug: "", category: "", shortDescription: "", featuredLabel: "", heroHeadline: "", heroText: "", heroMediaId: null, body: "",
        problems: [], benefits: [], deliverables: [], process: [], ctaLabel: "", ctaHref: "", whatsappMessage: "", showOnHome: true, status: "DRAFT",
        relatedIds: [], faqs: [], ogImageId: null, seoTitle: "", seoDescription: "", canonicalUrl: "", noindex: false,
      };

  return (
    <>
      <PageHeader title={service ? `Edit: ${service.title}` : "New service"} back={{ href: "/admin/services", label: "All services" }} />
      <ServiceForm initial={initial} services={all.filter((s) => s.id !== service?.id).map((s) => ({ value: s.id, label: s.title }))} />
    </>
  );
}
