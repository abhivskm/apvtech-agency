"use client";

import { PublishBar, Section, SelectField, TextArea, TextField, useAdminForm, type Values } from "@/components/admin/form";
import { saveFaq } from "../actions";

export function FaqForm({ initial, services }: { initial: Values; services: { value: string; label: string }[] }) {
  const form = useAdminForm(initial, saveFaq);
  return (
    <form onSubmit={(e) => e.preventDefault()} className="max-w-2xl space-y-5">
      <Section title="Question">
        <TextField form={form} name="question" label="Question" required maxLength={300} />
        <TextArea form={form} name="answer" label="Answer" required rows={5} maxLength={3000} />
        <TextField form={form} name="group" label="Group" help="FAQ sections show one group, e.g. “general”." />
        <SelectField form={form} name="serviceId" label="Attach to service (optional)" options={services} emptyLabel="Not service-specific" help="Service FAQs appear on that service's page." />
      </Section>
      <PublishBar form={form} status={form.values.status} />
    </form>
  );
}
