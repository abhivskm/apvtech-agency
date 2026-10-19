import { requireUser } from "@/lib/auth/guard";
import { ROLE_LABELS } from "@/lib/auth/permissions";
import { PageHeader } from "@/components/admin/ui";
import { PasswordForm } from "./PasswordForm";

export const metadata = { title: "My account" };

export default async function AccountPage() {
  const user = await requireUser();
  return (
    <>
      <PageHeader title="My account" description={`${user.name} · ${user.email} · ${ROLE_LABELS[user.role]}`} />
      <PasswordForm />
    </>
  );
}
