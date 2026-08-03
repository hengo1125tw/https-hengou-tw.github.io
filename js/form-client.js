(() => {
  const config = window.HG_FORM_CONFIG || {};

  const clean = value => String(value ?? "").trim();

  const createRequestToken = () => {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    const random = () => Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, "0");
    return `${random()}-${random().slice(0, 4)}-4${random().slice(1, 4)}-a${random().slice(1, 4)}-${random()}${random().slice(0, 4)}`;
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

  const delay = timeoutMs => new Promise(resolve => window.setTimeout(resolve, timeoutMs));
  const processingMessage = "資料已收到，系統正在建立需求編號，通常需要 30～60 秒，請勿重新整理或重複送出。";
  const timeoutMessage = "系統仍在確認，資料可能仍在處理，請勿重複送出。請保留本次查詢碼並提供送出時間與聯絡資料，客服可協助人工確認。";

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
      _ts: String(Date.now())
    });
    script.src = `${config.ENDPOINT}?${query.toString()}`;
    script.async = true;
    document.head.appendChild(script);
  });

  const waitForSavedStatus = async (requestToken, onStatus = () => {}) => {
    const totalTimeoutMs = Math.min(Number(config.STATUS_TIMEOUT_MS) || 60000, 60000);
    const fastPhaseMs = Number(config.STATUS_FAST_PHASE_MS) || 15000;
    const fastIntervalMs = Number(config.STATUS_FAST_POLL_INTERVAL_MS) || 800;
    const slowIntervalMs = Number(config.STATUS_SLOW_POLL_INTERVAL_MS) || 2500;
    const startedAt = Date.now();

    while (Date.now() - startedAt <= totalTimeoutMs) {
      try {
        const remainingMs = Math.max(1, totalTimeoutMs - (Date.now() - startedAt));
        const status = await readStatus(
          requestToken,
          Math.min(Number(config.STATUS_REQUEST_TIMEOUT_MS) || 5000, remainingMs)
        );
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
        if (["pending", "processing", "not_found"].includes(clean(status?.state))) {
          onStatus({ state: clean(status.state), message: processingMessage, elapsedSeconds: Math.floor((Date.now() - startedAt) / 1000) });
        } else {
          onStatus({ state: "pending", message: processingMessage, elapsedSeconds: Math.floor((Date.now() - startedAt) / 1000) });
        }
      } catch (_) {
        onStatus({ state: "pending", message: processingMessage, elapsedSeconds: Math.floor((Date.now() - startedAt) / 1000) });
      }
      const elapsedMs = Date.now() - startedAt;
      if (elapsedMs >= totalTimeoutMs) break;
      const intervalMs = elapsedMs < fastPhaseMs ? fastIntervalMs : slowIntervalMs;
      await delay(Math.min(intervalMs, Math.max(0, totalTimeoutMs - elapsedMs)));
    }

    return {
      ok: false,
      state: "timeout",
      message: timeoutMessage
    };
  };

  const submit = async (payload, options = {}) => {
    if (!isConfigured()) {
      return {
        ok: false,
        code: "not_configured",
        message: "表單後端尚未設定，請改用 Gmail 或 LINE 聯絡。"
      };
    }

    const requestToken = createRequestToken();
    const onStatus = typeof options.onStatus === "function" ? options.onStatus : () => {};

    try {
      onStatus({ state: "processing", message: processingMessage, elapsedSeconds: 0 });
      const postResult = fetch(config.ENDPOINT, {
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
        })
      }).then(
        () => ({ ok: true }),
        error => ({ ok: false, error })
      );

      const transportFailure = postResult.then(result => {
        if (result.ok) return new Promise(() => {});
        return {
          ok: false,
          state: "network_error",
          message: navigator.onLine === false
            ? "目前處於離線狀態，請恢復網路後再試，或改用 Gmail、複製內容與 LINE 聯絡。"
            : "網路連線失敗，請改用 Gmail、複製內容與 LINE 聯絡。"
        };
      });

      const status = await Promise.race([
        waitForSavedStatus(requestToken, onStatus),
        transportFailure
      ]);
      if (status.ok !== true || status.state !== "saved" || !clean(status.requestId)) {
        return {
          ok: false,
          code: status.state === "timeout"
            ? "status_timeout"
            : status.state === "network_error" ? "network_error" : "write_error",
          requestToken,
          message: clean(status.message) || "表單服務未完成寫入，請改用 Gmail 或 LINE 聯絡。"
        };
      }

      return {
        ok: true,
        state: "saved",
        requestId: clean(status.requestId),
        requestToken,
        message: `需求已送出（${clean(status.requestId)}），我們會盡快與您聯絡。請保留此需求編號，以便後續查詢。預計於 1 個工作日內回覆。`
      };
    } catch (_) {
      return {
        ok: false,
        code: "network_error",
        requestToken,
        message: "網路連線失敗，請改用 Gmail、複製內容與 LINE 聯絡。"
      };
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

  const copyText = async value => {
    const text = clean(value);
    if (!text) return { ok: false, text };
    try {
      if (!navigator.clipboard?.writeText) return { ok: false, text };
      await navigator.clipboard.writeText(text);
      return { ok: true, text };
    } catch (_) {
      return { ok: false, text };
    }
  };

  window.HGFormClient = Object.freeze({
    clean,
    createRequestToken,
    isConfigured,
    submit,
    copyText,
    gmailUrl,
    openGmail,
    lineUrl
  });
})();
