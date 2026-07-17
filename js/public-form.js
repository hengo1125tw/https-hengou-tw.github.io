document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("leadForm");
  const toast = document.getElementById("toast");
  if (!form) return;

  const showMessage = message => {
    if (!toast) return;
    toast.textContent = message;
    toast.className = "toast show info";
    window.setTimeout(() => { toast.className = "toast"; }, 4200);
  };

  form.addEventListener("submit", event => {
    event.preventDefault();
    const data = new FormData(form);
    const company = String(data.get("company") || "").trim();
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const line = String(data.get("line") || "").trim();
    const needs = String(data.get("needs") || "").trim();
    const note = String(data.get("note") || "").trim();
    const honeypot = String(data.get("website") || "").trim();

    if (honeypot) { form.reset(); showMessage("需求已送出。"); return; }
    if (!company || !name || !email || !needs) { showMessage("請填寫公司、姓名、Email 與需求項目。"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showMessage("Email 格式不正確。"); return; }

    const body = [
      "【HengGou AI 服務需求】", "",
      "公司：" + company,
      "姓名：" + name,
      "Email：" + email,
      "LINE：" + (line || "未提供"),
      "需求：" + needs, "",
      "補充說明：" + (note || "無")
    ].join("\n");

    const subject = encodeURIComponent("HengGou AI 服務需求｜" + company);
    window.location.href = "mailto:hengo1125.tw@gmail.com?subject=" + subject + "&body=" + encodeURIComponent(body);
    showMessage("已整理需求並開啟 Email；也可改用 LINE 聯絡。 ");
  });
});
