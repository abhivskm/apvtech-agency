"use client";

import { ActionButton } from "@/components/admin/form";
import { applyRetention, retryAllEmails } from "./actions";

export function BulkActions({ failedEmails, canDelete }: { failedEmails: number; canDelete: boolean }) {
  return (
    <>
      {failedEmails > 0 && <ActionButton action={() => retryAllEmails(undefined)}>Retry {failedEmails} notification(s)</ActionButton>}
      {canDelete && <ActionButton action={() => applyRetention(undefined)}>Apply retention policy</ActionButton>}
    </>
  );
}
