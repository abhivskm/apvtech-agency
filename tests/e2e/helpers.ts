import { expect, type Page } from "@playwright/test";

export const ADMIN = {
  email: process.env.E2E_ADMIN_EMAIL ?? "dev-admin@example.com",
  password: process.env.E2E_ADMIN_PASSWORD ?? "Dev-Only-Pass-2026!",
};

export async function login(page: Page, email = ADMIN.email, password = ADMIN.password) {
  await page.goto("/admin/login");
  await page.fill("#email", email);
  await page.fill("#password", password);
  await Promise.all([page.waitForURL(/\/admin(\?.*)?$/), page.getByRole("button", { name: "Sign in" }).click()]);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Welcome");
}

export function uid() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

/** A tiny valid 1×1 PNG. */
export const PNG_1PX = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);
