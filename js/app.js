function getUTMParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get("utm_source") || "",
    utm_medium: params.get("utm_medium") || "",
    utm_campaign: params.get("utm_campaign") || "",
    utm_content: params.get("utm_content") || "",
    utm_term: params.get("utm_term") || "",
    referrer: document.referrer || "",
    landing_page: window.location.href,
    user_agent: navigator.userAgent || "",
    device: window.innerWidth <= 768 ? "mobile" : "desktop"
  };
}

function showToast(message, type = "info") {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.className = "toast show " + type;
  setTimeout(() => {
    toast.className = "toast";
  }, 4200);
}

function setLoading(isLoading) {
  const overlay = document.getElementById("loadingOverlay");
  if (!overlay) return;
  overlay.classList.toggle("show", Boolean(isLoading));
  overlay.setAttribute("aria-hidden", String(!isLoading));
}

function formToPayload(form) {
  const data = new FormData(form);
  return {
    source: window.HG_CONFIG.SOURCE || "website",
    company: String(data.get("company") || "").trim(),
    name: String(data.get("name") || "").trim(),
    email: String(data.get("email") || "").trim(),
    line: String(data.get("line") || "").trim(),
    needs: String(data.get("needs") || "").trim(),
    note: String(data.get("note") || "").trim(),
    honeypot: String(data.get("website") || "").trim(),
    tracking: getUTMParams()
  };
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("leadForm");
  if (!form) return;

  let submitting = false;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submitting) return;

    const payload = formToPayload(form);

    if (window.HG_CONFIG.ENABLE_HONEYPOT && payload.honeypot) {
      showToast("送出成功，我們會盡快與您聯絡。", "success");
      form.reset();
      return;
    }

    const validation = window.HGValidation.lead(payload);
    if (!validation.ok) {
      showToast(validation.errors[0], "error");
      return;
    }

    submitting = true;
    const submitButton = form.querySelector("button[type='submit']");
    if (submitButton) submitButton.disabled = true;
    setLoading(true);

    const result = await window.HGAPI.submitLead(payload);

    setLoading(false);
    submitting = false;
    if (submitButton) submitButton.disabled = false;

    if (result.ok) {
      showToast(result.message || "申請已送出，我們會盡快與您聯絡。", "success");
      form.reset();
    } else {
      showToast(result.message || "送出失敗，請稍後再試或改用 LINE 聯絡。", "error");
    }
  });
});
