/**
 * PR #7 Stage 2 表單營運強化模組（尚未部署）。
 *
 * 此檔不含 Spreadsheet ID、Endpoint 或憑證。正式整合時由既有 doPost/doGet
 * 將已驗證 payload 與既有 Sheet/Gmail adapter 傳入。所有寫入冪等判斷必須
 * 位於同一個 ScriptLock 臨界區，Gmail 必須在解鎖後執行。
 */
var PR7_UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
var PR7_FINAL_STATUSES = ["received", "processing", "saved", "notification_sent", "notification_error", "error"];
var PR7_OPERATIONAL_HEADERS = [
  "request_token", "received_at", "processing_started_at", "saved_at",
  "notification_sent_at", "completed_at", "processing_duration_ms",
  "notification_duration_ms", "total_duration_ms", "final_status", "error_code",
  "error_message", "lead_status", "owner", "next_action", "next_action_date",
  "contacted_at", "is_test", "excluded_from_pipeline", "duplicate_of",
  "notification_status", "processing_health", "internal_note"
];

function pr7ValidateRequestToken_(token) {
  var value = String(token || "").trim();
  if (!value) return { ok: false, code: "REQUEST_TOKEN_REQUIRED" };
  if (!PR7_UUID_RE.test(value)) return { ok: false, code: "REQUEST_TOKEN_INVALID" };
  return { ok: true, value: value.toLowerCase() };
}

function pr7ProcessingHealth_(durationMs) {
  var seconds = Number(durationMs) / 1000;
  if (seconds <= 15) return "normal";
  if (seconds <= 30) return "slow";
  if (seconds <= 60) return "observe";
  return "abnormal";
}

function pr7OperationalDefaults_(payload) {
  var isTest = payload && payload.is_test === true;
  return {
    lead_status: isTest ? "系統測試" : "新進需求",
    owner: "", next_action: "", next_action_date: "", contacted_at: "",
    is_test: isTest,
    excluded_from_pipeline: isTest,
    duplicate_of: "", notification_status: "pending", internal_note: ""
  };
}

/**
 * deps contract:
 * now(), withLock(timeoutMs, callback), findByToken(token), findByRequestId(id),
 * createRequestId(), appendRequest(payload, operations), updateRequest(id, patch),
 * putStatus(token, status), sendNotification(requestId, payload).
 */
function pr7ProcessSubmission_(deps, payload) {
  var tokenResult = pr7ValidateRequestToken_(payload && payload.requestToken);
  if (!tokenResult.ok) return { ok: false, state: "error", code: tokenResult.code };
  var token = tokenResult.value;
  var receivedAt = deps.now();
  deps.putStatus(token, { ok: false, state: "received", requestId: "" });

  var lockedResult;
  try {
    lockedResult = deps.withLock(10000, function () {
      var existing = deps.findByToken(token);
      if (existing) {
        if (existing.requestId) {
          deps.putStatus(token, { ok: true, state: "saved", requestId: existing.requestId, duplicate: true });
          return { duplicate: true, requestId: existing.requestId };
        }
        return { error: true, code: "REQUEST_ALREADY_PROCESSING" };
      }

      var processingAt = deps.now();
      deps.putStatus(token, { ok: false, state: "processing", requestId: "" });
      var requestId = deps.createRequestId();
      if (!requestId || deps.findByRequestId(requestId)) return { error: true, code: "REQUEST_ID_CONFLICT" };
      var defaults = pr7OperationalDefaults_(payload);
      var operations = Object.assign({}, defaults, {
        request_token: token,
        received_at: receivedAt,
        processing_started_at: processingAt,
        final_status: "processing"
      });
      try {
        deps.appendRequest(payload, operations, requestId);
      } catch (error) {
        return { error: true, code: "SHEET_WRITE_FAILED", message: "需求資料未完成儲存" };
      }
      var savedAt = deps.now();
      var processingMs = savedAt - processingAt;
      deps.updateRequest(requestId, {
        saved_at: savedAt,
        processing_duration_ms: processingMs,
        processing_health: pr7ProcessingHealth_(processingMs),
        final_status: "saved"
      });
      deps.putStatus(token, { ok: true, state: "saved", requestId: requestId });
      return { duplicate: false, requestId: requestId, savedAt: savedAt };
    });
  } catch (error) {
    var lockError = { ok: false, state: "error", code: "LOCK_TIMEOUT", message: "系統忙碌，未建立需求資料" };
    deps.putStatus(token, lockError);
    return lockError;
  }

  if (lockedResult.error) {
    var failed = { ok: false, state: "error", code: lockedResult.code, message: lockedResult.message || "需求未完成處理" };
    deps.putStatus(token, failed);
    return failed;
  }
  if (lockedResult.duplicate) {
    return { ok: true, state: "already_saved", duplicate: true, requestId: lockedResult.requestId };
  }

  var notificationStartedAt = deps.now();
  try {
    deps.sendNotification(lockedResult.requestId, payload);
    var notificationSentAt = deps.now();
    deps.updateRequest(lockedResult.requestId, {
      notification_sent_at: notificationSentAt,
      completed_at: notificationSentAt,
      notification_duration_ms: notificationSentAt - notificationStartedAt,
      total_duration_ms: notificationSentAt - receivedAt,
      notification_status: "sent",
      final_status: "notification_sent"
    });
  } catch (error) {
    var failedAt = deps.now();
    deps.updateRequest(lockedResult.requestId, {
      completed_at: failedAt,
      notification_duration_ms: failedAt - notificationStartedAt,
      total_duration_ms: failedAt - receivedAt,
      notification_status: "error",
      final_status: "notification_error",
      error_code: "NOTIFICATION_FAILED",
      error_message: "通知寄送失敗"
    });
  }
  return { ok: true, state: "saved", requestId: lockedResult.requestId };
}

function pr7SafeStatusResponse_(status) {
  return {
    ok: status && status.ok === true,
    state: String(status && status.state || "not_found"),
    requestId: String(status && status.requestId || ""),
    message: String(status && status.message || ""),
    duplicate: status && status.duplicate === true
  };
}

function pr7JsonpCallbackIsValid_(name) {
  return /^[A-Za-z_$][0-9A-Za-z_$\.\[\]]{0,127}$/.test(String(name || ""));
}

/** 可安全重複執行；只在最右側新增缺少欄位，不重排、不覆寫既有欄。 */
function migrateStage2FormOperationsPr7(sheet) {
  var lastColumn = Math.max(sheet.getLastColumn(), 1);
  var existing = sheet.getRange(1, 1, 1, lastColumn).getDisplayValues()[0].map(String);
  var missing = PR7_OPERATIONAL_HEADERS.filter(function (header) { return existing.indexOf(header) === -1; });
  if (missing.length) sheet.getRange(1, lastColumn + 1, 1, missing.length).setValues([missing]);
  return { added: missing, unchanged: PR7_OPERATIONAL_HEADERS.length - missing.length };
}

/** 唯讀 audit；不刪除、不寄信、不修改任何資料。 */
function auditStage2FormOperationsPr7(rows, notificationRecords) {
  var tokenToIds = {};
  var tokenCounts = {};
  var idCounts = {};
  var findings = [];
  (rows || []).forEach(function (row, index) {
    var number = index + 2;
    var token = String(row.request_token || "");
    var id = String(row.requestId || row.request_id || "");
    if (token) {
      (tokenToIds[token] = tokenToIds[token] || {})[id] = true;
      tokenCounts[token] = (tokenCounts[token] || 0) + 1;
    }
    if (id) idCounts[id] = (idCounts[id] || 0) + 1;
    if (row.final_status === "saved" && !id) findings.push({ row: number, code: "SAVED_WITHOUT_REQUEST_ID" });
    if (row.final_status && PR7_FINAL_STATUSES.indexOf(row.final_status) === -1) findings.push({ row: number, code: "INVALID_FINAL_STATUS" });
    if (row.notification_status && row.notification_status !== "sent") findings.push({ row: number, code: "NOTIFICATION_NOT_SENT" });
    if (row.final_status === "processing" && Number(row.processing_duration_ms) > 60000) findings.push({ row: number, code: "PROCESSING_OVER_60S" });
    if (row.is_test === true && row.excluded_from_pipeline !== true) findings.push({ row: number, code: "TEST_IN_PIPELINE" });
    if (!row.source) findings.push({ row: number, code: "SOURCE_MISSING" });
    if (!row.email && !row.phone) findings.push({ row: number, code: "CONTACT_MISSING" });
    if (!row.note) findings.push({ row: number, code: "NOTE_MISSING" });
  });
  Object.keys(tokenToIds).forEach(function (token) {
    var ids = Object.keys(tokenToIds[token]).filter(Boolean);
    if (tokenCounts[token] > 1) findings.push({ code: "DUPLICATE_REQUEST_TOKEN", request_token: token, count: tokenCounts[token] });
    if (ids.length > 1) findings.push({ code: "TOKEN_MULTIPLE_REQUEST_IDS", request_token: token });
  });
  Object.keys(idCounts).forEach(function (id) {
    if (idCounts[id] > 1) findings.push({ code: "DUPLICATE_REQUEST_ID", requestId: id, count: idCounts[id] });
  });
  (notificationRecords || []).forEach(function (record) {
    var id = String(record.requestId || "");
    if (id && !idCounts[id]) findings.push({ code: "NOTIFICATION_WITHOUT_SHEET_ROW", requestId: id });
  });
  return { ok: findings.length === 0, rowCount: (rows || []).length, findings: findings };
}
