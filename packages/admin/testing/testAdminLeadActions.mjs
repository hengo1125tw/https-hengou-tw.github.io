import {
  analyzeLeadRow,
  generateProposalForLeadRow,
  generateEmailDraftForLeadRow,
  buildAdminAiActionBundle
} from "../actions/adminLeadActions.js";

const lead = {
  id: "HG-TEST-0001",
  company: "奇鋐科技",
  name: "Bill",
  email: "bill@avc.com.tw",
  need: "想評估 AOI 視覺檢測 OK NG Excel 紀錄，需求是水冷板重工檢測。",
  status: "評估中",
  created: "2026-07-08",
  spec: "水冷板外觀瑕疵"
};

const analysis = analyzeLeadRow(lead);
if (analysis.summary.businessUnitCode !== "AOI_SOFTWARE") {
  throw new Error(`Expected AOI_SOFTWARE, got ${analysis.summary.businessUnitCode}`);
}

const proposal = generateProposalForLeadRow(lead);
if (!proposal.markdown.includes("AOI")) {
  throw new Error("Proposal should include AOI");
}

const email = generateEmailDraftForLeadRow(lead);
if (!email.draft.subject.includes("AOI")) {
  throw new Error("Email subject should include AOI");
}

const bundle = buildAdminAiActionBundle(lead);
if (!bundle.proposalEmail.draft.related.proposalId) {
  throw new Error("Proposal email should link to proposalId");
}

console.log("Admin Lead Actions check passed.");
console.log(JSON.stringify({
  analysis: analysis.summary,
  proposalId: proposal.proposal.proposalId,
  emailSubject: email.draft.subject,
  proposalEmailSubject: bundle.proposalEmail.draft.subject
}, null, 2));
