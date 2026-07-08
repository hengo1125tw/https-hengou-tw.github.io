export function nowISO() { return new Date().toISOString(); }

export function formatDate(value, locale = "zh-TW") {
  if (!value) return "";
  return new Intl.DateTimeFormat(locale, { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(value));
}

export function addDays(value, days) {
  const date = value ? new Date(value) : new Date();
  date.setDate(date.getDate() + Number(days || 0));
  return date;
}
