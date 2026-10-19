import Link from "next/link";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

export function PageHeader({
  title,
  description,
  actions,
  back,
}: {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <div className="mb-6">
      {back && (
        <Link href={back.href} className="mb-2 inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900">
          <ChevronLeft className="h-3.5 w-3.5" aria-hidden /> {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900">{title}</h1>
          {description && <p className="mt-1 max-w-2xl text-sm text-zinc-500">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  PUBLISHED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  DRAFT: "bg-zinc-100 text-zinc-700 border-zinc-200",
  ARCHIVED: "bg-amber-50 text-amber-800 border-amber-200",
  SCHEDULED: "bg-blue-50 text-blue-700 border-blue-200",
  NEW: "bg-blue-50 text-blue-700 border-blue-200",
  CONTACTED: "bg-violet-50 text-violet-700 border-violet-200",
  QUALIFIED: "bg-amber-50 text-amber-800 border-amber-200",
  CONVERTED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CLOSED: "bg-zinc-100 text-zinc-600 border-zinc-200",
  SENT: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PENDING: "bg-blue-50 text-blue-700 border-blue-200",
  FAILED: "bg-red-50 text-red-700 border-red-200",
  SKIPPED_UNCONFIGURED: "bg-amber-50 text-amber-800 border-amber-200",
};

export function StatusBadge({ status, publishedAt }: { status: string; publishedAt?: Date | null }) {
  const scheduled = status === "PUBLISHED" && publishedAt && publishedAt > new Date();
  const key = scheduled ? "SCHEDULED" : status;
  const label = scheduled ? `Scheduled ${publishedAt!.toLocaleDateString("en-IN")}` : status.replace(/_/g, " ").toLowerCase();
  return <span className={`a-badge capitalize ${STATUS_STYLES[key] ?? STATUS_STYLES.DRAFT}`}>{label}</span>;
}

export function EmptyState({ title, text, action }: { title: string; text?: string; action?: React.ReactNode }) {
  return (
    <div className="a-card flex flex-col items-center px-6 py-14 text-center">
      <p className="font-medium text-zinc-900">{title}</p>
      {text && <p className="mt-1 max-w-md text-sm text-zinc-500">{text}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Pagination({ page, pages, href }: { page: number; pages: number; href: (p: number) => string }) {
  if (pages <= 1) return null;
  return (
    <nav aria-label="Pagination" className="mt-4 flex items-center justify-between text-sm">
      <span className="text-zinc-500">
        Page {page} of {pages}
      </span>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link href={href(page - 1)} className="a-btn a-btn-secondary a-btn-sm">
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden /> Previous
          </Link>
        ) : null}
        {page < pages ? (
          <Link href={href(page + 1)} className="a-btn a-btn-secondary a-btn-sm">
            Next <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        ) : null}
      </div>
    </nav>
  );
}

/** Plain GET search/filter form – works without JavaScript and keeps state in the URL. */
export function SearchFilters({
  q,
  placeholder = "Search…",
  filters = [],
  hidden = {},
}: {
  q?: string;
  placeholder?: string;
  filters?: { name: string; label: string; value?: string; options: { value: string; label: string }[] }[];
  hidden?: Record<string, string | undefined>;
}) {
  return (
    <form method="get" className="mb-4 flex flex-wrap items-end gap-2" role="search">
      {Object.entries(hidden).map(([k, v]) => (v ? <input key={k} type="hidden" name={k} value={v} /> : null))}
      <div className="relative min-w-55 flex-1">
        <label htmlFor="q" className="sr-only">
          Search
        </label>
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" aria-hidden />
        <input id="q" name="q" defaultValue={q} placeholder={placeholder} className="a-input pl-8" />
      </div>
      {filters.map((f) => (
        <div key={f.name}>
          <label htmlFor={`f-${f.name}`} className="sr-only">
            {f.label}
          </label>
          <select id={`f-${f.name}`} name={f.name} defaultValue={f.value ?? ""} className="a-input min-w-37.5">
            <option value="">{f.label}: all</option>
            {f.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      ))}
      <button type="submit" className="a-btn a-btn-secondary">
        Apply
      </button>
    </form>
  );
}

export function formatDate(d: Date | null | undefined, withTime = false) {
  if (!d) return "—";
  return d.toLocaleString("en-IN", withTime ? { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" } : { day: "numeric", month: "short", year: "numeric" });
}

export function Forbidden() {
  return <EmptyState title="You don't have access to this area" text="Ask a Super Admin if you need this permission." />;
}
