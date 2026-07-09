import { MemoryCache } from "../../core/cache/memoryCache.js";
import { AI_CACHE_NAMESPACE } from "./aiUsageConstants.js";
import { stableStringify, simpleHash } from "./stableStringify.js";

export class AICache {
  constructor(options = {}) {
    this.cache = options.cache || new MemoryCache();
    this.defaultTtlMs = options.defaultTtlMs || 10 * 60 * 1000;
  }
  createKey(payload = {}) {
    return [
      AI_CACHE_NAMESPACE,
      payload.provider || "unknown",
      payload.model || "unknown",
      payload.promptId || "manual",
      simpleHash(stableStringify({
        messages: payload.messages || [],
        context: payload.context || {},
        temperature: payload.temperature,
        maxTokens: payload.maxTokens
      }))
    ].join(":");
  }
  get(key) { return this.cache.get(key); }
  set(key, value, ttlMs = this.defaultTtlMs) {
    return this.cache.set(key, { ...value, cachedAt: new Date().toISOString() }, ttlMs);
  }
  has(key) { return this.cache.has(key); }
  clear() { this.cache.clear(); }
}
export const aiCache = new AICache();
