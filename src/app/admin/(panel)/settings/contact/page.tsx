import { db } from "@/lib/db";
import { requirePagePermission } from "@/lib/auth/guard";
import { PageHeader } from "@/components/admin/ui";
import { ContactForm } from "./ContactForm";

export const metadata = { title: "Contact Information" };

export default async function ContactSettings() {
  await requirePagePermission("contact.manage");
  const s = await db.siteSettings.findUniqueOrThrow({ where: { id: "singleton" } });
  return (
    <>
      <PageHeader
        title="Contact Information"
        description="Only enter real details. Empty fields are simply hidden on the website — no placeholder numbers or addresses are ever shown. The WhatsApp button appears only once a valid number is saved."
      />
      <ContactForm
        initial={{
          contactEmail: s.contactEmail ?? "", phone: s.phone ?? "", whatsappNumber: s.whatsappNumber ?? "", whatsappMessage: s.whatsappMessage, address: s.address ?? "",
          city: s.city ?? "", region: s.region ?? "", postalCode: s.postalCode ?? "", serviceAreas: s.serviceAreas, businessHours: s.businessHours ?? "", googleBusinessUrl: s.googleBusinessUrl ?? "",
        }}
      />
    </>
  );
}
