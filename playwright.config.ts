import { existsSync } from "node:fs";
import { defineConfig } from "@playwright/test";

const baseURL = process.env.BASE_URL ?? "http://localhost:3000";

// Lokal liegt ein vorinstallierter Browser; in CI kommt er aus `playwright install`.
const LOKALER_BROWSER = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const executablePath = existsSync(LOKALER_BROWSER) ? LOKALER_BROWSER : undefined;

export default defineConfig({
  testDir: "tests",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "off",
    launchOptions: { executablePath },
  },
  webServer: {
    command: process.env.CI ? "npm run start" : "npm run dev",
    url: baseURL,
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 900 } } },
    { name: "handy", use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
});
