import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const page = read("automation.html");
const home = read("index.html");
const css = read("css/style.css");
const form = read("js/public-form.js");
const tracking = read("js/automation.js");
const config = read("js/form-config.js");
const sitemap = read("sitemap.xml");

assert.match(page, /<html lang="zh-Hant-TW">/);
assert.match(page, /<title>製造業流程自動化｜Google Sheet・LINE・表單整合｜恒構企業社<\/title>/);
assert.match(page, /rel="canonical" href="https:\/\/hengo1125tw\.github\.io\/https-hengou-tw\.github\.io\/automation\.html"/);
assert.match(page, /property="og:title"/);
assert.match(page, /property="og:description"/);
assert.match(page, /property="og:type" content="website"/);
assert.match(page, /"@type": "Organization"/);
assert.match(page, /"@type": "Service"/);
assert.match(page, /assets\/images\/automation-og\.png/);
assert.ok(existsSync(new URL("../assets/images/automation-og.png", import.meta.url)));

for (const id of ["problems", "outcomes", "workflow", "cooperation", "pilot", "cases", "fit", "diagnosis", "contact"]) {
  assert.match(page, new RegExp(`id="${id}"`), `Missing section ${id}`);
}

for (const field of ["company", "name", "email", "phone", "line", "currentTools", "timeConsumingWork", "frequency", "commonError", "desiredOutcome", "startTime", "note"]) {
  assert.match(page, new RegExp(`name="${field}"`), `Missing automation field ${field}`);
}

assert.match(page, /data-source="automation-landing-page"/);
assert.match(page, /name="needs" value="企業流程自動化"/);
assert.match(page, /name="website"[^>]*tabindex="-1"[^>]*autocomplete="off"[^>]*aria-hidden="true"/);
assert.match(form, /source = clean\(form\.dataset\.source\) \|\| "website-home"/);
assert.match(form, /isAutomationForm[\s\S]*source,[\s\S]*phone:[\s\S]*note,/);
assert.match(form, /response\.ok === true && response\.state === "saved" && clean\(response\.requestId\)/);
assert.match(page, /leadGmailButton[\s\S]*leadCopyButton[\s\S]*leadLineButton/);

for (const event of ["automation_diagnosis_click", "automation_line_click", "automation_form_start", "automation_form_submit", "automation_form_success", "automation_form_error"]) {
  assert.match(page + form + tracking, new RegExp(event), `Missing event ${event}`);
}
assert.match(tracking, /typeof window\.gtag === "function"/);
assert.doesNotMatch(tracking, /G-[A-Z0-9]+/);

assert.match(home, /href="automation\.html">流程自動化<\/a>/);
assert.match(home, /href="automation\.html">了解流程自動化 →<\/a>/);
assert.match(sitemap, /automation\.html/);
assert.match(css, /\.automation-hero/);
assert.match(css, /@media\(max-width:760px\)/);

assert.equal((config.match(/https:\/\/script\.google\.com\/macros\/s\//g) || []).length, 1);
assert.doesNotMatch(page + tracking, /API_KEY|apiKey|SpreadsheetApp|SPREADSHEET_ID|Bearer\s|sk-[A-Za-z0-9]/i);

console.log("Automation page checks passed");
