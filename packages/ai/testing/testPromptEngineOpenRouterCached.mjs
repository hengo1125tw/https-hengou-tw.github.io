import { AIExecutionEngine, ContextBuilder, DEFAULT_PROMPTS } from "../index.js";
const apiKey = process.env.HG_OPENROUTER_API_KEY;
if (!apiKey) { console.error("Missing HG_OPENROUTER_API_KEY"); process.exit(1); }
const engine = new AIExecutionEngine();
const context = new ContextBuilder().buildForLead({
  company: { company_name: "奇鋐科技" },
  contact: { display_name: "Bill", email: "bill@example.com" },
  lead: { message: "想評估 AOI 視覺檢測 OK NG Excel 紀錄。", specification: "水冷板" }
});
const result = await engine.runPrompt(DEFAULT_PROMPTS[0], context, {
  apiKey,
  model: process.env.HG_AI_MODEL || "openai/gpt-4o-mini",
  maxTokens: 500,
  useCache: true
});
console.log(JSON.stringify({ ok: result.ok, cached: result.cached, output: result.result?.output || "", usage: result.result?.usage || null, cacheKey: result.cacheKey }, null, 2));
