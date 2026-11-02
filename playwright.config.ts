import { defineConfig, devices } from "@playwright/test";

/**
 * E2E config. Set BASE_URL to target the preview or local dev server.
 * Defaults to the Lovable preview URL.
 */
const baseURL =
  process.env.BASE_URL ??
  "https://id-preview--f3b2594d-9255-421b-b7bf-e1f3c397fc48.lovable.app";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  retries: 0,
  reporter: "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
    locale: "ar",
  },
  projects: [
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
    },
  ],
});
