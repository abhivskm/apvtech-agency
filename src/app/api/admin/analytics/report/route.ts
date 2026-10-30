import { guardRoute } from "@/lib/admin/route-guard";
import { parseFilters, report } from "@/lib/analytics/report";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const user = await guardRoute(req, "analytics.view");
  if (user instanceof Response) return user;
  const data = await report(parseFilters(new URL(req.url).searchParams));
  return Response.json(data, { headers: { "Cache-Control": "no-store" } });
}
