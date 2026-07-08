export function toText(value) { return String(value ?? "").trim(); }
export function normalizeKeyword(value) { return toText(value).toLowerCase().replace(/\s+/g, ""); }
export function truncate(value, max = 100) {
  const text = toText(value);
  return text.length > max ? `${text.slice(0, max)}...` : text;
}
