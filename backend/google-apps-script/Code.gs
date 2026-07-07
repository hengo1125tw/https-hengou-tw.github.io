/************************************************
 * SPRINT 4D NOTE
 * Frontend uses fetch(mode: 'no-cors') for Google Apps Script Web App compatibility.
 * API response is optimistic on frontend; check CRM/API Logs for final records.
 ************************************************/

/************************************************
 * HengGou AI Platform｜Lead API
 * Version: v0.5.0-sprint4B
 ************************************************/

const HG_CONFIG = {
  API_KEY: 'CHANGE_ME_TO_A_LONG_RANDOM_KEY',
  SPREADSHEET_ID: '',
  NOTIFY_EMAIL: 'hengo1125.tw@gmail.com',
  TELEGRAM_BOT_TOKEN: '',
  TELEGRAM_CHAT_ID: '',
  ALLOWED_ORIGINS: [
    'https://hengo1125tw.github.io',
    'https://hengo1125tw.github.io/https-hengou-tw.github.io'
  ],
  SHEETS: {
    LEADS: 'Leads',
    LOGS: 'API Logs',
    CONFIG: 'Config',
    DASHBOARD: 'Dashboard'
  }
};

function doPost(e) {
  const startedAt = new Date();

  try {
    const payload = parsePayload_(e);
    validateApiKey_(e, payload);
    validateLead_(payload);

    const ss = getSpreadsheet_();
    ensureSheets_(ss);
    seedConfigSheet_(ss);
    applyLeadDataValidation_(ss);

    const leadId = createLeadId_(ss);
    const now = new Date();
    const row = buildLeadRow_(leadId, now, payload);

    ss.getSheetByName(HG_CONFIG.SHEETS.LEADS).appendRow(row);

    sendEmailNotification_(leadId, payload);
    sendTelegramNotification_(leadId, payload);

    logApi_(ss, {
      status: 'success',
      leadId: leadId,
      message: 'Lead created',
      payload: payload,
      startedAt: startedAt
    });

    return json_({
      ok: true,
      leadId: leadId,
      message: '申請已送出，我們會盡快與您聯絡。'
    });
  } catch (error) {
    const ss = safeGetSpreadsheet_();

    if (ss) {
      logApi_(ss, {
        status: 'error',
        leadId: '',
        message: error.message,
        payload: {},
        startedAt: startedAt
      });
    }

    return json_({
      ok: false,
      message: error.message || '系統錯誤，請稍後再試。'
    });
  }
}

function doGet(e) {
  const action = e && e.parameter ? e.parameter.action : '';

  if (action === 'listLeads') {
    validateApiKeyGet_(e);
    return json_({
      ok: true,
      leads: listLeads_()
    });
  }

  if (action === 'listLogs') {
    validateApiKeyGet_(e);
    return json_({
      ok: true,
      logs: listLogs_()
    });
  }

  if (action === 'updateLeadStatus') {
    validateApiKeyGet_(e);
    return json_(updateLeadStatus_(e.parameter.leadId, e.parameter.status));
  }

  if (action === 'updateLeadFollowUp') {
    validateApiKeyGet_(e);
    return json_(updateLeadFollowUp_(e.parameter.leadId, e.parameter.followUp, e.parameter.note));
  }

  return json_({
    ok: true,
    service: 'HengGou AI Platform Lead API',
    version: 'v0.8.0'
  });
}

function validateApiKeyGet_(e) {
  const keyFromParameter = e && e.parameter ? (e.parameter.api_key || '') : '';

  if (!HG_CONFIG.API_KEY || HG_CONFIG.API_KEY === 'CHANGE_ME_TO_A_LONG_RANDOM_KEY') {
    throw new Error('後端 API_KEY 尚未設定');
  }

  if (keyFromParameter !== HG_CONFIG.API_KEY) {
    throw new Error('API Key 驗證失敗');
  }
}

function listLeads_() {
  const ss = getSpreadsheet_();
  ensureSheets_(ss);

  const sheet = ss.getSheetByName(HG_CONFIG.SHEETS.LEADS);
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();

  if (lastRow <= 1) return [];

  const values = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();

  return values.slice(-50).reverse().map(row => ({
    leadId: row[0],
    createdAt: row[1],
    source: row[2],
    company: row[3],
    name: row[4],
    email: row[5],
    line: row[6],
    needs: row[7],
    note: row[8],
    status: row[16],
    owner: row[17],
    followUp: row[18]
  }));
}

function parsePayload_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error('缺少 POST body');
  }

  try {
    return JSON.parse(e.postData.contents);
  } catch (error) {
    throw new Error('JSON 格式錯誤');
  }
}

function validateApiKey_(e, payload) {
  const keyFromPayload = payload.apiKey || '';
  const keyFromParameter = e && e.parameter ? (e.parameter.api_key || '') : '';

  if (!HG_CONFIG.API_KEY || HG_CONFIG.API_KEY === 'CHANGE_ME_TO_A_LONG_RANDOM_KEY') {
    throw new Error('後端 API_KEY 尚未設定');
  }

  if (keyFromPayload !== HG_CONFIG.API_KEY && keyFromParameter !== HG_CONFIG.API_KEY) {
    throw new Error('API Key 驗證失敗');
  }
}

function validateLead_(payload) {
  if (payload.honeypot) {
    throw new Error('Spam request ignored');
  }

  if (!payload.company) throw new Error('請填寫公司名稱');
  if (!payload.name) throw new Error('請填寫姓名');
  if (!payload.email) throw new Error('請填寫 Email');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(payload.email))) {
    throw new Error('Email 格式不正確');
  }
  if (!payload.needs) throw new Error('請選擇想導入的 AI 功能');
}

function getSpreadsheet_() {
  if (HG_CONFIG.SPREADSHEET_ID) {
    return SpreadsheetApp.openById(HG_CONFIG.SPREADSHEET_ID);
  }

  const props = PropertiesService.getScriptProperties();
  const existingId = props.getProperty('HG_SPREADSHEET_ID');

  if (existingId) {
    return SpreadsheetApp.openById(existingId);
  }

  const ss = SpreadsheetApp.create('HengGou AI Platform｜CRM');
  props.setProperty('HG_SPREADSHEET_ID', ss.getId());
  ensureSheets_(ss);
  return ss;
}

function safeGetSpreadsheet_() {
  try {
    return getSpreadsheet_();
  } catch (error) {
    return null;
  }
}

function ensureSheets_(ss) {
  ensureSheet_(ss, HG_CONFIG.SHEETS.LEADS, [
    'Lead ID',
    '建立時間',
    '來源',
    '公司名稱',
    '姓名',
    'Email',
    'LINE ID',
    'AI 需求',
    '備註',
    'UTM Source',
    'UTM Medium',
    'UTM Campaign',
    'Referrer',
    'Landing Page',
    'Device',
    'User Agent',
    '狀態',
    '負責人',
    'Follow Up',
    '內部備註'
  ]);

  ensureSheet_(ss, HG_CONFIG.SHEETS.LOGS, [
    '時間',
    '狀態',
    'Lead ID',
    '訊息',
    '耗時 ms',
    'Payload'
  ]);

  ensureSheet_(ss, HG_CONFIG.SHEETS.CONFIG, [
    'Key',
    'Value',
    'Note'
  ]);

  ensureSheet_(ss, HG_CONFIG.SHEETS.DASHBOARD, [
    'Metric',
    'Value'
  ]);
}

function ensureSheet_(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight('bold')
      .setBackground('#111827')
      .setFontColor('#ffffff');
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, headers.length);
  }

  return sheet;
}

function createLeadId_(ss) {
  const sheet = ss.getSheetByName(HG_CONFIG.SHEETS.LEADS);
  const today = Utilities.formatDate(new Date(), 'Asia/Taipei', 'yyyyMMdd');
  const prefix = 'HG-' + today + '-';
  const next = Math.max(sheet.getLastRow(), 1);
  return prefix + String(next).padStart(4, '0');
}

function buildLeadRow_(leadId, now, payload) {
  const tracking = payload.tracking || {};

  return [
    leadId,
    now,
    payload.source || 'website',
    sanitize_(payload.company),
    sanitize_(payload.name),
    sanitize_(payload.email),
    sanitize_(payload.line),
    sanitize_(payload.needs),
    sanitize_(payload.note),
    sanitize_(tracking.utm_source),
    sanitize_(tracking.utm_medium),
    sanitize_(tracking.utm_campaign),
    sanitize_(tracking.referrer),
    sanitize_(tracking.landing_page),
    sanitize_(tracking.device),
    sanitize_(tracking.user_agent),
    '未聯絡',
    '',
    '',
    ''
  ];
}

function sanitize_(value) {
  return String(value || '')
    .replace(/<[^>]*>/g, '')
    .replace(/[\\r\\n]+/g, ' ')
    .trim();
}

function sendEmailNotification_(leadId, payload) {
  if (!HG_CONFIG.NOTIFY_EMAIL) return;

  const subject = '【新 Lead】' + leadId + '｜' + payload.company;
  const body =
    '收到新的 HengGou AI Platform Lead：\\n\\n' +
    'Lead ID：' + leadId + '\\n' +
    '公司：' + payload.company + '\\n' +
    '姓名：' + payload.name + '\\n' +
    'Email：' + payload.email + '\\n' +
    'LINE：' + (payload.line || '') + '\\n' +
    '需求：' + payload.needs + '\\n\\n' +
    '備註：\\n' + (payload.note || '');

  GmailApp.sendEmail(HG_CONFIG.NOTIFY_EMAIL, subject, body);
}

function sendTelegramNotification_(leadId, payload) {
  if (!HG_CONFIG.TELEGRAM_BOT_TOKEN || !HG_CONFIG.TELEGRAM_CHAT_ID) return;

  const text =
    '🔔 新 Lead\\n\\n' +
    'Lead ID：' + leadId + '\\n' +
    '公司：' + payload.company + '\\n' +
    '姓名：' + payload.name + '\\n' +
    'Email：' + payload.email + '\\n' +
    '需求：' + payload.needs;

  UrlFetchApp.fetch(
    'https://api.telegram.org/bot' + HG_CONFIG.TELEGRAM_BOT_TOKEN + '/sendMessage',
    {
      method: 'post',
      payload: {
        chat_id: HG_CONFIG.TELEGRAM_CHAT_ID,
        text: text
      },
      muteHttpExceptions: true
    }
  );
}

function logApi_(ss, data) {
  const sheet = ss.getSheetByName(HG_CONFIG.SHEETS.LOGS) || ensureSheet_(ss, HG_CONFIG.SHEETS.LOGS, [
    '時間',
    '狀態',
    'Lead ID',
    '訊息',
    '耗時 ms',
    'Payload'
  ]);

  sheet.appendRow([
    new Date(),
    data.status,
    data.leadId,
    data.message,
    new Date().getTime() - data.startedAt.getTime(),
    JSON.stringify(data.payload || {})
  ]);
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}


/************************************************
 * SETUP / CRM DASHBOARD
 ************************************************/

function setupHengGouCRM() {
  const ss = getSpreadsheet_();
  ensureSheets_(ss);
  seedConfigSheet_(ss);
  refreshDashboard_();
  return {
    ok: true,
    spreadsheetUrl: ss.getUrl()
  };
}

function refreshDashboard_() {
  const ss = getSpreadsheet_();
  ensureSheets_(ss);

  const leads = ss.getSheetByName(HG_CONFIG.SHEETS.LEADS);
  const dashboard = ss.getSheetByName(HG_CONFIG.SHEETS.DASHBOARD);
  dashboard.clear();

  const lastRow = leads.getLastRow();
  const data = lastRow > 1 ? leads.getRange(2, 1, lastRow - 1, leads.getLastColumn()).getValues() : [];

  const total = data.length;
  const statusCol = 16;
  const needCol = 7;
  const sourceCol = 2;

  const statusCount = {};
  const needCount = {};
  const sourceCount = {};

  data.forEach(row => {
    const status = row[statusCol] || '未聯絡';
    const need = row[needCol] || '未分類';
    const source = row[sourceCol] || 'unknown';
    statusCount[status] = (statusCount[status] || 0) + 1;
    needCount[need] = (needCount[need] || 0) + 1;
    sourceCount[source] = (sourceCount[source] || 0) + 1;
  });

  const rows = [
    ['Metric', 'Value'],
    ['Total Leads', total],
    ['Last Updated', new Date()],
    ['', ''],
    ['Status', 'Count']
  ];

  Object.keys(statusCount).forEach(key => rows.push([key, statusCount[key]]));
  rows.push(['', '']);
  rows.push(['Needs', 'Count']);
  Object.keys(needCount).forEach(key => rows.push([key, needCount[key]]));
  rows.push(['', '']);
  rows.push(['Source', 'Count']);
  Object.keys(sourceCount).forEach(key => rows.push([key, sourceCount[key]]));

  dashboard.getRange(1, 1, rows.length, 2).setValues(rows);
  dashboard.getRange(1, 1, 1, 2).setFontWeight('bold').setBackground('#111827').setFontColor('#ffffff');
  dashboard.autoResizeColumns(1, 2);
}

function seedConfigSheet_(ss) {
  const sheet = ss.getSheetByName(HG_CONFIG.SHEETS.CONFIG);
  if (!sheet) return;

  if (sheet.getLastRow() > 1) return;

  const rows = [
    ['API_KEY', HG_CONFIG.API_KEY, '前端 js/config.js 需填入同一組 API_KEY'],
    ['NOTIFY_EMAIL', HG_CONFIG.NOTIFY_EMAIL, 'Lead 通知收件信箱'],
    ['TELEGRAM_ENABLED', HG_CONFIG.TELEGRAM_BOT_TOKEN && HG_CONFIG.TELEGRAM_CHAT_ID ? 'YES' : 'NO', 'Telegram 是否已設定'],
    ['DEFAULT_STATUS', '未聯絡', '新 Lead 預設狀態']
  ];

  sheet.getRange(2, 1, rows.length, 3).setValues(rows);
  sheet.autoResizeColumns(1, 3);
}

function applyLeadDataValidation_(ss) {
  const sheet = ss.getSheetByName(HG_CONFIG.SHEETS.LEADS);
  if (!sheet) return;

  const statusColumn = 17;
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['未聯絡', '已聯絡', '評估中', '已報價', '已成交', '暫不合作'], true)
    .setAllowInvalid(false)
    .build();

  sheet.getRange(2, statusColumn, 1000, 1).setDataValidation(rule);
}


function listLogs_() {
  const ss = getSpreadsheet_();
  ensureSheets_(ss);
  const sheet = ss.getSheetByName(HG_CONFIG.SHEETS.LOGS);
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow <= 1) return [];
  const values = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
  return values.slice(-50).reverse().map(row => ({
    time: row[0],
    status: row[1],
    leadId: row[2],
    message: row[3],
    durationMs: row[4]
  }));
}

function updateLeadStatus_(leadId, status) {
  if (!leadId) return { ok: false, message: '缺少 Lead ID' };
  const allowed = ['未聯絡', '已聯絡', '評估中', '已報價', '已成交', '暫不合作'];
  if (allowed.indexOf(status) === -1) return { ok: false, message: '狀態不合法' };

  const ss = getSpreadsheet_();
  ensureSheets_(ss);
  const sheet = ss.getSheetByName(HG_CONFIG.SHEETS.LEADS);
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return { ok: false, message: '尚無 Lead 資料' };

  const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat();
  const index = ids.indexOf(leadId);
  if (index === -1) return { ok: false, message: '找不到 Lead ID：' + leadId };

  const rowNumber = index + 2;
  const statusColumn = 17;
  sheet.getRange(rowNumber, statusColumn).setValue(status);
  refreshDashboard_();

  return { ok: true, message: '狀態已更新', leadId: leadId, status: status };
}


function updateLeadFollowUp_(leadId, followUp, note) {
  if (!leadId) return { ok: false, message: '缺少 Lead ID' };

  const ss = getSpreadsheet_();
  ensureSheets_(ss);
  const sheet = ss.getSheetByName(HG_CONFIG.SHEETS.LEADS);
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return { ok: false, message: '尚無 Lead 資料' };

  const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat();
  const index = ids.indexOf(leadId);
  if (index === -1) return { ok: false, message: '找不到 Lead ID：' + leadId };

  const rowNumber = index + 2;
  const followUpColumn = 19;
  const noteColumn = 20;

  sheet.getRange(rowNumber, followUpColumn).setValue(followUp || '');
  sheet.getRange(rowNumber, noteColumn).setValue(sanitize_(note || ''));

  refreshDashboard_();

  return {
    ok: true,
    message: 'Follow-up 已更新',
    leadId: leadId
  };
}
