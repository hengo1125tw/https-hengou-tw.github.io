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
assert.match(client, /_ts:\s*String\(Date\.now\(\)\)/, "Every JSONP status query must include a cache-busting timestamp");
assert.match(client, /status\?\.state === "saved"[\s\S]*status\?\.ok === true[\s\S]*status\.requestId/, "Client must require an explicit saved status and requestId");
assert.match(client, /Promise\.race\([\s\S]*waitForSavedStatus\(requestToken/, "Status polling must start without waiting for the no-cors POST response");
assert.doesNotMatch(client, /await fetch\(config\.ENDPOINT/, "The client must not delay status polling until the no-cors POST completes");
assert.match(client, /Math\.min\(Number\(config\.STATUS_TIMEOUT_MS\) \|\| 60000, 60000\)/, "Saved-state confirmation must be capped at 60 seconds");
assert.match(homeForm, /if \(submitting\) return/, "Home form must block duplicate submissions");
assert.match(gpuForm, /if \(!latestPayload \|\| submitting\) return/, "GPU form must block duplicate submissions");
for (const [name, field] of [["Home", homeHoneypot], ["GPU", gpuHoneypot]]) {
  assert.match(field, /autocomplete="off"/, `${name} honeypot must disable autocomplete`);
  assert.match(field, /tabindex="-1"/, `${name} honeypot must be removed from tab order`);
  assert.match(field, /aria-hidden="true"/, `${name} honeypot must be hidden from assistive technology`);
}
assert.match(homeForm, /clearAutofilledHoneypot\(data\)[\s\S]*client\.submit\(payload(?:,|\))/, "Home form must clear an autofilled honeypot and still call Apps Script");
assert.match(gpuForm, /clearAutofilledHoneypot\(data\)[\s\S]*client\.submit\(latestPayload(?:,|\))/, "GPU form must clear an autofilled honeypot and still call Apps Script");
assert.doesNotMatch(homeForm, /result\.spam|showMessage\("需求已送出。"/, "Home form must not fake honeypot success");
assert.doesNotMatch(gpuForm, /result\.spam|showToast\("需求已送出。"/, "GPU form must not fake honeypot success");
assert.match(homeForm, /response\.ok === true && response\.state === "saved" && clean\(response\.requestId\)[\s\S]*form\.reset\(\)[\s\S]*showMessage\(response\.message, "success"\)/, "Home success must require a saved Apps Script status");
assert.match(gpuForm, /response\.ok === true && response\.state === "saved" && clean\(response\.requestId\)[\s\S]*form\.reset\(\)[\s\S]*showToast\(response\.message\)/, "GPU success must require a saved Apps Script status");
assert.match(home, /leadGmailButton[\s\S]*leadCopyButton[\s\S]*leadLineButton/, "Home fallback actions are incomplete");
assert.match(gpu, /openEmailButton[\s\S]*copyRequestButton[\s\S]*line\.me/, "GPU fallback actions are incomplete");
assert.equal((gpu.match(/class="btn dialog-secondary fallback-only"/g) || []).length, 3, "GPU fallback actions must be grouped");
assert.equal((gpu.match(/fallback-only[^>]*hidden/g) || []).length, 3, "GPU fallback actions must be hidden initially");
assert.match(gpuForm, /setFallbackVisible\(false\)[\s\S]*client\.submit\(latestPayload(?:,|\))/, "GPU fallbacks must stay hidden during submission");
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

const loadClient = ({ fetch, statuses = [], online = true, configOverrides = {} }) => {
  let statusIndex = 0;
  const statusUrls = [];
  const window = {
    HG_FORM_CONFIG: {
      ENDPOINT: expectedEndpoint,
      NOTIFY_EMAIL: "hengo1125.tw@gmail.com",
      LINE_URL: "https://line.me/R/ti/p/@749ivaeq",
      STATUS_TIMEOUT_MS: 30,
      STATUS_REQUEST_TIMEOUT_MS: 5,
      STATUS_FAST_PHASE_MS: 10,
      STATUS_FAST_POLL_INTERVAL_MS: 1,
      STATUS_SLOW_POLL_INTERVAL_MS: 2,
      ...configOverrides
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
        statusUrls.push(url);
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
    navigator: { userAgent: "Stage2 test", language: "zh-TW", onLine: online },
    Intl,
    URLSearchParams,
    URL,
    fetch,
    Date,
    Math
  });
  return {
    client: window.HGFormClient,
    statusUrls,
    getStatusCount: () => statusIndex
  };
};

let postedPayload;
let postCount = 0;
const successHarness = loadClient({
  fetch: async (_url, options) => { postedPayload = JSON.parse(options.body); return {}; },
  statuses: [
    { ok: false, state: "processing", requestId: "", message: "" },
    { ok: true, state: "saved", requestId: "HG-TEST-1", message: "" }
  ]
});
const progressStates = [];
const saved = JSON.parse(JSON.stringify(await successHarness.client.submit(
  { formType: "general" },
  { onStatus: status => progressStates.push(status.state) }
)));
assert.equal(saved.ok, true, JSON.stringify(saved));
assert.equal(saved.state, "saved");
assert.equal(saved.requestId, "HG-TEST-1");
assert.equal(postedPayload.requestToken, "12345678-1234-4234-8234-123456789abc");
assert.match(saved.message, /HG-TEST-1/);
assert.deepEqual(progressStates, ["processing", "processing"]);
assert.equal(successHarness.statusUrls.length, 2, "Polling must stop immediately after saved");
for (const url of successHarness.statusUrls) {
  assert.equal(url.searchParams.get("requestToken"), postedPayload.requestToken, "POST and status tokens must match");
  assert.ok(url.searchParams.get("_ts"), "Status URL must include _ts cache busting");
}

const delayedPostHarness = loadClient({
  fetch: () => { postCount += 1; return new Promise(() => {}); },
  statuses: [
    { ok: false, state: "pending", requestId: "", message: "" },
    { ok: false, state: "not_found", requestId: "", message: "" },
    { ok: true, state: "saved", requestId: "HG-DELAYED-1", message: "" }
  ]
});
const delayedProgress = [];
const delayedSaved = await delayedPostHarness.client.submit({}, {
  onStatus: status => delayedProgress.push(status.state)
});
assert.equal(delayedSaved.ok, true, JSON.stringify(delayedSaved));
assert.equal(delayedSaved.requestId, "HG-DELAYED-1");
assert.equal(postCount, 1, "A delayed POST must never be retried");
assert.deepEqual(delayedProgress, ["processing", "pending", "not_found"]);
assert.equal(delayedPostHarness.statusUrls.length, 3, "Saved must stop further polling");

const rejected = await loadClient({
  fetch: async () => ({}),
  statuses: [{ ok: false, state: "error", requestId: "", message: "測試拒絕" }]
}).client.submit({});
assert.equal(rejected.ok, false);
assert.equal(rejected.code, "write_error");

const timeoutHarness = loadClient({
  fetch: async () => ({}),
  statuses: [{ ok: false, state: "pending", requestId: "", message: "" }],
  configOverrides: { STATUS_TIMEOUT_MS: 12, STATUS_FAST_PHASE_MS: 4 }
});
const timeoutProgress = [];
const timedOutStatus = await timeoutHarness.client.submit({}, {
  onStatus: status => timeoutProgress.push(status.state)
});
assert.equal(timedOutStatus.code, "status_timeout");
assert.ok(timeoutProgress.length > 1, "Pending must continue polling before timeout");
assert.match(timedOutStatus.message, /可能仍在處理.*請勿重複送出.*送出時間與聯絡資料/);

const offline = await loadClient({
  fetch: async () => { throw new TypeError("offline"); },
  online: false
}).client.submit({});
assert.equal(offline.code, "network_error");
assert.match(offline.message, /離線/);

const invalidSaved = await loadClient({
  fetch: async () => ({}),
  statuses: [{ ok: true, state: "saved", requestId: "", message: "" }],
  configOverrides: { STATUS_TIMEOUT_MS: 8 }
}).client.submit({});
assert.equal(invalidSaved.code, "status_timeout", "Saved without requestId must not be accepted");

assert.match(successHarness.client.gmailUrl("subject", "body"), /^https:\/\/mail\.google\.com\/mail\//);
assert.equal(successHarness.client.lineUrl(), "https://line.me/R/ti/p/@749ivaeq");

console.log("Stage 2 form checks passed");
