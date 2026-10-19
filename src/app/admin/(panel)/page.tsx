import Link from "next/link";
import { AlertTriangle, ArrowRight, FileText, Image, Inbox, Layers, Newspaper, Plus } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/guard";
import { can } from "@/lib/auth/permissions";
import { emailStatus } from "@/lib/email/outbox";
import { normaliseWhatsappNumber } from "@/lib/whatsapp";
import { PageHeader, StatusBadge, formatDate } from "@/components/admin/ui";

export const metadata = { title: "Dashboard" };

function Stat({ label, value, href, hint }: { label: string; value: number; href?: string; hint?: string }) {
  const body = (
    <>
      <p className="text-xs font-medium text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-zinc-400">{hint}</p>}
    </>
  );
  return href ? (
    <Link href={href} className="a-card block p-4 hover:border-zinc-300">
      {body}
    </Link>
  ) : (
    <div className="a-card p-4">{body}</div>
  );
}

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ forbidden?: string }> }) {
  const user = await requireUser();
  const { forbidden } = await searchParams;
  const leads = can(user.role, "leads.view");
  const activity = can(user.role, "activity.view");
  const [settings, total, fresh, unread, services, projects, articles, drafts, media, recentLeads, recentActivity, failedEmails] = await Promise.all([
    db.siteSettings.findUnique({ where: { id: "singleton" } }),
    leads ? db.enquiry.count({ where: { anonymizedAt: null } }) : 0,
    leads ? db.enquiry.count({ where: { status: "NEW", anonymizedAt: null } }) : 0,
    leads ? db.enquiry.count({ where: { readAt: null } }) : 0,
    db.service.count({ where: { status: "PUBLISHED" } }),
    db.project.count({ where: { status: "PUBLISHED" } }),
    db.article.count({ where: { status: "PUBLISHED" } }),
    db.article.count({ where: { status: "DRAFT" } }),
    db.mediaAsset.count(),
    leads ? db.enquiry.findMany({ orderBy: { createdAt: "desc" }, take: 6, select: { id: true, name: true, businessName: true, status: true, createdAt: true, readAt: true } }) : [],
    activity ? db.activityLog.findMany({ orderBy: { createdAt: "desc" }, take: 8 }) : db.activityLog.findMany({ where: { actorId: user.id }, orderBy: { createdAt: "desc" }, take: 8 }),
    leads ? db.emailOutbox.count({ where: { status: "FAILED" } }) : 0,
  ]);

  const warnings: { text: string; href: string }[] = [];
  if (settings && !normaliseWhatsappNumber(settings.whatsappNumber) && can(user.role, "contact.manage")) warnings.push({ text: "No WhatsApp number — WhatsApp buttons are hidden.", href: "/admin/settings/contact" });
  if (settings && !emailStatus(settings.notificationEmail).configured && can(user.role, "settings.manage")) warnings.push({ text: "Email notifications aren't configured. Enquiries are still saved here.", href: "/admin/settings/global" });
  if (failedEmails) warnings.push({ text: `${failedEmails} enquiry notification(s) failed to send.`, href: "/admin/enquiries" });
  if (settings?.brandName === "FORM & SIGNAL" && can(user.role, "branding.manage")) warnings.push({ text: "Still using the temporary brand name.", href: "/admin/settings/branding" });
  if (settings && !settings.contactEmail && !settings.phone && can(user.role, "contact.manage")) warnings.push({ text: "No public email or phone number added yet.", href: "/admin/settings/contact" });

  const shortcuts = [
    can(user.role, "homepage.manage") && { label: "Edit homepage", href: "/admin/homepage", icon: FileText },
    can(user.role, "articles.manage") && { label: "Write an article", href: "/admin/articles/new", icon: Newspaper },
    can(user.role, "projects.manage") && { label: "Add a project", href: "/admin/projects/new", icon: Plus },
    can(user.role, "services.manage") && { label: "Manage services", href: "/admin/services", icon: Layers },
    can(user.role, "media.manage") && { label: "Upload media", href: "/admin/media", icon: Image },
    leads && { label: "View enquiries", href: "/admin/enquiries", icon: Inbox },
  ].filter(Boolean) as { label: string; href: string; icon: typeof FileText }[];

  return (
    <>
      <PageHeader title={`Welcome, ${user.name.split(" ")[0]}`} description="Everything below is calculated live from your website's database." />
      {forbidden && <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">You don&apos;t have permission to open that area. Ask a Super Admin if you need access.</p>}

      {leads && (
        <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3">
          <Stat label="Total enquiries" value={total} href="/admin/enquiries" />
          <Stat label="New enquiries" value={fresh} href="/admin/enquiries?status=NEW" hint="Status: new" />
          <Stat label="Unread enquiries" value={unread} href="/admin/enquiries" />
        </div>
      )}
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Published services" value={services} href={can(user.role, "services.manage") ? "/admin/services" : undefined} />
        <Stat label="Published projects" value={projects} href={can(user.role, "projects.manage") ? "/admin/projects" : undefined} />
        <Stat label="Published articles" value={articles} href={can(user.role, "articles.manage") ? "/admin/articles" : undefined} hint={drafts ? `${drafts} draft(s)` : undefined} />
        <Stat label="Media files" value={media} href={can(user.role, "media.manage") ? "/admin/media" : undefined} />
      </div>

      {warnings.length > 0 && (
        <section className="a-card mb-5 p-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <AlertTriangle className="h-4 w-4 text-amber-500" aria-hidden /> Needs attention
          </h2>
          <ul className="mt-2 space-y-1.5 text-sm">
            {warnings.map((w) => (
              <li key={w.text}>
                <Link href={w.href} className="flex items-center justify-between gap-3 rounded-md px-2 py-1 hover:bg-zinc-50">
                  {w.text} <ArrowRight className="h-3.5 w-3.5 text-zinc-400" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        {leads && (
          <section className="a-card p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Recent enquiries</h2>
              <Link href="/admin/enquiries" className="text-xs text-zinc-500 hover:underline">
                View all
              </Link>
            </div>
            {recentLeads.length === 0 ? (
              <p className="mt-3 text-sm text-zinc-500">No enquiries yet.</p>
            ) : (
              <ul className="mt-2 divide-y divide-zinc-100">
                {recentLeads.map((e) => (
                  <li key={e.id}>
                    <Link href={`/admin/enquiries/${e.id}`} className="flex items-center justify-between gap-3 py-2 text-sm hover:bg-zinc-50">
                      <span className={!e.readAt ? "font-semibold" : ""}>
                        {e.name}
                        {e.businessName && <span className="font-normal text-zinc-500"> · {e.businessName}</span>}
                      </span>
                      <span className="flex items-center gap-2">
                        <StatusBadge status={e.status} />
                        <span className="text-xs text-zinc-400">{formatDate(e.createdAt)}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
        <section className="a-card p-4">
          <h2 className="text-sm font-semibold">Shortcuts</h2>
          <ul className="mt-3 grid grid-cols-2 gap-2">
            {shortcuts.map((s) => (
              <li key={s.href}>
                <Link href={s.href} className="flex items-center gap-2 rounded-lg border border-zinc-200 p-3 text-sm hover:bg-zinc-50">
                  <s.icon className="h-4 w-4 text-zinc-500" aria-hidden /> {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section className="a-card p-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">{activity ? "Recent activity" : "Your recent activity"}</h2>
            {activity && (
              <Link href="/admin/activity" className="text-xs text-zinc-500 hover:underline">
                Full log
              </Link>
            )}
          </div>
          {recentActivity.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-500">No activity yet.</p>
          ) : (
            <ul className="mt-2 divide-y divide-zinc-100 text-sm">
              {recentActivity.map((a) => (
                <li key={a.id} className="flex flex-wrap justify-between gap-2 py-2">
                  <span>{a.summary || a.action}</span>
                  <span className="text-xs text-zinc-400">
                    {a.actorEmail ?? "System"} · {formatDate(a.createdAt, true)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
