import { AIExecutionEngine, PromptEngine, ContextBuilder, DEFAULT_PROMPTS, AIUsageLog, AICache } from "../index.js";
let calls = 0;
const fakeProvider = {
  chat: async ({ messages, model }) => {
    calls += 1;
    return {
      provider: "fake",
      model,
      output: `fake response ${calls}`,
      raw: { messages },
      usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
      meta: { latencyMs: 1, cached: false }
    };
  }
};
const engine = new AIExecutionEngine({ promptEngine: new PromptEngine(), usageLog: new AIUsageLog(), cache: new AICache({ defaultTtlMs: 60000 }) });
const context = new ContextBuilder().buildForLead({
  company: { company_name: "奇鋐科技" },
  contact: { display_name: "Bill", email: "bill@example.com" },
  lead: { message: "想評估 AOI 視覺檢測 OK NG Excel 紀錄。", specification: "水冷板" }
});
const prompt = DEFAULT_PROMPTS[0];
const first = await engine.runPrompt(prompt, context, { providerInstance: fakeProvider, model: "fake-model", useCache: true });
const second = await engine.runPrompt(prompt, context, { providerInstance: fakeProvider, model: "fake-model", useCache: true });
if (calls !== 1) throw new Error(`Expected one provider call, got ${calls}`);
if (!second.cached) throw new Error("Expected second response to be cached");
const summary = engine.usageLog.summary();
if (summary.totalCalls !== 2 || summary.cacheHits !== 1) throw new Error("Usage summary mismatch");
console.log("AI Execution Engine check passed.");
console.log(JSON.stringify({ first: { cached: first.cached, output: first.result.output }, second: { cached: second.cached, output: second.result.output }, summary }, null, 2));
