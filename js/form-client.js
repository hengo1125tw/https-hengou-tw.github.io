(() => {
  const config = window.HG_FORM_CONFIG || {};

  const clean = value => String(value ?? "").trim();

  const createRequestToken = () => {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 14)}`;
  };

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

  const readStatus = (requestToken, timeoutMs = 5000) => new Promise((resolve, reject) => {
    const callbackName = `HGFormStatus_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    const script = document.createElement("script");
    const timer = window.setTimeout(() => finish(new Error("status_timeout")), timeoutMs);

    const finish = (error, result) => {
      window.clearTimeout(timer);
      delete window[callbackName];
      script.remove();
      if (error) reject(error);
      else resolve(result);
    };

    window[callbackName] = result => finish(null, result);
    script.onerror = () => finish(new Error("status_network_error"));
    const query = new URLSearchParams({
      action: "status",
      requestToken,
      prefix: callbackName,
      _: String(Date.now())
    });
    script.src = `${config.ENDPOINT}?${query.toString()}`;
    script.async = true;
    document.head.appendChild(script);
  });

  const waitForSavedStatus = async requestToken => {
    const totalTimeoutMs = Number(config.STATUS_TIMEOUT_MS) || 20000;
    const startedAt = Date.now();

    while (Date.now() - startedAt < totalTimeoutMs) {
      try {
        const status = await readStatus(requestToken);
        if (status?.state === "saved" && status?.ok === true && clean(status.requestId)) {
          return status;
        }
        if (status?.state === "error") {
          return {
            ok: false,
            state: "error",
            message: clean(status.message) || "表單服務未完成寫入。"
          };
        }
      } catch (_) {
        // A transient JSONP failure may recover on the next poll.
      }
      await new Promise(resolve => window.setTimeout(resolve, Number(config.STATUS_POLL_INTERVAL_MS) || 800));
    }

    return {
      ok: false,
      state: "timeout",
      message: "未收到需求寫入確認，請改用 Gmail 或 LINE 聯絡。"
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

    const requestToken = createRequestToken();
    const controller = new AbortController();
    const timer = window.setTimeout(
      () => controller.abort(),
      Number(config.REQUEST_TIMEOUT_MS) || 15000
    );

    try {
      await fetch(config.ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        cache: "no-store",
        redirect: "follow",
        referrerPolicy: "no-referrer",
        headers: {
          "Content-Type": "text/plain;charset=UTF-8"
        },
        body: JSON.stringify({
          ...payload,
          requestToken,
          tracking: getTracking()
        }),
        signal: controller.signal
      });

      const status = await waitForSavedStatus(requestToken);
      if (status.ok !== true || status.state !== "saved" || !clean(status.requestId)) {
        return {
          ok: false,
          code: status.state === "timeout" ? "status_timeout" : "write_error",
          requestToken,
          message: clean(status.message) || "表單服務未完成寫入，請改用 Gmail 或 LINE 聯絡。"
        };
      }

      return {
        ok: true,
        state: "saved",
        requestId: clean(status.requestId),
        requestToken,
        message: `需求已送出（${clean(status.requestId)}），我們會盡快與您聯絡。`
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
    createRequestToken,
    isConfigured,
    submit,
    gmailUrl,
    openGmail,
    lineUrl
  });
})();
