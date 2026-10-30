"use client";

import { Download, Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { AnalyticsLive, AnalyticsReport } from "@/lib/analytics/report";

const LIVE_MS = 3_000;
const REPORT_MS = 60_000;
const IST_MS = 5.5 * 3600_000;

const istDay = (d: Date) => new Date(d.getTime() + IST_MS).toISOString().slice(0, 10);
const daysAgo = (n: number) => istDay(new Date(Date.now() - n * 86_400_000));
const num = (n: number | null | undefined) => (n ?? 0).toLocaleString("en-IN");
const seconds = (ms: number) => {
  const s = Math.round(ms / 1000);
  return s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`;
};
const time = (iso: string) => new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

/** Runs `fn` now and on an interval, pausing while the browser tab is hidden. */
function usePolling(fn: () => void, ms: number) {
  useEffect(() => {
    fn();
    const id = setInterval(() => {
      if (document.visibilityState === "visible") fn();
    }, ms);
    const onShow = () => {
      if (document.visibilityState === "visible") fn();
    };
    document.addEventListener("visibilitychange", onShow);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onShow);
    };
  }, [fn, ms]);
}

function Card({ title, help, children, className = "" }: { title: string; help?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`a-card min-w-0 p-4 ${className}`}>
      <h3 className="text-sm font-semibold">{title}</h3>
      {help && <p className="a-help mt-0.5">{help}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}

const Empty = () => <p className="py-3 text-sm text-zinc-500">No data yet.</p>;

/** Ranked list with a proportional bar behind each row. */
function Bars({ rows }: { rows: { label: string; value: number; extra?: string }[] }) {
  if (!rows.length) return <Empty />;
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <ul className="space-y-1">
      {rows.map((r, i) => (
        <li key={`${r.label}-${i}`} className="relative overflow-hidden rounded bg-zinc-50 px-2 py-1 text-[13px]">
          <span className="absolute inset-y-0 left-0 bg-emerald-100" style={{ width: `${(r.value / max) * 100}%` }} aria-hidden />
          <span className="relative flex justify-between gap-3">
            <span className="min-w-0 truncate" title={r.label}>
              {r.label}
            </span>
            <span className="shrink-0 tabular-nums text-zinc-700">
              {num(r.value)}
              {r.extra && <span className="ml-2 text-zinc-500">{r.extra}</span>}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function Table({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  if (!rows.length) return <Empty />;
  return (
    <div className="overflow-x-auto">
      <table className="a-table min-w-105 text-[13px]">
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j} className={typeof c === "number" ? "tabular-nums" : ""}>
                  {typeof c === "number" ? num(c) : c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Stat({ label, value, now, before, format = num }: { label: string; value?: string; now: number; before: number; format?: (n: number) => string }) {
  const change = before ? Math.round(((now - before) / before) * 100) : null;
  return (
    <div className="a-card p-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums">{value ?? format(now)}</p>
      <p className={`mt-0.5 text-xs ${change === null ? "text-zinc-400" : change >= 0 ? "text-emerald-700" : "text-red-700"}`}>
        {change === null ? "No earlier data" : `${change >= 0 ? "+" : ""}${change}% vs previous period`}
      </p>
    </div>
  );
}

function Trend({ days }: { days: AnalyticsReport["daily"] }) {
  if (!days.length) return <Empty />;
  const max = Math.max(...days.map((d) => d.sessions), 1);
  return (
    <div className="flex h-32 items-end gap-0.5" role="img" aria-label={`Sessions per day from ${days[0].day} to ${days[days.length - 1].day}`}>
      {days.map((d) => (
        <div key={d.day} className="min-w-0 max-w-16 flex-1 rounded-t bg-emerald-500" style={{ height: `${Math.max((d.sessions / max) * 100, 3)}%` }} title={`${d.day}: ${d.sessions} sessions, ${d.pageviews} pageviews, ${d.leads} leads`} />
      ))}
    </div>
  );
}

function Funnel({ f }: { f: AnalyticsReport["funnel"] }) {
  const steps = [
    ["Visits", f.visits],
    ["Service, work or pricing view", f.interest],
    ["Contact page view", f.contact],
    ["Form started", f.started],
    ["Lead", f.leads],
  ] as const;
  return (
    <ol className="space-y-2">
      {steps.map(([label, value], i) => {
        const prev = i ? steps[i - 1][1] : value;
        return (
          <li key={label}>
            <div className="flex justify-between gap-3 text-[13px]">
              <span>{label}</span>
              <span className="tabular-nums">
                {num(value)}
                {i > 0 && <span className="ml-2 text-zinc-500">{prev ? Math.round((value / prev) * 100) : 0}%</span>}
              </span>
            </div>
            <div className="mt-1 h-2 rounded bg-zinc-100">
              <div className="h-2 rounded bg-emerald-500" style={{ width: `${f.visits ? (value / f.visits) * 100 : 0}%` }} />
            </div>
          </li>
        );
      })}
    </ol>
  );
}

const VITAL_LIMITS: Record<string, [number, number, string]> = {
  LCP: [2500, 4000, "ms"],
  INP: [200, 500, "ms"],
  CLS: [100, 250, ""],
  FCP: [1800, 3000, "ms"],
  TTFB: [800, 1800, "ms"],
};

function Vitals({ rows }: { rows: AnalyticsReport["vitals"] }) {
  if (!rows.length) return <Empty />;
  return (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {rows.map((v) => {
        const limit = VITAL_LIMITS[v.metric ?? ""];
        const rating = !limit ? "" : v.p75 <= limit[0] ? "Good" : v.p75 <= limit[1] ? "Needs work" : "Poor";
        const value = v.metric === "CLS" ? (v.p75 / 1000).toFixed(2) : `${num(v.p75)}${limit?.[2] ?? ""}`;
        return (
          <li key={v.metric} className="rounded border border-zinc-200 p-2">
            <p className="text-xs text-zinc-500">{v.metric} (p75)</p>
            <p className="font-semibold tabular-nums">{value}</p>
            <p className={`text-xs ${rating === "Good" ? "text-emerald-700" : rating === "Poor" ? "text-red-700" : "text-amber-700"}`}>
              {rating} · {num(v.samples)} samples
            </p>
          </li>
        );
      })}
    </ul>
  );
}

const EVENT_NAMES: Record<string, string> = {
  pageview: "Page view",
  "404": "Page not found",
  scroll: "Scrolled",
  outbound: "Outbound click",
  cta: "CTA click",
  nav: "Menu click",
  card: "Card click",
  form_view: "Form viewed",
  form_start: "Form started",
  form_submit: "Form submit attempt",
  form_success: "Lead",
  form_error: "Form error",
  contact_click: "Contact click",
  js_error: "JS error",
};

function LivePanel() {
  const [data, setData] = useState<AnalyticsLive | null>(null);
  const [failed, setFailed] = useState(false);
  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/analytics/live", { cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      setData(await res.json());
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, []);
  usePolling(load, LIVE_MS);

  return (
    <div className="grid gap-3 lg:grid-cols-3">
      <Card title="Live now" help="Updates every 3 seconds while this tab is open.">
        <p className="flex items-baseline gap-2">
          <span className="text-4xl font-semibold tabular-nums" data-testid="live-active">
            {data ? num(data.active) : "–"}
          </span>
          <span className="text-sm text-zinc-500">active {data?.active === 1 ? "visitor" : "visitors"}</span>
        </p>
        {failed && <p className="a-error mt-2">Couldn&apos;t refresh. Trying again…</p>}
        <div className="mt-3 space-y-3">
          <div>
            <p className="mb-1 text-xs font-medium text-zinc-500">Current pages</p>
            <Bars rows={data?.pages ?? []} />
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-zinc-500">Location</p>
            <Bars rows={data?.locations ?? []} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div>
              <p className="mb-1 text-xs font-medium text-zinc-500">Device</p>
              <Bars rows={data?.devices ?? []} />
            </div>
            <div>
              <p className="mb-1 text-xs font-medium text-zinc-500">Source</p>
              <Bars rows={data?.sources ?? []} />
            </div>
          </div>
        </div>
      </Card>
      <Card title="Live event feed" className="lg:col-span-2">
        {!data?.feed.length ? (
          <Empty />
        ) : (
          <ul className="max-h-120 divide-y divide-zinc-100 overflow-y-auto" data-testid="live-feed">
            {data.feed.map((e) => (
              <li key={e.id} className="flex flex-wrap items-baseline gap-x-2 py-1.5 text-[13px]">
                <span className="w-20 shrink-0 tabular-nums text-xs text-zinc-500">{time(e.createdAt)}</span>
                <span className="font-medium">{EVENT_NAMES[e.type] ?? e.type}</span>
                {e.label && <span className="min-w-0 truncate text-zinc-700">{e.label}</span>}
                {e.value != null && <span className="text-zinc-700">{e.value}%</span>}
                {e.area && <span className="rounded bg-zinc-100 px-1.5 text-[11px] text-zinc-600">{e.area}</span>}
                <code className="min-w-0 truncate text-[11px] text-zinc-500">{e.path}</code>
                <span className="ml-auto text-[11px] text-zinc-500">
                  {[e.session.city, e.session.country].filter(Boolean).join(", ") || "Location unknown"} · {e.session.device} · {e.session.source}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

const PRESETS = [
  { label: "Today", days: 0 },
  { label: "7 days", days: 6 },
  { label: "30 days", days: 29 },
  { label: "90 days", days: 89 },
];

const toBars = (rows: { key: string | null; count: number; sessions: number }[]) => rows.map((r) => ({ label: r.key ?? "Unknown", value: r.count, extra: `${num(r.sessions)} visits` }));
const toAudience = (rows: { key: string | null; sessions: number }[]) => rows.map((r) => ({ label: r.key ?? "Unknown", value: r.sessions }));

export function AnalyticsDashboard() {
  const [from, setFrom] = useState(() => daysAgo(6));
  const [to, setTo] = useState(() => daysAgo(0));
  const [device, setDevice] = useState("");
  const [data, setData] = useState<AnalyticsReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const query = useMemo(() => new URLSearchParams({ from, to, ...(device ? { device } : {}) }).toString(), [from, to, device]);
  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/analytics/report?${query}`, { cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      setData(await res.json());
      setError(null);
    } catch {
      setError("The report couldn't be loaded. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [query]);
  usePolling(load, REPORT_MS);

  const c = data?.current;
  const p = data?.previous;

  return (
    <div className="space-y-4">
      <LivePanel />

      <div className="a-card flex flex-wrap items-end gap-3 p-3">
        <div className="flex flex-wrap gap-1">
          {PRESETS.map((x) => (
            <button
              key={x.label}
              type="button"
              className="a-btn a-btn-secondary a-btn-sm"
              onClick={() => {
                setFrom(daysAgo(x.days));
                setTo(daysAgo(0));
              }}
            >
              {x.label}
            </button>
          ))}
        </div>
        <label className="text-xs text-zinc-500">
          From
          <input type="date" className="a-input mt-1" value={from} max={to} onChange={(e) => e.target.value && setFrom(e.target.value)} />
        </label>
        <label className="text-xs text-zinc-500">
          To
          <input type="date" className="a-input mt-1" value={to} min={from} onChange={(e) => e.target.value && setTo(e.target.value)} />
        </label>
        <label className="text-xs text-zinc-500">
          Device
          <select className="a-input mt-1" value={device} onChange={(e) => setDevice(e.target.value)}>
            <option value="">All devices</option>
            <option value="desktop">Desktop</option>
            <option value="mobile">Mobile</option>
            <option value="tablet">Tablet</option>
          </select>
        </label>
        <div className="ml-auto flex flex-wrap gap-2">
          <a className="a-btn a-btn-secondary a-btn-sm" href={`/api/admin/analytics/export?dataset=sessions&${query}`}>
            <Download className="h-3.5 w-3.5" aria-hidden /> Sessions CSV
          </a>
          <a className="a-btn a-btn-secondary a-btn-sm" href={`/api/admin/analytics/export?dataset=events&${query}`}>
            <Download className="h-3.5 w-3.5" aria-hidden /> Events CSV
          </a>
        </div>
      </div>

      {error && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {loading && !data && (
        <p className="flex items-center gap-2 p-4 text-sm text-zinc-500">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Loading report…
        </p>
      )}

      {data && c && p && (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            <Stat label="Visitors" now={c.visitors} before={p.visitors} />
            <Stat label="Sessions" now={c.sessions} before={p.sessions} />
            <Stat label="Pageviews" now={c.pageviews} before={p.pageviews} />
            <Stat label="Avg engaged time" now={c.engaged} before={p.engaged} format={seconds} />
            <Stat label="New / returning" value={`${num(c.newVisitors)} / ${num(c.returningVisitors)}`} now={c.newVisitors} before={p.newVisitors} />
            <Stat label="Leads" now={c.leads} before={p.leads} />
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            <Card title="Sessions per day" className="lg:col-span-2">
              <Trend days={data.daily} />
            </Card>
            <Card title="Funnel" help="Percentages compare each step with the one before it.">
              <Funnel f={data.funnel} />
            </Card>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <Card title="Traffic sources">
              <Table head={["Channel", "Source", "Sessions", "Visitors", "Leads"]} rows={data.sources.map((s) => [s.channel, s.source, s.sessions, s.visitors, s.leads])} />
            </Card>
            <Card title="UTM campaigns">
              <Table head={["Source", "Medium", "Campaign", "Sessions", "Leads"]} rows={data.campaigns.map((s) => [s.source ?? "–", s.medium ?? "–", s.campaign ?? "–", s.sessions, s.leads])} />
            </Card>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <Card title="Top pages">
              <Bars rows={toBars(data.pages)} />
            </Card>
            <Card title="Top services">
              <Bars rows={toBars(data.services)} />
            </Card>
            <Card title="Top case studies">
              <Bars rows={toBars(data.work)} />
            </Card>
            <Card title="Top articles">
              <Bars rows={toBars(data.insights)} />
            </Card>
            <Card title="Top industries">
              <Bars rows={toBars(data.industries)} />
            </Card>
            <Card title="Scroll depth">
              <Bars rows={[...data.scroll].sort((a, b) => Number(a.key) - Number(b.key)).map((r) => ({ label: `${r.key}%`, value: r.count }))} />
            </Card>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <Card title="CTA performance" help="By button label and where it sits on the page.">
              <Table head={["Label", "Location", "Clicks", "Visits"]} rows={data.cta.map((r) => [r.label ?? "–", r.area ?? "–", r.count, r.sessions])} />
            </Card>
            <Card title="Card clicks">
              <Table head={["Slug", "Type", "Clicks", "Visits"]} rows={data.cards.map((r) => [r.label ?? "–", r.area ?? "–", r.count, r.sessions])} />
            </Card>
            <Card title="Menu clicks">
              <Bars rows={toBars(data.nav)} />
            </Card>
            <div className="grid gap-3 sm:grid-cols-2">
              <Card title="Phone, email, WhatsApp">
                <Bars rows={toBars(data.contacts)} />
              </Card>
              <Card title="Outbound clicks">
                <Bars rows={toBars(data.outbound)} />
              </Card>
            </div>
          </div>

          <Card title="Audience">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {(
                [
                  ["Device", data.audience.device],
                  ["Browser", data.audience.browser],
                  ["Operating system", data.audience.os],
                  ["Language", data.audience.language],
                  ["Country", data.audience.country],
                  ["State", data.audience.region],
                  ["City", data.audience.city],
                ] as const
              ).map(([title, rows]) => (
                <div key={title} className="min-w-0">
                  <p className="mb-1 text-xs font-medium text-zinc-500">{title}</p>
                  <Bars rows={toAudience(rows)} />
                </div>
              ))}
            </div>
          </Card>

          <div className="grid gap-3 lg:grid-cols-2">
            <Card title="Web vitals" help="75th percentile from real visitors. Lower is better.">
              <Vitals rows={data.vitals} />
            </Card>
            <Card title="Errors">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="min-w-0">
                  <p className="mb-1 text-xs font-medium text-zinc-500">Pages not found</p>
                  <Bars rows={toBars(data.notFound)} />
                </div>
                <div className="min-w-0">
                  <p className="mb-1 text-xs font-medium text-zinc-500">JavaScript errors</p>
                  <Bars rows={toBars(data.jsErrors)} />
                </div>
                <div className="min-w-0">
                  <p className="mb-1 text-xs font-medium text-zinc-500">Form errors</p>
                  <Bars rows={toBars(data.formErrors)} />
                </div>
              </div>
            </Card>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <Card title="Storage">
              <p className="text-sm">
                {num(data.usage.events)} raw events · database {(data.usage.bytes / 1024 / 1024).toFixed(0)} MB in total.
              </p>
              <p className="a-help">Raw events are kept for 13 months, then reduced to daily totals. Neon&apos;s free plan allows about 500 MB.</p>
            </Card>
            <Card title="Older months (daily totals)">
              <Table head={["Month", "Metric", "Total"]} rows={data.archive.map((r) => [r.month, r.metric, r.value])} />
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
