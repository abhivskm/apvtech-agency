import Link from "next/link";
import { ExternalLink, Plus } from "lucide-react";
import { db } from "@/lib/db";
import { requirePagePermission } from "@/lib/auth/guard";
import { planPriceLines } from "@/lib/pricing";
import { PageHeader } from "@/components/admin/ui";
import { ContentList } from "@/components/admin/ContentList";
import { PricingNoteForm } from "./PricingNoteForm";

export const metadata = { title: "Plans & Pricing" };

export default async function PlansAdmin() {
  await requirePagePermission("plans.manage");
  const [plans, settings, pricingPage] = await Promise.all([
    db.plan.findMany({ orderBy: { order: "asc" } }),
    db.siteSettings.findUnique({ where: { id: "singleton" }, select: { pricingNote: true } }),
    db.page.findUnique({ where: { slug: "pricing" }, select: { id: true } }),
  ]);
  return (
    <>
      <PageHeader
        title="Plans & Pricing"
        description="Client packages shown on /pricing and in the homepage plans section. Prices are in whole rupees. Leave both prices empty for a “Custom quote” plan. Each “Choose plan” button opens the contact form with that plan preselected."
        actions={
          <>
            {pricingPage && (
              <Link href={`/admin/pages/${pricingPage.id}`} className="a-btn a-btn-secondary">
                Edit pricing page text
              </Link>
            )}
            <a href="/pricing" target="_blank" rel="noopener noreferrer" className="a-btn a-btn-secondary">
              <ExternalLink className="h-4 w-4" /> View pricing page
            </a>
            <Link href="/admin/plans/new" className="a-btn a-btn-primary">
              <Plus className="h-4 w-4" /> New plan
            </Link>
          </>
        }
      />
      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        <ContentList
          entity="plan"
          sortable
          emptyTitle="No plans yet"
          emptyText="Create your first package. Only published plans appear on the website."
          rows={plans.map((p) => {
            const price = planPriceLines(p);
            return {
              id: p.id,
              title: p.name,
              subtitle: price ? `${p.pricePrefix} ${price.main} ${price.unit}${price.secondary ? ` ${price.secondary}` : ""}` : p.pricePrefix || "Custom quote",
              status: p.status,
              editHref: `/admin/plans/${p.id}`,
              viewHref: "/pricing",
              badges: [...(p.highlighted ? ["Highlighted"] : []), ...(p.badge ? [p.badge] : [])],
            };
          })}
        />
        <PricingNoteForm initial={settings?.pricingNote ?? ""} />
      </div>
    </>
  );
}
