"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { ConfirmButton } from "@/components/admin/form";
import { createProjectCategory, deleteProjectCategory } from "./actions";

export function CategoryManager({ categories }: { categories: { id: string; name: string; count: number }[] }) {
  const [name, setName] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <section className="a-card self-start p-4">
      <h2 className="text-sm font-semibold">Filter categories</h2>
      <p className="mt-0.5 text-xs text-zinc-500">Shown as filters on /work when they have published projects.</p>
      <ul className="mt-3 divide-y divide-zinc-100 text-sm">
        {categories.map((c) => (
          <li key={c.id} className="flex items-center justify-between gap-2 py-1.5">
            <span>
              {c.name} <span className="text-xs text-zinc-400">({c.count})</span>
            </span>
            <ConfirmButton label="Remove" className="a-btn a-btn-ghost a-btn-sm text-red-700" title={`Delete “${c.name}”?`} description="Projects keep their other categories." action={() => deleteProjectCategory(c.id)} />
          </li>
        ))}
      </ul>
      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          start(async () => {
            const res = await createProjectCategory(name);
            if (res.ok) {
              setName("");
              toast.success(res.message ?? "Added");
              router.refresh();
            } else toast.error(res.error);
          });
        }}
      >
        <input className="a-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="New category" aria-label="New category name" />
        <button type="submit" className="a-btn a-btn-secondary" disabled={pending || !name.trim()}>
          <Plus className="h-4 w-4" />
        </button>
      </form>
    </section>
  );
}
