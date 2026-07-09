import { PromptEngine } from "../prompt/promptEngine.js";
import { aiCache } from "./aiCache.js";
import { aiUsageLog } from "./aiUsageLog.js";
import { estimateUsageCost } from "./aiCostEstimator.js";
import { AI_USAGE_STATUS, AI_USAGE_TYPE } from "./aiUsageConstants.js";

function usageValue(usage = {}, camel, snake) {
  return usage[camel] ?? usage[snake] ?? 0;
}

export class AIExecutionEngine {
  constructor(options = {}) {
    this.promptEngine = options.promptEngine || new PromptEngine();
    this.cache = options.cache || aiCache;
    this.usageLog = options.usageLog || aiUsageLog;
  }
  async runPrompt(prompt, context = {}, options = {}) {
    const startedAt = Date.now();
    const providerName = options.provider || prompt.provider || "openrouter";
    const model = options.model || prompt.model || "";
    const built = this.promptEngine.buildMessages(prompt, context, options);
    const cacheKey = this.cache.createKey({
      provider: providerName,
      model,
      promptId: prompt.promptId,
      messages: built.messages,
      context,
      temperature: options.temperature ?? prompt.temperature,
      maxTokens: options.maxTokens ?? prompt.maxTokens
    });

    if (options.useCache !== false) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        this.usageLog.add({
          status: AI_USAGE_STATUS.CACHE_HIT,
          usageType: options.usageType || AI_USAGE_TYPE.PROMPT,
          provider: cached.result?.provider || providerName,
          model: cached.result?.model || model,
          promptId: prompt.promptId,
          promptName: prompt.name,
          latencyMs: Date.now() - startedAt,
          cacheKey
        });
        return { ...cached, cached: true, cacheKey };
      }
    }

    try {
      const response = await this.promptEngine.run(prompt, context, { ...options, failOnMissing: options.failOnMissing ?? true });
      if (!response.ok) {
        this.usageLog.add({
          status: AI_USAGE_STATUS.ERROR,
          usageType: options.usageType || AI_USAGE_TYPE.PROMPT,
          provider: providerName,
          model,
          promptId: prompt.promptId,
          promptName: prompt.name,
          latencyMs: Date.now() - startedAt,
          cacheKey,
          error: response.error
        });
        return { ...response, cached: false, cacheKey };
      }

      const result = response.result || {};
      const usage = result.usage || {};
      const estimatedCostUSD = estimateUsageCost(result, { model });
      this.usageLog.add({
        status: AI_USAGE_STATUS.SUCCESS,
        usageType: options.usageType || AI_USAGE_TYPE.PROMPT,
        provider: result.provider || providerName,
        model: result.model || model,
        promptId: prompt.promptId,
        promptName: prompt.name,
        latencyMs: result.meta?.latencyMs ?? Date.now() - startedAt,
        promptTokens: usageValue(usage, "promptTokens", "prompt_tokens"),
        completionTokens: usageValue(usage, "completionTokens", "completion_tokens"),
        totalTokens: usageValue(usage, "totalTokens", "total_tokens"),
        estimatedCostUSD,
        cacheKey
      });

      const payload = { ...response, cached: false, cacheKey };
      if (options.useCache !== false) this.cache.set(cacheKey, payload, options.cacheTtlMs);
      return payload;
    } catch (error) {
      this.usageLog.add({
        status: AI_USAGE_STATUS.ERROR,
        usageType: options.usageType || AI_USAGE_TYPE.PROMPT,
        provider: providerName,
        model,
        promptId: prompt.promptId,
        promptName: prompt.name,
        latencyMs: Date.now() - startedAt,
        cacheKey,
        error: { name: error.name, message: error.message, code: error.code || "AI_EXECUTION_ERROR" }
      });
      throw error;
    }
  }
}
export const aiExecutionEngine = new AIExecutionEngine();
