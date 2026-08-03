import { createServer } from "node:http";
import { readFileSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = new URL("../../", import.meta.url);
const rootPath = fileURLToPath(root);
const operationsSource = readFileSync(new URL("../../backend/google-apps-script/PR7FormOperations.gs", import.meta.url), "utf8");
const mime = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".webmanifest": "application/manifest+json" };

export function createPr7Server() {
  const ops = { Object, String, Number, Math, Date, JSON, isFinite }; ops.globalThis = ops;
  vm.runInNewContext(operationsSource, ops);
  const state = { scenario: "normal", rows: [], statuses: new Map(), mails: [], posts: 0, polls: 0, pollingTs: [], pollByToken: new Map(), statusSequence: [], warnings: [], sequence: 0, timers: [] };
  const deps = {
    now: () => Date.now(),
    withLock(_timeout, callback) { return callback(); },
    findByToken: token => state.rows.find(row => row.operations.request_token === token) || null,
    findByRequestId: id => state.rows.find(row => row.requestId === id) || null,
    createRequestId: () => `HG-E2E-${String(++state.sequence).padStart(4, "0")}`,
    createNotificationClaimId: () => `claim-${state.sequence}`,
    appendRequest(payload, operations, requestId) { state.rows.push({ payload: structuredClone(payload), operations: { ...operations }, requestId }); },
    updateRequest(id, patch) { const row = state.rows.find(item => item.requestId === id); if (!row) throw new Error("missing row"); Object.assign(row.operations, patch); },
    putStatus(token, status) { if (state.scenario === "cache_saved_failure" && status.state === "saved") throw new Error("cache saved failure"); state.statuses.set(token, { ...status }); },
    getStatus: token => state.statuses.get(token) || null,
    recordWarning: warning => state.warnings.push({ ...warning }),
    sendNotification(id, payload, subject) { if (state.scenario === "gmail_error") throw new Error("gmail mock failure"); state.mails.push({ id, subject, payload: structuredClone(payload) }); }
  };
  const reset = scenario => { state.scenario = scenario || "normal"; state.rows.length = 0; state.statuses.clear(); state.mails.length = 0; state.posts = 0; state.polls = 0; state.pollingTs.length = 0; state.pollByToken.clear(); state.statusSequence.length = 0; state.warnings.length = 0; state.sequence = 0; state.timers.forEach(clearTimeout); state.timers.length = 0; };
  const json = (res, value, status = 200) => { res.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }); res.end(JSON.stringify(value)); };
  const server = createServer((req, res) => {
    const url = new URL(req.url, "http://127.0.0.1");
    if (url.pathname === "/__control/reset") { reset(url.searchParams.get("scenario")); return json(res, { ok: true }); }
    if (url.pathname === "/__evidence") return json(res, { scenario: state.scenario, rows: state.rows, mails: state.mails, posts: state.posts, polls: state.polls, pollingTs: state.pollingTs, statusSequence: state.statusSequence, warnings: state.warnings });
    if (url.pathname === "/apps-script/exec" && req.method === "POST") {
      state.posts += 1; let body = ""; req.on("data", chunk => { body += chunk; }); req.on("end", () => {
        const payload = JSON.parse(body || "{}"); payload.is_test = true; payload.excluded_from_pipeline = true; payload.lead_status = "系統測試"; const token = String(payload.requestToken || "").trim().toLowerCase();
        state.statuses.set(token, { ok: false, state: "processing" });
        if (state.scenario === "timeout") return json(res, { accepted: true });
        if (state.scenario === "confirmed_error") { state.statuses.set(token, { ok: false, state: "error", message: "controlled error" }); return json(res, { accepted: true }); }
        const timer = setTimeout(() => ops.pr7ProcessSubmission_(deps, payload), 260); state.timers.push(timer);
        json(res, { accepted: true });
      }); return;
    }
    if (url.pathname === "/apps-script/exec" && req.method === "GET") {
      state.polls += 1; state.pollingTs.push(url.searchParams.get("_ts"));
      const token = url.searchParams.get("requestToken") || ""; const callback = url.searchParams.get("prefix") || "";
      const canonical = String(token).trim().toLowerCase(); const tokenPolls = (state.pollByToken.get(canonical) || 0) + 1; state.pollByToken.set(canonical, tokenPolls);
      let status = tokenPolls === 1 && state.scenario === "normal" ? { ok: false, state: "not_found" } : ops.pr7ResolveStatus_(deps, token);
      if (state.scenario === "empty_request_id" && status.state === "saved") status = { ok: true, state: "saved", requestId: "" };
      state.statusSequence.push(status.state);
      const safeCallback = /^[A-Za-z_$][0-9A-Za-z_$]*$/.test(callback);
      if (!safeCallback) return json(res, { ok: false, code: "JSONP_CALLBACK_INVALID" }, 400);
      res.writeHead(200, { "content-type": "text/javascript; charset=utf-8", "cache-control": "no-store" }); res.end(`${callback}(${JSON.stringify(status)});`); return;
    }
    let pathname = decodeURIComponent(url.pathname);
    if (pathname === "/") pathname = "/index.html";
    if (pathname === "/gpu/") pathname = "/gpu/index.html";
    if (pathname === "/js/form-config.js") {
      res.writeHead(200, { "content-type": mime[".js"], "cache-control": "no-store" });
      res.end(`window.HG_FORM_CONFIG={ENDPOINT:"https://script.google.com/macros/s/PR7_LOCAL_EMULATOR/exec",NOTIFY_EMAIL:"test@example.invalid",STATUS_TIMEOUT_MS:1400,STATUS_REQUEST_TIMEOUT_MS:300,STATUS_FAST_PHASE_MS:700,STATUS_FAST_POLL_INTERVAL_MS:100,STATUS_SLOW_POLL_INTERVAL_MS:200};`); return;
    }
    const relative = normalize(pathname).replace(/^([/\\])+/, ""); const file = join(rootPath, relative);
    try { if (!statSync(file).isFile()) throw new Error("not file"); res.writeHead(200, { "content-type": mime[extname(file).toLowerCase()] || "application/octet-stream" }); res.end(readFileSync(file)); } catch { res.writeHead(404); res.end("not found"); }
  });
  return new Promise(resolve => server.listen(0, "127.0.0.1", () => resolve({ server, baseURL: `http://127.0.0.1:${server.address().port}`, state })));
}
