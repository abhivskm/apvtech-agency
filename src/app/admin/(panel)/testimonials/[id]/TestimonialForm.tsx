"use client";

import { PublishBar, Section, TextArea, TextField, useAdminForm, type Values } from "@/components/admin/form";
import { MediaField } from "@/components/admin/MediaPicker";
import { saveTestimonial } from "../actions";

export function TestimonialForm({ initial }: { initial: Values }) {
  const form = useAdminForm(initial, saveTestimonial);
  return (
    <form onSubmit={(e) => e.preventDefault()} className="max-w-2xl space-y-5">
      <Section title="Testimonial" description="Use the client's exact words and confirm they agree to it being published.">
        <TextField form={form} name="name" label="Name" required />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField form={form} name="role" label="Role" />
          <TextField form={form} name="company" label="Company" />
        </div>
        <TextArea form={form} name="quote" label="Quote" required rows={5} maxLength={1200} />
        <MediaField form={form} name="photoId" label="Photo (optional)" />
      </Section>
      <PublishBar form={form} status={form.values.status} />
    </form>
  );
}
