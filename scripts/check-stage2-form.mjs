import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const home = read("index.html");
const gpu = read("gpu/index.html");
const config = read("js/form-config.js");
const client = read("js/form-client.js");
const homeForm = read("js/public-form.js");
const gpuForm = read("gpu/gpu.js");

assert.match(config, /ENDPOINT:\s*""/, "Endpoint must remain an empty replaceable setting");
assert.doesNotMatch(config, /script\.google\.com\/macros\/s\/[A-Za-z0-9_-]{10,}\/exec/, "No deployed Endpoint may be committed");
assert.match(home, /js\/form-config\.js[\s\S]*js\/form-client\.js[\s\S]*js\/public-form\.js/, "Home script order is invalid");
assert.match(gpu, /\.\.\/js\/form-config\.js[\s\S]*\.\.\/js\/form-client\.js[\s\S]*gpu\.js/, "GPU subpath script order is invalid");
assert.match(client, /mode:\s*"cors"/, "Client must be able to inspect the Apps Script response");
assert.match(client, /result\?\.ok !== true/, "Client must reject non-success backend responses");
assert.match(client, /invalid_response/, "Client must reject malformed responses");
assert.match(homeForm, /if \(submitting\) return/, "Home form must block duplicate submissions");
assert.match(gpuForm, /if \(!latestPayload \|\| submitting\) return/, "GPU form must block duplicate submissions");
assert.match(home, /leadGmailButton[\s\S]*leadCopyButton[\s\S]*leadLineButton/, "Home fallback actions are incomplete");
assert.match(gpu, /openEmailButton[\s\S]*copyRequestButton[\s\S]*line\.me/, "GPU fallback actions are incomplete");
assert.match(home, /name="email"[^>]*type="email"|type="email"[^>]*name="email"/, "Home email field must use type=email");
assert.match(gpu, /name="email"[^>]*type="email"|type="email"[^>]*name="email"/, "GPU email field must use type=email");
assert.equal((home.match(/id="leadForm"/g) || []).length, 1, "Home form must be unique");
assert.equal((gpu.match(/id="gpuRequestForm"/g) || []).length, 1, "GPU form must be unique");

console.log("Stage 2 form checks passed");
