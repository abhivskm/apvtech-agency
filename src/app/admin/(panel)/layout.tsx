import { Toaster } from "sonner";
import { requireUser } from "@/lib/auth/guard";
import { can, ROLE_LABELS } from "@/lib/auth/permissions";
import { db } from "@/lib/db";
import { ADMIN_NAV } from "@/components/admin/nav";
import { AdminShell } from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";
export const metadata = { title: { default: "Admin", template: "%s · Admin" }, robots: { index: false, follow: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const [settings, newEnquiries] = await Promise.all([
    db.siteSettings.findUnique({ where: { id: "singleton" }, select: { brandName: true } }),
    can(user.role, "leads.view") ? db.enquiry.count({ where: { status: "NEW", anonymizedAt: null } }) : Promise.resolve(0),
  ]);
  const nav = ADMIN_NAV.map((g) => ({ ...g, items: g.items.filter((i) => can(user.role, i.permission)) })).filter((g) => g.items.length);
  return (
    <>
      <AdminShell
        nav={nav}
        user={{ name: user.name, email: user.email, roleLabel: ROLE_LABELS[user.role] }}
        brandName={settings?.brandName ?? "Website"}
        newEnquiries={newEnquiries}
      >
        {children}
      </AdminShell>
      <Toaster position="top-right" richColors closeButton />
    </>
  );
}
