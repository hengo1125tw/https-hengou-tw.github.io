window.HGValidation = {
  email(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
  },

  required(value) {
    return String(value || "").trim().length > 0;
  },

  lead(payload) {
    const errors = [];

    if (!this.required(payload.company)) errors.push("請填寫公司名稱");
    if (!this.required(payload.name)) errors.push("請填寫姓名");
    if (!this.required(payload.email)) errors.push("請填寫 Email");
    if (payload.email && !this.email(payload.email)) errors.push("Email 格式不正確");
    if (!this.required(payload.needs)) errors.push("請選擇想導入的 AI 功能");

    return {
      ok: errors.length === 0,
      errors
    };
  }
};
