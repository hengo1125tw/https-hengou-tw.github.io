(() => {
  const config = window.HG_FORM_CONFIG || {};

  const clean = value => String(value ?? "").trim();

  const isConfigured = () => /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec(?:\?.*)?$/.test(clean(config.ENDPOINT));

  const getTracking = () => {
    const params = new URLSearchParams(window.location.search);
    return {
      utm_source: clean(params.get("utm_source")),
      utm_medium: clean(params.get("utm_medium")),
      utm_campaign: clean(params.get("utm_campaign")),
      referrer: clean(document.referrer),
      landing_page: window.location.href,
      user_agent: navigator.userAgent,
      language: navigator.language || "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || ""
    };
  };

  const submit = async payload => {
    if (!isConfigured()) {
      return {
        ok: false,
        code: "not_configured",
        message: "表單後端尚未設定，請改用 Gmail 或 LINE 聯絡。"
      };
    }

    const controller = new AbortController();
    const timer = window.setTimeout(
      () => controller.abort(),
      Number(config.REQUEST_TIMEOUT_MS) || 15000
    );

    try {
      const response = await fetch(config.ENDPOINT, {
        method: "POST",
        mode: "cors",
        cache: "no-store",
        redirect: "follow",
        referrerPolicy: "no-referrer",
        headers: {
          "Content-Type": "text/plain;charset=UTF-8"
        },
        body: JSON.stringify({
          ...payload,
          tracking: getTracking()
        }),
        signal: controller.signal
      });

      let result;
      try {
        result = await response.json();
      } catch (_) {
        return {
          ok: false,
          code: "invalid_response",
          message: "表單服務回應格式異常，請改用 Gmail 或 LINE 聯絡。"
        };
      }

      if (!response.ok || result?.ok !== true) {
        return {
          ok: false,
          code: clean(result?.code) || `http_${response.status}`,
          message: clean(result?.message) || "表單服務未完成送出，請改用 Gmail 或 LINE 聯絡。"
        };
      }

      return {
        ok: true,
        requestId: clean(result.requestId),
        message: clean(result.message) || "需求已送出，我們會盡快與您聯絡。"
      };
    } catch (error) {
      const timeout = error?.name === "AbortError";
      return {
        ok: false,
        code: timeout ? "timeout" : "network_error",
        message: timeout
          ? "送出逾時，請改用 Gmail 或 LINE 聯絡。"
          : "網路或表單服務異常，請改用 Gmail 或 LINE 聯絡。"
      };
    } finally {
      window.clearTimeout(timer);
    }
  };

  const gmailUrl = (subject, body) => {
    const to = encodeURIComponent(clean(config.NOTIFY_EMAIL) || "hengo1125.tw@gmail.com");
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const openGmail = (subject, body) => {
    const popup = window.open(gmailUrl(subject, body), "_blank", "noopener,noreferrer");
    if (!popup) window.location.href = gmailUrl(subject, body);
  };

  const lineUrl = () => clean(config.LINE_URL) || "https://line.me/R/ti/p/@749ivaeq";

  window.HGFormClient = Object.freeze({
    clean,
    isConfigured,
    submit,
    gmailUrl,
    openGmail,
    lineUrl
  });
})();
