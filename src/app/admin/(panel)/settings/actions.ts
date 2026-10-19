"use server";

import { db } from "@/lib/db";
import { adminAction } from "@/lib/admin/action";
import { brandingSchema, contactSchema, globalSettingsSchema, redirectSchema, seoSettingsSchema, socialSaveSchema } from "@/lib/validation/content";
import { normaliseWhatsappNumber } from "@/lib/whatsapp";
import { normalisePath } from "@/lib/url-safety";
import { logActivity } from "@/lib/audit";
import { refresh } from "@/lib/content/revalidate";
import { TAGS } from "@/lib/content/tags";

const ID = { id: "singleton" } as const;

function changedKeys(before: Record<string, unknown>, after: Record<string, unknown>) {
  return Object.keys(after).filter((k) => JSON.stringify(before[k] ?? null) !== JSON.stringify(after[k] ?? null));
}

export const saveContact = adminAction("contact.manage", async (input: Record<string, unknown>, user) => {
  const data = contactSchema.parse(input);
  if (data.whatsappNumber && !normaliseWhatsappNumber(data.whatsappNumber)) {
    return { ok: false, error: "That WhatsApp number doesn't look valid.", fieldErrors: { whatsappNumber: "Use the full number, e.g. +91 98765 43210" } };
  }
  const before = await db.siteSettings.findUniqueOrThrow({ where: ID });
  await db.siteSettings.update({ where: ID, data });
  await logActivity(user, "settings.contact", "SiteSettings", "singleton", "Updated contact information", { changed: changedKeys(before, data) });
  refresh(TAGS.settings);
  return { ok: true, message: "Contact information saved" };
});

export const saveSocial = adminAction("social.manage", async (input: unknown, user) => {
  const { items } = socialSaveSchema.parse(input);
  await db.$transaction([db.socialProfile.deleteMany(), db.socialProfile.createMany({ data: items.map(({ id: _id, ...it }, order) => (void _id, { ...it, order })) })]);
  await logActivity(user, "settings.social", "SocialProfile", null, `Updated social profiles (${items.length})`);
  refresh(TAGS.social);
  return { ok: true, message: "Social profiles saved" };
});

export const saveSeo = adminAction("seo.manage", async (input: Record<string, unknown>, user) => {
  const data = seoSettingsSchema.parse(input);
  const before = await db.siteSettings.findUniqueOrThrow({ where: ID });
  await db.siteSettings.update({ where: ID, data });
  await logActivity(user, "settings.seo", "SiteSettings", "singleton", "Updated SEO defaults", { changed: changedKeys(before, data) });
  refresh(TAGS.settings);
  return { ok: true, message: "SEO settings saved" };
});

export const saveRedirect = adminAction("seo.manage", async (input: Record<string, unknown>, user) => {
  const data = redirectSchema.parse(input);
  const fromPath = normalisePath(data.fromPath);
  if (fromPath === normalisePath(data.toPath)) return { ok: false, error: "A redirect can't point to itself.", fieldErrors: { toPath: "Same as source" } };
  const r = await db.redirect.upsert({ where: { fromPath }, create: { ...data, fromPath }, update: { toPath: data.toPath, permanent: data.permanent } });
  await logActivity(user, "redirect.save", "Redirect", r.id, `Redirect ${fromPath} → ${data.toPath}`);
  refresh(TAGS.redirects);
  return { ok: true, message: "Redirect saved" };
});

export const deleteRedirect = adminAction("seo.manage", async (id: string, user) => {
  const r = await db.redirect.delete({ where: { id } });
  await logActivity(user, "redirect.delete", "Redirect", id, `Removed redirect ${r.fromPath}`);
  refresh(TAGS.redirects);
  return { ok: true, message: "Redirect removed" };
});

export const saveBranding = adminAction("branding.manage", async (input: Record<string, unknown>, user) => {
  const data = brandingSchema.parse(input);
  const before = await db.siteSettings.findUniqueOrThrow({ where: ID });
  await db.siteSettings.update({ where: ID, data });
  await logActivity(user, "settings.branding", "SiteSettings", "singleton", `Updated branding (${data.brandName})`, { changed: changedKeys(before, data) });
  refresh(TAGS.settings);
  return { ok: true, message: "Branding saved — changes are live across the site" };
});

export const saveGlobal = adminAction("settings.manage", async (input: Record<string, unknown>, user) => {
  const data = globalSettingsSchema.parse(input);
  const before = await db.siteSettings.findUniqueOrThrow({ where: ID });
  await db.siteSettings.update({ where: ID, data });
  await logActivity(user, "settings.global", "SiteSettings", "singleton", "Updated global settings", { changed: changedKeys(before, data) });
  refresh(TAGS.settings);
  return { ok: true, message: "Settings saved" };
});

export const sendTestEmail = adminAction("settings.manage", async (_: undefined, user) => {
  const { emailStatus } = await import("@/lib/email/outbox");
  const s = await db.siteSettings.findUniqueOrThrow({ where: ID, select: { notificationEmail: true, brandName: true } });
  const st = emailStatus(s.notificationEmail);
  if (!st.configured) return { ok: false, error: `Email is not configured: ${st.missing.join(", ")}` };
  const { Resend } = await import("resend");
  const { error } = await new Resend(process.env.RESEND_API_KEY).emails.send({
    from: process.env.EMAIL_FROM!,
    to: s.notificationEmail!,
    subject: `${s.brandName}: test notification`,
    text: "This is a test email from your website admin. Enquiry notifications will arrive at this address.",
  });
  await logActivity(user, "settings.test_email", "SiteSettings", "singleton", error ? `Test email failed: ${error.message}` : "Test email sent");
  return error ? { ok: false, error: `Provider error: ${error.message}` } : { ok: true, message: `Test email sent to ${s.notificationEmail}` };
});

export const resetBrandColors = adminAction("branding.manage", async (_: undefined, user) => {
  const { DEFAULT_COLORS } = await import("@/lib/brand");
  await db.siteSettings.update({ where: ID, data: { colors: DEFAULT_COLORS } });
  await logActivity(user, "settings.branding", "SiteSettings", "singleton", "Reset brand colours to defaults");
  refresh(TAGS.settings);
  return { ok: true, message: "Colours reset" };
});

