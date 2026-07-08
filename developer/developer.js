import { createProvider } from "../packages/ai/index.js";

const output = document.querySelector("#output");
const runBtn = document.querySelector("#runBtn");

function render(value) {
  output.textContent = typeof value === "string" ? value : JSON.stringify(value, null, 2);
}

runBtn.addEventListener("click", async () => {
  const providerName = document.querySelector("#provider").value.trim();
  const model = document.querySelector("#model").value.trim();
  const apiKey = document.querySelector("#apiKey").value.trim();
  const prompt = document.querySelector("#prompt").value.trim();

  if (!apiKey) {
    render("請先輸入 OpenRouter API Key。");
    return;
  }

  render("Running...");

  try {
    const provider = createProvider(providerName, { apiKey, model });

    const result = await provider.chat({
      messages: [
        { role: "system", content: "You are a concise business assistant." },
        { role: "user", content: prompt }
      ],
      temperature: 0.1,
      maxTokens: 400
    });

    render({
      provider: result.provider,
      model: result.model,
      output: result.output,
      usage: result.usage,
      meta: result.meta
    });
  } catch (error) {
    render({
      name: error.name,
      message: error.message,
      code: error.code,
      details: error.details || null
    });
  }
});
