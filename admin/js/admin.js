const mockLeads = [
  { id: "HG-20260706-0001", company: "毅嘉科技", name: "王先生", email: "buyer@example.com", need: "AOI 視覺檢測", status: "評估中", created: "2026-07-06" },
  { id: "HG-20260706-0002", company: "電子模組廠", name: "林小姐", email: "pm@example.com", need: "LINE Bot", status: "已聯絡", created: "2026-07-06" },
  { id: "HG-20260706-0003", company: "物流公司", name: "陳先生", email: "ops@example.com", need: "Workflow Automation", status: "未聯絡", created: "2026-07-05" },
  { id: "HG-20260706-0004", company: "製造業客戶", name: "張小姐", email: "qa@example.com", need: "AI Agent", status: "已報價", created: "2026-07-05" },
  { id: "HG-20260706-0005", company: "電商團隊", name: "許先生", email: "owner@example.com", need: "Website Development", status: "已成交", created: "2026-07-04" }
];

function renderLeads() {
  const tbody = document.getElementById("leadTable");
  if (!tbody) return;

  tbody.innerHTML = mockLeads.map(lead => `
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
}

function initCharts() {
  const trend = document.getElementById("leadTrendChart");
  const need = document.getElementById("needChart");

  if (trend && window.Chart) {
    new Chart(trend, {
      type: "line",
      data: {
        labels: ["W1", "W2", "W3", "W4", "W5", "W6"],
        datasets: [{
          label: "Leads",
          data: [4, 8, 12, 18, 31, 52],
          tension: .35,
          borderWidth: 3
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } }
      }
    });
  }

  if (need && window.Chart) {
    new Chart(need, {
      type: "doughnut",
      data: {
        labels: ["AI Agent", "AOI", "LINE", "Website"],
        datasets: [{
          data: [35, 25, 22, 18]
        }]
      },
      options: {
        responsive: true
      }
    });
  }
}

function initTheme() {
  const button = document.getElementById("themeToggle");
  if (!button) return;

  button.addEventListener("click", () => {
    document.body.classList.toggle("light");
    localStorage.setItem("hg_admin_theme", document.body.classList.contains("light") ? "light" : "dark");
  });

  if (localStorage.getItem("hg_admin_theme") === "light") {
    document.body.classList.add("light");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderLeads();
  initCharts();
  initTheme();
});
