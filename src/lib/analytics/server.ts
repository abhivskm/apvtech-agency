import { EVENT_TYPES, contentGroup, type EventType } from "@/lib/analytics/shared";

/** Pure helpers for the collection endpoint (no database access). */
const BOT = /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|whatsapp\/|headless|lighthouse|pagespeed|gtmetrix|pingdom|uptime|monitor|curl|wget|python|axios|node-fetch|go-http|java\/|preview/i;

export function isBot(ua: string) {
  return !ua || BOT.test(ua);
}

export function parseUserAgent(ua: string) {
  const device = /ipad|tablet|(android(?!.*mobile))/i.test(ua) ? "tablet" : /mobi|iphone|android/i.test(ua) ? "mobile" : "desktop";
  const browser = /edg/i.test(ua) ? "Edge" : /opr\/|opera/i.test(ua) ? "Opera" : /samsungbrowser/i.test(ua) ? "Samsung Internet" : /firefox|fxios/i.test(ua) ? "Firefox" : /chrome|crios/i.test(ua) ? "Chrome" : /safari/i.test(ua) ? "Safari" : "Other";
  const os = /windows/i.test(ua) ? "Windows" : /android/i.test(ua) ? "Android" : /iphone|ipad|ipod/i.test(ua) ? "iOS" : /mac os/i.test(ua) ? "macOS" : /linux/i.test(ua) ? "Linux" : "Other";
  return { device, browser, os };
}

const SEARCH = /(^|\.)(google|bing|duckduckgo|yahoo|yandex|baidu|ecosia|brave)\./i;
const SOCIAL = /(^|\.)(facebook|fb|instagram|linkedin|lnkd|twitter|t|x|youtube|youtu|whatsapp|wa|pinterest|reddit|threads)\.(com|co|me|net|in)$/i;

/** Sorts a visit into a channel and a source name from its UTM tags or referrer host. */
export function classifySource(input: { referrerHost?: string | null; utmSource?: string | null; utmMedium?: string | null }) {
  const host = input.referrerHost?.toLowerCase().replace(/^www\./, "") ?? null;
  if (input.utmSource) {
    const medium = input.utmMedium?.toLowerCase() ?? "";
    const channel = /cpc|ppc|paid|ads/.test(medium) ? "Paid" : /email|newsletter/.test(medium) ? "Email" : /social/.test(medium) ? "Social" : "Campaign";
    return { channel, source: input.utmSource.toLowerCase().slice(0, 80) };
  }
  if (!host) return { channel: "Direct", source: "direct" };
  if (SEARCH.test(host)) return { channel: "Organic search", source: host };
  if (SOCIAL.test(host)) return { channel: "Social", source: host };
  return { channel: "Referral", source: host };
}

/** Removes anything in an error message that could identify a person or a private URL. */
export function scrubError(message: string) {
  return message
    .replace(/https?:\/\/\S+/g, "[url]")
    .replace(/[^\s@]+@[^\s@]+/g, "[email]")
    .replace(/\d{5,}/g, "[number]")
    .slice(0, 160);
}

const str = (v: unknown, max: number) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null);
const cleanPath = (v: unknown) => {
  const p = str(v, 200);
  return p && p.startsWith("/") ? p.split(/[?#]/)[0] : null;
};
const ID = /^[a-f0-9]{16,40}$/;
const ALLOWED = new Set<string>(EVENT_TYPES);

export type ParsedEvent = { type: EventType; path: string; group: string; slug: string | null; label: string | null; area: string | null; value: number | null };
export type ParsedPayload = {
  visitorId: string;
  sessionId: string;
  isNewVisitor: boolean;
  path: string;
  engagedMs: number;
  context: { referrerHost: string | null; utmSource: string | null; utmMedium: string | null; utmCampaign: string | null; utmTerm: string | null; utmContent: string | null; language: string | null };
  events: ParsedEvent[];
};

/** Strict allow-list parser: unknown types and unknown fields are dropped, so nothing else can reach the database. */
export function parsePayload(raw: unknown): ParsedPayload | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.v !== "string" || !ID.test(r.v) || typeof r.s !== "string" || !ID.test(r.s)) return null;
  const c = (r.c && typeof r.c === "object" ? r.c : {}) as Record<string, unknown>;
  const path = cleanPath(r.p) ?? "/";
  const events: ParsedEvent[] = [];
  for (const e of Array.isArray(r.e) ? r.e.slice(0, 50) : []) {
    if (!e || typeof e !== "object") continue;
    const ev = e as Record<string, unknown>;
    if (typeof ev.t !== "string" || !ALLOWED.has(ev.t)) continue;
    const type = ev.t as EventType;
    const p = cleanPath(ev.p) ?? path;
    const label = str(ev.label, 200);
    events.push({
      type,
      path: p,
      ...contentGroup(p),
      label: type === "js_error" && label ? scrubError(label) : label ? label.slice(0, 80) : null,
      area: str(ev.area, 30),
      value: typeof ev.value === "number" && Number.isFinite(ev.value) ? Math.max(-1e6, Math.min(1e6, Math.round(ev.value))) : null,
    });
  }
  return {
    visitorId: r.v,
    sessionId: r.s,
    isNewVisitor: r.n === true,
    path,
    engagedMs: typeof r.d === "number" && r.d > 0 ? Math.min(Math.round(r.d), 120_000) : 0,
    context: {
      referrerHost: str(c.r, 120)?.split("/")[0] ?? null,
      utmSource: str(c.us, 120),
      utmMedium: str(c.um, 120),
      utmCampaign: str(c.uc, 120),
      utmTerm: str(c.ut, 120),
      utmContent: str(c.ux, 120),
      language: str(c.lang, 12),
    },
    events,
  };
}
