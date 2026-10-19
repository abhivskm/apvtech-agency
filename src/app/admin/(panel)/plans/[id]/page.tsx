import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requirePagePermission } from "@/lib/auth/guard";
import { PageHeader } from "@/components/admin/ui";
import { PlanForm } from "./PlanForm";

export const metadata = { title: "Edit plan" };

export default async function EditPlan({ params }: { params: Promise<{ id: string }> }) {
  await requirePagePermission("plans.manage");
  const { id } = await params;
  const [plan, settings] = await Promise.all([
    id === "new" ? null : db.plan.findUnique({ where: { id } }),
    db.siteSettings.findUnique({ where: { id: "singleton" }, select: { pricingNote: true } }),
  ]);
  if (id !== "new" && !plan) notFound();
  const initial = plan
    ? {
        id: plan.id, name: plan.name, slug: plan.slug, tagline: plan.tagline, bestFor: plan.bestFor, description: plan.description,
        setupPrice: plan.setupPrice ?? "", monthlyPrice: plan.monthlyPrice ?? "", pricePrefix: plan.pricePrefix, includesLabel: plan.includesLabel ?? "",
        features: plan.features, notes: plan.notes, highlighted: plan.highlighted, badge: plan.badge ?? "", ctaLabel: plan.ctaLabel, status: plan.status,
      }
    : {
        name: "", slug: "", tagline: "", bestFor: "", description: "", setupPrice: "", monthlyPrice: "", pricePrefix: "Starting from", includesLabel: "",
        features: [], notes: [], highlighted: false, badge: "", ctaLabel: "Choose this plan", status: "DRAFT",
      };
  return (
    <>
      <PageHeader title={plan ? `Edit plan: ${plan.name}` : "New plan"} back={{ href: "/admin/plans", label: "All plans" }} />
      <PlanForm initial={initial} pricingNote={settings?.pricingNote ?? ""} />
    </>
  );
}
