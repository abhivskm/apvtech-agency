"use client";

import { PublishBar, Section, TextField, useAdminForm } from "@/components/admin/form";
import { changeOwnPassword } from "../users/actions";

export function PasswordForm() {
  const form = useAdminForm({ current: "", next: "", confirm: "" }, (v) => changeOwnPassword({ current: v.current, next: v.next, confirm: v.confirm }));
  return (
    <form onSubmit={(e) => e.preventDefault()} className="max-w-lg">
      <Section title="Change password" description="You'll be signed out everywhere and asked to sign in again.">
        <TextField form={form} name="current" label="Current password" type="password" required />
        <TextField form={form} name="next" label="New password" type="password" required help="At least 12 characters using three of: lowercase, uppercase, numbers, symbols." />
        <TextField form={form} name="confirm" label="Confirm new password" type="password" required />
      </Section>
      <PublishBar form={form} />
    </form>
  );
}
