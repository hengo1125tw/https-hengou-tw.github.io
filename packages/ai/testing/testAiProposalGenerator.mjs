import { AIProposalGenerator, AIExecutionEngine, PromptEngine, AIUsageLog, AICache } from "../index.js";

let calls = 0;
const fakeProvider = {
  chat: async ({ messages, model }) => {
    calls += 1;
    return {
      provider: "fake",
      model,
      output: "客戶版提案：這是一份經 AI 潤飾的提案。\n待確認事項：規格、預算、時程。\n建議下一步：安排需求訪談。",
      raw: { messages },
      usage: { promptTokens: 100, completionTokens: 30, totalTokens: 130 },
      meta: { latencyMs: 1 }
    };
  }
};

const generator = new AIProposalGenerator({
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
  requirement: "想評估 AOI 視覺檢測 OK NG Excel 紀錄，需求是水冷板重工檢測。",
  specification: "水冷板外觀瑕疵"
}, {
  providerInstance: fakeProvider,
  model: "fake-model",
  useCache: true
});

if (!result.proposal.proposalId) throw new Error("proposalId missing");
if (!result.aiText.includes("AI 潤飾")) throw new Error("AI text missing");
if (calls !== 1) throw new Error("Expected one fake provider call");

console.log("AI Proposal Generator check passed.");
console.log(JSON.stringify({
  proposalId: result.proposal.proposalId,
  aiText: result.aiText,
  cached: result.aiResult.cached
}, null, 2));
