import Link from "next/link";
import { Download } from "lucide-react";
import { db } from "@/lib/db";
import { requirePagePermission } from "@/lib/auth/guard";
import { can } from "@/lib/auth/permissions";
import { enquiryWhere } from "@/lib/admin/enquiry-filters";
import { EmptyState, PageHeader, Pagination, StatusBadge, formatDate } from "@/components/admin/ui";
import { BulkActions } from "./BulkActions";

export const metadata = { title: "Enquiries" };
const PER_PAGE = 25;

type SP = { q?: string; status?: string; assignee?: string; from?: string; to?: string; page?: string };

export default async function EnquiriesAdmin({ searchParams }: { searchParams: Promise<SP> }) {
  const user = await requirePagePermission("leads.view");
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const where = enquiryWhere(sp);
  const [items, total, users, failedEmails] = await Promise.all([
    db.enquiry.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PER_PAGE, take: PER_PAGE, include: { assignee: { select: { name: true } }, emails: { select: { status: true }, orderBy: { createdAt: "desc" }, take: 1 } } }),
    db.enquiry.count({ where }),
    db.user.findMany({ where: { role: { in: ["SUPER_ADMIN", "MARKETING"] } }, select: { id: true, name: true } }),
    db.emailOutbox.count({ where: { status: { in: ["FAILED", "PENDING"] } } }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const filterQs = new URLSearchParams(Object.entries({ q: sp.q, status: sp.status, assignee: sp.assignee, from: sp.from, to: sp.to }).filter(([, v]) => v) as [string, string][]);
  const qs = (p: number) => `/admin/enquiries?${new URLSearchParams([...filterQs.entries(), ["page", String(p)]])}`;

  return (
    <>
      <PageHeader
        title="Enquiries"
        description={`${total} matching enquir${total === 1 ? "y" : "ies"}. Every website form submission is stored here, even if the email notification fails.`}
        actions={
          <>
            <BulkActions failedEmails={failedEmails} canDelete={can(user.role, "leads.delete")} />
            {can(user.role, "leads.export") && (
              <a href={`/api/admin/enquiries/export?${filterQs}`} className="a-btn a-btn-secondary">
                <Download className="h-4 w-4" /> Export CSV
              </a>
            )}
          </>
        }
      />
      <form method="get" className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto]" role="search">
        <input name="q" defaultValue={sp.q} placeholder="Search name, email, business, phone, message" className="a-input" aria-label="Search enquiries" />
        <select name="status" defaultValue={sp.status ?? ""} className="a-input" aria-label="Status">
          <option value="">All statuses</option>
          {["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "CLOSED"].map((s) => (
            <option key={s} value={s}>
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
        <select name="assignee" defaultValue={sp.assignee ?? ""} className="a-input" aria-label="Assignee">
          <option value="">Anyone</option>
          <option value="none">Unassigned</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
        <input type="date" name="from" defaultValue={sp.from} className="a-input" aria-label="From date" />
        <input type="date" name="to" defaultValue={sp.to} className="a-input" aria-label="To date" />
        <button className="a-btn a-btn-secondary" type="submit">
          Filter
        </button>
      </form>

      {items.length === 0 ? (
        <EmptyState title="No enquiries found" text={total === 0 && !filterQs.toString() ? "When someone submits the contact form, it will appear here." : "Try different filters."} />
      ) : (
        <div className="a-card overflow-x-auto">
          <table className="a-table min-w-[760px]">
            <thead>
              <tr>
                <th>Received</th>
                <th>Name</th>
                <th>Business</th>
                <th>Services</th>
                <th>Status</th>
                <th>Assigned</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {items.map((e) => (
                <tr key={e.id} className={!e.readAt ? "font-medium" : ""}>
                  <td className="whitespace-nowrap text-xs text-zinc-500">{formatDate(e.createdAt, true)}</td>
                  <td>
                    <Link href={`/admin/enquiries/${e.id}`} className="hover:underline">
                      {!e.readAt && <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-blue-600" aria-label="Unread" />}
                      {e.name}
                    </Link>
                    <div className="text-xs font-normal text-zinc-500">{e.email}</div>
                  </td>
                  <td className="text-zinc-600">{e.businessName ?? "—"}</td>
                  <td className="max-w-[200px] truncate text-xs text-zinc-600">{e.services.join(", ") || "—"}</td>
                  <td>
                    <StatusBadge status={e.status} />
                  </td>
                  <td className="text-xs">{e.assignee?.name ?? "—"}</td>
                  <td>{e.emails[0] ? <StatusBadge status={e.emails[0].status} /> : <span className="text-xs text-zinc-400">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={page} pages={pages} href={qs} />
    </>
  );
}
