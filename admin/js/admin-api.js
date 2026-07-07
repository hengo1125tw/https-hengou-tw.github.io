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
  }
};

let currentRows = [];

function normalizeLeadRows(leads) {
  if (!Array.isArray(leads) || leads.length === 0) return [];
  return leads.map((lead, index) => ({
    id: lead.leadId || lead["Lead ID"] || `HG-MOCK-${String(index + 1).padStart(4, "0")}`,
    company: lead.company || lead["公司名稱"] || "",
    name: lead.name || lead["姓名"] || "",
    email: lead.email || lead["Email"] || "",
    need: lead.needs || lead["AI 需求"] || "",
    status: lead.status || lead["狀態"] || "未聯絡",
    created: lead.createdAt || lead["建立時間"] || ""
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
  const searchInput = document.getElementById("leadSearchInput");
  const statusFilter = document.getElementById("statusFilter");

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
  if (searchInput) searchInput.addEventListener("input", rerenderCurrentRows);
  if (statusFilter) statusFilter.addEventListener("change", rerenderCurrentRows);
  updateApiStatus();
});
