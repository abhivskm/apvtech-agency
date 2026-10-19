import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requirePagePermission } from "@/lib/auth/guard";
import { EmptyState, PageHeader, Pagination, SearchFilters, formatDate } from "@/components/admin/ui";

export const metadata = { title: "Activity Log" };
const PER_PAGE = 50;

export default async function ActivityLog({ searchParams }: { searchParams: Promise<{ q?: string; type?: string; page?: string }> }) {
  await requirePagePermission("activity.view");
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const where: Prisma.ActivityLogWhereInput = {
    ...(sp.q ? { OR: [{ summary: { contains: sp.q, mode: "insensitive" } }, { actorEmail: { contains: sp.q, mode: "insensitive" } }, { action: { contains: sp.q, mode: "insensitive" } }] } : {}),
    ...(sp.type ? { entityType: sp.type } : {}),
  };
  const [items, total, types] = await Promise.all([
    db.activityLog.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PER_PAGE, take: PER_PAGE }),
    db.activityLog.count({ where }),
    db.activityLog.findMany({ distinct: ["entityType"], select: { entityType: true }, orderBy: { entityType: "asc" } }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const qs = (p: number) => `/admin/activity?${new URLSearchParams(Object.entries({ ...sp, page: String(p) }).filter(([, v]) => v) as [string, string][])}`;
  return (
    <>
      <PageHeader title="Activity Log" description="Sign-ins, content changes, publishing, settings changes, user management and lead exports. Passwords and tokens are never recorded." />
      <SearchFilters q={sp.q} placeholder="Search actions, users or descriptions" filters={[{ name: "type", label: "Area", value: sp.type, options: types.map((t) => ({ value: t.entityType, label: t.entityType })) }]} />
      {items.length === 0 ? (
        <EmptyState title="No activity recorded" />
      ) : (
        <div className="a-card overflow-x-auto">
          <table className="a-table min-w-[700px]">
            <thead>
              <tr>
                <th>When</th>
                <th>Who</th>
                <th>Action</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a.id}>
                  <td className="whitespace-nowrap text-xs text-zinc-500">{formatDate(a.createdAt, true)}</td>
                  <td className="text-xs">{a.actorEmail ?? "System"}</td>
                  <td>
                    <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-[11px]">{a.action}</code>
                  </td>
                  <td className="text-[13px]">{a.summary}</td>
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
