"use client";

import { CheckboxGroup, PublishBar, Section, SeoFields, SlugField, StringListField, TextArea, TextField, useAdminForm, type Values } from "@/components/admin/form";
import { MediaField } from "@/components/admin/MediaPicker";
import { RichTextField } from "@/components/admin/RichTextEditor";
import { saveIndustry } from "../actions";

export function IndustryForm({ initial, services }: { initial: Values; services: { value: string; label: string }[] }) {
  const form = useAdminForm(initial, saveIndustry);
  const v = form.values;
  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <Section title="Industry">
            <TextField form={form} name="title" label="Title" required maxLength={120} />
            <TextField form={form} name="shortTitle" label="Short title" maxLength={60} help="Used in the footer and buttons, e.g. “Hospitality”." />
            <SlugField form={form} prefix="/industries/" />
            <TextArea form={form} name="intro" label="Introduction" required rows={3} maxLength={600} />
            <MediaField form={form} name="heroMediaId" label="Hero image" />
          </Section>
          <Section title="Content">
            <StringListField form={form} name="needs" label="Typical digital needs" />
            <RichTextField form={form} name="body" label="Detailed content" />
          </Section>
        </div>
        <div className="space-y-5">
          <Section title="Relevant services">
            <CheckboxGroup form={form} name="serviceIds" label="Linked services" options={services} />
          </Section>
          <Section title="SEO">
            <SeoFields form={form} path={`/industries/${v.slug}`} />
          </Section>
        </div>
      </div>
      <PublishBar form={form} status={v.status} previewHref={v.id && v.slug ? `/api/preview?type=industry&slug=${v.slug}` : undefined} />
    </form>
  );
}
