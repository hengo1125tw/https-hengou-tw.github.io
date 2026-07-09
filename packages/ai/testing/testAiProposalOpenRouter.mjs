import { aiProposalGenerator } from "../index.js";

const apiKey = process.env.HG_OPENROUTER_API_KEY;

if (!apiKey) {
  console.error("Missing HG_OPENROUTER_API_KEY");
  process.exit(1);
}

const result = await aiProposalGenerator.generateFromLead({
  companyName: "奇鋐科技",
  contactName: "Bill",
  email: "bill@avc.com.tw",
  requirement: "想評估 AOI 視覺檢測 OK NG Excel 紀錄，需求是水冷板重工檢測。",
  specification: "水冷板外觀瑕疵",
  timeline: "本季評估"
}, {
  apiKey,
  model: process.env.HG_AI_MODEL || "openai/gpt-4o-mini",
  maxTokens: 1200,
  useCache: true
});

console.log(JSON.stringify({
  proposalId: result.proposal.proposalId,
  aiText: result.aiText,
  usage: result.aiResult.result?.usage || null,
  cacheKey: result.aiResult.cacheKey
}, null, 2));
