import {
  createProvider,
  AIExecutionEngine,
  aiUsageLog,
  AIGmailDraftGenerator
} from "../packages/ai/index.js";

const output = document.querySelector("#output");
const runBtn = document.querySelector("#runBtn");

function render(value) {
  output.textContent = typeof value === "string" ? value : JSON.stringify(value, null, 2);
}

function buildLead(promptText) {
  return {
    companyName: "恒構測試客戶",
    contactName: "Bill",
    email: "bill@example.com",
    requirement: promptText,
    source: "Developer Console"
  };
}

runBtn.addEventListener("click", async () => {
  const providerName = document.querySelector("#provider").value.trim();
  const model = document.querySelector("#model").value.trim();
  const apiKey = document.querySelector("#apiKey").value.trim();
  const promptText = document.querySelector("#prompt").value.trim();

  if (!apiKey) {
    render("請先輸入 OpenRouter API Key。");
    return;
  }

  render("Running Gmail Draft Generator...");

  try {
    const provider = createProvider(providerName, { apiKey, model });
    const generator = new AIGmailDraftGenerator({
      executionEngine: new AIExecutionEngine()
    });

    const result = await generator.generateFromLead(buildLead(promptText), {
      providerInstance: provider,
      model,
      useCache: true,
      metadata: {
        test: "B010 Developer Console"
      }
    });

    render({
      draftId: result.draft.draftId,
      subject: result.draft.subject,
      deterministicDraft: result.text,
      aiText: result.aiText,
      cached: result.aiResult.cached,
      usage: result.aiResult.result?.usage || null,
      usageSummary: aiUsageLog.summary()
    });
  } catch (error) {
    render({
      name: error.name,
      message: error.message,
      code: error.code,
      details: error.details || null,
      usageSummary: aiUsageLog.summary()
    });
  }
});
