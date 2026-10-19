import { db } from "@/lib/db";
import { requirePagePermission } from "@/lib/auth/guard";
import { PageHeader } from "@/components/admin/ui";
import { SocialEditor } from "./SocialEditor";

export const metadata = { title: "Social Media" };

export default async function SocialSettings() {
  await requirePagePermission("social.manage");
  const items = await db.socialProfile.findMany({ orderBy: { order: "asc" } });
  return (
    <>
      <PageHeader
        title="Social Media"
        description="Profiles appear as icon links in the footer and in the Organization structured data (sameAs). Displaying a link is not a live feed integration."
      />
      <SocialEditor initial={items.map((i) => ({ id: i.id, platform: i.platform, label: i.label, url: i.url, visible: i.visible }))} />
    </>
  );
}
