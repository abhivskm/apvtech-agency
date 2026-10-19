"use client";

import { PublishBar, Section, TextArea, TextField, useAdminForm, type Values } from "@/components/admin/form";
import { normaliseWhatsappNumber, whatsappLink } from "@/lib/whatsapp";
import { saveContact } from "../actions";

export function ContactForm({ initial }: { initial: Values }) {
  const form = useAdminForm(initial, saveContact);
  const v = form.values;
  const normalised = normaliseWhatsappNumber(v.whatsappNumber);
  const link = whatsappLink(v.whatsappNumber, v.whatsappMessage);
  return (
    <form onSubmit={(e) => e.preventDefault()} className="max-w-3xl space-y-5">
      <Section title="Contact details">
        <TextField form={form} name="contactEmail" label="Public email" type="email" />
        <TextField form={form} name="phone" label="Phone number" placeholder="+91 …" />
      </Section>
      <Section title="WhatsApp" description="Uses the free click-to-chat link format (wa.me). No WhatsApp Business API is required.">
        <TextField form={form} name="whatsappNumber" label="WhatsApp number" placeholder="+91 98765 43210" help="Indian 10-digit numbers get +91 automatically. Include the country code for other countries." />
        {v.whatsappNumber ? (
          normalised ? (
            <p className="rounded-md bg-emerald-50 p-2 text-xs text-emerald-800">
              Valid. Visitors will be sent to{" "}
              <a href={link ?? "#"} target="_blank" rel="noopener noreferrer" className="break-all underline">
                {link}
              </a>{" "}
              — open it to test.
            </p>
          ) : (
            <p className="rounded-md bg-red-50 p-2 text-xs text-red-700">This number can&apos;t be converted into a valid WhatsApp link.</p>
          )
        ) : (
          <p className="rounded-md bg-amber-50 p-2 text-xs text-amber-900">No number set — WhatsApp buttons are hidden across the site.</p>
        )}
        <TextArea form={form} name="whatsappMessage" label="Default prefilled message" rows={2} required maxLength={300} help="Service pages automatically mention the service the visitor is viewing." />
      </Section>
      <Section title="Location" description="Leave blank if you work remotely. A full address enables local-business structured data.">
        <TextField form={form} name="address" label="Street address" />
        <div className="grid gap-4 sm:grid-cols-3">
          <TextField form={form} name="city" label="City" />
          <TextField form={form} name="region" label="State" />
          <TextField form={form} name="postalCode" label="PIN code" />
        </div>
        <TextField form={form} name="serviceAreas" label="Service areas" help="Comma separated, e.g. Mumbai, Pune, All India" />
        <TextField form={form} name="businessHours" label="Business hours" placeholder="Mon–Sat, 10am–7pm" />
        <TextField form={form} name="googleBusinessUrl" label="Google Business Profile URL" placeholder="https://maps.app.goo.gl/…" />
      </Section>
      <PublishBar form={form} />
    </form>
  );
}
