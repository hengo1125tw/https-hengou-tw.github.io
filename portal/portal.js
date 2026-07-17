(() => {
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const loginView = $("#loginView");
  const dashboardView = $("#dashboardView");
  const toast = $("#portalToast");
  const titles = { overview: "總覽", reservation: "預約排程", usage: "使用紀錄", support: "技術支援" };

  const notify = message => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.setTimeout(() => toast.classList.remove("show"), 3500);
  };

  const openDemo = () => {
    loginView.hidden = true;
    dashboardView.hidden = false;
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const closeDemo = () => {
    dashboardView.hidden = true;
    loginView.hidden = false;
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const showPanel = name => {
    $$("[data-panel]").forEach(button => button.classList.toggle("active", button.dataset.panel === name));
    $$("[data-panel-content]").forEach(panel => panel.classList.toggle("active", panel.dataset.panelContent === name));
    const heading = $("#dashboardTitle");
    if (heading) heading.textContent = titles[name] || "客戶入口";
  };

  $("#portalLoginForm")?.addEventListener("submit", event => {
    event.preventDefault();
    notify("正式帳戶尚未啟用。請先提交 GPU 算力需求，或使用展示模式查看介面。");
    event.currentTarget.querySelector("input[type='password']").value = "";
  });

  $("#forgotButton")?.addEventListener("click", () => notify("帳戶服務尚未啟用，目前不會寄送重設密碼信件。"));
  $("#demoButton")?.addEventListener("click", openDemo);
  $("#exitDemoButton")?.addEventListener("click", closeDemo);
  $$("[data-panel]").forEach(button => button.addEventListener("click", () => showPanel(button.dataset.panel)));
  $$("[data-go-panel]").forEach(button => button.addEventListener("click", () => showPanel(button.dataset.goPanel)));

  $("#reservationForm")?.addEventListener("submit", event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const date = String(data.get("date") || "").replaceAll("-", "/");
    const start = String(data.get("start") || "");
    const hours = Number(data.get("hours") || 0);
    if (!date || !start || !hours) {
      notify("請填寫日期、開始時間與預估時數。");
      return;
    }
    const [hour, minute] = start.split(":").map(Number);
    const endDate = new Date(2000, 0, 1, hour, minute || 0);
    endDate.setHours(endDate.getHours() + hours);
    const end = `${String(endDate.getHours()).padStart(2, "0")}:${String(endDate.getMinutes()).padStart(2, "0")}`;
    const row = document.createElement("div");
    row.className = "reservation-row";
    row.innerHTML = `<span>${date.slice(5)}</span><strong>${start}–${end}</strong><em>展示新增</em><small>${String(data.get("task") || "未填工作內容").replace(/[<>]/g, "")}</small>`;
    $("#demoReservationList")?.prepend(row);
    notify("已新增展示預約；此資料不會送出或保存。");
    event.currentTarget.reset();
  });

  $$('[data-support]').forEach(button => button.addEventListener("click", () => {
    notify(`${button.dataset.support}工單功能尚未啟用，請先透過 LINE 或 Email 聯絡。`);
  }));

  if (new URLSearchParams(window.location.search).get("demo") === "1") openDemo();
})();
