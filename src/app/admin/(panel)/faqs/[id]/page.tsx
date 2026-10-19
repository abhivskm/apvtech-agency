import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requirePagePermission } from "@/lib/auth/guard";
import { PageHeader } from "@/components/admin/ui";
import { FaqForm } from "./FaqForm";

export const metadata = { title: "Edit FAQ" };

export default async function EditFaq({ params }: { params: Promise<{ id: string }> }) {
  await requirePagePermission("faqs.manage");
  const { id } = await params;
  const [f, services] = await Promise.all([
    id === "new" ? null : db.faq.findUnique({ where: { id } }),
    db.service.findMany({ orderBy: { order: "asc" }, select: { id: true, title: true } }),
  ]);
  if (id !== "new" && !f) notFound();
  const initial = f ? { id: f.id, question: f.question, answer: f.answer, group: f.group, serviceId: f.serviceId, status: f.status } : { question: "", answer: "", group: "general", serviceId: null, status: "DRAFT" };
  return (
    <>
      <PageHeader title={f ? "Edit FAQ" : "New FAQ"} back={{ href: "/admin/faqs", label: "All FAQs" }} />
      <FaqForm initial={initial} services={services.map((s) => ({ value: s.id, label: s.title }))} />
    </>
  );
}
