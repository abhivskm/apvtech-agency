import type { EnquiryStatus, Prisma } from "@prisma/client";

export type EnquiryFilters = { q?: string; status?: string; assignee?: string; from?: string; to?: string };

/** Shared by the enquiry list and the CSV export so exports match exactly what is filtered on screen. */
export function enquiryWhere(f: EnquiryFilters): Prisma.EnquiryWhereInput {
  const where: Prisma.EnquiryWhereInput = {};
  if (f.q) {
    where.OR = [
      { name: { contains: f.q, mode: "insensitive" } },
      { email: { contains: f.q, mode: "insensitive" } },
      { businessName: { contains: f.q, mode: "insensitive" } },
      { phone: { contains: f.q } },
      { message: { contains: f.q, mode: "insensitive" } },
    ];
  }
  if (["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "CLOSED"].includes(f.status ?? "")) where.status = f.status as EnquiryStatus;
  if (f.assignee === "none") where.assigneeId = null;
  else if (f.assignee) where.assigneeId = f.assignee;
  const from = f.from ? new Date(f.from) : null;
  const to = f.to ? new Date(`${f.to}T23:59:59`) : null;
  if ((from && !isNaN(from.getTime())) || (to && !isNaN(to.getTime()))) {
    where.createdAt = { ...(from && !isNaN(from.getTime()) ? { gte: from } : {}), ...(to && !isNaN(to.getTime()) ? { lte: to } : {}) };
  }
  return where;
}
