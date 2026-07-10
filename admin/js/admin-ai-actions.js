// v1.2.0-rc.5
// Browser-bundled Admin AI Actions with immediate init and delegated click fallback.
// This file intentionally has no static imports so GitHub Pages cannot fail silently
// because of module dependency paths or browser-incompatible package imports.

const STORAGE_PREFIX = "henggou:admin:ai-actions:";
const DEFAULT_OUTPUT = "請選擇 Analyze Lead、Generate Proposal 或 Generate Gmail Draft。";

let activeLead = null;
let aiActionsInitialized = false;

function $(id) {
  return document.getElementById(id);
}

function getText(id) {
  return String($(id)?.textContent || "").trim();
}

function safeText(value, fallback = "-") {
  const text = String(value || "").trim();
  return text || fallback;
}

function leadKey(lead = activeLead) {
  const id = lead?.id || getText("drawerLeadId") || "manual";
  return `${STORAGE_PREFIX}${id}`;
}

function leadFromDrawer() {
  return activeLead || {
    id: getText("drawerLeadId"),
    company: getText("drawerCompany"),
    name: getText("drawerName"),
    email: getText("drawerEmail"),
    need: getText("drawerNeed"),
    status: getText("drawerStatus"),
    created: getText("drawerCreated"),
    followUp: $("followUpDate")?.value || "",
    note: $("internalNote")?.value || ""
  };
}

function saveState(state = {}) {
  try {
    localStorage.setItem(leadKey(), JSON.stringify({
      ...state,
      savedAt: new Date().toISOString()
    }));
  } catch (error) {
    console.warn("AI action state not saved", error);
  }
}

function loadState(lead = activeLead) {
  try {
    const raw = localStorage.getItem(leadKey(lead));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function clearState() {
  try {
    localStorage.removeItem(leadKey());
  } catch {}
}

function classifyBusinessUnit(lead = {}) {
  const text = `${lead.company || ""} ${lead.need || ""} ${lead.note || ""}`.toLowerCase();

  const rules = [
    {
      unit: "AOI 視覺檢測軟體",
      code: "AOI_SOFTWARE",
      product: "AOI 視覺檢測軟體",
      keywords: ["aoi", "視覺", "檢測", "瑕疵", "相機", "拍照", "影像", "判斷", "ok/ng"]
    },
    {
      unit: "AI Agent / 自動化",
      code: "AI_PLATFORM",
      product: "AI Agent / Workflow Automation",
      keywords: ["ai", "agent", "自動化", "workflow", "bot", "聊天", "客服", "line bot", "openrouter", "gpt"]
    },
    {
      unit: "網站 / 系統開發",
      code: "WEBSITE_SYSTEM",
      product: "網站 / 系統客製",
      keywords: ["網站", "官網", "web", "系統", "表單", "dashboard", "crm"]
    },
    {
      unit: "COSMO / 設備代理",
      code: "COSMO_EQUIPMENT",
      product: "COSMO 氣密測試設備 / 自動記錄軟體",
      keywords: ["cosmo", "氣密", "測漏", "leak", "ls-r902", "設備"]
    },
    {
      unit: "3D 列印 / ProtoFab",
      code: "PROTOFAB_3D",
      product: "3D 列印設計與代印",
      keywords: ["3d", "列印", "petg", "洞洞板", "相框", "治具", "stl"]
    },
    {
      unit: "物流 / 報關 / 集運",
      code: "LOGISTICS_CUSTOMS",
      product: "物流報關與集運協助",
      keywords: ["物流", "報關", "集運", "出口", "進口", "越南", "貨運"]
    },
    {
      unit: "包材 / 工業品",
      code: "PACKAGING_MATERIALS",
      product: "包材與工業品供應",
      keywords: ["包材", "紙箱", "膠膜", "棧板", "工具", "代購", "1688", "淘寶"]
    }
  ];

  let best = {
    unit: "其他 / 待分類",
    code: "OTHER",
    product: "待確認服務項目",
    score: 0
  };

  for (const rule of rules) {
    const score = rule.keywords.reduce((sum, keyword) => sum + (text.includes(keyword.toLowerCase()) ? 1 : 0), 0);
    if (score > best.score) best = { ...rule, score };
  }

  return best;
}

function analyzeLead(lead = {}) {
  const classification = classifyBusinessUnit(lead);
  const hasCompany = Boolean(String(lead.company || "").trim());
  const hasContact = Boolean(String(lead.name || "").trim());
  const hasEmail = Boolean(String(lead.email || "").trim());
  const hasNeed = Boolean(String(lead.need || "").trim());
  const hasTimeline = Boolean(String(lead.followUp || "").trim());
  const missingInfo = [];

  if (!hasNeed) missingInfo.push("需求內容 / 使用情境");
  if (!hasTimeline) missingInfo.push("導入時程 / 需求期限");
  if (!hasContact || !hasEmail) missingInfo.push("聯絡窗口資訊");
  missingInfo.push("預算範圍");
  missingInfo.push("交付範圍 / 驗收方式");

  let score = 35;
  if (hasCompany) score += 10;
  if (hasContact) score += 8;
  if (hasEmail) score += 8;
  if (hasNeed) score += 20;
  if (classification.score > 0) score += Math.min(15, classification.score * 5);
  if (hasTimeline) score += 8;
  score = Math.max(0, Math.min(100, score));

  const priority = score >= 75 ? "High" : score >= 55 ? "Medium" : "Low";
  const nextAction = missingInfo.length >= 3 ? "先補齊需求資訊，再安排需求訪談" : "安排需求訪談並整理初步提案";
  const status = score >= 60 ? "Qualified" : "Needs Info";
  const confidence = classification.score > 0 ? Math.min(95, 65 + classification.score * 10) : 45;

  return {
    status,
    priority,
    score,
    confidence,
    businessUnit: classification.unit,
    businessUnitCode: classification.code,
    product: classification.product,
    missingInfo,
    nextAction,
    pricingGuidance: "專案估價：先確認需求範圍、交付項目、時程、維護責任，再報價。",
    analyzedAt: new Date().toISOString()
  };
}

function renderProposal(lead = {}, analysis = analyzeLead(lead)) {
  const company = safeText(lead.company, "貴公司");
  const contact = safeText(lead.name, "窗口");
  const need = safeText(lead.need, "尚待確認");
  const followUp = safeText(lead.followUp, "待確認");

  return [
    `# ${analysis.product} 初步提案`,
    "",
    `## 一、客戶與需求`,
    `- 公司：${company}`,
    `- 聯絡人：${contact}`,
    `- 需求摘要：${need}`,
    `- 目前狀態：${safeText(lead.status, "待確認")}`,
    "",
    `## 二、建議方案`,
    `本案初步歸類為「${analysis.businessUnit}」。建議先以需求訪談確認實際流程、資料來源、交付範圍與驗收方式，再進入正式報價。`,
    "",
    `## 三、建議執行步驟`,
    `1. 確認現場流程、輸入資料、輸出格式與例外情境。`,
    `2. 建立 PoC 或最小可行流程，先驗證準確度與操作可行性。`,
    `3. 依測試結果整理正式報價、時程、維護與後續擴充項目。`,
    "",
    `## 四、需補充資訊`,
    ...(analysis.missingInfo || []).slice(0, 5).map(item => `- ${item}`),
    "",
    `## 五、Follow-up`,
    `- 建議追蹤日期：${followUp}`,
    `- 下一步：${analysis.nextAction}`,
    "",
    `> 本提案為初步草稿，正式價格、交期與保固條件需待需求確認後另行提供。`
  ].join("\n");
}

function renderMissingInfoEmail(lead = {}, analysis = analyzeLead(lead)) {
  const company = safeText(lead.company, "貴公司");
  const contact = safeText(lead.name, "您好");

  return [
    `To: ${safeText(lead.email, "(待填 Email)")}`,
    `Subject: 關於${analysis.product}需求資訊確認｜${company}`,
    "",
    `${contact}您好：`,
    "",
    `謝謝您提供需求資訊。我們已先初步整理，為了評估合適方案與後續報價，想再跟您確認幾項內容：`,
    "",
    ...(analysis.missingInfo || []).slice(0, 5).map((item, index) => `${index + 1}. ${item}`),
    "",
    `確認後，我們會再整理初步方案、建議導入方式與後續時程。`,
    "",
    `謝謝。`,
    "",
    `恒構企業社`
  ].join("\n");
}

function renderProposalEmail(lead = {}, analysis = analyzeLead(lead)) {
  const company = safeText(lead.company, "貴公司");
  const contact = safeText(lead.name, "您好");

  return [
    `To: ${safeText(lead.email, "(待填 Email)")}`,
    `Subject: ${analysis.product}初步提案｜${company}`,
    "",
    `${contact}您好：`,
    "",
    `依照目前資訊，我們先整理一版「${analysis.product}」初步方向給您參考。`,
    "",
    `本案建議先以需求確認與小範圍驗證為主，確認流程、資料格式、現場限制與驗收標準後，再進一步提供正式報價與交期。`,
    "",
    `目前建議下一步：${analysis.nextAction}`,
    "",
    `若方便，我們可以再約時間確認需求細節。`,
    "",
    `謝謝。`,
    "",
    `恒構企業社`
  ].join("\n");
}

function setSummary(summary = {}) {
  const mappings = {
    aiLeadPriority: summary.priority || "-",
    aiLeadScore: summary.score !== undefined ? String(summary.score) : "-",
    aiLeadBusinessUnit: summary.businessUnit || "-",
    aiLeadProduct: summary.product || "-",
    aiLeadNextAction: summary.nextAction || "-"
  };

  Object.entries(mappings).forEach(([id, value]) => {
    const el = $(id);
    if (el) el.textContent = value;
  });
}

function renderOutput(title, content, mode = "json", options = {}) {
  const output = $("aiActionOutput");
  const titleEl = $("aiActionTitle");
  const savedAtEl = $("aiActionSavedAt");
  if (!output) return;

  const text = mode === "text" ? String(content || "") : JSON.stringify(content, null, 2);

  if (titleEl) titleEl.textContent = title;
  output.textContent = text;

  const state = {
    title,
    content: text,
    mode,
    summary: options.summary || null
  };

  if (options.persist !== false) {
    saveState(state);
    if (savedAtEl) savedAtEl.textContent = `Saved: ${new Date().toLocaleString()}`;
  } else if (savedAtEl) {
    savedAtEl.textContent = `Saved: ${options.savedAt || "-"}`;
  }
}

function restoreLeadState(lead) {
  const state = loadState(lead);
  if (!state) {
    setSummary({});
    renderOutput("AI Actions", DEFAULT_OUTPUT, "text", { persist: false, savedAt: "-" });
    return;
  }

  if (state.summary) setSummary(state.summary);
  renderOutput(state.title || "AI Actions", state.content || DEFAULT_OUTPUT, "text", {
    persist: false,
    savedAt: state.savedAt ? new Date(state.savedAt).toLocaleString() : "-"
  });
}

async function copyOutput() {
  const text = $("aiActionOutput")?.textContent || "";
  try {
    await navigator.clipboard.writeText(text);
    alert("已複製 AI Actions 輸出。");
  } catch {
    const temp = document.createElement("textarea");
    temp.value = text;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand("copy");
    temp.remove();
    alert("已複製 AI Actions 輸出。");
  }
}

function downloadOutput(prefix = "henggou-ai-action") {
  const lead = leadFromDrawer();
  const text = $("aiActionOutput")?.textContent || "";
  const safeLeadId = String(lead?.id || "lead").replace(/[^\w-]+/g, "_");
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${prefix}-${safeLeadId}-${new Date().toISOString().slice(0, 10)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

function clearOutput() {
  clearState();
  setSummary({});
  renderOutput("AI Actions", DEFAULT_OUTPUT, "text", { persist: false, savedAt: "-" });
}

function runAction(actionName, runner) {
  try {
    const lead = leadFromDrawer();
    if (!lead.id || lead.id === "Lead") {
      renderOutput("AI Actions Error", "請先開啟一筆 Lead 再執行 AI Actions。", "text", { persist: false });
      return;
    }
    runner(lead);
  } catch (error) {
    console.error(`AI action failed: ${actionName}`, error);
    renderOutput("AI Actions Error", `${actionName} 執行失敗：${error.message || error}`, "text", { persist: false });
  }
}

function initAiActions() {
  if (aiActionsInitialized) return;
  aiActionsInitialized = true;
  const analyzeButton = $("analyzeLeadAi");
  const proposalButton = $("generateProposalAi");
  const missingEmailButton = $("generateMissingInfoEmailAi");
  const proposalEmailButton = $("generateProposalEmailAi");
  const copyButton = $("copyAiActionOutput");
  const downloadButton = $("downloadAiActionOutput");
  const clearButton = $("clearAiActionOutput");

  if (!analyzeButton || !proposalButton || !missingEmailButton || !proposalEmailButton) {
    console.warn("AI Actions buttons not found.");
    return;
  }

  window.addEventListener("hg:lead-drawer-opened", event => {
    activeLead = event.detail?.lead || null;
    restoreLeadState(activeLead);
  });

  window.addEventListener("hg:lead-drawer-closed", () => {
    activeLead = null;
  });

  analyzeButton.addEventListener("click", () => runAction("Analyze Lead", lead => {
    const summary = analyzeLead(lead);
    setSummary(summary);
    renderOutput("Lead Analysis", summary, "json", { summary });
  }));

  proposalButton.addEventListener("click", () => runAction("Generate Proposal", lead => {
    const summary = analyzeLead(lead);
    setSummary(summary);
    renderOutput("Proposal Markdown", renderProposal(lead, summary), "text", { summary });
  }));

  missingEmailButton.addEventListener("click", () => runAction("Generate Missing Info Email", lead => {
    const summary = analyzeLead(lead);
    setSummary(summary);
    renderOutput("Missing Info Gmail Draft", renderMissingInfoEmail(lead, summary), "text", { summary });
  }));

  proposalEmailButton.addEventListener("click", () => runAction("Generate Proposal Email", lead => {
    const summary = analyzeLead(lead);
    setSummary(summary);
    renderOutput("Proposal Gmail Draft", renderProposalEmail(lead, summary), "text", { summary });
  }));

  copyButton?.addEventListener("click", copyOutput);
  downloadButton?.addEventListener("click", () => downloadOutput("henggou-ai-action"));
  clearButton?.addEventListener("click", clearOutput);

  document.addEventListener("click", event => {
    const button = event.target.closest("button");
    if (!button) return;

    const id = button.id;
    if (![
      "analyzeLeadAi",
      "generateProposalAi",
      "generateMissingInfoEmailAi",
      "generateProposalEmailAi",
      "copyAiActionOutput",
      "downloadAiActionOutput",
      "clearAiActionOutput"
    ].includes(id)) return;

    event.preventDefault();

    if (id === "analyzeLeadAi") {
      runAction("Analyze Lead", lead => {
        const summary = analyzeLead(lead);
        setSummary(summary);
        renderOutput("Lead Analysis", summary, "json", { summary });
      });
    }

    if (id === "generateProposalAi") {
      runAction("Generate Proposal", lead => {
        const summary = analyzeLead(lead);
        setSummary(summary);
        renderOutput("Proposal Markdown", renderProposal(lead, summary), "text", { summary });
      });
    }

    if (id === "generateMissingInfoEmailAi") {
      runAction("Generate Missing Info Email", lead => {
        const summary = analyzeLead(lead);
        setSummary(summary);
        renderOutput("Missing Info Gmail Draft", renderMissingInfoEmail(lead, summary), "text", { summary });
      });
    }

    if (id === "generateProposalEmailAi") {
      runAction("Generate Proposal Email", lead => {
        const summary = analyzeLead(lead);
        setSummary(summary);
        renderOutput("Proposal Gmail Draft", renderProposalEmail(lead, summary), "text", { summary });
      });
    }

    if (id === "copyAiActionOutput") copyOutput();
    if (id === "downloadAiActionOutput") downloadOutput("henggou-ai-action");
    if (id === "clearAiActionOutput") clearOutput();
  });

  window.HGAiActionsReady = true;
  window.HGRunAiActionTest = () => {
    activeLead = leadFromDrawer();
    const summary = analyzeLead(activeLead);
    setSummary(summary);
    renderOutput("Lead Analysis", summary, "json", { summary });
    return summary;
  };
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAiActions);
} else {
  initAiActions();
}
