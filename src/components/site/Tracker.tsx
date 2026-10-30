"use client";

import { usePathname } from "next/navigation";
import { useReportWebVitals } from "next/web-vitals";
import { useEffect } from "react";
import { addEngagedTime, flush, initAnalytics, track } from "@/lib/analytics/client";

const CARD = /^\/(services|industries|work|insights)\/([^/?#]+)\/?$/;
const CARD_GROUP: Record<string, string> = { services: "service", industries: "industry", work: "work", insights: "insight" };
const ACTIVITY = ["pointerdown", "pointermove", "keydown", "scroll", "touchstart"];
const HEARTBEAT_MS = 20_000;
const TICK_MS = 5_000;
const IDLE_MS = 30_000;
const STOP_MS = 30 * 60_000;

const text = (el: Element) => (el.getAttribute("aria-label") || el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 80);

function areaOf(el: Element) {
  const marked = el.closest("[data-track-area]")?.getAttribute("data-track-area");
  if (marked) return marked;
  if (el.closest('header, [aria-label="Site menu"]')) return "navbar";
  if (el.closest("footer")) return "footer";
  return "page";
}

/** Works out what a click was from the link itself, so individual components need no tracking code. */
function onClick(e: MouseEvent) {
  const el = (e.target as Element | null)?.closest?.("a, button");
  if (!el) return;
  const area = areaOf(el);
  const href = el.getAttribute("href") ?? "";
  if (href.startsWith("tel:")) return track("contact_click", { label: "phone", area });
  if (href.startsWith("mailto:")) return track("contact_click", { label: "email", area });
  if (/^https?:\/\/(wa\.me|api\.whatsapp\.com)\//.test(href)) return track("contact_click", { label: "whatsapp", area });
  if (/^https?:/.test(href)) {
    try {
      const host = new URL(href).hostname;
      if (host !== location.hostname) return track("outbound", { label: host, area });
    } catch {
      return;
    }
  }
  if (el.matches(".btn, [data-track='cta']")) return track("cta", { label: text(el), area });
  if (!href) return;
  if (el.closest("nav") && !el.closest('[aria-label="Breadcrumb"]')) return track("nav", { label: text(el), area });
  const card = CARD.exec(href);
  if (card) track("card", { label: card[2], area: CARD_GROUP[card[1]] });
}

/** Anonymous first-party analytics. Runs after hydration and only ever sends data in the background. */
export function Tracker() {
  const pathname = usePathname();

  useReportWebVitals((m) => {
    if (m.name === "FID") return; // Retired metric, replaced by INP.
    // CLS is a small decimal, so it is stored multiplied by 1000.
    track("vital", { label: m.name, value: Math.round(m.name === "CLS" ? m.value * 1000 : m.value) });
  });

  useEffect(() => {
    if (!initAnalytics()) return;
    let lastActive = Date.now();
    let lastBeat = Date.now();
    let errors = 0;
    const active = () => {
      lastActive = Date.now();
    };
    const tick = () => {
      if (document.visibilityState !== "visible") return;
      const now = Date.now();
      if (now - lastActive < IDLE_MS) addEngagedTime(TICK_MS);
      if (now - lastActive < STOP_MS && now - lastBeat >= HEARTBEAT_MS) {
        lastBeat = now;
        flush(true);
      }
    };
    const hidden = () => {
      if (document.visibilityState === "hidden") flush();
    };
    const pageHide = () => flush();
    const jsError = (message: string) => {
      if (errors++ < 5) track("js_error", { label: message.slice(0, 200) });
    };
    const onError = (e: ErrorEvent) => jsError(e.message || "Script error");
    const onRejection = (e: PromiseRejectionEvent) => jsError(e.reason instanceof Error ? e.reason.message : "Unhandled rejection");

    const interval = setInterval(tick, TICK_MS);
    for (const type of ACTIVITY) window.addEventListener(type, active, { passive: true });
    document.addEventListener("click", onClick, { capture: true, passive: true });
    document.addEventListener("visibilitychange", hidden);
    window.addEventListener("pagehide", pageHide);
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      clearInterval(interval);
      for (const type of ACTIVITY) window.removeEventListener(type, active);
      document.removeEventListener("click", onClick, { capture: true });
      document.removeEventListener("visibilitychange", hidden);
      window.removeEventListener("pagehide", pageHide);
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  // Pageview and scroll depth, once per route (client-side navigation included).
  useEffect(() => {
    if (!initAnalytics()) return;
    track(document.querySelector("[data-analytics-404]") ? "404" : "pageview");
    const seen = new Set<number>();
    let frame = 0;
    const measure = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      const pct = ((window.scrollY + 1) / max) * 100;
      for (const mark of [25, 50, 75, 100]) {
        if (pct >= mark && !seen.has(mark)) {
          seen.add(mark);
          track("scroll", { value: mark });
        }
      }
    };
    const onScroll = () => {
      frame ||= requestAnimationFrame(measure);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [pathname]);

  return null;
}
