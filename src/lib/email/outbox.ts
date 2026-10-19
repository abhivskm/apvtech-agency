import "server-only";
import { Resend } from "resend";
import type { Enquiry } from "@prisma/client";
import { db } from "@/lib/db";
import { env } from "@/lib/env";

const MAX_ATTEMPTS = 5;

export function emailStatus(notificationEmail: string | null | undefined) {
  const missing: string[] = [];
  if (!env.resendApiKey) missing.push("RESEND_API_KEY (environment)");
  if (!env.emailFrom) missing.push("EMAIL_FROM (environment)");
  if (!notificationEmail) missing.push("Notification email (Admin → Global settings)");
  return { configured: missing.length === 0, missing };
}

/** Queue a notification for a stored enquiry. The enquiry itself is already persisted before this runs. */
export async function queueEnquiryNotification(enquiry: Enquiry, brandName: string, notificationEmail: string | null) {
  const lines = [
    `New enquiry received on the ${brandName} website.`,
    "",
    `Name: ${enquiry.name}`,
    `Business: ${enquiry.businessName ?? "—"}`,
    `Email: ${enquiry.email}`,
    `Phone / WhatsApp: ${enquiry.phone}`,
    `Website: ${enquiry.website ?? "—"}`,
    `Industry: ${enquiry.industry ?? "—"}`,
    `Plan: ${enquiry.plan ?? "—"}`,
    `Services: ${enquiry.services.join(", ") || "—"}`,
    `Budget: ${enquiry.budget ?? "—"}`,
    `Timeline: ${enquiry.timeline ?? "—"}`,
    "",
    enquiry.message,
    "",
    `Open in admin: ${env.siteUrl}/admin/enquiries/${enquiry.id}`,
  ];
  const status = emailStatus(notificationEmail);
  return db.emailOutbox.create({
    data: {
      enquiryId: enquiry.id,
      toAddress: notificationEmail,
      subject: `New enquiry: ${enquiry.name}${enquiry.businessName ? ` (${enquiry.businessName})` : ""}`,
      text: lines.join("\n"),
      status: status.configured ? "PENDING" : "SKIPPED_UNCONFIGURED",
      lastError: status.configured ? null : `Not configured: ${status.missing.join(", ")}`,
    },
  });
}

type Sender = (msg: { to: string; subject: string; text: string; replyTo?: string }) => Promise<void>;

const resendSender: Sender = async (msg) => {
  const resend = new Resend(env.resendApiKey);
  const { error } = await resend.emails.send({
    from: env.emailFrom,
    to: msg.to,
    subject: msg.subject,
    text: msg.text,
    replyTo: msg.replyTo,
  });
  if (error) throw new Error(`${error.name}: ${error.message}`);
};

/** Attempt delivery of one outbox row. Never throws – failures are recorded for retry. */
export async function deliverOutboxItem(id: string, send: Sender = resendSender): Promise<"SENT" | "FAILED" | "SKIPPED"> {
  const item = await db.emailOutbox.findUnique({ where: { id }, include: { enquiry: { select: { email: true } } } });
  if (!item || item.status === "SENT") return "SKIPPED";
  const settings = await db.siteSettings.findUnique({ where: { id: "singleton" }, select: { notificationEmail: true } });
  const to = settings?.notificationEmail ?? item.toAddress;
  const status = emailStatus(to);
  if (!status.configured || !to) {
    await db.emailOutbox.update({
      where: { id },
      data: { status: "SKIPPED_UNCONFIGURED", lastError: `Not configured: ${status.missing.join(", ")}` },
    });
    return "SKIPPED";
  }
  try {
    await send({ to, subject: item.subject, text: item.text, replyTo: item.enquiry?.email });
    await db.emailOutbox.update({
      where: { id },
      data: { status: "SENT", sentAt: new Date(), attempts: { increment: 1 }, lastError: null, toAddress: to },
    });
    return "SENT";
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await db.emailOutbox.update({
      where: { id },
      data: { status: "FAILED", attempts: { increment: 1 }, lastError: message.slice(0, 500) },
    });
    return "FAILED";
  }
}

/** Process pending/failed items (used by the cron route and the admin "retry" action). */
export async function processOutbox(limit = 20, includeSkipped = false) {
  const items = await db.emailOutbox.findMany({
    where: {
      OR: [
        { status: "PENDING" },
        { status: "FAILED", attempts: { lt: MAX_ATTEMPTS } },
        ...(includeSkipped ? [{ status: "SKIPPED_UNCONFIGURED" as const }] : []),
      ],
    },
    orderBy: { createdAt: "asc" },
    take: limit,
    select: { id: true },
  });
  const results = { sent: 0, failed: 0, skipped: 0 };
  for (const { id } of items) {
    const r = await deliverOutboxItem(id);
    if (r === "SENT") results.sent++;
    else if (r === "FAILED") results.failed++;
    else results.skipped++;
  }
  return results;
}
