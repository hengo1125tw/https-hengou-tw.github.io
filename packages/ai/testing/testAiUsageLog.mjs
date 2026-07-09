import { AIUsageLog, AI_USAGE_STATUS } from "../index.js";
const log = new AIUsageLog();
log.add({ status: AI_USAGE_STATUS.SUCCESS, provider: "openrouter", model: "openai/gpt-4o-mini", promptId: "PRM-TEST", latencyMs: 1200, promptTokens: 20, completionTokens: 10, totalTokens: 30, estimatedCostUSD: 0.00001 });
log.add({ status: AI_USAGE_STATUS.CACHE_HIT, provider: "openrouter", model: "openai/gpt-4o-mini", promptId: "PRM-TEST", latencyMs: 5 });
const summary = log.summary();
if (summary.totalCalls !== 2) throw new Error("Usage log total calls mismatch");
if (summary.cacheHits !== 1) throw new Error("Usage log cache hit mismatch");
console.log("AI Usage Log check passed.");
console.log(JSON.stringify(summary, null, 2));
