import { proposalGenerator } from "../index.js";

const result = proposalGenerator.generateFromLead({
  companyName: "奇鋐科技",
  contactName: "Bill",
  email: "bill@avc.com.tw",
  requirement: "想評估 AOI 視覺檢測 OK NG Excel 紀錄，需求是水冷板重工檢測。",
  specification: "水冷板外觀瑕疵",
  timeline: "本季評估"
});

if (!result.proposal.proposalId) throw new Error("proposalId missing");
if (!result.markdown.includes("AOI")) throw new Error("proposal markdown should include AOI");
if (!result.markdown.includes("報價邏輯")) throw new Error("proposal markdown should include pricing guidance");

console.log("Proposal Generator check passed.");
console.log(JSON.stringify({
  proposalId: result.proposal.proposalId,
  title: result.proposal.title,
  businessUnit: result.proposal.businessUnit,
  product: result.proposal.product,
  markdownPreview: result.markdown.slice(0, 600)
}, null, 2));
