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

function pr7Boolean_(value) {
  if (value === true || value === 1) return true;
  if (value === false || value === 0 || value === null || value === undefined || value === "") return false;
  return String(value).trim().toLowerCase() === "true";
}

function pr7ErrorCode_(error, fallback) {
  return String(error && (error.code || error.message) || fallback).toUpperCase().replace(/[^A-Z0-9_]/g, "_");
}

function pr7TimestampMs_(value) {
  if (value instanceof Date) {
    var dateMs = value.getTime();
    return isFinite(dateMs) ? { ok: true, value: dateMs } : { ok: false, code: "TIMESTAMP_INVALID" };
  }
  if (typeof value === "number") return isFinite(value) ? { ok: true, value: value } : { ok: false, code: "TIMESTAMP_INVALID" };
  var text = String(value === null || value === undefined ? "" : value).trim();
  if (!text) return { ok: false, code: "TIMESTAMP_EMPTY" };
  var numeric = /^-?\d+(?:\.\d+)?$/.test(text) ? Number(text) : NaN;
  if (isFinite(numeric)) return { ok: true, value: numeric };
  var parsed = new Date(text).getTime();
  return isFinite(parsed) ? { ok: true, value: parsed } : { ok: false, code: "TIMESTAMP_INVALID" };
}

function pr7OperationalDefaults_(payload) {
  var isTest = pr7Boolean_(payload && payload.is_test);
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

  var lockedResult;
  try {
    lockedResult = deps.withLock(10000, function () {
      var existing;
      try { existing = deps.findByToken(token); }
      catch (error) { return { error: true, code: "SHEET_READ_FAILED", message: "無法查核既有需求" }; }
      if (existing) {
        if (existing.requestId) {
          var existingFinal = String(existing.operations && existing.operations.final_status || "");
          if (["saved", "notification_sent", "notification_error"].indexOf(existingFinal) === -1) {
            var recoveredAt = deps.now();
            var startedResult = pr7TimestampMs_(existing.operations && existing.operations.processing_started_at);
            var recoveredDuration = startedResult.ok ? Math.max(0, recoveredAt - startedResult.value) : 0;
            try {
              deps.updateRequest(existing.requestId, {
                saved_at: existing.operations && existing.operations.saved_at || recoveredAt,
                processing_duration_ms: recoveredDuration,
                processing_health: pr7ProcessingHealth_(recoveredDuration),
                final_status: "saved",
                error_code: startedResult.ok ? "" : startedResult.code,
                error_message: startedResult.ok ? "" : "processing_started_at 無法解析"
              });
            } catch (error) {
              return { error: true, state: "processing", code: "PARTIAL_WRITE_RECOVERY_FAILED", requestId: existing.requestId, message: "資料列已存在，等待人工或安全重試完成狀態修復" };
            }
          }
          var wasRecovered = existingFinal !== "saved" && existingFinal !== "notification_sent" && existingFinal !== "notification_error";
          var notificationStatus = String(existing.operations && existing.operations.notification_status || "pending").toLowerCase();
          var ownsNotification = false;
          if (notificationStatus === "pending") {
            try {
              deps.updateRequest(existing.requestId, { notification_status: "sending" });
              ownsNotification = true;
              notificationStatus = "sending";
            } catch (error) {
              return { error: true, state: "saved", code: "NOTIFICATION_OWNERSHIP_FAILED", requestId: existing.requestId, rowExists: true };
            }
          }
          var statusWriteFailed = false;
          try { deps.putStatus(token, { ok: true, state: "saved", requestId: existing.requestId, duplicate: !wasRecovered }); }
          catch (error) { statusWriteFailed = true; }
          return { duplicate: !wasRecovered && !ownsNotification, requestId: existing.requestId, recovered: wasRecovered, savedAt: deps.now(), ownsNotification: ownsNotification, notificationStatus: notificationStatus, statusWriteFailed: statusWriteFailed };
        }
        return { error: true, code: "REQUEST_ALREADY_PROCESSING" };
      }

      var processingAt = deps.now();
      try { deps.putStatus(token, { ok: false, state: "received", requestId: "" }); }
      catch (error) { return { error: true, code: "STATUS_WRITE_FAILED", message: "無法建立 received 狀態" }; }
      try { deps.putStatus(token, { ok: false, state: "processing", requestId: "" }); }
      catch (error) { return { error: true, code: "STATUS_WRITE_FAILED", message: "無法建立 processing 狀態" }; }
      var requestId = deps.createRequestId();
      try {
        if (!requestId || deps.findByRequestId(requestId)) return { error: true, code: "REQUEST_ID_CONFLICT" };
      } catch (error) { return { error: true, code: "SHEET_READ_FAILED", message: "無法查核需求編號" }; }
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
      try {
        deps.updateRequest(requestId, {
          saved_at: savedAt,
          processing_duration_ms: processingMs,
          processing_health: pr7ProcessingHealth_(processingMs),
          final_status: "saved"
        });
      } catch (error) {
        return { error: true, state: "processing", code: "PARTIAL_WRITE_PENDING", requestId: requestId, rowExists: true, message: "資料列已建立，等待安全重試完成狀態" };
      }
      try { deps.updateRequest(requestId, { notification_status: "sending" }); }
      catch (error) { return { error: true, state: "saved", code: "NOTIFICATION_OWNERSHIP_FAILED", requestId: requestId, rowExists: true }; }
      var savedStatusWriteFailed = false;
      try { deps.putStatus(token, { ok: true, state: "saved", requestId: requestId }); }
      catch (error) { savedStatusWriteFailed = true; }
      return { duplicate: false, requestId: requestId, savedAt: savedAt, ownsNotification: true, notificationStatus: "sending", statusWriteFailed: savedStatusWriteFailed };
    });
  } catch (error) {
    var caughtCode = pr7ErrorCode_(error, "LOCK_EXECUTION_FAILED");
    return { ok: false, state: "invocation_error", code: caughtCode === "LOCK_TIMEOUT" ? "LOCK_TIMEOUT" : "LOCK_EXECUTION_FAILED", invocationOnly: true, message: caughtCode === "LOCK_TIMEOUT" ? "系統忙碌，未取得處理鎖" : "鎖定區段執行失敗" };
  }

  if (lockedResult.error) {
    var failed = { ok: false, state: lockedResult.state || "error", code: lockedResult.code, message: lockedResult.message || "需求未完成處理" };
    if (lockedResult.requestId) failed.requestId = lockedResult.requestId;
    if (lockedResult.rowExists) failed.rowExists = true;
    try { deps.putStatus(token, failed); } catch (_) { failed.statusWriteFailed = true; }
    return failed;
  }
  if (lockedResult.duplicate) {
    return { ok: true, state: "already_saved", duplicate: true, requestId: lockedResult.requestId };
  }

  if (!lockedResult.ownsNotification) {
    return { ok: true, state: "saved", requestId: lockedResult.requestId, notification_status: lockedResult.notificationStatus || "pending", statusWriteFailed: lockedResult.statusWriteFailed === true };
  }

  var notificationStartedAt = deps.now();
  var notificationSentAt;
  try {
    deps.sendNotification(lockedResult.requestId, payload);
    notificationSentAt = deps.now();
  } catch (error) {
    var sendFailedAt = deps.now();
    try {
      deps.updateRequest(lockedResult.requestId, { completed_at: sendFailedAt, notification_duration_ms: sendFailedAt - notificationStartedAt, total_duration_ms: sendFailedAt - receivedAt, notification_status: "error", final_status: "notification_error", error_code: "NOTIFICATION_SEND_FAILED", error_message: "通知寄送失敗" });
    } catch (_) {
      return { ok: true, state: "saved", requestId: lockedResult.requestId, notification_status: "unknown_metadata_pending", recovery_code: "NOTIFICATION_ERROR_METADATA_UPDATE_FAILED" };
    }
    return { ok: true, state: "saved", requestId: lockedResult.requestId, notification_status: "error", recovery_code: "NOTIFICATION_SEND_FAILED" };
  }
  try {
    deps.updateRequest(lockedResult.requestId, {
      notification_sent_at: notificationSentAt,
      completed_at: notificationSentAt,
      notification_duration_ms: notificationSentAt - notificationStartedAt,
      total_duration_ms: notificationSentAt - receivedAt,
      notification_status: "sent",
      final_status: "notification_sent"
    });
  } catch (error) {
    var metadataRecorded = true;
    try {
      deps.updateRequest(lockedResult.requestId, { notification_status: "metadata_pending", final_status: "notification_sent", error_code: "NOTIFICATION_METADATA_UPDATE_FAILED", error_message: "Gmail 已寄出，通知 metadata 待人工補齊" });
    } catch (_) { metadataRecorded = false; }
    return { ok: true, state: "saved", requestId: lockedResult.requestId, notification_status: "metadata_pending", notification_delivery: "sent", metadataRecorded: metadataRecorded, recovery_code: "NOTIFICATION_METADATA_UPDATE_FAILED" };
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
  var lastColumn = Number(sheet.getLastColumn()) || 0;
  var existing = lastColumn ? sheet.getRange(1, 1, 1, lastColumn).getDisplayValues()[0].map(String) : [];
  var missing = PR7_OPERATIONAL_HEADERS.filter(function (header) { return existing.indexOf(header) === -1; });
  if (missing.length) sheet.getRange(1, lastColumn ? lastColumn + 1 : 1, 1, missing.length).setValues([missing]);
  return { added: missing, unchanged: PR7_OPERATIONAL_HEADERS.length - missing.length };
}

/** 唯讀 audit；不刪除、不寄信、不修改任何資料。 */
function auditStage2FormOperationsPr7(rows, notificationRecords, currentTimeMs) {
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
    var processingStarted = pr7TimestampMs_(row.processing_started_at);
    var auditNow = Number(currentTimeMs) || Date.now();
    if (row.final_status === "processing" && processingStarted.ok && auditNow - processingStarted.value > 60000) findings.push({ row: number, code: "PROCESSING_OVER_60S" });
    if (row.final_status === "processing" && !processingStarted.ok) findings.push({ row: number, code: processingStarted.code });
    if (pr7Boolean_(row.is_test) && !pr7Boolean_(row.excluded_from_pipeline)) findings.push({ row: number, code: "TEST_IN_PIPELINE" });
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
