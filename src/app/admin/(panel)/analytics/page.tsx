import { requirePagePermission } from "@/lib/auth/guard";
import { PageHeader } from "@/components/admin/ui";
import { AnalyticsDashboard } from "./AnalyticsDashboard";

export const metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  await requirePagePermission("analytics.view");
  return (
    <>
      <PageHeader title="Analytics" description="First-party, anonymous visitor analytics. Signed-in staff, bots and opted-out visitors are not counted, so test in a private window." />
      <AnalyticsDashboard />
    </>
  );
}
