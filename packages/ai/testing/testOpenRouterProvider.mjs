import { createProvider } from "../providers/providerFactory.js";

const apiKey = process.env.HG_OPENROUTER_API_KEY;

if (!apiKey) {
  console.error("Missing HG_OPENROUTER_API_KEY");
  process.exit(1);
}

const provider = createProvider("openrouter", {
  apiKey,
  model: process.env.HG_AI_MODEL || "openai/gpt-4o-mini"
});

const result = await provider.chat({
  messages: [
    { role: "system", content: "You are a concise business assistant." },
    { role: "user", content: "用繁體中文回覆：HengGou OS AI Provider Layer 測試成功。" }
  ],
  temperature: 0.1,
  maxTokens: 200,
  metadata: {
    test: "B002"
  }
});

console.log(JSON.stringify({
  provider: result.provider,
  model: result.model,
  output: result.output,
  usage: result.usage,
  meta: result.meta
}, null, 2));
