"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { ActionButton, ConfirmButton } from "@/components/admin/form";
import { addEnquiryNote, anonymizeEnquiry, deleteEnquiry, retryEnquiryEmail, updateEnquiry } from "../actions";

type Props = {
  id: string;
  status: string;
  assigneeId: string | null;
  users: { id: string; name: string }[];
  notes: { id: string; body: string; author: string; createdAt: string }[];
  outboxId: string | null;
  canManage: boolean;
  canDelete: boolean;
  anonymized: boolean;
};

export function EnquiryControls({ id, status, assigneeId, users, notes, outboxId, canManage, canDelete, anonymized }: Props) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [pending, start] = useTransition();

  const update = (patch: { status?: string; assigneeId?: string | null }) =>
    start(async () => {
      const res = await updateEnquiry({ id, ...patch });
      if (res.ok) {
        toast.success(res.message ?? "Updated");
        router.refresh();
      } else toast.error(res.error);
    });

  return (
    <div className="space-y-5">
      {canManage && (
        <section className="a-card space-y-3 p-5">
          <h2 className="text-sm font-semibold">Lead status</h2>
          <div>
            <label htmlFor="enq-status" className="a-label">
              Status
            </label>
            <select id="enq-status" className="a-input" defaultValue={status} disabled={pending} onChange={(e) => update({ status: e.target.value })}>
              {["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "CLOSED"].map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="enq-assignee" className="a-label">
              Assigned to
            </label>
            <select id="enq-assignee" className="a-input" defaultValue={assigneeId ?? ""} disabled={pending} onChange={(e) => update({ assigneeId: e.target.value || null })}>
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
          {outboxId && <ActionButton action={() => retryEnquiryEmail(outboxId)}>Retry email notification</ActionButton>}
        </section>
      )}

      <section className="a-card p-5">
        <h2 className="text-sm font-semibold">Internal notes</h2>
        <p className="text-xs text-zinc-500">Private to your team — never shown to the client.</p>
        {canManage && !anonymized && (
          <form
            className="mt-3 space-y-2"
            onSubmit={(e) => {
              e.preventDefault();
              start(async () => {
                const res = await addEnquiryNote({ id, body: note });
                if (res.ok) {
                  setNote("");
                  toast.success("Note added");
                  router.refresh();
                } else toast.error(res.error);
              });
            }}
          >
            <label htmlFor="enq-note" className="sr-only">
              New note
            </label>
            <textarea id="enq-note" className="a-input" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Call notes, next steps…" />
            <button type="submit" className="a-btn a-btn-primary" disabled={pending || !note.trim()}>
              {pending && <Loader2 className="h-4 w-4 animate-spin" />} Add note
            </button>
          </form>
        )}
        <ul className="mt-4 space-y-3">
          {notes.map((n) => (
            <li key={n.id} className="rounded-lg bg-zinc-50 p-3 text-sm">
              <p className="whitespace-pre-wrap">{n.body}</p>
              <p className="mt-1 text-xs text-zinc-500">
                {n.author} · {n.createdAt}
              </p>
            </li>
          ))}
          {notes.length === 0 && <li className="text-xs text-zinc-400">No notes yet.</li>}
        </ul>
      </section>

      {canDelete && (
        <section className="a-card space-y-2 p-5">
          <h2 className="text-sm font-semibold">Data protection</h2>
          <p className="text-xs text-zinc-500">Use when someone asks for their data to be removed, or when it is no longer needed.</p>
          <div className="flex flex-wrap gap-2">
            {!anonymized && (
              <ConfirmButton
                label="Anonymise"
                title="Anonymise this enquiry?"
                description="Removes name, email, phone, website, message and notes but keeps the record for reporting. This cannot be undone."
                confirmLabel="Anonymise"
                action={() => anonymizeEnquiry(id)}
              />
            )}
            <ConfirmButton label="Delete" title="Delete this enquiry permanently?" description="The enquiry, its notes and notification history will be deleted. This cannot be undone." confirmLabel="Delete" action={() => deleteEnquiry(id)} redirectTo="/admin/enquiries" />
          </div>
        </section>
      )}
    </div>
  );
}
