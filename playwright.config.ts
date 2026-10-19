import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests run against a running app (dev or production build) with a seeded database.
 *   BASE_URL=http://localhost:3000 E2E_ADMIN_EMAIL=… E2E_ADMIN_PASSWORD=… npm run test:e2e
 * Set E2E_START=1 to let Playwright start `npm run start` itself (after `npm run build`).
 */
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  reporter: [["list"]],
  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
    reducedMotion: "reduce",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"], channel: undefined } }],
  webServer: process.env.E2E_START
    ? { command: "npm run start", url: process.env.BASE_URL ?? "http://localhost:3000", reuseExistingServer: true, timeout: 120_000 }
    : undefined,
});
