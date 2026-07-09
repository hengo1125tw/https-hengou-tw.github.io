import { PromptEngine } from "../prompt/promptEngine.js";
import { DEFAULT_PROMPTS } from "../prompt/defaultPrompts.js";

const apiKey = process.env.HG_OPENROUTER_API_KEY;

if (!apiKey) {
  console.error("Missing HG_OPENROUTER_API_KEY");
  process.exit(1);
}

const engine = new PromptEngine();
const prompt = DEFAULT_PROMPTS[0];

const context = {
  company: { name: "奇鋐科技" },
  contact: { name: "Bill", email: "bill@example.com" },
  lead: { requirement: "想評估 AOI 視覺檢測與 AI Agent 導入。" },
  product: { businessUnit: "AOI" }
};

const response = await engine.run(prompt, context, {
  apiKey,
  model: process.env.HG_AI_MODEL || "openai/gpt-4o-mini",
  maxTokens: 500
});

console.log(JSON.stringify({
  ok: response.ok,
  output: response.result?.output || "",
  usage: response.result?.usage || null,
  meta: response.result?.meta || null
}, null, 2));
