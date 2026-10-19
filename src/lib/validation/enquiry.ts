import { z } from "zod";

export const BUDGET_OPTIONS = [
  "Under ₹25,000",
  "₹25,000 – ₹75,000",
  "₹75,000 – ₹2,00,000",
  "₹2,00,000 – ₹5,00,000",
  "Above ₹5,00,000",
  "Not sure yet",
] as const;

export const TIMELINE_OPTIONS = ["As soon as possible", "Within 1 month", "1–3 months", "3+ months", "Just exploring"] as const;

export const INDUSTRY_OPTIONS = [
  "Small / medium business",
  "Startup / new brand",
  "E-commerce / D2C",
  "Restaurant / café / hotel",
  "Professional services",
  "Other",
] as const;

/** Shared client + server schema for the project enquiry form. */
export const enquirySchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  businessName: z.string().trim().max(120).optional().default(""),
  email: z.email("Please enter a valid email address").trim().toLowerCase().max(200),
  phone: z
    .string()
    .trim()
    .max(25)
    .refine((v) => v.replace(/\D/g, "").length >= 8, "Please enter a phone or WhatsApp number"),
  website: z
    .string()
    .trim()
    .max(300)
    .optional()
    .default("")
    .refine((v) => !v || /^(https?:\/\/)?[\w.-]+\.[a-z]{2,}(\/\S*)?$/i.test(v), "Please enter a valid website address"),
  industry: z.string().trim().max(80).optional().default(""),
  services: z.array(z.string().trim().max(80)).max(15).default([]),
  budget: z.string().trim().max(60).optional().default(""),
  timeline: z.string().trim().max(60).optional().default(""),
  message: z.string().trim().min(10, "Tell us a little about your project (10+ characters)").max(4000),
  consent: z.literal(true, { error: "Please agree to the privacy policy so we can respond" }),
  // Spam controls (not shown to people)
  company_url: z.string().max(0, "Spam detected").optional().default(""),
  startedAt: z.coerce.number().optional(),
  sourcePath: z.string().max(200).optional(),
});

export type EnquiryInput = z.input<typeof enquirySchema>;
