import { expect, test } from "@playwright/test";
import { uid } from "./helpers";

const ROUTES = [
  "/",
  "/services",
  "/services/website-development",
  "/services/ecommerce-development",
  "/services/seo-google-presence",
  "/services/social-media-management",
  "/services/creative-design",
  "/services/product-photography",
  "/services/video-production",
  "/services/paid-advertising",
  "/services/ai-automation",
  "/services/it-support-software",
  "/services/whatsapp-booking-setup",
  "/services/reviews-customer-follow-up",
  "/work",
  "/work/monsoon-roast-coffee",
  "/industries",
  "/industries/small-business",
  "/industries/startups",
  "/industries/ecommerce",
  "/industries/restaurants-hospitality",
  "/industries/salons-spas-clinics",
  "/pricing",
  "/about",
  "/insights",
  "/insights/what-a-small-business-website-needs",
  "/insights/cut-no-shows-whatsapp-reminders",
  "/contact",
  "/privacy-policy",
  "/terms-and-conditions",
];

test.describe("public routes", () => {
  for (const path of ROUTES) {
    test(`${path} renders with SEO basics`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      const title = await page.title();
      expect(title.length).toBeGreaterThan(5);
      const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
      expect(canonical).toMatch(new RegExp(`${path === "/" ? "/?$" : path.replace(/\//g, "\\/")}$`));
      await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.{40,}/);
      await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
      // every image has alt text (empty alt allowed only for decorative images marked aria-hidden containers)
      const missingAlt = await page.locator("img:not([alt])").count();
      expect(missingAlt).toBe(0);
    });
  }

  test("unknown routes and /404 return a branded 404", async ({ page }) => {
    for (const p of ["/404", "/this-page-does-not-exist", "/services/not-a-service"]) {
      const res = await page.goto(p);
      expect(res?.status()).toBe(404);
      await expect(page.getByRole("heading", { level: 1 })).toContainText("moved on");
    }
  });

  test("sitemap and robots exclude private routes", async ({ request }) => {
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toContain("/services/website-development");
    expect(sitemap).toContain("/insights/");
    expect(sitemap).not.toContain("/admin");
    expect(sitemap).not.toContain("/api/");
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toMatch(/Disallow: \/admin/);
    expect(robots).toMatch(/Sitemap: .*sitemap\.xml/);
  });

  test("security headers are present", async ({ request }) => {
    const res = await request.get("/");
    const h = res.headers();
    expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["referrer-policy"]).toBeTruthy();
    expect(h["x-powered-by"]).toBeUndefined();
  });
});

test.describe("responsive layout", () => {
  for (const width of [375, 390, 768, 1280, 1920]) {
    test(`no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const p of ["/", "/services/website-development", "/work", "/contact", "/insights/google-business-profile-checklist"]) {
        await page.goto(p);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow, `${p} at ${width}px`).toBeLessThanOrEqual(0);
      }
    });
  }
});

test("mobile navigation drawer is keyboard accessible", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Open menu" });
  await expect(toggle).toBeVisible();
  await toggle.click();
  const dialog = page.getByRole("dialog", { name: "Site menu" });
  await expect(dialog).toBeVisible();
  await expect(page.getByRole("button", { name: "Close menu" })).toHaveAttribute("aria-expanded", "true");
  const focusedInside = await dialog.evaluate((el) => el.contains(document.activeElement));
  expect(focusedInside).toBe(true);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await toggle.click();
  await dialog.getByRole("link", { name: /^Work\s+\d+$/ }).click();
  await expect(page).toHaveURL(/\/work$/);
  await expect(dialog).toBeHidden();
});

test("portfolio filter narrows projects and updates the URL", async ({ page }) => {
  await page.goto("/work");
  const cards = page.locator("main ul li a[href^='/work/']");
  const all = await cards.count();
  expect(all).toBeGreaterThan(1);
  await page.getByRole("group", { name: "Filter projects by category" }).getByRole("button", { name: /^Branding/ }).click();
  await expect(page).toHaveURL(/category=branding/);
  const filtered = await cards.count();
  expect(filtered).toBeGreaterThan(0);
  expect(filtered).toBeLessThan(all);
  await page.goto("/work?category=branding");
  await expect(cards).toHaveCount(filtered);
});

test("pricing page lists plans and preselects a plan on the contact form", async ({ page }) => {
  await page.goto("/pricing");
  const choose = page.getByRole("link", { name: /Choose Growth/ });
  await expect(choose).toBeVisible();
  await expect(page.getByText("₹49,999").first()).toBeVisible();
  await expect(page.getByText(/GST/).first()).toBeVisible();
  await choose.click();
  await expect(page).toHaveURL(/\/contact\?plan=growth/);
  await expect(page.locator("#f-plan")).toHaveValue("Growth");
});

test("enquiry form validates and submits", async ({ page }) => {
  await page.goto("/contact?service=seo-google-presence");
  await expect(page.getByRole("button", { name: "SEO & Google Presence", pressed: true })).toBeVisible();
  await page.getByRole("button", { name: /Send enquiry/ }).click();
  await expect(page.getByText("Please check the highlighted fields.")).toBeVisible();
  await expect(page.locator("#f-name")).toHaveAttribute("aria-invalid", "true");

  const id = uid();
  await page.fill("#f-name", `E2E Visitor ${id}`);
  await page.fill("#f-email", `e2e-${id}@example.com`);
  await page.fill("#f-phone", "+91 98765 43210");
  await page.fill("#f-message", `Automated end-to-end test enquiry ${id}. Please ignore.`);
  await page.getByLabel(/I agree that my details/).check();
  await page.waitForTimeout(2600); // minimum fill time spam check
  await page.getByRole("button", { name: /Send enquiry/ }).click();
  await expect(page.getByRole("status")).toContainText("received your enquiry");
});
