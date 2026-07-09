export const DEFAULT_RATES = Object.freeze({
  "openai/gpt-4o-mini": { input: 0.15, output: 0.60 },
  "openrouter/free": { input: 0, output: 0 },
  "default": { input: 0, output: 0 }
});
export function estimateCostUSD({ model = "default", promptTokens = 0, completionTokens = 0, rates = DEFAULT_RATES } = {}) {
  const rate = rates[model] || rates.default || { input: 0, output: 0 };
  const inputCost = (Number(promptTokens || 0) / 1000000) * Number(rate.input || 0);
  const outputCost = (Number(completionTokens || 0) / 1000000) * Number(rate.output || 0);
  return Number((inputCost + outputCost).toFixed(8));
}
export function estimateUsageCost(result = {}, options = {}) {
  const usage = result.usage || {};
  return estimateCostUSD({
    model: result.model || options.model,
    promptTokens: usage.promptTokens ?? usage.prompt_tokens ?? 0,
    completionTokens: usage.completionTokens ?? usage.completion_tokens ?? 0,
    rates: options.rates || DEFAULT_RATES
  });
}
