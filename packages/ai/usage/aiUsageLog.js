import { AI_USAGE_STATUS, AI_USAGE_TYPE } from "./aiUsageConstants.js";
export class AIUsageLog {
  constructor() { this.entries = []; }
  add(entry = {}) {
    const item = {
      logId: entry.logId || `AILOG-${String(this.entries.length + 1).padStart(6, "0")}`,
      status: entry.status || AI_USAGE_STATUS.SUCCESS,
      usageType: entry.usageType || AI_USAGE_TYPE.PROMPT,
      provider: entry.provider || "",
      model: entry.model || "",
      promptId: entry.promptId || "",
      promptName: entry.promptName || "",
      latencyMs: Number(entry.latencyMs || 0),
      promptTokens: Number(entry.promptTokens || 0),
      completionTokens: Number(entry.completionTokens || 0),
      totalTokens: Number(entry.totalTokens || 0),
      estimatedCostUSD: Number(entry.estimatedCostUSD || 0),
      cacheKey: entry.cacheKey || "",
      error: entry.error || null,
      createdAt: entry.createdAt || new Date().toISOString()
    };
    this.entries.push(item);
    return item;
  }
  list(filter = {}) {
    return this.entries.filter(e =>
      (!filter.status || e.status === filter.status) &&
      (!filter.provider || e.provider === filter.provider) &&
      (!filter.model || e.model === filter.model) &&
      (!filter.promptId || e.promptId === filter.promptId)
    );
  }
  summary() {
    const items = this.list();
    return {
      totalCalls: items.length,
      success: items.filter(e => e.status === AI_USAGE_STATUS.SUCCESS).length,
      errors: items.filter(e => e.status === AI_USAGE_STATUS.ERROR).length,
      cacheHits: items.filter(e => e.status === AI_USAGE_STATUS.CACHE_HIT).length,
      totalTokens: items.reduce((n, e) => n + e.totalTokens, 0),
      estimatedCostUSD: Number(items.reduce((n, e) => n + e.estimatedCostUSD, 0).toFixed(8)),
      averageLatencyMs: items.length ? Math.round(items.reduce((n, e) => n + e.latencyMs, 0) / items.length) : 0
    };
  }
  clear() { this.entries = []; }
}
export const aiUsageLog = new AIUsageLog();
