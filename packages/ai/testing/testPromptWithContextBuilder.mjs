import { ContextBuilder, PromptEngine, DEFAULT_PROMPTS } from "../index.js";

const builder = new ContextBuilder();
const engine = new PromptEngine();

const context = builder.buildForLead({
  company: { company_name: "奇鋐科技" },
  contact: { display_name: "Bill", email: "bill@example.com" },
  lead: { message: "想評估 AOI 視覺檢測與 AI Agent 導入。" },
  product: { business_unit: "AOI" }
});

const built = engine.buildMessages(DEFAULT_PROMPTS[0], context);

if (built.missing.length) {
  throw new Error(`Missing variables: ${built.missing.join(", ")}`);
}

console.log("Prompt + Context Builder check passed.");
console.log(JSON.stringify(built, null, 2));
