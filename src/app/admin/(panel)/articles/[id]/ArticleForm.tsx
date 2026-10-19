"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Field, PublishBar, Section, SeoFields, SelectField, SlugField, StringListField, TextArea, TextField, useAdminForm, type Values } from "@/components/admin/form";
import { MediaField } from "@/components/admin/MediaPicker";
import { RichTextField } from "@/components/admin/RichTextEditor";
import { createArticleCategory, saveArticle } from "../actions";

/** datetime-local values are entered in IST; convert to an absolute ISO string for the server. */
function istToIso(v: string) {
  return v ? new Date(`${v}:00+05:30`).toISOString() : null;
}

export function ArticleForm({ initial, categories: initialCats }: { initial: Values; categories: { value: string; label: string }[] }) {
  const form = useAdminForm(initial, (values) => saveArticle({ ...values, publishedAt: istToIso(values.publishedAt) }));
  const v = form.values;
  const [cats, setCats] = useState(initialCats);
  const [newCat, setNewCat] = useState("");
  const [pending, start] = useTransition();

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <Section title="Article">
            <TextField form={form} name="title" label="Title" required maxLength={160} />
            <SlugField form={form} prefix="/insights/" />
            <TextArea form={form} name="excerpt" label="Excerpt" required rows={3} maxLength={400} help="Shown in lists and used as the default meta description." />
            <RichTextField form={form} name="body" label="Body" help="Use headings to structure the article. Reading time is calculated automatically." />
          </Section>
        </div>
        <div className="space-y-5">
          <Section title="Publishing">
            <Field id="pubdate" label="Publication date & time (IST)" help="Leave empty to publish immediately. A future date schedules the article." error={form.errors.publishedAt}>
              <input id="pubdate" type="datetime-local" className="a-input" value={v.publishedAt ?? ""} onChange={(e) => form.set("publishedAt", e.target.value)} />
            </Field>
            <TextField form={form} name="authorName" label="Author name" />
            <TextField form={form} name="authorRole" label="Author role" />
          </Section>
          <Section title="Organisation">
            <SelectField form={form} name="categoryId" label="Category" options={cats} emptyLabel="Uncategorised" />
            <div className="flex gap-2">
              <input className="a-input" placeholder="New category" value={newCat} onChange={(e) => setNewCat(e.target.value)} aria-label="New category name" />
              <button
                type="button"
                className="a-btn a-btn-secondary"
                disabled={pending || !newCat.trim()}
                onClick={() =>
                  start(async () => {
                    const res = await createArticleCategory(newCat);
                    if (res.ok && res.data) {
                      const d = res.data as { id: string; name: string };
                      setCats((c) => [...c, { value: d.id, label: d.name }]);
                      form.set("categoryId", d.id);
                      setNewCat("");
                      toast.success("Category created");
                    } else if (!res.ok) toast.error(res.error);
                  })
                }
              >
                Add
              </button>
            </div>
            <StringListField form={form} name="tags" label="Tags" placeholder="Add a tag" />
          </Section>
          <Section title="Images">
            <MediaField form={form} name="coverId" label="Cover image" />
            <MediaField form={form} name="ogImageId" label="Open Graph image" help="Defaults to the cover image." />
          </Section>
          <Section title="SEO">
            <SeoFields form={form} path={`/insights/${v.slug}`} />
          </Section>
        </div>
      </div>
      <PublishBar form={form} status={v.status} previewHref={v.id && v.slug ? `/api/preview?type=article&slug=${v.slug}` : undefined} />
    </form>
  );
}
