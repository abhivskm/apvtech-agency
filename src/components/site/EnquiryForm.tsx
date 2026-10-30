"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowUpRight, CheckCircle2, Loader2 } from "lucide-react";
import { BUDGET_OPTIONS, INDUSTRY_OPTIONS, TIMELINE_OPTIONS, enquirySchema } from "@/lib/validation/enquiry";
import { submitEnquiry } from "@/app/(site)/contact/actions";
import { WhatsAppIcon } from "@/components/site/icons";
import { track } from "@/lib/analytics/client";

type Props = {
  services: { slug: string; title: string }[];
  plans?: { slug: string; name: string }[];
  whatsappHref: string | null;
  preselected?: string | null;
  preselectedPlan?: string | null;
};
type Errors = Record<string, string>;

/**
 * Reads ?service=<slug> and ?plan=<slug> in the browser so service pages can link here with that service preselected,
 * while the contact page itself stays statically cacheable. Render inside <Suspense>.
 */
export function EnquiryFormWithQuery(props: Omit<Props, "preselected" | "preselectedPlan">) {
  const params = useSearchParams();
  const preselected = props.services.find((s) => s.slug === params.get("service"))?.title ?? null;
  const preselectedPlan = props.plans?.find((p) => p.slug === params.get("plan"))?.name ?? null;
  return <EnquiryForm {...props} preselected={preselected} preselectedPlan={preselectedPlan} />;
}

export function EnquiryForm({ services, plans = [], whatsappHref, preselected = null, preselectedPlan = null }: Props) {
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState<string[]>(preselected ? [preselected] : []);
  useEffect(() => {
    if (preselected) setSelected((cur) => (cur.includes(preselected) ? cur : [...cur, preselected]));
  }, [preselected]);
  const [plan, setPlan] = useState(preselectedPlan ?? "");
  useEffect(() => {
    if (preselectedPlan) setPlan(preselectedPlan);
  }, [preselectedPlan]);
  const startedAt = useRef<number>(0);
  const formRef = useRef<HTMLFormElement>(null);
  const formStarted = useRef(false);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startedAt.current = Date.now();
    track("form_view");
  }, []);

  const toggle = (s: string) => setSelected((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));

  const markStarted = () => {
    if (formStarted.current) return;
    formStarted.current = true;
    track("form_start");
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    track("form_submit");
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") ?? ""),
      businessName: String(fd.get("businessName") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      website: String(fd.get("website") ?? ""),
      industry: String(fd.get("industry") ?? ""),
      services: selected,
      plan,
      budget: String(fd.get("budget") ?? ""),
      timeline: String(fd.get("timeline") ?? ""),
      message: String(fd.get("message") ?? ""),
      consent: fd.get("consent") === "on",
      company_url: String(fd.get("company_url") ?? ""),
      startedAt: startedAt.current,
      sourcePath: window.location.pathname,
    };

    // Client-side validation for fast feedback; the server validates again.
    const check = enquirySchema.safeParse(payload);
    if (!check.success) {
      track("form_error", { label: "validation" });
      const errs: Errors = {};
      for (const i of check.error.issues) errs[String(i.path[0])] ??= i.message;
      setErrors(errs);
      setFormError("Please check the highlighted fields.");
      const first = Object.keys(errs)[0];
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setErrors({});
    setFormError(null);
    startTransition(async () => {
      const res = await submitEnquiry(payload);
      if (res.ok) {
        track("form_success");
        setDone(true);
        requestAnimationFrame(() => statusRef.current?.focus());
      } else {
        track("form_error", { label: res.fieldErrors ? "validation" : "server" });
        setErrors(res.fieldErrors ?? {});
        setFormError(res.error);
      }
    });
  };

  if (done) {
    return (
      <div ref={statusRef} tabIndex={-1} role="status" className="border border-line p-8 outline-none lg:p-12">
        <CheckCircle2 className="h-10 w-10 text-accent" aria-hidden />
        <h2 className="t-h2 mt-6">Thank you — we&apos;ve received your enquiry.</h2>
        <p className="mt-4 max-w-[52ch] text-muted">
          We&apos;ll review the details and reply by email or phone. If it&apos;s urgent, you can also message us on WhatsApp.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/work" className="btn btn-ghost">
            Explore our work
          </Link>
          {whatsappHref && (
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
              <WhatsAppIcon className="h-4 w-4" /> Open WhatsApp
            </a>
          )}
        </div>
      </div>
    );
  }

  const field = (name: string) => ({
    id: `f-${name}`,
    name,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `e-${name}` : undefined,
    className: "field-input",
  });
  const Err = ({ name }: { name: string }) =>
    errors[name] ? (
      <p id={`e-${name}`} className="field-error">
        {errors[name]}
      </p>
    ) : null;

  return (
    <form ref={formRef} onSubmit={onSubmit} onFocusCapture={markStarted} noValidate className="space-y-7" aria-describedby={formError ? "form-error" : undefined}>
      <div aria-live="assertive" id="form-error">
        {formError && <p className="border border-(--brand-danger)/50 bg-(--brand-danger)/10 px-4 py-3 text-sm text-(--brand-danger-text)">{formError}</p>}
      </div>

      {/* Honeypot (hidden from people and assistive tech) */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
        <label htmlFor="f-company_url">Company URL</label>
        <input id="f-company_url" name="company_url" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="f-name" className="field-label">
            Your name <span aria-hidden>*</span>
          </label>
          <input {...field("name")} type="text" autoComplete="name" required />
          <Err name="name" />
        </div>
        <div>
          <label htmlFor="f-businessName" className="field-label">
            Business name
          </label>
          <input {...field("businessName")} type="text" autoComplete="organization" />
          <Err name="businessName" />
        </div>
        <div>
          <label htmlFor="f-email" className="field-label">
            Email <span aria-hidden>*</span>
          </label>
          <input {...field("email")} type="email" autoComplete="email" inputMode="email" required />
          <Err name="email" />
        </div>
        <div>
          <label htmlFor="f-phone" className="field-label">
            Phone or WhatsApp <span aria-hidden>*</span>
          </label>
          <input {...field("phone")} type="tel" autoComplete="tel" inputMode="tel" placeholder="+91" required />
          <Err name="phone" />
        </div>
        <div>
          <label htmlFor="f-website" className="field-label">
            Current website <span className="text-muted/70">(optional)</span>
          </label>
          <input {...field("website")} type="text" inputMode="url" placeholder="yourbusiness.com" autoComplete="url" />
          <Err name="website" />
        </div>
        <div>
          <label htmlFor="f-industry" className="field-label">
            Industry
          </label>
          <select {...field("industry")} defaultValue="">
            <option value="">Select…</option>
            {INDUSTRY_OPTIONS.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>
      </div>

      {plans.length > 0 && (
        <div>
          <label htmlFor="f-plan" className="field-label">
            Plan you&apos;re interested in
          </label>
          <select id="f-plan" name="plan" className="field-input" value={plan} onChange={(e) => setPlan(e.target.value)}>
            <option value="">Not sure yet — recommend one</option>
            {plans.map((p) => (
              <option key={p.slug} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <fieldset>
        <legend className="field-label">Services you&apos;re interested in</legend>
        <div className="flex flex-wrap gap-2">
          {services.map(({ title: s }) => (
            <button key={s} type="button" className="chip text-sm" aria-pressed={selected.includes(s)} onClick={() => toggle(s)}>
              {s}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="f-budget" className="field-label">
            Approximate budget
          </label>
          <select {...field("budget")} defaultValue="">
            <option value="">Select…</option>
            {BUDGET_OPTIONS.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-timeline" className="field-label">
            Timeline
          </label>
          <select {...field("timeline")} defaultValue="">
            <option value="">Select…</option>
            {TIMELINE_OPTIONS.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="f-message" className="field-label">
          Tell us about your project <span aria-hidden>*</span>
        </label>
        <textarea {...field("message")} rows={6} required placeholder="What are you building, and what would a great outcome look like?" />
        <Err name="message" />
      </div>

      <div>
        <label className="flex items-start gap-3 text-[0.9375rem]">
          <input
            name="consent"
            type="checkbox"
            className="mt-1 h-5 w-5 shrink-0 accent-accent"
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? "e-consent" : undefined}
          />
          <span className="text-ink/85">
            I agree that my details will be used to respond to this enquiry, as described in the{" "}
            <Link href="/privacy-policy" className="underline decoration-accent underline-offset-2">
              privacy policy
            </Link>
            . <span aria-hidden>*</span>
          </span>
        </label>
        <Err name="consent" />
      </div>

      <div className="flex flex-wrap items-center gap-4 pt-2">
        <button type="submit" className="btn btn-primary min-h-14! px-8! text-lg disabled:opacity-60" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> Sending…
            </>
          ) : (
            <>
              Send enquiry <ArrowUpRight className="btn-arrow h-5 w-5" aria-hidden />
            </>
          )}
        </button>
        <p className="text-sm text-muted">Fields marked * are required.</p>
      </div>
    </form>
  );
}
