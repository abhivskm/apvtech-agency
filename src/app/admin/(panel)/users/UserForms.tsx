"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ActionButton, ConfirmButton, PublishBar, Section, SelectField, TextField, useAdminForm } from "@/components/admin/form";
import { createUser, deleteUser, resetUserPassword, revokeSessions, updateUser } from "./actions";

const ROLE_OPTS = [
  { value: "SUPER_ADMIN", label: "Super Admin" },
  { value: "EDITOR", label: "Editor" },
  { value: "MARKETING", label: "Marketing Manager" },
];

type U = { id: string; name: string; email: string; role: string; active: boolean; lastLogin: string; sessions: number };

export function UserRow({ user, isMe }: { user: U; isMe: boolean }) {
  const router = useRouter();
  const [role, setRole] = useState(user.role);
  const [active, setActive] = useState(user.active);
  const [pending, start] = useTransition();
  const dirty = role !== user.role || active !== user.active;

  const save = () =>
    start(async () => {
      const res = await updateUser({ id: user.id, name: user.name, role, active });
      if (res.ok) {
        toast.success(res.message ?? "Saved");
        router.refresh();
      } else {
        toast.error(res.error);
        setRole(user.role);
        setActive(user.active);
      }
    });

  const reset = () => {
    const pw = window.prompt(`New password for ${user.email} (min 12 characters, mixed types):`);
    if (!pw) return;
    start(async () => {
      const res = await resetUserPassword({ id: user.id, password: pw });
      if (res.ok) toast.success(res.message ?? "Reset");
      else toast.error(res.error);
      router.refresh();
    });
  };

  return (
    <tr>
      <td>
        <div className="font-medium">
          {user.name} {isMe && <span className="text-xs text-zinc-500">(you)</span>}
        </div>
        <div className="text-xs text-zinc-500">{user.email}</div>
      </td>
      <td>
        <select className="a-input" value={role} onChange={(e) => setRole(e.target.value)} aria-label={`Role for ${user.name}`}>
          {ROLE_OPTS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </td>
      <td>
        <label className="flex items-center gap-2 text-xs">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> Active
        </label>
      </td>
      <td className="text-xs text-zinc-500">{user.lastLogin}</td>
      <td className="text-xs">{user.sessions}</td>
      <td>
        <div className="flex flex-wrap justify-end gap-1.5">
          {dirty && (
            <button type="button" className="a-btn a-btn-primary a-btn-sm" onClick={save} disabled={pending}>
              Save
            </button>
          )}
          <button type="button" className="a-btn a-btn-secondary a-btn-sm" onClick={reset} disabled={pending}>
            Reset password
          </button>
          {user.sessions > 0 && <ActionButton action={() => revokeSessions(user.id)}>Sign out</ActionButton>}
          {!isMe && <ConfirmButton label="Delete" title={`Delete ${user.email}?`} description="Their activity history is kept but no longer linked to the account." action={() => deleteUser(user.id)} />}
        </div>
      </td>
    </tr>
  );
}

export function NewUserForm() {
  const form = useAdminForm({ name: "", email: "", role: "EDITOR", password: "" }, createUser);
  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <Section title="Add a user" description="Choose the least-privileged role that lets them do their job.">
        <TextField form={form} name="name" label="Name" required />
        <TextField form={form} name="email" label="Email" type="email" required />
        <SelectField form={form} name="role" label="Role" options={ROLE_OPTS} />
        <TextField form={form} name="password" label="Temporary password" type="password" required help="At least 12 characters using three of: lowercase, uppercase, numbers, symbols." />
      </Section>
      <PublishBar form={form} />
    </form>
  );
}
