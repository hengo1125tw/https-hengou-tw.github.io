import { proposalGenerator, emailDraftGenerator, EMAIL_DRAFT_TYPE } from "../index.js";

const proposalResult = proposalGenerator.generateFromLead({
  companyName: "奇鋐科技",
  contactName: "Bill",
  email: "bill@avc.com.tw",
  requirement: "想評估 AOI 視覺檢測 OK NG Excel 紀錄。",
  specification: "水冷板外觀瑕疵"
});

const result = emailDraftGenerator.generateFromProposal(proposalResult.proposal, {
  type: EMAIL_DRAFT_TYPE.PROPOSAL
});

if (!result.draft.subject.includes("AOI")) throw new Error("proposal email subject should include AOI");
if (!result.draft.related.proposalId) throw new Error("proposalId relation missing");

console.log("Proposal Email Draft check passed.");
console.log(JSON.stringify({
  subject: result.draft.subject,
  related: result.draft.related,
  bodyPreview: result.draft.body.slice(0, 400)
}, null, 2));
