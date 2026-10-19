import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requirePagePermission } from "@/lib/auth/guard";
import { PageHeader } from "@/components/admin/ui";
import { TestimonialForm } from "./TestimonialForm";

export const metadata = { title: "Edit testimonial" };

export default async function EditTestimonial({ params }: { params: Promise<{ id: string }> }) {
  await requirePagePermission("testimonials.manage");
  const { id } = await params;
  const t = id === "new" ? null : await db.testimonial.findUnique({ where: { id } });
  if (id !== "new" && !t) notFound();
  const initial = t
    ? { id: t.id, name: t.name, role: t.role ?? "", company: t.company ?? "", quote: t.quote, photoId: t.photoId, status: t.status }
    : { name: "", role: "", company: "", quote: "", photoId: null, status: "DRAFT" };
  return (
    <>
      <PageHeader title={t ? `Testimonial: ${t.name}` : "New testimonial"} back={{ href: "/admin/testimonials", label: "All testimonials" }} />
      <TestimonialForm initial={initial} />
    </>
  );
}
