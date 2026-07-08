export function formatCurrency(value, currency = "TWD", locale = "zh-TW") {
  return new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0 }).format(Number(value || 0));
}

export function formatPhone(value) { return String(value || "").replace(/[^\d+]/g, ""); }

export function formatFileSize(bytes = 0) {
  const size = Number(bytes || 0);
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}
