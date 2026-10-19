import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requirePagePermission } from "@/lib/auth/guard";
import { can } from "@/lib/auth/permissions";
import { logActivity } from "@/lib/audit";
import { PageHeader, StatusBadge, formatDate } from "@/components/admin/ui";
import { whatsappLink } from "@/lib/whatsapp";
import { EnquiryControls } from "./EnquiryControls";

export const metadata = { title: "Enquiry" };

export default async function EnquiryDetail({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePagePermission("leads.view");
  const { id } = await params;
  const e = await db.enquiry.findUnique({
    where: { id },
    include: { notes: { orderBy: { createdAt: "desc" }, include: { author: { select: { name: true } } } }, emails: { orderBy: { createdAt: "desc" } }, assignee: { select: { name: true } } },
  });
  if (!e) notFound();
  if (!e.readAt) {
    await db.enquiry.update({ where: { id }, data: { readAt: new Date() } });
    await logActivity(user, "enquiry.view", "Enquiry", id, "Opened enquiry");
  }
  const users = await db.user.findMany({ where: { active: true, role: { in: ["SUPER_ADMIN", "MARKETING"] } }, select: { id: true, name: true } });
  const wa = whatsappLink(e.phone, `Hi ${e.name.split(" ")[0]}, thanks for your enquiry on our website.`);

  const rows: [string, React.ReactNode][] = [
    ["Email", e.anonymizedAt ? "—" : <a href={`mailto:${e.email}`} className="text-blue-700 underline">{e.email}</a>],
    ["Phone / WhatsApp", e.anonymizedAt ? "—" : <span className="flex flex-wrap gap-3"><a href={`tel:${e.phone.replace(/[^\d+]/g, "")}`} className="text-blue-700 underline">{e.phone}</a>{wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="text-green-700 underline">Open WhatsApp</a>}</span>],
    ["Business", e.businessName ?? "—"],
    ["Website", e.website ? <a href={e.website} target="_blank" rel="noopener noreferrer nofollow" className="text-blue-700 underline">{e.website}</a> : "—"],
    ["Industry", e.industry ?? "—"],
    ["Plan", e.plan ?? "—"],
    ["Services", e.services.join(", ") || "—"],
    ["Budget", e.budget ?? "—"],
    ["Timeline", e.timeline ?? "—"],
    ["Consent", e.consent ? `Given ${formatDate(e.consentAt, true)}` : "No"],
    ["Submitted from", e.sourcePath ?? "—"],
    ["Received", formatDate(e.createdAt, true)],
  ];

  return (
    <>
      <PageHeader title={e.name} description={e.anonymizedAt ? `Anonymised on ${formatDate(e.anonymizedAt)}` : undefined} back={{ href: "/admin/enquiries", label: "All enquiries" }} actions={<StatusBadge status={e.status} />} />
      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <section className="a-card p-5">
            <h2 className="text-sm font-semibold">Project description</h2>
            <p className="mt-2 whitespace-pre-wrap text-[0.9375rem] leading-relaxed text-zinc-800">{e.message}</p>
          </section>
          <section className="a-card p-5">
            <h2 className="text-sm font-semibold">Details</h2>
            <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-[160px_1fr]">
              {rows.map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="text-zinc-500">{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section className="a-card p-5">
            <h2 className="text-sm font-semibold">Email notifications</h2>
            {e.emails.length === 0 ? (
              <p className="mt-2 text-sm text-zinc-500">No notification was queued.</p>
            ) : (
              <ul className="mt-2 space-y-2 text-sm">
                {e.emails.map((m) => (
                  <li key={m.id} className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={m.status} />
                    <span className="text-zinc-600">
                      {m.attempts} attempt(s){m.sentAt ? ` · sent ${formatDate(m.sentAt, true)}` : ""}
                    </span>
                    {m.lastError && <span className="w-full text-xs text-red-700">{m.lastError}</span>}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
        <EnquiryControls
          id={e.id}
          status={e.status}
          assigneeId={e.assigneeId}
          users={users}
          notes={e.notes.map((n) => ({ id: n.id, body: n.body, author: n.author?.name ?? "Former user", createdAt: formatDate(n.createdAt, true) }))}
          outboxId={e.emails.find((m) => m.status !== "SENT")?.id ?? null}
          canManage={can(user.role, "leads.manage")}
          canDelete={can(user.role, "leads.delete")}
          anonymized={Boolean(e.anonymizedAt)}
        />
      </div>
    </>
  );
}
