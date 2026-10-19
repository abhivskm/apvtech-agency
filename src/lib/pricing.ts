/** Formats whole rupees with Indian digit grouping: 150000 → "₹1,50,000". */
export function formatINR(amount: number): string {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

export type PlanPrice = { setupPrice: number | null; monthlyPrice: number | null; pricePrefix: string };

/**
 * Turns a plan's prices into display lines.
 *   setup only   → "₹24,999" + "one-time"
 *   monthly only → "₹4,999" + "/month"
 *   both         → main "₹24,999 one-time", secondary "+ ₹4,999/month"
 *   neither      → null (render the prefix, e.g. "Custom quote")
 */
export function planPriceLines(p: PlanPrice): { main: string; unit: string; secondary: string | null } | null {
  if (p.setupPrice == null && p.monthlyPrice == null) return null;
  if (p.setupPrice != null && p.monthlyPrice != null) {
    return { main: formatINR(p.setupPrice), unit: "one-time", secondary: `+ ${formatINR(p.monthlyPrice)}/month` };
  }
  if (p.setupPrice != null) return { main: formatINR(p.setupPrice), unit: "one-time", secondary: null };
  return { main: formatINR(p.monthlyPrice!), unit: "/month", secondary: null };
}
