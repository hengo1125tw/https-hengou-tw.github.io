export function cacheKey(parts = []) {
  return parts.filter(Boolean).map(part => String(part).trim().toLowerCase()).join(":");
}

export const CACHE_NAMESPACE = Object.freeze({
  AI: "ai",
  CRM: "crm",
  API: "api",
  CONFIG: "config"
});
