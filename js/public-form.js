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

  if (!form || !client) return;

  const clean = client.clean;

  const clearAutofilledHoneypot = data => {
    const field = form.elements.website;
    if (!field || !clean(data.get("website"))) return;
    field.value = "";
    data.set("website", "");
  };

  const showMessage = (message, type = "info") => {
    if (!toast) return;
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    window.setTimeout(() => { toast.className = "toast"; }, 4600);
  };

  const setBusy = busy => {
    if (submitButton) {
      submitButton.disabled = busy;
      submitButton.textContent = busy ? "正在送出…" : "送出服務需求";
    }
    overlay?.classList.toggle("show", busy);
    overlay?.setAttribute("aria-hidden", String(!busy));
  };

  const buildSummary = data => [
    "【HengGou AI 服務需求】",
    "",
    `公司：${clean(data.get("company"))}`,
    `姓名：${clean(data.get("name"))}`,
    `Email：${clean(data.get("email"))}`,
    `LINE：${clean(data.get("line")) || "未提供"}`,
    `需求：${clean(data.get("needs"))}`,
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
    const payload = {
      formType: "general",
      source: "website-home",
      company: clean(data.get("company")),
      name: clean(data.get("name")),
      email: clean(data.get("email")),
      line: clean(data.get("line")),
      needs: clean(data.get("needs")),
      note: clean(data.get("note")),
      honeypot: clean(data.get("website")),
      formStartedAt,
      submittedAt: Date.now()
    };

    submitting = true;
    setBusy(true);
    const response = await client.submit(payload);
    submitting = false;
    setBusy(false);

    if (response.ok === true && response.state === "saved" && clean(response.requestId)) {
      form.reset();
      showMessage(response.message, "success");
      return;
    }

    showMessage(response.message, "error");
    showFallback(response.message);
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
