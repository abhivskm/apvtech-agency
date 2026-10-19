import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requirePagePermission } from "@/lib/auth/guard";
import { EmptyState } from "@/components/admin/ui";

export default async function HomepageRedirect() {
  await requirePagePermission("homepage.manage");
  const home = await db.page.findUnique({ where: { slug: "home" }, select: { id: true } });
  if (home) redirect(`/admin/pages/${home.id}`);
  return <EmptyState title="Homepage not found" text="Run the database seed (npm run seed) to create the homepage structure." />;
}
