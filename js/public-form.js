(() => {
  const formStartedAt = Date.now();
  let latestSummary = "";

  const $ = selector => document.querySelector(selector);
  const form = $("#leadForm");
  const toast = $("#toast");
  const overlay = $("#loadingOverlay");
  const fallbackDialog = $("#leadFallbackDialog");
  const fallbackMessage = $("#leadFallbackMessage");
  const submitButton = form?.querySelector('button[type="submit"]');
  const client = window.HGFormClient;
  let submitting = false;
  let toastTimer = 0;

  if (!form || !client) return;

  const clean = client.clean;
  const source = clean(form.dataset.source) || "website-home";
  const isAutomationForm = source === "automation-landing-page";

  const trackAutomation = eventName => {
    if (isAutomationForm && typeof window.hgTrackAutomation === "function") {
      window.hgTrackAutomation(eventName);
    }
  };

  const clearAutofilledHoneypot = data => {
    const field = form.elements.website;
    if (!field || !clean(data.get("website"))) return;
    field.value = "";
    data.set("website", "");
  };

  const showMessage = (message, type = "info") => {
    if (!toast) return;
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    toastTimer = window.setTimeout(() => { toast.className = "toast"; }, 4600);
  };

  const setBusy = busy => {
    if (submitButton) {
      submitButton.disabled = busy;
      submitButton.textContent = busy ? "正在送出…" : "送出服務需求";
    }
    overlay?.classList.toggle("show", busy);
    overlay?.setAttribute("aria-hidden", String(!busy));
  };

  const automationDetails = data => [
    `目前使用工具：${clean(data.get("currentTools")) || "未提供"}`,
    `最耗時間的工作：${clean(data.get("timeConsumingWork")) || "未提供"}`,
    `執行次數：${clean(data.get("frequency")) || "未提供"}`,
    `常見錯誤：${clean(data.get("commonError")) || "未提供"}`,
    `希望改善結果：${clean(data.get("desiredOutcome")) || "未提供"}`,
    `預計開始時間：${clean(data.get("startTime")) || "未提供"}`
  ];

  const buildSummary = data => [
    isAutomationForm ? "【企業流程自動化｜免費流程診斷】" : "【HengGou AI 服務需求】",
    "",
    `公司：${clean(data.get("company"))}`,
    `姓名：${clean(data.get("name"))}`,
    `Email：${clean(data.get("email"))}`,
    `LINE：${clean(data.get("line")) || "未提供"}`,
    `需求：${clean(data.get("needs"))}`,
    ...(isAutomationForm ? ["", ...automationDetails(data)] : []),
    "",
    `補充說明：${clean(data.get("note")) || "無"}`
  ].join("\n");

  const validate = data => {
    const required = [
      ["company", "請填寫公司名稱。"],
      ["name", "請填寫姓名。"],
      ["email", "請填寫 Email。"],
      ["needs", "請選擇需求項目。"]
    ];
    if (isAutomationForm) {
      required.push(
        ["timeConsumingWork", "請填寫最耗時間的工作。"],
        ["desiredOutcome", "請填寫希望改善的結果。"]
      );
    }

    for (const [field, message] of required) {
      if (!clean(data.get(field))) return { ok: false, message, field };
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(data.get("email")))) {
      return { ok: false, message: "Email 格式不正確。", field: "email" };
    }

    return { ok: true };
  };

  const showFallback = message => {
    if (fallbackMessage) fallbackMessage.textContent = message;
    if (fallbackDialog?.showModal) fallbackDialog.showModal();
    else showMessage(message, "error");
  };

  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (submitting) return;
    const data = new FormData(form);
    clearAutofilledHoneypot(data);
    const result = validate(data);

    if (!result.ok) {
      showMessage(result.message, "error");
      form.elements[result.field]?.focus();
      return;
    }

    latestSummary = buildSummary(data);
    const note = isAutomationForm
      ? [...automationDetails(data), "", `補充說明：${clean(data.get("note")) || "無"}`].join("\n")
      : clean(data.get("note"));
    const payload = {
      formType: "general",
      source,
      company: clean(data.get("company")),
      name: clean(data.get("name")),
      email: clean(data.get("email")),
      phone: clean(data.get("phone")),
      line: clean(data.get("line")),
      needs: clean(data.get("needs")),
      note,
      honeypot: clean(data.get("website")),
      formStartedAt,
      submittedAt: Date.now()
    };

    submitting = true;
    trackAutomation("automation_form_submit");
    setBusy(true);
    const response = await client.submit(payload, {
      onStatus: status => showMessage(status.message, "info")
    });
    submitting = false;
    setBusy(false);

    if (response.ok === true && response.state === "saved" && clean(response.requestId)) {
      form.reset();
      showMessage(response.message, "success");
      trackAutomation("automation_form_success");
      return;
    }

    showMessage(response.message, "error");
    showFallback(response.message);
    trackAutomation("automation_form_error");
  });

  $("[data-lead-dialog-close]")?.addEventListener("click", () => fallbackDialog?.close());
  fallbackDialog?.addEventListener("click", event => {
    if (event.target === fallbackDialog) fallbackDialog.close();
  });

  $("#leadGmailButton")?.addEventListener("click", () => {
    const company = clean(new FormData(form).get("company")) || "網站客戶";
    client.openGmail(`HengGou AI 服務需求｜${company}`, latestSummary || "請協助我評估服務需求。 ");
  });

  $("#leadCopyButton")?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(latestSummary);
      showMessage("需求內容已複製。", "success");
    } catch {
      showMessage("無法自動複製，請改用 Gmail 或 LINE。", "error");
    }
  });

  const lineButton = $("#leadLineButton");
  if (lineButton) lineButton.href = client.lineUrl();
})();
