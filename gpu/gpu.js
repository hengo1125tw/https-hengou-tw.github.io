(() => {
  const formStartedAt = Date.now();
  const $ = selector => document.querySelector(selector);
  const form = $("#gpuRequestForm");
  const dialog = $("#requestDialog");
  const summary = $("#requestSummary");
  const toast = $("#gpuToast");
  const status = $("#requestDialogStatus");
  const sendButton = $("#sendRequestButton");
  const client = window.HGFormClient;
  const fallbackActions = [...document.querySelectorAll(".fallback-only")];
  let latestText = "";
  let latestPayload = null;
  let submitting = false;

  if (!form || !client) return;

  const clean = client.clean;

  const clearAutofilledHoneypot = data => {
    const field = form.elements.website;
    if (!field || !clean(data.get("website"))) return;
    field.value = "";
    data.set("website", "");
  };

  const showToast = message => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.setTimeout(() => toast.classList.remove("show"), 3800);
  };

  const setStatus = (message, state = "info") => {
    if (!status) return;
    status.textContent = message;
    status.dataset.state = state;
  };

  const setBusy = busy => {
    if (!sendButton) return;
    sendButton.disabled = busy;
    sendButton.textContent = busy ? "正在送出…" : "確認送出";
  };

  const setFallbackVisible = visible => {
    fallbackActions.forEach(element => {
      element.hidden = !visible;
    });
  };

  const buildSummary = data => [
    "【GPU 算力需求申請】",
    "",
    `公司 / 單位：${clean(data.get("company"))}`,
    `聯絡人：${clean(data.get("name"))}`,
    `Email：${clean(data.get("email"))}`,
    `電話：${clean(data.get("phone")) || "未提供"}`,
    `LINE：${clean(data.get("line")) || "未提供"}`,
    `預計開始：${clean(data.get("startDate")) || "未確定"}`,
    "",
    `主要用途：${clean(data.get("useCase"))}`,
    `軟體 / 框架：${clean(data.get("software")) || "未提供"}`,
    `最低 VRAM：${clean(data.get("vram"))}`,
    `供應方式：${clean(data.get("scheduleType"))}`,
    `每月預估時數：${clean(data.get("hoursPerMonth")) || "未確定"}`,
    `固定時段：${clean(data.get("fixedTime")) || "未提供"}`,
    `儲存需求：${clean(data.get("storage")) || "未提供"}`,
    `技術支援：${clean(data.get("support"))}`,
    `預算範圍：${clean(data.get("budget"))}`,
    `接受同級替代：${data.get("allowEquivalent") ? "是" : "否"}`,
    "",
    `補充說明：${clean(data.get("note")) || "無"}`,
    "",
    "此申請僅供需求評估，實際規格、價格、排程與服務條款另行確認。"
  ].join("\n");

  const validate = data => {
    const required = [
      ["company", "請填寫公司 / 單位名稱"],
      ["name", "請填寫聯絡人"],
      ["email", "請填寫 Email"],
      ["useCase", "請選擇主要用途"],
      ["scheduleType", "請選擇供應方式"]
    ];

    for (const [field, message] of required) {
      if (!clean(data.get(field))) return { ok: false, message, field };
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(data.get("email")))) {
      return { ok: false, message: "Email 格式不正確", field: "email" };
    }

    if (!data.get("consent")) return { ok: false, message: "請確認需求評估聲明", field: "consent" };
    return { ok: true };
  };

  const toPayload = data => ({
    formType: "gpu",
    source: "gpu-service-page",
    company: clean(data.get("company")),
    name: clean(data.get("name")),
    email: clean(data.get("email")),
    phone: clean(data.get("phone")),
    line: clean(data.get("line")),
    startDate: clean(data.get("startDate")),
    useCase: clean(data.get("useCase")),
    software: clean(data.get("software")),
    vram: clean(data.get("vram")),
    scheduleType: clean(data.get("scheduleType")),
    hoursPerMonth: clean(data.get("hoursPerMonth")),
    fixedTime: clean(data.get("fixedTime")),
    storage: clean(data.get("storage")),
    support: clean(data.get("support")),
    budget: clean(data.get("budget")),
    allowEquivalent: Boolean(data.get("allowEquivalent")),
    consent: Boolean(data.get("consent")),
    note: clean(data.get("note")),
    honeypot: clean(data.get("website")),
    formStartedAt,
    submittedAt: Date.now()
  });

  document.addEventListener("DOMContentLoaded", () => {
    const toggle = $(".nav-toggle");
    const nav = $(".site-nav");
    if (toggle && nav) {
      toggle.addEventListener("click", () => {
        const open = nav.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(open));
      });
      nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }));
    }
  });

  form.addEventListener("submit", event => {
    event.preventDefault();
    const data = new FormData(form);
    clearAutofilledHoneypot(data);
    const result = validate(data);

    if (!result.ok) {
      showToast(result.message);
      form.elements[result.field]?.focus();
      return;
    }

    latestText = buildSummary(data);
    latestPayload = toPayload(data);
    if (summary) summary.textContent = latestText;
    setFallbackVisible(false);
    setStatus("請確認內容，按下「確認送出」後會直接寫入需求紀錄。", "info");
    if (dialog?.showModal) dialog.showModal();
    else showToast("瀏覽器不支援確認視窗，請改用 Gmail 或 LINE。 ");
  });

  sendButton?.addEventListener("click", async () => {
    if (!latestPayload || submitting) return;
    submitting = true;
    setBusy(true);
    setFallbackVisible(false);
    setStatus("正在傳送需求資料至需求紀錄…", "info");
    const response = await client.submit(latestPayload);
    submitting = false;
    setBusy(false);

    if (response.ok === true && response.state === "saved" && clean(response.requestId)) {
      setStatus(response.message, "success");
      form.reset();
      latestPayload = null;
      showToast(response.message);
      window.setTimeout(() => dialog?.close(), 1200);
      return;
    }

    setFallbackVisible(true);
    setStatus(`${response.message} 可改用下方 Gmail、複製內容或 LINE 備援。`, "error");
    showToast(response.message);
  });

  $("[data-close]")?.addEventListener("click", () => dialog?.close());
  dialog?.addEventListener("click", event => {
    if (event.target === dialog) dialog.close();
  });

  $("#copyRequestButton")?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(latestText);
      showToast("需求內容已複製。");
    } catch {
      showToast("無法自動複製，請手動選取摘要內容。");
    }
  });

  $("#openEmailButton")?.addEventListener("click", () => {
    client.openGmail("GPU 算力需求申請｜恒構企業社", latestText);
  });

  const lineLink = $("#dialogLineButton");
  if (lineLink) lineLink.href = client.lineUrl();
})();
