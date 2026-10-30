import { guardRoute } from "@/lib/admin/route-guard";
import { live } from "@/lib/analytics/report";

export const dynamic = "force-dynamic";

/** Live panel data, polled by the dashboard every few seconds. */
export async function GET(req: Request) {
  const user = await guardRoute(req, "analytics.view");
  if (user instanceof Response) return user;
  return Response.json(await live(), { headers: { "Cache-Control": "no-store" } });
}
