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

  async healthCheck() {
    const { apiBase } = this.getConfig();
    if (!apiBase) return { ok: false, message: "尚未設定 API URL" };

    try {
      const response = await fetch(apiBase, { method: "GET" });
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch (error) {
        return { ok: response.ok, message: text || "API 可連線，但不是 JSON 回應" };
      }
    } catch (error) {
      return { ok: false, message: "API 連線失敗" };
    }
  },

  async listLeads() {
    const { apiBase, apiKey } = this.getConfig();
    if (!apiBase) return { ok: false, message: "尚未設定 API URL", leads: [] };

    const url = apiBase + (apiBase.includes("?") ? "&" : "?") + "action=listLeads&api_key=" + encodeURIComponent(apiKey || "");

    try {
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      return { ok: false, message: "讀取 Leads 失敗", leads: [] };
    }
  }
};

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

function renderLeadRows(rows, sourceLabel = "API") {
  const tbody = document.getElementById("leadTable");
  const label = document.getElementById("leadSourceLabel");
  if (!tbody) return;

  if (label) label.textContent = sourceLabel;

  tbody.innerHTML = rows.map(lead => `
    <tr>
      <td>${lead.id}</td>
      <td>${lead.company}</td>
      <td>${lead.name}</td>
      <td>${lead.email}</td>
      <td>${lead.need}</td>
      <td><span class="badge">${lead.status}</span></td>
      <td>${lead.created}</td>
    </tr>
  `).join("");

  const total = document.getElementById("metricTotalLeads");
  const waiting = document.getElementById("metricWaiting");
  const quotation = document.getElementById("metricQuotation");

  if (total) total.textContent = rows.length;
  if (waiting) waiting.textContent = rows.filter(x => x.status === "未聯絡").length;
  if (quotation) quotation.textContent = rows.filter(x => x.status === "已報價").length;
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
  if (result.ok && result.leads) {
    renderLeadRows(normalizeLeadRows(result.leads), "Google Sheets CRM");
  } else {
    renderLeadRows(mockLeads, "Mock Data（API 尚未可用）");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const config = HGAdminAPI.getConfig();
  const apiBaseInput = document.getElementById("apiBaseInput");
  const apiKeyInput = document.getElementById("apiKeyInput");
  const configForm = document.getElementById("apiConfigForm");
  const testButton = document.getElementById("testApiButton");
  const refreshButton = document.getElementById("refreshLeads");
  const mockButton = document.getElementById("loadMockData");

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

  updateApiStatus();
});
