export const AI_USAGE_STATUS = Object.freeze({
  SUCCESS: "success",
  ERROR: "error",
  CACHE_HIT: "cache_hit",
  CACHE_MISS: "cache_miss"
});
export const AI_USAGE_TYPE = Object.freeze({
  PROMPT: "prompt",
  CHAT: "chat",
  ANALYSIS: "analysis",
  DRAFT: "draft",
  PROPOSAL: "proposal",
  TEST: "test"
});
export const AI_CACHE_NAMESPACE = "ai:response";
