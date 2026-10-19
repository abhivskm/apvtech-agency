"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { adminAction } from "@/lib/admin/action";
import { logActivity } from "@/lib/audit";
import { deliverOutboxItem, processOutbox } from "@/lib/email/outbox";

const STATUS = z.enum(["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "CLOSED"]);

export const updateEnquiry = adminAction("leads.manage", async (input: { id: string; status?: string; assigneeId?: string | null }, user) => {
  const data: { status?: z.infer<typeof STATUS>; assigneeId?: string | null } = {};
  if (input.status !== undefined) data.status = STATUS.parse(input.status);
  if (input.assigneeId !== undefined) {
    if (input.assigneeId) {
      const assignee = await db.user.findUnique({ where: { id: input.assigneeId }, select: { role: true, active: true } });
      if (!assignee?.active || assignee.role === "EDITOR") return { ok: false, error: "Leads can only be assigned to active users with lead access." };
    }
    data.assigneeId = input.assigneeId || null;
  }
  const e = await db.enquiry.update({ where: { id: input.id }, data });
  await logActivity(user, "enquiry.update", "Enquiry", e.id, data.status ? `Status changed to ${data.status.toLowerCase()}` : "Assignment changed", data);
  return { ok: true, message: "Enquiry updated" };
});

export const addEnquiryNote = adminAction("leads.manage", async (input: { id: string; body: string }, user) => {
  const body = z.string().trim().min(1, "Write a note first").max(4000).parse(input.body);
  await db.enquiryNote.create({ data: { enquiryId: input.id, authorId: user.id, body } });
  await logActivity(user, "enquiry.note", "Enquiry", input.id, "Added an internal note");
  return { ok: true, message: "Note added" };
});

export const retryEnquiryEmail = adminAction("leads.manage", async (outboxId: string, user) => {
  const r = await deliverOutboxItem(outboxId);
  await logActivity(user, "enquiry.email_retry", "EmailOutbox", outboxId, `Notification retry: ${r}`);
  if (r === "SENT") return { ok: true, message: "Notification sent" };
  if (r === "SKIPPED") return { ok: false, error: "Email is not configured. See Global Settings → Integrations." };
  return { ok: false, error: "Sending failed again. Check the error shown and your email provider settings." };
});

export const retryAllEmails = adminAction("leads.manage", async (_: undefined, user) => {
  const r = await processOutbox(50, true);
  await logActivity(user, "enquiry.email_retry_all", "EmailOutbox", null, `Retried notifications: ${r.sent} sent, ${r.failed} failed, ${r.skipped} skipped`);
  return { ok: true, message: `${r.sent} sent · ${r.failed} failed · ${r.skipped} not configured` };
});

const ANON = { name: "Anonymised", businessName: null, email: "anonymised@invalid", phone: "—", website: null, message: "[removed]", ipHash: null } as const;

export const anonymizeEnquiry = adminAction("leads.delete", async (id: string, user) => {
  await db.$transaction([
    db.enquiry.update({ where: { id }, data: { ...ANON, anonymizedAt: new Date() } }),
    db.enquiryNote.deleteMany({ where: { enquiryId: id } }),
    db.emailOutbox.updateMany({ where: { enquiryId: id }, data: { text: "[removed]", subject: "Enquiry (anonymised)" } }),
  ]);
  await logActivity(user, "enquiry.anonymize", "Enquiry", id, "Anonymised enquiry personal data");
  return { ok: true, message: "Personal data removed" };
});

export const deleteEnquiry = adminAction("leads.delete", async (id: string, user) => {
  await db.enquiry.delete({ where: { id } });
  await logActivity(user, "enquiry.delete", "Enquiry", id, "Deleted enquiry");
  return { ok: true, message: "Enquiry deleted", data: { redirect: "/admin/enquiries" } };
});

/** Applies the retention policy from Global Settings: anonymises enquiries older than N days. */
export const applyRetention = adminAction("leads.delete", async (_: undefined, user) => {
  const s = await db.siteSettings.findUnique({ where: { id: "singleton" }, select: { enquiryRetentionDays: true } });
  const days = s?.enquiryRetentionDays ?? 730;
  const cutoff = new Date(Date.now() - days * 86_400_000);
  const old = await db.enquiry.findMany({ where: { createdAt: { lt: cutoff }, anonymizedAt: null }, select: { id: true } });
  const ids = old.map((o) => o.id);
  if (ids.length) {
    await db.$transaction([
      db.enquiry.updateMany({ where: { id: { in: ids } }, data: { ...ANON, anonymizedAt: new Date() } }),
      db.enquiryNote.deleteMany({ where: { enquiryId: { in: ids } } }),
      db.emailOutbox.updateMany({ where: { enquiryId: { in: ids } }, data: { text: "[removed]" } }),
    ]);
  }
  await logActivity(user, "enquiry.retention", "Enquiry", null, `Retention policy (${days} days) anonymised ${ids.length} enquiries`);
  return { ok: true, message: `${ids.length} enquiries older than ${days} days anonymised` };
});
