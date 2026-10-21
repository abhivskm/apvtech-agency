import { db } from "@/lib/db";
import { requirePagePermission } from "@/lib/auth/guard";
import { env } from "@/lib/env";
import { storageStatus } from "@/lib/storage";
import { emailStatus } from "@/lib/email/outbox";
import { normaliseWhatsappNumber } from "@/lib/whatsapp";
import { PageHeader } from "@/components/admin/ui";
import { GlobalForm } from "./GlobalForm";

export const metadata = { title: "Global Settings" };

function Status({ ok, label, detail }: { ok: boolean | "warn"; label: string; detail: React.ReactNode }) {
  const cls = ok === true ? "bg-emerald-500" : ok === "warn" ? "bg-amber-500" : "bg-red-500";
  return (
    <li className="flex gap-3 py-2.5">
      <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${cls}`} aria-hidden />
      <div>
        <p className="text-[13px] font-medium">
          {label} <span className="sr-only">{ok === true ? "configured" : ok === "warn" ? "needs attention" : "not configured"}</span>
        </p>
        <p className="text-xs text-zinc-500">{detail}</p>
      </div>
    </li>
  );
}

export default async function GlobalSettings() {
  await requirePagePermission("settings.manage");
  const s = await db.siteSettings.findUniqueOrThrow({ where: { id: "singleton" } });
  const storage = storageStatus();
  const email = emailStatus(s.notificationEmail);
  const failing = await db.emailOutbox.count({ where: { status: "FAILED" } });

  return (
    <>
      <PageHeader title="Global Settings" description="Site URL, notifications, default calls-to-action, footer text, analytics and data retention. Secrets (API keys, database URL) are environment variables and never stored here." />
      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <GlobalForm
          initial={{
            siteUrl: s.siteUrl ?? "", notificationEmail: s.notificationEmail ?? "", defaultCtaLabel: s.defaultCtaLabel, defaultCtaHref: s.defaultCtaHref, footerText: s.footerText,
            copyrightText: s.copyrightText, gaMeasurementId: s.gaMeasurementId ?? "", gtmContainerId: s.gtmContainerId ?? "", consentEnabled: s.consentEnabled,
            consentMessage: s.consentMessage, enquiryRetentionDays: s.enquiryRetentionDays,
          }}
        />
        <section className="a-card self-start p-5">
          <h2 className="text-sm font-semibold">Integrations & launch checklist</h2>
          <ul className="mt-2 divide-y divide-zinc-100">
            <Status ok={true} label="Database" detail="Connected (PostgreSQL)." />
            <Status
              ok={storage.configured ? (storage.persistentWarning ? "warn" : storage.driver === "local" && env.isProd ? "warn" : true) : false}
              label={`Media storage: ${storage.driver}`}
              detail={storage.persistentWarning ?? (storage.driver === "local" ? "Files saved on this server's disk. Use Vercel Blob or S3/R2 for serverless hosting." : storage.driver === "blob" ? (storage.configured ? "Vercel Blob store connected." : "Connect a Blob store in Vercel → Storage (sets BLOB_READ_WRITE_TOKEN).") : storage.configured ? "S3-compatible bucket configured." : "Set S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_PUBLIC_BASE_URL.")}
            />
            <Status ok={email.configured ? (failing ? "warn" : true) : false} label="Email notifications (Resend)" detail={email.configured ? (failing ? `${failing} notification(s) failed — see Enquiries.` : `Sending to ${s.notificationEmail}.`) : `Not configured: ${email.missing.join("; ")}. Enquiries are still saved.`} />
            <Status ok={Boolean(normaliseWhatsappNumber(s.whatsappNumber))} label="WhatsApp" detail={s.whatsappNumber ? "Number configured — buttons are live." : "No number yet — WhatsApp buttons are hidden. Add it in Contact Information."} />
            <Status ok={Boolean(s.gaMeasurementId || s.gtmContainerId) || "warn"} label="Analytics" detail={s.gaMeasurementId || s.gtmContainerId ? `Configured${s.consentEnabled ? " (loads after consent)" : ""}.` : "Optional — add a GA4 or GTM ID below."} />
            <Status ok={Boolean(s.gscVerification) || "warn"} label="Google Search Console" detail={s.gscVerification ? "Verification tag present." : "Add your verification code in SEO & Redirects."} />
            <Status ok={Boolean(env.cronSecret) || "warn"} label="Notification retry job" detail={env.cronSecret ? "CRON_SECRET set." : "Set CRON_SECRET so /api/cron/outbox can retry failed emails."} />
            <Status ok={env.appSecret.length >= 32} label="App secret" detail={env.appSecret.length >= 32 ? "APP_SECRET set." : "APP_SECRET missing or too short."} />
            <Status ok={Boolean(s.siteUrl || process.env.NEXT_PUBLIC_SITE_URL) && !/localhost/.test(s.siteUrl || env.siteUrl) ? true : "warn"} label="Public site URL" detail={`${s.siteUrl || env.siteUrl} — used for canonical URLs and the sitemap.`} />
            <Status ok={s.brandName !== "FORM & SIGNAL" || "warn"} label="Final brand name" detail={s.brandName === "FORM & SIGNAL" ? "Still using the temporary working name. Update it in Branding & Theme." : `Using “${s.brandName}”.`} />
          </ul>
        </section>
      </div>
    </>
  );
}
