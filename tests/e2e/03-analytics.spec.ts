import { expect, test, type Page } from "@playwright/test";
import { login, uid } from "./helpers";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36";

// Playwright marks its browser as automated, which the tracker treats as a bot; these tests act as a normal visitor.
async function visitorPage(browser: import("@playwright/test").Browser, init?: () => void) {
  const context = await browser.newContext({ userAgent: UA });
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
    // Playwright can't read beacon bodies, so keep a copy of each one inside the page. The list restarts on full page loads.
    const list: string[] = [];
    (window as unknown as { __beacons: string[] }).__beacons = list;
    const send = navigator.sendBeacon.bind(navigator);
    navigator.sendBeacon = (url, data) => {
      if (data instanceof Blob) void data.text().then((t) => list.push(t));
      return send(url, data);
    };
  });
  if (init) await context.addInitScript(init);
  return context.newPage();
}

const beacons = (page: Page) => {
  const sent: string[] = [];
  page.on("request", (r) => {
    if (r.url().endsWith("/api/t")) sent.push(r.postData() ?? "");
  });
  return sent;
};

test("visitor journey appears on the dashboard, without form contents", async ({ browser, page: admin }) => {
  await login(admin);
  await admin.goto("/admin/analytics");
  await expect(admin.getByRole("heading", { level: 1 })).toContainText("Analytics");

  const visitor = await visitorPage(browser);
  await visitor.goto("/?utm_source=e2e&utm_campaign=launch");
  await visitor.getByRole("link", { name: "Pricing" }).first().click();
  await expect(visitor).toHaveURL(/\/pricing$/);

  await visitor.goto("/contact");
  const id = uid();
  const email = `e2e-${id}@example.com`;
  await visitor.fill("#f-name", `Private Name ${id}`);
  await visitor.fill("#f-email", email);
  await visitor.fill("#f-phone", "+91 98765 43210");
  await visitor.fill("#f-message", `Private message ${id}. Automated test, please ignore.`);
  await visitor.getByLabel(/I agree that my details/).check();
  await visitor.waitForTimeout(2600);
  await visitor.getByRole("button", { name: /Send enquiry/ }).click();
  await expect(visitor.getByRole("status")).toContainText("received your enquiry");
  await visitor.waitForTimeout(1500);

  const all = await visitor.evaluate(() => (window as unknown as { __beacons: string[] }).__beacons.join("\n"));
  expect(all).toContain("form_success");
  expect(all).toContain("form_start");
  for (const secret of [email, id, "98765"]) expect(all).not.toContain(secret);

  // Live within 5 seconds of the event, with no manual refresh.
  await expect(admin.getByTestId("live-feed")).toContainText("Lead", { timeout: 5000 });
  await expect(admin.getByTestId("live-feed")).toContainText("Form started");

  // Nothing typed into the form reaches storage or exports.
  for (const dataset of ["events", "sessions"]) {
    const res = await admin.request.get(`/api/admin/analytics/export?dataset=${dataset}`);
    expect(res.status()).toBe(200);
    const csv = await res.text();
    if (dataset === "events") expect(csv).toContain("form_success");
    for (const secret of [email, id, "98765"]) expect(csv).not.toContain(secret);
  }
  await visitor.context().close();
});

test("?ignore_me=1 stops tracking and stays off on later pages", async ({ browser }) => {
  const visitor = await visitorPage(browser);
  const sent = beacons(visitor);
  await visitor.goto("/?ignore_me=1");
  await visitor.goto("/about");
  await visitor.waitForTimeout(2000);
  expect(sent).toHaveLength(0);
  await visitor.goto("/about?ignore_me=0");
  await visitor.waitForTimeout(2000);
  expect(sent.length).toBeGreaterThan(0);
  await visitor.context().close();
});

test("Do Not Track stops tracking", async ({ browser }) => {
  const visitor = await visitorPage(browser, () => Object.defineProperty(navigator, "doNotTrack", { get: () => "1" }));
  const sent = beacons(visitor);
  await visitor.goto("/");
  await visitor.waitForTimeout(2000);
  expect(sent).toHaveLength(0);
  await visitor.context().close();
});

test("dashboard and its data need a signed-in user", async ({ request }) => {
  for (const path of ["/api/admin/analytics/live", "/api/admin/analytics/report", "/api/admin/analytics/export"]) {
    expect((await request.get(path, { maxRedirects: 0 })).status()).toBe(401);
  }
});
