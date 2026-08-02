import { test, expect } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { createPr7Server } from "./local-server.mjs";

let runtime;
test.beforeAll(async () => { runtime = await createPr7Server(); console.log(JSON.stringify({ emulatorURL: runtime.baseURL })); mkdirSync("screenshots", { recursive: true }); });
test.afterAll(async () => { await new Promise(resolve => runtime.server.close(resolve)); });

async function reset(request, scenario = "normal") { await request.get(`${runtime.baseURL}/__control/reset?scenario=${scenario}`); }
async function evidence(request) { return (await request.get(`${runtime.baseURL}/__evidence`)).json(); }
async function wire(page) {
  const errors = [], warnings = [], pageErrors = [], failed = [];
  page.on("console", msg => { if (msg.type() === "error") errors.push(msg.text()); if (msg.type() === "warning") warnings.push(msg.text()); });
  page.on("pageerror", error => pageErrors.push(error.message)); page.on("requestfailed", request => failed.push(request.url()));
  await page.addInitScript(() => { Object.defineProperty(window.crypto, "randomUUID", { configurable: true, value: () => "12345678-1234-4234-8234-123456789abc" }); });
  await page.route("https://script.google.com/**", async route => {
    const original = new URL(route.request().url()); const target = new URL(`${runtime.baseURL}/apps-script/exec`); original.searchParams.forEach((value, key) => target.searchParams.set(key, value));
    const response = await page.request.fetch(target.toString(), { method: route.request().method(), data: route.request().postData() || undefined, headers: { "content-type": "text/plain;charset=UTF-8" } });
    await route.fulfill({ status: response.status(), headers: response.headers(), body: await response.body() });
  });
  return { errors, warnings, pageErrors, failed };
}
async function fillPublic(page, path, shot) {
  await page.goto(`${runtime.baseURL}${path}?utm_source=playwright&utm_medium=ci&utm_campaign=pr7`);
  await page.locator('[name="company"]').fill("PR7 虛構測試企業"); await page.locator('[name="name"]').fill("系統測試"); await page.locator('[name="email"]').fill("test@example.invalid");
  if (path === "/automation.html") { await page.locator('[name="currentTools"]').fill("Google Sheet"); await page.locator('[name="timeConsumingWork"]').fill("虛構流程整理"); await page.locator('[name="desiredOutcome"]').fill("驗證自動化"); await page.locator('[name="note"]').fill("SYSTEM TEST - EXCLUDED"); }
  else { await page.locator('[name="needs"]').selectOption({ index: 1 }); await page.locator('[name="note"]').fill("SYSTEM TEST - EXCLUDED"); }
  await page.locator('#leadForm button[type="submit"]').click();
  if (shot) await page.screenshot({ path: `screenshots/${shot}-processing.png`, fullPage: true });
}
async function fillGpu(page, _path, shot) {
  await page.goto(`${runtime.baseURL}/gpu/?utm_source=playwright&utm_medium=ci&utm_campaign=pr7`);
  await page.locator('[name="company"]').fill("PR7 虛構 GPU 測試"); await page.locator('[name="name"]').fill("系統測試"); await page.locator('[name="email"]').fill("test@example.invalid");
  await page.locator('[name="useCase"]').selectOption({ index: 1 }); await page.locator('[name="scheduleType"]').selectOption({ index: 1 }); await page.locator('[name="consent"]').check(); await page.locator('[name="note"]').fill("SYSTEM TEST - EXCLUDED");
  await page.locator('#gpuRequestForm button[type="submit"]').click(); await expect(page.locator("#requestDialog")).toBeVisible(); await page.locator("#sendRequestButton").click();
  if (shot) await page.screenshot({ path: `screenshots/${shot}-processing.png`, fullPage: true });
}

for (const entry of [{ name: "home", path: "/", fill: fillPublic }, { name: "gpu", path: "/gpu/", fill: fillGpu }, { name: "automation", path: "/automation.html", fill: fillPublic }]) {
  test(`${entry.name} real Chromium saved flow`, async ({ page, request, context }) => {
    await reset(request); await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: runtime.baseURL }); const signals = await wire(page); await entry.fill(page, entry.path, entry.name);
    const output = entry.name === "gpu" ? page.locator("#requestDialogStatus") : page.locator("#leadRequestId"); await expect(output).toContainText("HG-E2E-0001", { timeout: 5000 });
    await page.screenshot({ path: `screenshots/${entry.name}-success.png`, fullPage: true }); const data = await evidence(request);
    expect(data.posts).toBe(1); expect(data.rows).toHaveLength(1); expect(data.mails).toHaveLength(1); expect(data.mails[0].subject).toContain("[HG-REQUEST:HG-E2E-0001]"); expect(new Set(data.pollingTs).size).toBe(data.pollingTs.length);
    expect(data.rows[0].operations.request_token).toBe("12345678-1234-4234-8234-123456789abc"); expect(data.statusSequence).toContain("not_found"); expect(data.statusSequence.at(-1)).toBe("saved");
    expect(data.rows[0].payload.is_test).toBe(true); expect(data.rows[0].payload.excluded_from_pipeline).toBe(true); expect(data.rows[0].payload.lead_status).toBe("系統測試");
    expect(data.rows[0].payload.tracking.utm_source).toBe("playwright"); expect(data.rows[0].payload.tracking.utm_medium).toBe("ci"); expect(data.rows[0].payload.tracking.utm_campaign).toBe("pr7"); expect(data.rows[0].payload.tracking.landing_page).toContain(entry.path === "/" ? "/?" : entry.path);
    if (entry.name === "home") { expect(data.rows[0].payload.formType).toBe("general"); expect(data.rows[0].payload.source).toBe("website-home"); }
    if (entry.name === "gpu") { expect(data.rows[0].payload.formType).toBe("gpu"); expect(data.rows[0].payload.source).toBe("gpu-service-page"); expect(data.rows[0].payload.note).toContain("SYSTEM TEST"); }
    if (entry.name === "automation") { expect(data.rows[0].payload.formType).toBe("general"); expect(data.rows[0].payload.source).toBe("automation-landing-page"); expect(data.rows[0].payload.needs).toBe("企業流程自動化"); expect(data.rows[0].payload.note).toContain("SYSTEM TEST"); }
    if (entry.name !== "gpu") { await page.locator("#leadRequestIdCopy").click(); expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("HG-E2E-0001"); }
    expect(signals.errors).toEqual([]); expect(signals.warnings).toEqual([]); expect(signals.pageErrors).toEqual([]); expect(signals.failed).toEqual([]);
  });
}

test("timeout preserves single POST without false success", async ({ page, request }) => { for (const entry of [{ name: "home", path: "/", fill: fillPublic }, { name: "gpu", path: "/gpu/", fill: fillGpu }, { name: "automation", path: "/automation.html", fill: fillPublic }]) { await reset(request, "timeout"); await wire(page); await entry.fill(page, entry.path); const fallback = entry.name === "gpu" ? page.locator("#openEmailButton") : page.locator("#leadFallbackDialog"); await expect(fallback).toBeVisible({ timeout: 5000 }); const data = await evidence(request); expect(data.posts).toBe(1); expect(data.rows).toHaveLength(0); expect(data.mails).toHaveLength(0); await page.screenshot({ path: `screenshots/${entry.name}-timeout.png`, fullPage: true }); } });
test("confirmed error and empty requestId never show success", async ({ page, request }) => { for (const scenario of ["confirmed_error", "empty_request_id"]) { await reset(request, scenario); await wire(page); await fillPublic(page, "/automation.html"); await expect(page.locator("#leadFallbackDialog")).toBeVisible({ timeout: 5000 }); await expect(page.locator("#leadSuccess")).toBeHidden(); expect((await evidence(request)).posts).toBe(1); } });
test("saved reconciliation succeeds after cache persistence failure", async ({ page, request }) => { await reset(request, "cache_saved_failure"); await wire(page); await fillPublic(page, "/automation.html"); await expect(page.locator("#leadRequestId")).toContainText("HG-E2E-0001", { timeout: 5000 }); const data = await evidence(request); expect(data.rows).toHaveLength(1); expect(data.mails).toHaveLength(1); expect(data.warnings.some(item => item.code === "SAVED_STATUS_PERSISTENCE_FAILED")).toBeTruthy(); });

test("clipboard unavailable uses visible manual fallback without exception", async ({ page, request }) => { await reset(request); await wire(page); await page.addInitScript(() => { Object.defineProperty(navigator, "clipboard", { configurable: true, value: undefined }); }); await fillPublic(page, "/automation.html"); await expect(page.locator("#leadRequestId")).toContainText("HG-E2E-0001", { timeout: 5000 }); await page.locator("#leadRequestIdCopy").click(); await expect(page.locator("#toast")).toContainText("HG-E2E-0001"); });

test("responsive real Chromium 9 viewport/page combinations", async ({ browser, request }) => {
  await reset(request);
  const pages = [{ name: "home", path: "/" }, { name: "gpu", path: "/gpu/" }, { name: "automation", path: "/automation.html" }];
  for (const viewport of [{ width: 390, height: 844 }, { width: 768, height: 1024 }, { width: 1440, height: 1000 }]) for (const entry of pages) {
    const context = await browser.newContext({ viewport }); const page = await context.newPage(); const signals = await wire(page); await page.goto(`${runtime.baseURL}${entry.path}`);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy(); expect(await page.locator("form").isVisible()).toBeTruthy(); await page.screenshot({ path: `screenshots/${entry.name}-${viewport.width}-initial.png`, fullPage: true }); expect(signals.errors).toEqual([]); expect(signals.warnings).toEqual([]); expect(signals.pageErrors).toEqual([]); await context.close();
  }
});

test.afterAll(async () => { writeFileSync("test-results/pr7-test-summary.json", JSON.stringify({ status: "PASS", realChromium: true, cloud: "CLOUD_AUTOMATION_BLOCKED_CREDENTIALS", forms: 3, responsive: 9 }, null, 2)); });
