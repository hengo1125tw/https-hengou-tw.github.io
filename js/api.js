window.HGAPI = {
  async submitLead(payload) {
    if (!window.HG_CONFIG || !window.HG_CONFIG.API_BASE) {
      return {
        ok: false,
        message: "API 尚未設定，請部署 Google Apps Script Web App 後更新 js/config.js"
      };
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), window.HG_CONFIG.REQUEST_TIMEOUT_MS || 15000);

    try {
      await fetch(window.HG_CONFIG.API_BASE, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify({
          ...payload,
          apiKey: window.HG_CONFIG.API_KEY || ""
        }),
        signal: controller.signal
      });

      return {
        ok: true,
        message: "申請已送出，我們會盡快與您聯絡。"
      };
    } catch (error) {
      return {
        ok: false,
        message: error.name === "AbortError"
          ? "連線逾時，請稍後再試"
          : "送出失敗，請檢查網路或 API 設定"
      };
    } finally {
      clearTimeout(timer);
    }
  }
};
