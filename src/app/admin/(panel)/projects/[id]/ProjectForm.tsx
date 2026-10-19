"use client";

import { CheckboxGroup, PublishBar, RepeaterField, Section, SeoFields, SelectField, SlugField, SwitchField, TextArea, TextField, useAdminForm, type Values } from "@/components/admin/form";
import { MediaField, MediaListField } from "@/components/admin/MediaPicker";
import { RichTextField } from "@/components/admin/RichTextEditor";
import { saveProject } from "../actions";

type Opt = { value: string; label: string };

export function ProjectForm({ initial, services, industries, categories }: { initial: Values; services: Opt[]; industries: Opt[]; categories: Opt[] }) {
  const form = useAdminForm(initial, saveProject);
  const v = form.values;
  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <Section title="Project">
            <TextField form={form} name="title" label="Title" required maxLength={120} />
            <SlugField form={form} prefix="/work/" />
            <TextArea form={form} name="summary" label="Summary" required rows={2} maxLength={400} />
            <MediaField form={form} name="coverId" label="Cover image" />
          </Section>
          <Section title="Story" description="Keep it factual. Outcomes should describe what actually happened.">
            <TextArea form={form} name="challenge" label="Challenge" rows={4} />
            <TextArea form={form} name="solution" label="Solution / approach" rows={4} />
            <TextArea form={form} name="outcome" label="Outcome" rows={3} />
            <RichTextField form={form} name="description" label="Additional description (optional)" />
          </Section>
          <Section title="Gallery & video">
            <MediaListField form={form} name="galleryIds" label="Gallery images" max={30} />
            <TextField form={form} name="videoUrl" label="Video link (YouTube or Vimeo)" placeholder="https://…" />
          </Section>
          <Section title="Results" description="Only metrics marked as verified are shown publicly. Never publish estimated or invented figures.">
            <RepeaterField
              form={form}
              name="metrics"
              label="Metric"
              fields={[
                { key: "value", label: "Value (e.g. 42%)" },
                { key: "label", label: "What it measures" },
                { key: "note", label: "Source / period" },
                { key: "verified", label: "Verified with client data — OK to publish", type: "checkbox" },
              ]}
              newItem={{ value: "", label: "", note: "", verified: false }}
            />
          </Section>
        </div>
        <div className="space-y-5">
          <Section title="Classification">
            <SwitchField form={form} name="isConcept" label="Concept project" help="Self-initiated work. Shown with a “Concept” label." />
            {!v.isConcept && <TextField form={form} name="client" label="Client name" help="Only with the client's permission." />}
            <TextField form={form} name="year" label="Year" type="number" />
            <SelectField form={form} name="industryId" label="Industry" options={industries} emptyLabel="None" />
            <CheckboxGroup form={form} name="categoryIds" label="Categories (portfolio filters)" options={categories} />
            <CheckboxGroup form={form} name="serviceIds" label="Services used" options={services} />
            <SwitchField form={form} name="featured" label="Feature on homepage" />
          </Section>
          <Section title="SEO & sharing">
            <SeoFields form={form} path={`/work/${v.slug}`} />
            <MediaField form={form} name="ogImageId" label="Social sharing image" help="Defaults to the cover image." />
          </Section>
        </div>
      </div>
      <PublishBar form={form} status={v.status} previewHref={v.id && v.slug ? `/api/preview?type=project&slug=${v.slug}` : undefined} />
    </form>
  );
}
