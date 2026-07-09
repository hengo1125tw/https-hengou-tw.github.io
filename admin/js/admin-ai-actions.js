import {
  analyzeLeadRow,
  generateProposalForLeadRow,
  generateEmailDraftForLeadRow,
  generateProposalEmailForLeadRow
} from "../../packages/admin/actions/adminLeadActions.js";

let activeLead = null;

function getText(id) {
  return String(document.getElementById(id)?.textContent || "").trim();
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

function renderOutput(title, content, mode = "json") {
  const output = document.getElementById("aiActionOutput");
  const titleEl = document.getElementById("aiActionTitle");
  if (!output) return;

  if (titleEl) titleEl.textContent = title;

  if (mode === "text") {
    output.textContent = content;
    return;
  }

  output.textContent = JSON.stringify(content, null, 2);
}

function setSummary(summary = {}) {
  const set = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value || "-";
  };

  set("aiLeadPriority", summary.priority);
  set("aiLeadScore", summary.score);
  set("aiLeadBusinessUnit", summary.businessUnit);
  set("aiLeadProduct", summary.product);
  set("aiLeadNextAction", summary.nextAction);
}

function copyOutput() {
  const output = document.getElementById("aiActionOutput");
  if (!output) return;
  navigator.clipboard?.writeText(output.textContent || "");
}

function downloadOutput(filenamePrefix = "henggou-ai-action") {
  const output = document.getElementById("aiActionOutput");
  if (!output) return;

  const blob = new Blob([output.textContent || ""], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filenamePrefix}-${new Date().toISOString().slice(0, 10)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

function initAiActions() {
  const analyzeButton = document.getElementById("analyzeLeadAi");
  const proposalButton = document.getElementById("generateProposalAi");
  const missingEmailButton = document.getElementById("generateMissingInfoEmailAi");
  const proposalEmailButton = document.getElementById("generateProposalEmailAi");
  const copyButton = document.getElementById("copyAiActionOutput");
  const downloadButton = document.getElementById("downloadAiActionOutput");

  window.addEventListener("hg:lead-drawer-opened", event => {
    activeLead = event.detail?.lead || null;
    renderOutput("AI Actions", "請選擇 Analyze Lead、Generate Proposal 或 Generate Gmail Draft。", "text");
    setSummary({});
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
}

document.addEventListener("DOMContentLoaded", initAiActions);
