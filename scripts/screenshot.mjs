/**
 * Dev utility: full-page screenshots of routes at several viewport widths, plus a horizontal-overflow check.
 *   node scripts/screenshot.mjs <outDir> <width> <path...>
 */
import { chromium } from "@playwright/test";

const [outDir, width, ...paths] = process.argv.slice(2);
const base = process.env.BASE_URL || "http://localhost:3000";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: Number(width), height: 900 }, deviceScaleFactor: 1, reducedMotion: process.env.MOTION ? "no-preference" : "reduce" });
for (const p of paths) {
  const res = await page.goto(base + p, { waitUntil: "networkidle", timeout: 120000 });
  await page.waitForTimeout(1200);
  // Trigger reveals by scrolling through the page
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(800);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  const name = (p === "/" ? "home" : p.replace(/[^a-z0-9]+/gi, "_")) + `-${width}.png`;
  await page.screenshot({ path: `${outDir}/${name}`, fullPage: process.env.FULL !== "0" });
  console.log(`${res?.status()} ${p} overflow=${overflow}px -> ${name}`);
}
await browser.close();
