import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requirePagePermission } from "@/lib/auth/guard";
import { PageHeader } from "@/components/admin/ui";
import { IndustryForm } from "./IndustryForm";

export const metadata = { title: "Edit industry" };

export default async function EditIndustry({ params }: { params: Promise<{ id: string }> }) {
  await requirePagePermission("industries.manage");
  const { id } = await params;
  const [ind, services] = await Promise.all([
    id === "new" ? null : db.industry.findUnique({ where: { id }, include: { services: true } }),
    db.service.findMany({ orderBy: { order: "asc" }, select: { id: true, title: true } }),
  ]);
  if (id !== "new" && !ind) notFound();
  const initial = ind
    ? {
        id: ind.id, title: ind.title, shortTitle: ind.shortTitle, slug: ind.slug, intro: ind.intro, needs: ind.needs, body: ind.body, heroMediaId: ind.heroMediaId,
        status: ind.status, serviceIds: ind.services.map((s) => s.serviceId), seoTitle: ind.seoTitle ?? "", seoDescription: ind.seoDescription ?? "", canonicalUrl: ind.canonicalUrl ?? "", noindex: ind.noindex,
      }
    : { title: "", shortTitle: "", slug: "", intro: "", needs: [], body: "", heroMediaId: null, status: "DRAFT", serviceIds: [], seoTitle: "", seoDescription: "", canonicalUrl: "", noindex: false };
  return (
    <>
      <PageHeader title={ind ? `Edit: ${ind.title}` : "New industry"} back={{ href: "/admin/industries", label: "All industries" }} />
      <IndustryForm initial={initial} services={services.map((s) => ({ value: s.id, label: s.title }))} />
    </>
  );
}
