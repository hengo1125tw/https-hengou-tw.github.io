import { AIGmailDraftGenerator, AIExecutionEngine, PromptEngine, AIUsageLog, AICache } from "../index.js";

let calls = 0;
const fakeProvider = {
  chat: async ({ messages, model }) => {
    calls += 1;
    return {
      provider: "fake",
      model,
      output: "Subject: AOI 視覺檢測需求資訊確認\nBody:\nBill 您好，這是一封經 AI 潤飾的 Email 草稿。\nFollow-up Note: 三天後追蹤。",
      raw: { messages },
      usage: { promptTokens: 80, completionTokens: 30, totalTokens: 110 },
      meta: { latencyMs: 1 }
    };
  }
};

const generator = new AIGmailDraftGenerator({
  executionEngine: new AIExecutionEngine({
    promptEngine: new PromptEngine(),
    usageLog: new AIUsageLog(),
    cache: new AICache({ defaultTtlMs: 60000 })
  })
});

const result = await generator.generateFromLead({
  companyName: "奇鋐科技",
  contactName: "Bill",
  email: "bill@avc.com.tw",
  requirement: "想評估 AOI 視覺檢測 OK NG Excel 紀錄。",
  specification: "水冷板外觀瑕疵"
}, {
  providerInstance: fakeProvider,
  model: "fake-model",
  useCache: true
});

if (!result.draft.draftId) throw new Error("draftId missing");
if (!result.aiText.includes("AI 潤飾")) throw new Error("AI text missing");
if (calls !== 1) throw new Error("Expected one fake provider call");

console.log("AI Gmail Draft Generator check passed.");
console.log(JSON.stringify({
  draftId: result.draft.draftId,
  subject: result.draft.subject,
  aiText: result.aiText,
  cached: result.aiResult.cached
}, null, 2));
