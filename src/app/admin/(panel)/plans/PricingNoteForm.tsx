"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { savePricingNote } from "./actions";

export function PricingNoteForm({ initial }: { initial: string }) {
  const [note, setNote] = useState(initial);
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <form
      className="a-card self-start space-y-3 p-4"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await savePricingNote(note);
          if (res.ok) {
            toast.success(res.message ?? "Saved");
            router.refresh();
          } else toast.error(res.error);
        });
      }}
    >
      <div>
        <label htmlFor="pricing-note" className="a-label">
          Tax note under prices
        </label>
        <input id="pricing-note" className="a-input" value={note} maxLength={120} onChange={(e) => setNote(e.target.value)} />
        <p className="a-help">Shown under every listed price, e.g. “Prices exclude 18% GST.” Leave empty to hide.</p>
      </div>
      <button type="submit" className="a-btn a-btn-primary" disabled={pending || note === initial}>
        Save note
      </button>
    </form>
  );
}
