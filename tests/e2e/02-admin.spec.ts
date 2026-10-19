import { expect, test } from "@playwright/test";
import { ADMIN, PNG_1PX, login, uid } from "./helpers";

test.describe("access control (unauthenticated)", () => {
  test("admin pages redirect to login", async ({ page }) => {
    for (const p of ["/admin", "/admin/enquiries", "/admin/settings/global", "/admin/users"]) {
      await page.goto(p);
      await expect(page).toHaveURL(/\/admin\/login/);
    }
  });

  test("admin APIs refuse anonymous requests", async ({ request, baseURL }) => {
    expect((await request.get("/api/admin/enquiries/export")).status()).toBe(401);
    const up = await request.post("/api/admin/media", { headers: { origin: baseURL! }, multipart: { file: { name: "a.png", mimeType: "image/png", buffer: PNG_1PX } } });
    expect(up.status()).toBe(401);
    expect((await request.get("/api/cron/outbox")).status()).toBe(401);
  });

  test("a forged session cookie is rejected", async ({ page, context, baseURL }) => {
    await context.addCookies([{ name: "agency_session", value: "forged-token-value", url: baseURL! }]);
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("wrong password shows a generic error", async ({ page }) => {
    await page.goto("/admin/login");
    await page.fill("#email", ADMIN.email);
    await page.fill("#password", "definitely-wrong-password");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText("Incorrect email or password.")).toBeVisible();
  });
});

test.describe("admin (super admin)", () => {
  test.beforeEach(async ({ page }) => login(page));

  test("homepage hero edits publish to the live site", async ({ page }) => {
    await page.goto("/admin/homepage");
    await expect(page).toHaveURL(/\/admin\/pages\//);
    await page.getByRole("button", { name: /Hero.*Your brand/ }).click();
    const field = page.getByRole("textbox", { name: "Supporting headline" });
    const original = await field.inputValue();
    const marker = `E2E supporting line ${uid()}`;
    await field.fill(marker);
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("All changes saved")).toBeVisible();

    const pub = await page.context().newPage();
    await pub.goto("/");
    await expect(pub.getByText(marker)).toBeVisible();

    await field.fill(original);
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("All changes saved")).toBeVisible();
    await pub.reload();
    await expect(pub.getByText(marker)).toHaveCount(0);
  });

  test("service draft → publish → unpublish → delete lifecycle", async ({ page }) => {
    const id = uid();
    const slug = `e2e-service-${id}`;
    await page.goto("/admin/services/new");
    await page.getByRole("textbox", { name: /Service title/ }).fill(`E2E Service ${id}`);
    await page.getByRole("textbox", { name: /URL slug/ }).fill(slug);
    await page.getByRole("textbox", { name: /Short description/ }).fill("A temporary service created by the end-to-end test suite.");
    await page.getByRole("textbox", { name: /Hero headline/ }).fill("Temporary e2e headline");
    await page.getByRole("button", { name: "Save draft" }).click();
    await expect(page).toHaveURL(/\/admin\/services\/(?!new)/);

    const pub = await page.context().newPage();
    expect((await pub.goto(`/services/${slug}`))?.status()).toBe(404);

    await page.getByRole("button", { name: "Publish" }).click();
    await expect(page.getByText(/All changes saved · Status: published/)).toBeVisible();
    expect((await pub.goto(`/services/${slug}`))?.status()).toBe(200);
    await expect(pub.getByRole("heading", { level: 1 })).toContainText("Temporary e2e headline");

    await page.getByRole("button", { name: "Unpublish" }).click();
    await expect(page.getByText(/All changes saved · Status: draft/)).toBeVisible();
    expect((await pub.goto(`/services/${slug}`))?.status()).toBe(404);

    await page.goto("/admin/services");
    const row = page.locator("li", { hasText: `E2E Service ${id}` });
    await row.getByRole("button", { name: "Delete" }).click();
    await page.getByRole("button", { name: "Delete permanently" }).click();
    await expect(page.getByText("Service deleted")).toBeVisible();
  });

  test("validation errors are shown for invalid content", async ({ page }) => {
    await page.goto("/admin/services/new");
    await page.getByRole("textbox", { name: /URL slug/ }).fill("Not A Valid Slug!");
    await page.getByRole("button", { name: "Save draft" }).click();
    await expect(page.getByText("Please fix the highlighted fields.")).toBeVisible();
    await expect(page.getByText("Use lowercase letters, numbers and hyphens only")).toBeVisible();
  });

  test("navigation editor rejects unsafe URLs", async ({ page }) => {
    await page.goto("/admin/navigation?menu=FOOTER_LEGAL");
    await page.getByRole("button", { name: "Add link" }).click();
    const labels = page.getByRole("textbox", { name: "Label" });
    await labels.last().fill("Bad link");
    await page.getByRole("combobox", { name: "Destination" }).last().fill("javascript:alert(1)");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText(/site path|Use a site path/).first()).toBeVisible();
  });

  test("media upload validates file type and supports deletion", async ({ page, baseURL }) => {
    const bad = await page.request.post("/api/admin/media", {
      headers: { origin: baseURL! },
      multipart: { file: { name: "evil.png", mimeType: "image/png", buffer: Buffer.from("<script>alert(1)</script>") } },
    });
    expect(bad.status()).toBe(400);
    expect((await bad.json()).errors.join(" ")).toMatch(/Unsupported file type/);

    const crossSite = await page.request.post("/api/admin/media", {
      headers: { origin: "https://evil.example" },
      multipart: { file: { name: "a.png", mimeType: "image/png", buffer: PNG_1PX } },
    });
    expect(crossSite.status()).toBe(403);

    const name = `e2e-${uid()}.png`;
    const ok = await page.request.post("/api/admin/media", { headers: { origin: baseURL! }, multipart: { file: { name, mimeType: "image/png", buffer: PNG_1PX } } });
    expect(ok.status()).toBe(201);
    const created = (await ok.json()).created[0];
    expect((await page.request.get(created.url)).status()).toBe(200);

    await page.goto(`/admin/media?q=${encodeURIComponent(name.replace(".png", ""))}`);
    await page.locator("main ul li button").first().click();
    await page.getByRole("button", { name: "Delete file" }).click();
    await page.getByRole("button", { name: "Delete", exact: true }).click();
    await expect(page.getByText("Media deleted")).toBeVisible();
  });

  test("enquiries are listed, updated and exported", async ({ page }) => {
    await page.goto("/admin/enquiries?q=E2E+Visitor");
    const first = page.locator("tbody tr").first();
    await expect(first).toContainText("E2E Visitor");
    await first.getByRole("link").click();
    await expect(page.getByText("Automated end-to-end test enquiry")).toBeVisible();
    await page.getByLabel("Status").selectOption("CONTACTED");
    await expect(page.getByText("Enquiry updated")).toBeVisible();
    await page.getByLabel("New note").fill("Called — e2e note");
    await page.getByRole("button", { name: "Add note" }).click();
    await expect(page.getByText("Called — e2e note")).toBeVisible();

    const csv = await page.request.get("/api/admin/enquiries/export?q=E2E+Visitor");
    expect(csv.status()).toBe(200);
    expect(csv.headers()["content-type"]).toContain("text/csv");
    expect(await csv.text()).toContain("E2E Visitor");
  });

  test("logout ends the session", async ({ page }) => {
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/admin\/login/);
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});

test("role restrictions are enforced server-side for editors", async ({ page, browser, baseURL }) => {
  const id = uid();
  const email = `e2e-editor-${id}@example.com`;
  const password = "Editor-Pass-2026!";
  await login(page);
  await page.goto("/admin/users");
  const form = page.locator("form", { has: page.getByRole("heading", { name: "Add a user" }) });
  await form.getByRole("textbox", { name: /^Name/ }).fill(`E2E Editor ${id}`);
  await form.getByRole("textbox", { name: /^Email/ }).fill(email);
  await form.getByRole("combobox", { name: "Role" }).selectOption("EDITOR");
  await form.getByLabel(/Temporary password/).fill(password);
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText(/User created/)).toBeVisible();

  const ctx = await browser.newContext({ baseURL });
  const editor = await ctx.newPage();
  await login(editor, email, password);
  await expect(editor.getByRole("navigation", { name: "Admin" }).getByRole("link", { name: "Enquiries" })).toHaveCount(0);
  await expect(editor.getByRole("navigation", { name: "Admin" }).getByRole("link", { name: "Services" })).toHaveCount(1);
  for (const p of ["/admin/users", "/admin/settings/global", "/admin/enquiries", "/admin/activity"]) {
    await editor.goto(p);
    await expect(editor).toHaveURL(/\/admin\?forbidden=1/);
  }
  expect((await editor.request.get("/api/admin/enquiries/export")).status()).toBe(403);
  await ctx.close();

  await page.goto("/admin/users");
  const row = page.locator("tr", { hasText: email });
  await row.getByRole("button", { name: "Delete" }).click();
  await page.getByRole("button", { name: "Confirm" }).click();
  await expect(page.getByText("User deleted")).toBeVisible();
});
