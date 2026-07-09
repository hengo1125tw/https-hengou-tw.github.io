import {
  analyzeLeadRow,
  generateProposalForLeadRow,
  generateEmailDraftForLeadRow,
  generateProposalEmailForLeadRow
} from "../../packages/admin/actions/adminLeadActions.js";

const STORAGE_PREFIX = "henggou:admin:ai-actions:";
const DEFAULT_OUTPUT = "請選擇 Analyze Lead、Generate Proposal 或 Generate Gmail Draft。";

let activeLead = null;

function getText(id) {
  return String(document.getElementById(id)?.textContent || "").trim();
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
    followUp: document.getElementById("followUpDate")?.value || "",
    note: document.getElementById("internalNote")?.value || ""
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

function renderOutput(title, content, mode = "json", options = {}) {
  const output = document.getElementById("aiActionOutput");
  const titleEl = document.getElementById("aiActionTitle");
  const savedAtEl = document.getElementById("aiActionSavedAt");
  if (!output) return;

  const text = mode === "text" ? String(content || "") : JSON.stringify(content, null, 2);

  if (titleEl) titleEl.textContent = title;
  output.textContent = text || DEFAULT_OUTPUT;

  const savedAt = options.savedAt || new Date().toISOString();
  if (savedAtEl) savedAtEl.textContent = `Saved: ${savedAt}`;

  if (options.persist !== false) {
    saveState({
      title,
      contentText: output.textContent,
      mode: "text",
      summary: collectSummary(),
      savedAt
    });
  }
}

function collectSummary() {
  return {
    priority: document.getElementById("aiLeadPriority")?.textContent || "-",
    score: document.getElementById("aiLeadScore")?.textContent || "-",
    businessUnit: document.getElementById("aiLeadBusinessUnit")?.textContent || "-",
    product: document.getElementById("aiLeadProduct")?.textContent || "-",
    nextAction: document.getElementById("aiLeadNextAction")?.textContent || "-"
  };
}

function setSummary(summary = {}, options = {}) {
  const set = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value || "-";
  };

  set("aiLeadPriority", summary.priority);
  set("aiLeadScore", summary.score);
  set("aiLeadBusinessUnit", summary.businessUnit);
  set("aiLeadProduct", summary.product);
  set("aiLeadNextAction", summary.nextAction);

  if (options.persist) {
    const state = loadState() || {};
    saveState({
      ...state,
      summary: collectSummary()
    });
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
  renderOutput(state.title || "AI Actions", state.contentText || DEFAULT_OUTPUT, "text", {
    persist: false,
    savedAt: state.savedAt || "-"
  });
}

async function copyOutput() {
  const output = document.getElementById("aiActionOutput");
  if (!output) return;

  const text = output.textContent || "";
  try {
    await navigator.clipboard?.writeText(text);
    const savedAtEl = document.getElementById("aiActionSavedAt");
    if (savedAtEl) savedAtEl.textContent = "Copied";
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  }
}

function downloadOutput(filenamePrefix = "henggou-ai-action") {
  const output = document.getElementById("aiActionOutput");
  if (!output) return;

  const lead = leadFromDrawer();
  const safeLeadId = String(lead.id || "manual").replace(/[^a-zA-Z0-9_-]/g, "");
  const blob = new Blob([output.textContent || ""], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filenamePrefix}-${safeLeadId}-${new Date().toISOString().slice(0, 10)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

function clearOutput() {
  clearState();
  setSummary({});
  renderOutput("AI Actions", DEFAULT_OUTPUT, "text", { persist: false, savedAt: "-" });
}

function initAiActions() {
  const analyzeButton = document.getElementById("analyzeLeadAi");
  const proposalButton = document.getElementById("generateProposalAi");
  const missingEmailButton = document.getElementById("generateMissingInfoEmailAi");
  const proposalEmailButton = document.getElementById("generateProposalEmailAi");
  const copyButton = document.getElementById("copyAiActionOutput");
  const downloadButton = document.getElementById("downloadAiActionOutput");
  const clearButton = document.getElementById("clearAiActionOutput");

  window.addEventListener("hg:lead-drawer-opened", event => {
    activeLead = event.detail?.lead || null;
    restoreLeadState(activeLead);
  });

  window.addEventListener("hg:lead-drawer-closed", () => {
    activeLead = null;
  });

  analyzeButton?.addEventListener("click", () => {
    const result = analyzeLeadRow(leadFromDrawer());
    setSummary(result.summary);
    renderOutput("Lead Analysis", result.summary);
  });

  proposalButton?.addEventListener("click", () => {
    const result = generateProposalForLeadRow(leadFromDrawer());
    renderOutput("Proposal Markdown", result.markdown, "text");
  });

  missingEmailButton?.addEventListener("click", () => {
    const result = generateEmailDraftForLeadRow(leadFromDrawer());
    renderOutput("Missing Info Gmail Draft", result.text, "text");
  });

  proposalEmailButton?.addEventListener("click", () => {
    const result = generateProposalEmailForLeadRow(leadFromDrawer());
    renderOutput("Proposal Gmail Draft", result.text, "text");
  });

  copyButton?.addEventListener("click", copyOutput);
  downloadButton?.addEventListener("click", () => downloadOutput("henggou-ai-action"));
  clearButton?.addEventListener("click", clearOutput);
}

document.addEventListener("DOMContentLoaded", initAiActions);
