import { db } from "@/lib/db";
import { requirePagePermission } from "@/lib/auth/guard";
import { PERMISSIONS, ROLE_LABELS } from "@/lib/auth/permissions";
import { PageHeader, formatDate } from "@/components/admin/ui";
import { UserRow, NewUserForm } from "./UserForms";

export const metadata = { title: "Users & Permissions" };

export default async function UsersAdmin() {
  const me = await requirePagePermission("users.manage");
  const users = await db.user.findMany({ orderBy: { createdAt: "asc" }, include: { _count: { select: { sessions: true } } } });
  const roles = ["SUPER_ADMIN", "EDITOR", "MARKETING"] as const;
  return (
    <>
      <PageHeader title="Users & Permissions" description="Permissions are enforced on the server for every page and action — hiding menu items is not relied upon." />
      <div className="space-y-5">
        <div className="a-card overflow-x-auto">
          <table className="a-table min-w-180">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last sign-in</th>
                <th>Sessions</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <UserRow
                  key={u.id}
                  isMe={u.id === me.id}
                  user={{ id: u.id, name: u.name, email: u.email, role: u.role, active: u.active, lastLogin: formatDate(u.lastLoginAt, true), sessions: u._count.sessions }}
                />
              ))}
            </tbody>
          </table>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <NewUserForm />
          <section className="a-card p-5">
            <h2 className="text-sm font-semibold">What each role can do</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="a-table text-xs">
                <thead>
                  <tr>
                    <th>Permission</th>
                    {roles.map((r) => (
                      <th key={r}>{ROLE_LABELS[r]}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(PERMISSIONS).map(([p, allowed]) => (
                    <tr key={p}>
                      <td className="font-mono">{p}</td>
                      {roles.map((r) => (
                        <td key={r} aria-label={(allowed as readonly string[]).includes(r) ? "Allowed" : "Not allowed"}>
                          {(allowed as readonly string[]).includes(r) ? "✓" : "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
