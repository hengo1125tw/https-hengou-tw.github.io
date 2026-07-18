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
assert.match(client, /mode:\s*"cors"/, "Client must be able to inspect the Apps Script response");
assert.match(client, /result\?\.ok !== true/, "Client must reject non-success backend responses");
assert.match(client, /invalid_response/, "Client must reject malformed responses");
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
assert.match(homeForm, /if \(response\.ok\) \{[\s\S]*form\.reset\(\)[\s\S]*showMessage\(response\.message, "success"\)/, "Home success must require a successful Apps Script response");
assert.match(gpuForm, /if \(response\.ok\) \{[\s\S]*form\.reset\(\)[\s\S]*showToast\(response\.message\)/, "GPU success must require a successful Apps Script response");
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

const loadClient = fetch => {
  const window = {
    HG_FORM_CONFIG: {
      ENDPOINT: expectedEndpoint,
      NOTIFY_EMAIL: "hengo1125.tw@gmail.com",
      LINE_URL: "https://line.me/R/ti/p/@749ivaeq",
      REQUEST_TIMEOUT_MS: 5
    },
    location: { search: "", href: "https://example.test/", assign() {} },
    setTimeout,
    clearTimeout,
    open() { return {}; }
  };
  vm.runInNewContext(client, {
    window,
    document: { referrer: "" },
    navigator: { userAgent: "Stage2 test", language: "zh-TW" },
    Intl,
    URLSearchParams,
    AbortController,
    fetch
  });
  return window.HGFormClient;
};

const successClient = loadClient(async () => ({
  ok: true,
  status: 200,
  async json() { return { ok: true, requestId: "HG-TEST-1", message: "測試成功" }; }
}));
assert.deepEqual(
  JSON.parse(JSON.stringify(await successClient.submit({ formType: "general" }))),
  { ok: true, requestId: "HG-TEST-1", message: "測試成功" },
  "Successful response handling failed"
);

const rejected = await loadClient(async () => ({
  ok: true,
  status: 200,
  async json() { return { ok: false, code: "rejected", message: "測試拒絕" }; }
})).submit({});
assert.equal(rejected.ok, false);
assert.equal(rejected.code, "rejected");

const malformed = await loadClient(async () => ({
  ok: true,
  status: 200,
  async json() { throw new Error("invalid JSON"); }
})).submit({});
assert.equal(malformed.code, "invalid_response");

const offline = await loadClient(async () => { throw new TypeError("offline"); }).submit({});
assert.equal(offline.code, "network_error");

const timedOut = await loadClient((_url, { signal }) => new Promise((_, reject) => {
  signal.addEventListener("abort", () => reject(Object.assign(new Error("timeout"), { name: "AbortError" })));
})).submit({});
assert.equal(timedOut.code, "timeout");

assert.match(successClient.gmailUrl("subject", "body"), /^https:\/\/mail\.google\.com\/mail\//);
assert.equal(successClient.lineUrl(), "https://line.me/R/ti/p/@749ivaeq");

console.log("Stage 2 form checks passed");
