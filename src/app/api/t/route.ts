import { ingest } from "@/lib/analytics/ingest";
import { isBot, parsePayload } from "@/lib/analytics/server";
import { logError } from "@/lib/log";

export const runtime = "nodejs";

const MAX_BODY = 32_000;
const LIMIT_PER_MIN = 120;
const none = () => new Response(null, { status: 204 });

// Per-instance flood protection. Keys are held in memory for one minute and never written anywhere.
const hits = new Map<string, { n: number; reset: number }>();
function limited(key: string, now: number) {
  if (hits.size > 5000) hits.clear();
  const h = hits.get(key);
  if (!h || h.reset < now) {
    hits.set(key, { n: 1, reset: now + 60_000 });
    return false;
  }
  return ++h.n > LIMIT_PER_MIN;
}

function header(req: Request, name: string) {
  const v = req.headers.get(name);
  if (!v) return null;
  try {
    return decodeURIComponent(v).slice(0, 80);
  } catch {
    return v.slice(0, 80);
  }
}

/** Anonymous analytics collector. Always answers 204 so it can never affect the visitor's page. */
export async function POST(req: Request) {
  if (process.env.ANALYTICS_DISABLED === "true") return none();
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  try {
    if (origin && new URL(origin).host !== host) return none();
  } catch {
    return none();
  }
  const userAgent = req.headers.get("user-agent") ?? "";
  if (isBot(userAgent) || req.headers.get("dnt") === "1" || req.headers.get("sec-gpc") === "1") return none();
  // Signed-in staff are never counted.
  if (req.headers.get("cookie")?.includes("agency_session=")) return none();
  const ip = req.headers.get("x-vercel-forwarded-for") ?? req.headers.get("x-real-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  if (limited(ip, Date.now())) return none();

  try {
    const body = await req.text();
    if (body.length > MAX_BODY) return none();
    const payload = parsePayload(JSON.parse(body));
    if (payload) {
      await ingest(payload, {
        userAgent,
        country: header(req, "x-vercel-ip-country"),
        region: header(req, "x-vercel-ip-country-region"),
        city: header(req, "x-vercel-ip-city"),
      });
    }
  } catch (err) {
    if (!(err instanceof SyntaxError)) logError("analytics ingest failed", err);
  }
  return none();
}
