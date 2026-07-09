import { PromptEngine, ContextBuilder, DEFAULT_PROMPTS } from "../index.js";

const engine = new PromptEngine();
const builder = new ContextBuilder();

const prompt = DEFAULT_PROMPTS[0];

const context = builder.buildForLead({
  company: {
    company_name: "奇鋐科技"
  },
  contact: {
    display_name: "Bill",
    email: "bill@example.com"
  },
  lead: {
    message: "想評估 AOI 視覺檢測與 AI Agent 導入。"
  },
  product: {
    business_unit: "AOI"
  }
});

const built = engine.buildMessages(prompt, context);

if (!built.messages.length) {
  throw new Error("Prompt messages were not built");
}

if (built.missing.length) {
  throw new Error(`Unexpected missing variables: ${built.missing.join(", ")}`);
}

console.log("Prompt engine build check passed.");
console.log(JSON.stringify(built, null, 2));
