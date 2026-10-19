import { describe, expect, it } from "vitest";
import { formatINR, planPriceLines } from "@/lib/pricing";
import { planSchema } from "@/lib/validation/content";

describe("formatINR", () => {
  it("uses Indian digit grouping", () => {
    expect(formatINR(4999)).toBe("₹4,999");
    expect(formatINR(150000)).toBe("₹1,50,000");
    expect(formatINR(12500000)).toBe("₹1,25,00,000");
  });
});

describe("planPriceLines", () => {
  const base = { pricePrefix: "Starting from" };
  it("handles setup + monthly", () => {
    expect(planPriceLines({ ...base, setupPrice: 24999, monthlyPrice: 4999 })).toEqual({ main: "₹24,999", unit: "one-time", secondary: "+ ₹4,999/month" });
  });
  it("handles one-time only and monthly only", () => {
    expect(planPriceLines({ ...base, setupPrice: 50000, monthlyPrice: null })?.unit).toBe("one-time");
    expect(planPriceLines({ ...base, setupPrice: null, monthlyPrice: 9999 })).toEqual({ main: "₹9,999", unit: "/month", secondary: null });
  });
  it("returns null for custom-quote plans", () => {
    expect(planPriceLines({ ...base, setupPrice: null, monthlyPrice: null })).toBeNull();
  });
});

describe("planSchema", () => {
  const valid = { name: "Growth", slug: "growth", ctaLabel: "Choose", status: "PUBLISHED", features: [], notes: [] };
  it("accepts rupee strings with symbols and commas", () => {
    const r = planSchema.parse({ ...valid, setupPrice: "₹49,999", monthlyPrice: "" });
    expect(r.setupPrice).toBe(49999);
    expect(r.monthlyPrice).toBeNull();
  });
  it("rejects negative or fractional prices", () => {
    expect(planSchema.safeParse({ ...valid, setupPrice: "-5" }).success).toBe(false);
    expect(planSchema.safeParse({ ...valid, monthlyPrice: "99.5" }).success).toBe(false);
  });
});
