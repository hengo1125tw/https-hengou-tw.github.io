import {
  leadIntakeEngine,
  toLeadIntakeSummary,
  proposalGenerator,
  emailDraftGenerator,
  EMAIL_DRAFT_TYPE
} from "../../business/index.js";

export function normalizeAdminLeadRow(row = {}) {
  return {
    leadId: row.id || row.leadId || row["Lead ID"] || "",
    companyName: row.company || row.companyName || row["公司名稱"] || "",
    contactName: row.name || row.contactName || row["姓名"] || "",
    email: row.email || row.Email || row["Email"] || "",
    phone: row.phone || row["電話"] || "",
    lineId: row.lineId || row["LINE"] || "",
    source: row.source || "Admin Dashboard",
    requirement: row.need || row.requirement || row.needs || row["AI 需求"] || row["需求"] || "",
    productName: row.productName || row.product || "",
    budget: row.budget || "",
    timeline: row.timeline || row.followUp || "",
    quantity: row.quantity || row.qty || "",
    specification: row.specification || row.spec || row.model || "",
    targetCountry: row.targetCountry || row.country || ""
  };
}

export function analyzeLeadRow(row = {}) {
  const leadInput = normalizeAdminLeadRow(row);
  const result = leadIntakeEngine.analyze(leadInput);

  return {
    result,
    summary: toLeadIntakeSummary(result)
  };
}

export function generateProposalForLeadRow(row = {}, options = {}) {
  const leadInput = normalizeAdminLeadRow(row);
  return proposalGenerator.generateFromLead(leadInput, options);
}

export function generateEmailDraftForLeadRow(row = {}, options = {}) {
  const leadInput = normalizeAdminLeadRow(row);
  return emailDraftGenerator.generateFromLead(leadInput, {
    type: options.type || EMAIL_DRAFT_TYPE.MISSING_INFO,
    tone: options.tone,
    ...options
  });
}

export function generateProposalEmailForLeadRow(row = {}, options = {}) {
  const leadInput = normalizeAdminLeadRow(row);
  return emailDraftGenerator.generateProposalEmailFromLead(leadInput, {
    type: options.type || EMAIL_DRAFT_TYPE.PROPOSAL,
    tone: options.tone,
    ...options
  });
}

export function buildAdminAiActionBundle(row = {}, options = {}) {
  const analysis = analyzeLeadRow(row);
  const proposal = generateProposalForLeadRow(row, {
    leadIntakeResult: analysis.result,
    ...options
  });
  const missingInfoEmail = emailDraftGenerator.generateFromLead(normalizeAdminLeadRow(row), {
    leadIntakeResult: analysis.result,
    type: EMAIL_DRAFT_TYPE.MISSING_INFO
  });
  const proposalEmail = emailDraftGenerator.generateFromProposal(proposal.proposal, {
    type: EMAIL_DRAFT_TYPE.PROPOSAL
  });

  return {
    analysis,
    proposal,
    missingInfoEmail,
    proposalEmail
  };
}
