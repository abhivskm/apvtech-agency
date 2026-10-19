/**
 * Dev utility: rough lab measurement of LCP and CLS for a few routes using Chromium
 * with mobile viewport, 4× CPU slowdown and a "Fast 4G"-like network profile.
 * This is NOT a substitute for field data (Search Console / CrUX) — use it to catch regressions.
 *   node scripts/vitals.mjs [baseUrl]
 */
import { chromium } from "@playwright/test";

const base = process.argv[2] ?? "http://localhost:3000";
const routes = ["/", "/services/website-development", "/work", "/insights/google-business-profile-checklist", "/contact"];
const browser = await chromium.launch();

for (const route of routes) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 60, downloadThroughput: (9 * 1024 * 1024) / 8, uploadThroughput: (1.5 * 1024 * 1024) / 8 });
  await page.addInitScript(() => {
    window.__vitals = { lcp: 0, cls: 0 };
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) window.__vitals.lcp = e.startTime;
    }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) if (!e.hadRecentInput) window.__vitals.cls += e.value;
    }).observe({ type: "layout-shift", buffered: true });
  });
  await page.goto(base + route, { waitUntil: "load" });
  await page.waitForTimeout(3000);
  const v = await page.evaluate(() => window.__vitals);
  console.log(`${route.padEnd(48)} LCP ${(v.lcp / 1000).toFixed(2)}s  CLS ${v.cls.toFixed(3)}`);
  await ctx.close();
}
await browser.close();
