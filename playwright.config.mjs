import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/pr7-browser",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
  reporter: [
    ["list"],
    ["junit", { outputFile: "test-results/junit.xml" }],
    ["json", { outputFile: "test-results/playwright-results.json" }],
    ["html", { outputFolder: "playwright-report", open: "never" }]
  ],
  use: {
    headless: true,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off"
  },
  outputDir: "test-results/raw"
});
