import "server-only";
import { db } from "@/lib/db";
import { sha256 } from "@/lib/crypto";
import { rateLimit } from "@/lib/rate-limit";
import { enquirySchema } from "@/lib/validation/enquiry";
import { deliverOutboxItem, queueEnquiryNotification } from "@/lib/email/outbox";
import { logError } from "@/lib/log";

export type EnquiryResult =
  | { ok: true; duplicate?: boolean }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

const MIN_FILL_MS = 2500;
const RATE_LIMIT = { max: 5, windowMs: 60 * 60_000 };
const DEDUPE_WINDOW_MS = 10 * 60_000;

/**
 * Validates, spam-checks, rate-limits, de-duplicates and stores an enquiry.
 * The enquiry is persisted BEFORE any email attempt; notification failures never lose a lead.
 */
export async function createEnquiry(input: unknown, meta: { ipHash: string; now?: number; deliver?: typeof deliverOutboxItem }): Promise<EnquiryResult> {
  const parsed = enquirySchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (key === "company_url") return { ok: true }; // honeypot: silently accept, store nothing
      fieldErrors[key] ??= issue.message;
    }
    return { ok: false, error: "Please check the highlighted fields.", fieldErrors };
  }
  const data = parsed.data;
  const now = meta.now ?? Date.now();

  if (data.startedAt && now - data.startedAt < MIN_FILL_MS) {
    return { ok: false, error: "That was quick! Please take a moment to review your message and submit again." };
  }

  if (!(await rateLimit(`enquiry:${meta.ipHash}`, RATE_LIMIT.max, RATE_LIMIT.windowMs))) {
    return { ok: false, error: "Too many enquiries from this connection. Please try again later or contact us on WhatsApp." };
  }

  const fingerprint = sha256(`${data.email}|${data.message.replace(/\s+/g, " ").toLowerCase()}`);
  const dup = await db.enquiry.findFirst({
    where: { fingerprint, createdAt: { gte: new Date(now - DEDUPE_WINDOW_MS) } },
    select: { id: true },
  });
  if (dup) return { ok: true, duplicate: true };

  const website = data.website ? (/^https?:\/\//i.test(data.website) ? data.website : `https://${data.website}`) : null;

  const enquiry = await db.enquiry.create({
    data: {
      name: data.name,
      businessName: data.businessName || null,
      email: data.email,
      phone: data.phone,
      website,
      industry: data.industry || null,
      services: data.services,
      plan: data.plan || null,
      budget: data.budget || null,
      timeline: data.timeline || null,
      message: data.message,
      consent: true,
      consentAt: new Date(now),
      sourcePath: data.sourcePath?.startsWith("/") ? data.sourcePath : null,
      ipHash: meta.ipHash,
      fingerprint,
    },
  });

  // Notification: queued in the outbox, attempted once now, retried later by cron/admin on failure.
  try {
    const settings = await db.siteSettings.findUnique({ where: { id: "singleton" }, select: { brandName: true, notificationEmail: true } });
    const item = await queueEnquiryNotification(enquiry, settings?.brandName ?? "website", settings?.notificationEmail ?? null);
    if (item.status === "PENDING") await (meta.deliver ?? deliverOutboxItem)(item.id);
  } catch (err) {
    logError("enquiry notification failed (enquiry saved)", err);
  }

  return { ok: true };
}
