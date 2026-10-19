"use client";

import { ActionButton, PublishBar, Section, SwitchField, TextArea, TextField, useAdminForm, type Values } from "@/components/admin/form";
import { saveGlobal, sendTestEmail } from "../actions";

export function GlobalForm({ initial }: { initial: Values }) {
  const form = useAdminForm(initial, saveGlobal);
  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
      <Section title="Website">
        <TextField form={form} name="siteUrl" label="Public site URL" placeholder="https://www.yourdomain.in" help="Overrides NEXT_PUBLIC_SITE_URL for canonical links and the sitemap. No trailing slash." />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField form={form} name="defaultCtaLabel" label="Default CTA label" required maxLength={40} />
          <TextField form={form} name="defaultCtaHref" label="Default CTA destination" required />
        </div>
        <TextArea form={form} name="footerText" label="Footer text" rows={2} maxLength={500} />
        <TextField form={form} name="copyrightText" label="Copyright" help="Use {year} and {brand} placeholders." />
      </Section>
      <Section title="Enquiry notifications">
        <TextField form={form} name="notificationEmail" label="Send new enquiry notifications to" type="email" help="Requires RESEND_API_KEY and EMAIL_FROM environment variables." />
        <ActionButton action={() => sendTestEmail(undefined)}>Send test email</ActionButton>
      </Section>
      <Section title="Analytics & consent" description="IDs are public identifiers, not secrets. Nothing loads until an ID is set.">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField form={form} name="gaMeasurementId" label="Google Analytics 4 ID" placeholder="G-XXXXXXXXXX" />
          <TextField form={form} name="gtmContainerId" label="Google Tag Manager ID" placeholder="GTM-XXXXXXX" />
        </div>
        <SwitchField form={form} name="consentEnabled" label="Ask for cookie consent before loading analytics" />
        <TextArea form={form} name="consentMessage" label="Consent banner message" rows={2} maxLength={300} />
      </Section>
      <Section title="Data retention">
        <TextField form={form} name="enquiryRetentionDays" label="Keep enquiry personal data for (days)" type="number" help="Use “Apply retention policy” on the Enquiries page to anonymise older enquiries. 30–3650 days." />
      </Section>
      <PublishBar form={form} />
    </form>
  );
}
