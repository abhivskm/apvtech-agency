import { db } from "@/lib/db";
import { requirePagePermission } from "@/lib/auth/guard";
import { PageHeader } from "@/components/admin/ui";
import { DEFAULT_COLORS } from "@/lib/brand";
import { BrandingForm } from "./BrandingForm";

export const metadata = { title: "Branding & Theme" };

export default async function BrandingSettings() {
  await requirePagePermission("branding.manage");
  const s = await db.siteSettings.findUniqueOrThrow({ where: { id: "singleton" } });
  return (
    <>
      <PageHeader
        title="Branding & Theme"
        description="Your brand name, logo and colours are used everywhere — navigation, footer, page titles, structured data and emails. Change them here once and the whole site updates."
      />
      <BrandingForm
        initial={{
          brandName: s.brandName,
          brandShortName: s.brandShortName ?? "",
          tagline: s.tagline,
          supportingMessage: s.supportingMessage,
          logoId: s.logoId,
          faviconId: s.faviconId,
          colors: { ...DEFAULT_COLORS, ...(s.colors as object) },
        }}
      />
    </>
  );
}
