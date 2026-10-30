import type { EventType } from "@/lib/analytics/shared";

/**
 * Browser side of first-party analytics. Anonymous random IDs only, stored in localStorage.
 * Nothing typed by a visitor is ever read: only event names, public link labels and page paths.
 */
const STORE = "apv_a";
const OFF = "apv_a_off";
const SESSION_MS = 30 * 60_000;
const FLUSH_MS = 1000;

type Context = { r?: string; us?: string; um?: string; uc?: string; ut?: string; ux?: string; lang?: string };
type State = { v: string; s: string; n: boolean; last: number; c: Context };
export type TrackFields = { label?: string; area?: string; value?: number };

let enabled: boolean | null = null;
let state: State | null = null;
let queue: Record<string, unknown>[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;
let engagedMs = 0;

const randomId = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
};

function read<T>(key: string): T | null {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable: IDs last for this page only */
  }
}

/** Referrer host (never its path) and UTM tags from the landing URL. */
function landingContext(): Context {
  const c: Context = { lang: navigator.language?.slice(0, 12) };
  try {
    if (document.referrer) {
      const host = new URL(document.referrer).hostname;
      if (host !== location.hostname) c.r = host;
    }
  } catch {
    /* unparsable referrer */
  }
  const q = new URLSearchParams(location.search);
  const utm: [keyof Context, string][] = [["us", "utm_source"], ["um", "utm_medium"], ["uc", "utm_campaign"], ["ut", "utm_term"], ["ux", "utm_content"]];
  for (const [k, name] of utm) {
    const v = q.get(name);
    if (v) c[k] = v.slice(0, 120);
  }
  return c;
}

/** Decides once per page load whether tracking may run. */
export function initAnalytics(): boolean {
  if (enabled !== null) return enabled;
  const q = new URLSearchParams(location.search).get("ignore_me");
  if (q === "1") write(OFF, 1);
  if (q === "0") write(OFF, null);
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  let declined = false;
  try {
    declined = localStorage.getItem("analytics-consent") === "denied";
  } catch {
    /* storage unavailable */
  }
  enabled = !read(OFF) && !declined && nav.doNotTrack !== "1" && !nav.globalPrivacyControl && !nav.webdriver;
  if (!enabled) queue = [];
  else if (queue.length) schedule();
  return enabled;
}

function session(): State {
  const now = Date.now();
  state ??= read<State>(STORE);
  if (!state?.v) state = { v: randomId(), s: randomId(), n: true, last: now, c: landingContext() };
  else if (now - state.last > SESSION_MS) state = { v: state.v, s: randomId(), n: false, last: now, c: landingContext() };
  state.last = now;
  write(STORE, state);
  return state;
}

function schedule() {
  if (enabled && !timer) timer = setTimeout(flush, FLUSH_MS);
}

/** Sends queued events. `heartbeat` also reports presence and engaged time when there are no events. */
export function flush(heartbeat: unknown = false) {
  if (timer) clearTimeout(timer);
  timer = null;
  if (!enabled || (!queue.length && heartbeat !== true && !engagedMs)) return;
  const s = session();
  const body = JSON.stringify({ v: s.v, s: s.s, n: s.n, c: s.c, d: engagedMs, p: location.pathname, e: queue });
  queue = [];
  engagedMs = 0;
  const blob = new Blob([body], { type: "application/json" });
  if (!navigator.sendBeacon?.("/api/t", blob)) {
    void fetch("/api/t", { method: "POST", body: blob, keepalive: true }).catch(() => {});
  }
}

export function addEngagedTime(ms: number) {
  engagedMs += ms;
}

/** Queues one event. Safe to call before the tracker starts, and a no-op when tracking is off. */
export function track(type: EventType, fields: TrackFields = {}) {
  if (enabled === false || typeof window === "undefined") return;
  queue.push({ t: type, p: location.pathname, ...fields });
  if (queue.length >= 20) flush();
  else schedule();
}
