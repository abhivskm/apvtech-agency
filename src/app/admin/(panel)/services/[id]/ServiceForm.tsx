"use client";

import { CheckboxGroup, PublishBar, RepeaterField, Section, SeoFields, SlugField, StringListField, SwitchField, TextArea, TextField, useAdminForm, type Values } from "@/components/admin/form";
import { MediaField } from "@/components/admin/MediaPicker";
import { RichTextField } from "@/components/admin/RichTextEditor";
import { saveService } from "../actions";

const CATEGORIES = [
  "Digital Experience",
  "Search and Google Visibility",
  "Social Media and Content",
  "Branding and Creative Design",
  "Photography and Video Production",
  "Performance Marketing",
  "AI and Automation",
  "IT and Custom Software",
];

export function ServiceForm({ initial, services }: { initial: Values; services: { value: string; label: string }[] }) {
  const form = useAdminForm(initial, saveService);
  const v = form.values;
  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <Section title="Basics">
            <TextField form={form} name="title" label="Service title" required maxLength={120} />
            <SlugField form={form} prefix="/services/" />
            <div>
              <TextField form={form} name="category" label="Homepage category" help="Services sharing a category are grouped together on the homepage." />
              <div className="mt-1 flex flex-wrap gap-1">
                {CATEGORIES.map((c) => (
                  <button key={c} type="button" className="rounded border border-zinc-200 px-1.5 py-0.5 text-[11px] text-zinc-600 hover:bg-zinc-100" onClick={() => form.set("category", c)}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <TextArea form={form} name="shortDescription" label="Short description" required rows={2} maxLength={400} help="Used in service lists, the homepage and as the default meta description." />
            <TextField form={form} name="featuredLabel" label="Featured label (optional)" maxLength={40} help="Small tag such as “New” or “Core service”." />
            <SwitchField form={form} name="showOnHome" label="Show on homepage" />
          </Section>

          <Section title="Hero">
            <TextField form={form} name="heroHeadline" label="Hero headline" required maxLength={200} />
            <TextArea form={form} name="heroText" label="Hero supporting text" rows={2} maxLength={600} />
            <MediaField form={form} name="heroMediaId" label="Hero image" />
          </Section>

          <Section title="Page content">
            <RichTextField form={form} name="body" label="Full description" />
            <StringListField form={form} name="problems" label="Problems addressed" />
            <StringListField form={form} name="benefits" label="Benefits" />
            <StringListField form={form} name="deliverables" label="Deliverables" />
            <RepeaterField form={form} name="process" label="Process step" fields={[{ key: "title", label: "Title" }, { key: "description", label: "Description", type: "textarea" }]} newItem={{ title: "", description: "" }} />
          </Section>

          <Section title="FAQs" description="Shown on this service page and in its structured content.">
            <RepeaterField form={form} name="faqs" label="FAQ" fields={[{ key: "question", label: "Question" }, { key: "answer", label: "Answer", type: "textarea" }]} newItem={{ question: "", answer: "" }} />
          </Section>
        </div>

        <div className="space-y-5">
          <Section title="Call to action">
            <TextField form={form} name="ctaLabel" label="CTA button text" placeholder="Discuss this service" />
            <TextField form={form} name="ctaHref" label="CTA destination" placeholder="/contact" help="Site path, https:// URL, mailto: or tel:. Defaults to the contact form with this service preselected." />
            <TextArea form={form} name="whatsappMessage" label="WhatsApp prefilled message" rows={3} help="Defaults to a message mentioning this service." />
          </Section>
          <Section title="Related services">
            <CheckboxGroup form={form} name="relatedIds" label="Show these on the page" options={services} />
          </Section>
          <Section title="SEO & sharing">
            <SeoFields form={form} path={`/services/${v.slug}`} />
            <MediaField form={form} name="ogImageId" label="Social sharing image" help="Defaults to the hero image." />
          </Section>
        </div>
      </div>
      <PublishBar form={form} status={v.status} previewHref={v.id && v.slug ? `/api/preview?type=service&slug=${v.slug}` : undefined} />
    </form>
  );
}
