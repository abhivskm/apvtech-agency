import { db } from "@/lib/db";
import { guardRoute } from "@/lib/admin/route-guard";
import { enquiryWhere } from "@/lib/admin/enquiry-filters";
import { logActivity } from "@/lib/audit";

/** Escape a CSV cell and neutralise spreadsheet formula injection (=, +, -, @ prefixes). */
function cell(v: unknown): string {
  let s = v == null ? "" : v instanceof Date ? v.toISOString() : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET(req: Request) {
  const user = await guardRoute(req, "leads.export");
  if (user instanceof Response) return user;
  const url = new URL(req.url);
  const filters = Object.fromEntries(["q", "status", "assignee", "from", "to"].map((k) => [k, url.searchParams.get(k) ?? undefined]));
  const rows = await db.enquiry.findMany({ where: enquiryWhere(filters), orderBy: { createdAt: "desc" }, take: 10_000, include: { assignee: { select: { name: true } } } });

  const header = ["Received", "Status", "Name", "Business", "Email", "Phone", "Website", "Industry", "Services", "Budget", "Timeline", "Message", "Consent at", "Assigned to", "Source"];
  const lines = [header.map(cell).join(",")];
  for (const e of rows) {
    lines.push(
      [e.createdAt, e.status, e.name, e.businessName, e.email, e.phone, e.website, e.industry, e.services.join("; "), e.budget, e.timeline, e.message, e.consentAt, e.assignee?.name, e.sourcePath]
        .map(cell)
        .join(","),
    );
  }
  await logActivity(user, "enquiry.export", "Enquiry", null, `Exported ${rows.length} enquiries to CSV`, { filters });
  const name = `enquiries-${new Date().toISOString().slice(0, 10)}.csv`;
  return new Response("﻿" + lines.join("\r\n"), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${name}"`, "Cache-Control": "no-store" },
  });
}
