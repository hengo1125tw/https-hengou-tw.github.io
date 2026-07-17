(() => {
  const $ = selector => document.querySelector(selector);
  const form = $("#gpuRequestForm");
  const dialog = $("#requestDialog");
  const summary = $("#requestSummary");
  const toast = $("#gpuToast");
  let latestText = "";
  let latestEmail = "";

  const showToast = message => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.setTimeout(() => toast.classList.remove("show"), 3600);
  };

  const clean = value => String(value || "").trim();

  const buildSummary = data => {
    const lines = [
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
    ];
    return lines.join("\n");
  };

  const validate = data => {
    if (clean(data.get("website"))) return { ok: false, spam: true };
    const required = [
      ["company", "請填寫公司 / 單位名稱"],
      ["name", "請填寫聯絡人"],
      ["email", "請填寫 Email"],
      ["useCase", "請選擇主要用途"],
      ["scheduleType", "請選擇供應方式"]
    ];
    for (const [key, message] of required) {
      if (!clean(data.get(key))) return { ok: false, message };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(data.get("email")))) {
      return { ok: false, message: "Email 格式不正確" };
    }
    if (!data.get("consent")) return { ok: false, message: "請確認需求評估聲明" };
    return { ok: true };
  };

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

  form?.addEventListener("submit", event => {
    event.preventDefault();
    const data = new FormData(form);
    const result = validate(data);
    if (result.spam) {
      form.reset();
      showToast("需求已送出。");
      return;
    }
    if (!result.ok) {
      showToast(result.message);
      form.querySelector(":invalid")?.focus();
      return;
    }

    latestText = buildSummary(data);
    latestEmail = clean(data.get("email"));
    if (summary) summary.textContent = latestText;
    if (dialog?.showModal) dialog.showModal();
    else showToast("需求摘要已產生，請透過 Email 或 LINE 傳送。");
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
    const subject = encodeURIComponent("GPU 算力需求申請｜恒構企業社");
    const body = encodeURIComponent(latestText + `\n\n申請人 Email：${latestEmail}`);
    window.location.href = `mailto:hengo1125.tw@gmail.com?subject=${subject}&body=${body}`;
  });
})();
