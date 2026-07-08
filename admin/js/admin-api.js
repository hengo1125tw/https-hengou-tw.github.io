const HGAdminAPI = {
  storageKey: "hg_admin_api_config",

  getConfig() {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey)) || { apiBase: "", apiKey: "" };
    } catch (error) {
      return { apiBase: "", apiKey: "" };
    }
  },

  saveConfig(config) {
    localStorage.setItem(this.storageKey, JSON.stringify(config));
  },

  buildUrl(action, params = {}) {
    const { apiBase, apiKey } = this.getConfig();
    if (!apiBase) return "";
    const search = new URLSearchParams({ action, api_key: apiKey || "", ...params });
    return apiBase + (apiBase.includes("?") ? "&" : "?") + search.toString();
  },

  async healthCheck() {
    const { apiBase } = this.getConfig();
    if (!apiBase) return { ok: false, message: "尚未設定 API URL" };
    try {
      const response = await fetch(apiBase, { method: "GET" });
      const text = await response.text();
      try { return JSON.parse(text); }
      catch { return { ok: response.ok, message: text || "API 可連線，但不是 JSON 回應" }; }
    } catch {
      return { ok: false, message: "API 連線失敗" };
    }
  },

  async listLeads() {
    const url = this.buildUrl("listLeads");
    if (!url) return { ok: false, message: "尚未設定 API URL", leads: [] };
    try {
      const response = await fetch(url);
      return await response.json();
    } catch {
      return { ok: false, message: "讀取 Leads 失敗", leads: [] };
    }
  },

  async listLogs() {
    const url = this.buildUrl("listLogs");
    if (!url) return { ok: false, message: "尚未設定 API URL", logs: [] };
    try {
      const response = await fetch(url);
      return await response.json();
    } catch {
      return { ok: false, message: "讀取 Logs 失敗", logs: [] };
    }
  },

  async updateLeadStatus(leadId, status) {
    const url = this.buildUrl("updateLeadStatus", { leadId, status });
    if (!url) return { ok: false, message: "尚未設定 API URL" };
    try {
      const response = await fetch(url);
      return await response.json();
    } catch {
      return { ok: false, message: "更新狀態失敗" };
    }
  },

  async updateLeadFollowUp(leadId, followUp, note) {
    const url = this.buildUrl("updateLeadFollowUp", { leadId, followUp, note });
    if (!url) return { ok: false, message: "尚未設定 API URL" };
    try {
      const response = await fetch(url);
      return await response.json();
    } catch {
      return { ok: false, message: "更新 Follow-up 失敗" };
    }
  }
};

let currentRows = [];
let currentDrawerLead = null;

function normalizeLeadRows(leads) {
  if (!Array.isArray(leads) || leads.length === 0) return [];
  return leads.map((lead, index) => ({
    id: lead.leadId || lead["Lead ID"] || `HG-MOCK-${String(index + 1).padStart(4, "0")}`,
    company: lead.company || lead["公司名稱"] || "",
    name: lead.name || lead["姓名"] || "",
    email: lead.email || lead["Email"] || "",
    need: lead.needs || lead["AI 需求"] || "",
    status: lead.status || lead["狀態"] || "未聯絡",
    created: lead.createdAt || lead["建立時間"] || "",
    followUp: lead.followUp || lead["Follow Up"] || "",
    note: lead.internalNote || lead["內部備註"] || ""
  }));
}

function getFilteredRows() {
  const search = String(document.getElementById("leadSearchInput")?.value || "").toLowerCase().trim();
  const status = String(document.getElementById("statusFilter")?.value || "").trim();
  return currentRows.filter(row => {
    const text = `${row.id} ${row.company} ${row.name} ${row.email} ${row.need}`.toLowerCase();
    return (!search || text.includes(search)) && (!status || row.status === status);
  });
}

function renderLeadRows(rows, sourceLabel = "API") {
  currentRows = rows;
  const tbody = document.getElementById("leadTable");
  const label = document.getElementById("leadSourceLabel");
  if (!tbody) return;
  if (label) label.textContent = sourceLabel;
  const filtered = getFilteredRows();

  tbody.innerHTML = filtered.map(lead => `
    <tr>
      <td>${lead.id}</td>
      <td>${lead.company}</td>
      <td>${lead.name}</td>
      <td>${lead.email}</td>
      <td>${lead.need}</td>
      <td><span class="badge">${lead.status}</span></td>
      <td>${lead.created}</td>
      <td>
        <button class="ghost-button small detail-button" data-lead-id="${lead.id}" type="button">詳細</button>
        <select class="status-select" data-lead-id="${lead.id}">
          ${["未聯絡","已聯絡","評估中","已報價","已成交","暫不合作"].map(status => `<option ${status === lead.status ? "selected" : ""}>${status}</option>`).join("")}
        </select>
      </td>
    </tr>
  `).join("");

  tbody.querySelectorAll(".status-select").forEach(select => {
    select.addEventListener("change", async () => {
      const result = await HGAdminAPI.updateLeadStatus(select.dataset.leadId, select.value);
      if (!result.ok) alert(result.message || "更新失敗");
      await loadLeadsFromApi();
    });
  });

  tbody.querySelectorAll(".detail-button").forEach(button => {
    button.addEventListener("click", () => openLeadDrawer(button.dataset.leadId));
  });

  updateMetrics(rows);
}

function updateMetrics(rows) {
  const total = document.getElementById("metricTotalLeads");
  const waiting = document.getElementById("metricWaiting");
  const quotation = document.getElementById("metricQuotation");
  if (total) total.textContent = rows.length;
  if (waiting) waiting.textContent = rows.filter(x => x.status === "未聯絡").length;
  if (quotation) quotation.textContent = rows.filter(x => x.status === "已報價").length;
}

function rerenderCurrentRows() {
  const label = document.getElementById("leadSourceLabel");
  renderLeadRows(currentRows, label ? label.textContent : "API");
}

function openLeadDrawer(leadId) {
  const lead = currentRows.find(row => row.id === leadId);
  if (!lead) return;
  currentDrawerLead = lead;

  document.getElementById("drawerLeadId").textContent = lead.id;
  document.getElementById("drawerCompany").textContent = lead.company || "-";
  document.getElementById("drawerName").textContent = lead.name || "-";
  document.getElementById("drawerEmail").textContent = lead.email || "-";
  document.getElementById("drawerNeed").textContent = lead.need || "-";
  document.getElementById("drawerStatus").textContent = lead.status || "-";
  document.getElementById("drawerCreated").textContent = lead.created || "-";
  document.getElementById("followUpDate").value = lead.followUp ? String(lead.followUp).slice(0, 10) : "";
  document.getElementById("internalNote").value = lead.note || "";

  const timeline = document.getElementById("noteTimeline");
  renderFollowUpTimeline(lead);

  const drawer = document.getElementById("leadDrawer");
  drawer.classList.add("show");
  drawer.setAttribute("aria-hidden", "false");
}

function closeLeadDrawer() {
  const drawer = document.getElementById("leadDrawer");
  drawer.classList.remove("show");
  drawer.setAttribute("aria-hidden", "true");
  currentDrawerLead = null;
}

function exportCurrentRowsToCsv() {
  const rows = getFilteredRows();
  const headers = ["Lead ID","公司","姓名","Email","需求","狀態","建立時間","Follow Up","內部備註"];
  const csvRows = [
    headers,
    ...rows.map(row => [row.id,row.company,row.name,row.email,row.need,row.status,row.created,row.followUp || "",row.note || ""])
  ];

  const csv = csvRows.map(row => row.map(value => `"${String(value || "").replace(/"/g, '""')}"`).join(",")).join("\\n");
  const blob = new Blob(["\\ufeff" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `henggou-leads-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

async function updateApiStatus() {
  const statusText = document.getElementById("apiStatusText");
  const statusHint = document.getElementById("apiStatusHint");
  const result = await HGAdminAPI.healthCheck();
  if (statusText) statusText.textContent = result.ok ? "Online" : "Offline";
  if (statusHint) statusHint.textContent = result.message || result.service || "";
}

async function loadLeadsFromApi() {
  const result = await HGAdminAPI.listLeads();
  if (result.ok && result.leads) renderLeadRows(normalizeLeadRows(result.leads), "Google Sheets CRM");
  else renderLeadRows(mockLeads, "Mock Data（API 尚未可用）");
}

async function loadLogsFromApi() {
  const result = await HGAdminAPI.listLogs();
  const list = document.getElementById("apiLogsList");
  if (!list) return;
  if (!result.ok || !Array.isArray(result.logs)) {
    list.innerHTML = `<p><span class="warn"></span>${result.message || "讀取 Logs 失敗"}</p>`;
    return;
  }
  list.innerHTML = result.logs.map(log => {
    const cls = log.status === "success" ? "ok" : "warn";
    return `<p><span class="${cls}"></span>${log.time || ""}｜${log.status || ""}｜${log.leadId || ""}｜${log.message || ""}</p>`;
  }).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  const config = HGAdminAPI.getConfig();
  const apiBaseInput = document.getElementById("apiBaseInput");
  const apiKeyInput = document.getElementById("apiKeyInput");
  const configForm = document.getElementById("apiConfigForm");
  const testButton = document.getElementById("testApiButton");
  const refreshButton = document.getElementById("refreshLeads");
  const mockButton = document.getElementById("loadMockData");
  const refreshLogs = document.getElementById("refreshLogs");
  const exportCsv = document.getElementById("exportCsv");
  const searchInput = document.getElementById("leadSearchInput");
  const statusFilter = document.getElementById("statusFilter");
  const closeDrawer = document.getElementById("closeDrawer");
  const followUpForm = document.getElementById("followUpForm");

  if (apiBaseInput) apiBaseInput.value = config.apiBase || "";
  if (apiKeyInput) apiKeyInput.value = config.apiKey || "";

  if (configForm) {
    configForm.addEventListener("submit", event => {
      event.preventDefault();
      HGAdminAPI.saveConfig({
        apiBase: apiBaseInput ? apiBaseInput.value.trim() : "",
        apiKey: apiKeyInput ? apiKeyInput.value.trim() : ""
      });
      updateApiStatus();
      alert("API 設定已儲存於本機瀏覽器。");
    });
  }

  if (testButton) testButton.addEventListener("click", async () => {
    await updateApiStatus();
    alert("API 測試完成，請查看 API Status 卡片。");
  });
  if (refreshButton) refreshButton.addEventListener("click", loadLeadsFromApi);
  if (mockButton) mockButton.addEventListener("click", () => renderLeadRows(mockLeads, "Mock Data"));
  if (refreshLogs) refreshLogs.addEventListener("click", loadLogsFromApi);
  if (exportCsv) exportCsv.addEventListener("click", exportCurrentRowsToCsv);
  if (searchInput) searchInput.addEventListener("input", rerenderCurrentRows);
  if (statusFilter) statusFilter.addEventListener("change", rerenderCurrentRows);
  if (closeDrawer) closeDrawer.addEventListener("click", closeLeadDrawer);

  if (followUpForm) {
    followUpForm.addEventListener("submit", async event => {
      event.preventDefault();
      if (!currentDrawerLead) return;
      const followUp = document.getElementById("followUpDate").value;
      const note = document.getElementById("internalNote").value;
      const result = await HGAdminAPI.updateLeadFollowUp(currentDrawerLead.id, followUp, note);
      if (!result.ok) {
        alert(result.message || "儲存失敗");
        return;
      }
      alert("Follow-up 已更新");
      closeLeadDrawer();
      await loadLeadsFromApi();
    });
  }

  updateApiStatus();
});


function renderFollowUpTimeline(lead) {
  const timeline = document.getElementById("noteTimeline");
  if (!timeline) return;

  const items = [];
  if (lead.created) items.push({ title: "Lead 建立", body: lead.created });
  if (lead.status) items.push({ title: "目前狀態", body: lead.status });
  if (lead.followUp) items.push({ title: "Follow-up", body: lead.followUp });
  if (lead.note) items.push({ title: "內部備註", body: lead.note });

  timeline.innerHTML = items.length
    ? items.map(item => `<p><strong>${item.title}</strong><br>${item.body}</p>`).join("")
    : `<p class="muted">尚無備註紀錄。</p>`;
}
