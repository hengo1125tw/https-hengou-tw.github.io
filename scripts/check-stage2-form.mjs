import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const home = read("index.html");
const gpu = read("gpu/index.html");
const config = read("js/form-config.js");
const client = read("js/form-client.js");
const homeForm = read("js/public-form.js");
const gpuForm = read("gpu/gpu.js");
const expectedEndpoint = "https://script.google.com/macros/s/AKfycbwcGkZ_mvMAnwwuGhitUOprdg72ho72UDLEk6A8Vpg6ioMEhzeP8WiTkRKEqo3LkVDs/exec";
const homeHoneypot = home.match(/<input[^>]*name="website"[^>]*>/)?.[0] || "";
const gpuHoneypot = gpu.match(/<input[^>]*name="website"[^>]*>/)?.[0] || "";

assert.match(config, new RegExp(`ENDPOINT:\\s*"${expectedEndpoint}"`), "Configured Endpoint is incorrect");
assert.equal((config.match(/https:\/\/script\.google\.com\/macros\/s\//g) || []).length, 1, "Only one Apps Script Endpoint may be configured");
assert.match(home, /js\/form-config\.js[\s\S]*js\/form-client\.js[\s\S]*js\/public-form\.js/, "Home script order is invalid");
assert.match(gpu, /\.\.\/js\/form-config\.js[\s\S]*\.\.\/js\/form-client\.js[\s\S]*gpu\.js/, "GPU subpath script order is invalid");
assert.match(client, /mode:\s*"no-cors"/, "Apps Script POST must remain compatible with GitHub Pages");
assert.match(client, /requestToken/, "POST payload must include a request token");
assert.match(client, /action:\s*"status"[\s\S]*prefix:\s*callbackName/, "Client must confirm writes through JSONP status queries");
assert.match(client, /status\?\.state === "saved"[\s\S]*status\?\.ok === true[\s\S]*status\.requestId/, "Client must require an explicit saved status and requestId");
assert.match(homeForm, /if \(submitting\) return/, "Home form must block duplicate submissions");
assert.match(gpuForm, /if \(!latestPayload \|\| submitting\) return/, "GPU form must block duplicate submissions");
for (const [name, field] of [["Home", homeHoneypot], ["GPU", gpuHoneypot]]) {
  assert.match(field, /autocomplete="off"/, `${name} honeypot must disable autocomplete`);
  assert.match(field, /tabindex="-1"/, `${name} honeypot must be removed from tab order`);
  assert.match(field, /aria-hidden="true"/, `${name} honeypot must be hidden from assistive technology`);
}
assert.match(homeForm, /clearAutofilledHoneypot\(data\)[\s\S]*client\.submit\(payload\)/, "Home form must clear an autofilled honeypot and still call Apps Script");
assert.match(gpuForm, /clearAutofilledHoneypot\(data\)[\s\S]*client\.submit\(latestPayload\)/, "GPU form must clear an autofilled honeypot and still call Apps Script");
assert.doesNotMatch(homeForm, /result\.spam|showMessage\("需求已送出。"/, "Home form must not fake honeypot success");
assert.doesNotMatch(gpuForm, /result\.spam|showToast\("需求已送出。"/, "GPU form must not fake honeypot success");
assert.match(homeForm, /response\.ok === true && response\.state === "saved" && clean\(response\.requestId\)[\s\S]*form\.reset\(\)[\s\S]*showMessage\(response\.message, "success"\)/, "Home success must require a saved Apps Script status");
assert.match(gpuForm, /response\.ok === true && response\.state === "saved" && clean\(response\.requestId\)[\s\S]*form\.reset\(\)[\s\S]*showToast\(response\.message\)/, "GPU success must require a saved Apps Script status");
assert.match(home, /leadGmailButton[\s\S]*leadCopyButton[\s\S]*leadLineButton/, "Home fallback actions are incomplete");
assert.match(gpu, /openEmailButton[\s\S]*copyRequestButton[\s\S]*line\.me/, "GPU fallback actions are incomplete");
assert.equal((gpu.match(/class="btn dialog-secondary fallback-only"/g) || []).length, 3, "GPU fallback actions must be grouped");
assert.equal((gpu.match(/fallback-only[^>]*hidden/g) || []).length, 3, "GPU fallback actions must be hidden initially");
assert.match(gpuForm, /setFallbackVisible\(false\)[\s\S]*client\.submit\(latestPayload\)/, "GPU fallbacks must stay hidden during submission");
assert.match(gpuForm, /setFallbackVisible\(true\)[\s\S]*Gmail、複製內容或 LINE 備援/, "GPU fallbacks must appear after failure");
assert.match(home, /name="email"[^>]*type="email"|type="email"[^>]*name="email"/, "Home email field must use type=email");
assert.match(gpu, /name="email"[^>]*type="email"|type="email"[^>]*name="email"/, "GPU email field must use type=email");
assert.equal((home.match(/id="leadForm"/g) || []).length, 1, "Home form must be unique");
assert.equal((gpu.match(/id="gpuRequestForm"/g) || []).length, 1, "GPU form must be unique");

const verifyHoneypotSanitizer = (name, source) => {
  const declaration = source.match(/const clearAutofilledHoneypot = data => \{[\s\S]*?\n  \};/)?.[0];
  assert.ok(declaration, `${name} honeypot sanitizer was not found`);
  const field = { value: "autofilled-by-browser" };
  const values = new Map([["website", field.value]]);
  const data = {
    get(key) { return values.get(key) || ""; },
    set(key, value) { values.set(key, value); }
  };
  const context = {
    form: { elements: { website: field } },
    clean: value => String(value ?? "").trim()
  };
  context.globalThis = context;
  vm.runInNewContext(
    declaration.replace("const clearAutofilledHoneypot", "globalThis.clearAutofilledHoneypot"),
    context
  );
  context.clearAutofilledHoneypot(data);
  assert.equal(field.value, "", `${name} honeypot DOM value was not cleared`);
  assert.equal(data.get("website"), "", `${name} honeypot FormData value was not cleared`);
};

verifyHoneypotSanitizer("Home", homeForm);
verifyHoneypotSanitizer("GPU", gpuForm);

const loadClient = ({ fetch, statuses = [] }) => {
  let statusIndex = 0;
  const window = {
    HG_FORM_CONFIG: {
      ENDPOINT: expectedEndpoint,
      NOTIFY_EMAIL: "hengo1125.tw@gmail.com",
      LINE_URL: "https://line.me/R/ti/p/@749ivaeq",
      REQUEST_TIMEOUT_MS: 5,
      STATUS_TIMEOUT_MS: 100,
      STATUS_POLL_INTERVAL_MS: 1
    },
    location: { search: "", href: "https://example.test/", assign() {} },
    setTimeout,
    clearTimeout,
    open() { return {}; },
    crypto: { randomUUID: () => "12345678-1234-4234-8234-123456789abc" }
  };
  const document = {
    referrer: "",
    createElement() {
      return { remove() {} };
    },
    head: {
      appendChild(script) {
        const url = new URL(script.src);
        const callbackName = url.searchParams.get("prefix");
        const status = statuses[Math.min(statusIndex++, statuses.length - 1)];
        queueMicrotask(() => {
          if (status === "network_error") script.onerror();
          else if (status !== undefined) window[callbackName](status);
        });
      }
    }
  };
  vm.runInNewContext(client, {
    window,
    document,
    navigator: { userAgent: "Stage2 test", language: "zh-TW" },
    Intl,
    URLSearchParams,
    URL,
    AbortController,
    fetch,
    Date,
    Math
  });
  return window.HGFormClient;
};

let postedPayload;
const successClient = loadClient({
  fetch: async (_url, options) => { postedPayload = JSON.parse(options.body); return {}; },
  statuses: [
    { ok: false, state: "processing", requestId: "", message: "" },
    { ok: true, state: "saved", requestId: "HG-TEST-1", message: "" }
  ]
});
const saved = JSON.parse(JSON.stringify(await successClient.submit({ formType: "general" })));
assert.equal(saved.ok, true, JSON.stringify(saved));
assert.equal(saved.state, "saved");
assert.equal(saved.requestId, "HG-TEST-1");
assert.equal(postedPayload.requestToken, "12345678-1234-4234-8234-123456789abc");
assert.match(saved.message, /HG-TEST-1/);

const rejected = await loadClient({
  fetch: async () => ({}),
  statuses: [{ ok: false, state: "error", requestId: "", message: "測試拒絕" }]
}).submit({});
assert.equal(rejected.ok, false);
assert.equal(rejected.code, "write_error");

const timedOutStatus = await loadClient({
  fetch: async () => ({}),
  statuses: [{ ok: false, state: "processing", requestId: "", message: "" }]
}).submit({});
assert.equal(timedOutStatus.code, "status_timeout");

const offline = await loadClient({ fetch: async () => { throw new TypeError("offline"); } }).submit({});
assert.equal(offline.code, "network_error");

const timedOut = await loadClient({ fetch: (_url, { signal }) => new Promise((_, reject) => {
  signal.addEventListener("abort", () => reject(Object.assign(new Error("timeout"), { name: "AbortError" })));
}) }).submit({});
assert.equal(timedOut.code, "timeout");

assert.match(successClient.gmailUrl("subject", "body"), /^https:\/\/mail\.google\.com\/mail\//);
assert.equal(successClient.lineUrl(), "https://line.me/R/ti/p/@749ivaeq");

console.log("Stage 2 form checks passed");
