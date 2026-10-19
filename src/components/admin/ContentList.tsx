"use client";

import Link from "next/link";
import { ExternalLink, Pencil } from "lucide-react";
import { ActionButton, ConfirmButton, SortableList, useReorder } from "@/components/admin/form";
import { deleteItem, reorderItems, setItemStatus } from "@/app/admin/(panel)/content-actions";
import { EmptyState } from "@/components/admin/ui";

export type ContentRow = {
  id: string;
  title: string;
  subtitle?: string;
  status: string;
  scheduled?: boolean;
  editHref?: string;
  viewHref?: string | null;
  badges?: string[];
  deletable?: boolean;
};

type Entity = "service" | "project" | "industry" | "article" | "page" | "testimonial" | "faq" | "plan";

const STATUS_CLS: Record<string, string> = {
  PUBLISHED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  DRAFT: "bg-zinc-100 text-zinc-700 border-zinc-200",
  ARCHIVED: "bg-amber-50 text-amber-800 border-amber-200",
};

function Row({ entity, row }: { entity: Entity; row: ContentRow }) {
  return (
    <div className="flex flex-wrap items-center gap-3 py-2.5 pr-3">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {row.editHref ? (
            <Link href={row.editHref} className="truncate font-medium text-zinc-900 hover:underline">
              {row.title}
            </Link>
          ) : (
            <span className="truncate font-medium">{row.title}</span>
          )}
          <span className={`a-badge capitalize ${row.scheduled ? "border-blue-200 bg-blue-50 text-blue-700" : STATUS_CLS[row.status] ?? STATUS_CLS.DRAFT}`}>
            {row.scheduled ? "scheduled" : row.status.toLowerCase()}
          </span>
          {row.badges?.map((b) => (
            <span key={b} className="a-badge border-zinc-200 bg-white text-zinc-600">
              {b}
            </span>
          ))}
        </div>
        {row.subtitle && <p className="truncate text-xs text-zinc-500">{row.subtitle}</p>}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {row.viewHref && row.status === "PUBLISHED" && (
          <a href={row.viewHref} target="_blank" rel="noopener noreferrer" className="a-btn a-btn-ghost a-btn-sm" aria-label={`View ${row.title} on site`}>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
        {row.status === "PUBLISHED" ? (
          <ActionButton action={() => setItemStatus(entity, row.id, "DRAFT")}>Unpublish</ActionButton>
        ) : (
          <ActionButton action={() => setItemStatus(entity, row.id, "PUBLISHED")}>Publish</ActionButton>
        )}
        {row.status !== "ARCHIVED" ? (
          <ActionButton action={() => setItemStatus(entity, row.id, "ARCHIVED")}>Archive</ActionButton>
        ) : (
          <ActionButton action={() => setItemStatus(entity, row.id, "DRAFT")}>Restore</ActionButton>
        )}
        {row.editHref && (
          <Link href={row.editHref} className="a-btn a-btn-secondary a-btn-sm">
            <Pencil className="h-3.5 w-3.5" /> Edit
          </Link>
        )}
        {row.deletable !== false && (
          <ConfirmButton
            label="Delete"
            title={`Delete “${row.title}”?`}
            description="This permanently removes it. Consider archiving instead if you might need it later."
            confirmLabel="Delete permanently"
            action={() => deleteItem(entity, row.id)}
          />
        )}
      </div>
    </div>
  );
}

export function ContentList({ entity, rows, sortable = false, emptyTitle = "Nothing here yet", emptyText }: { entity: Entity; rows: ContentRow[]; sortable?: boolean; emptyTitle?: string; emptyText?: string }) {
  const { items, reorder } = useReorder(rows, (ids) => reorderItems(entity, ids));
  if (!rows.length) return <EmptyState title={emptyTitle} text={emptyText} />;
  return (
    <div className="a-card overflow-hidden">
      {sortable ? (
        <>
          <p className="border-b border-zinc-100 bg-zinc-50 px-3 py-2 text-xs text-zinc-500">Drag rows (or focus the handle and use Space + arrow keys) to change the order shown on the website.</p>
          <SortableList items={items} onReorder={reorder} render={(row) => <Row entity={entity} row={row} />} />
        </>
      ) : (
        <ul className="divide-y divide-zinc-100 pl-3">
          {rows.map((row) => (
            <li key={row.id}>
              <Row entity={entity} row={row} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
