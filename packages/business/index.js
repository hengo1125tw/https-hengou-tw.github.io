export { BUSINESS_UNITS, BUSINESS_UNIT_STATUS, BUSINESS_UNIT_CATEGORY } from "./units/businessUnits.js";
export { validateBusinessUnit, toBusinessUnitSummary } from "./units/businessUnitSchema.js";
export { BusinessUnitRegistry, businessUnitRegistry } from "./units/businessUnitRegistry.js";
export { classifyBusinessUnit, classifyLeadBusinessUnit } from "./units/businessUnitClassifier.js";

export { PRODUCT_STATUS, PRODUCT_TYPE, PRICING_MODEL } from "./products/productConstants.js";
export { PRODUCTS } from "./products/products.js";
export { validateProduct, toProductSummary } from "./products/productSchema.js";
export { ProductRegistry, productRegistry } from "./products/productRegistry.js";
export { classifyProduct, classifyLeadProduct } from "./products/productClassifier.js";
export { getPricingGuidance } from "./products/pricingRules.js";

export { LEAD_PRIORITY, LEAD_STATUS, LEAD_SOURCE, MISSING_INFO_TYPE } from "./leads/leadConstants.js";
export { normalizeLeadInput, leadToSearchText } from "./leads/leadNormalizer.js";
export { validateLeadInput } from "./leads/leadIntakeSchema.js";
export { classifyLead } from "./leads/leadClassifier.js";
export { analyzeMissingInfo } from "./leads/missingInfoAnalyzer.js";
export { calculateLeadScore, calculateConfidence } from "./leads/leadScoring.js";
export { recommendNextAction } from "./leads/nextActionRules.js";
export { LeadIntakeEngine, leadIntakeEngine } from "./leads/leadIntakeEngine.js";
export { toLeadIntakeSummary } from "./leads/leadSummary.js";

export { PROPOSAL_STATUS, PROPOSAL_SECTION, PROPOSAL_TEMPLATE_TYPE } from "./proposals/proposalConstants.js";
export { PROPOSAL_TEMPLATES } from "./proposals/proposalTemplates.js";
export { ProposalTemplateRegistry, proposalTemplateRegistry } from "./proposals/proposalTemplateRegistry.js";
export { validateProposal } from "./proposals/proposalSchema.js";
export { buildProposalFromLeadIntake } from "./proposals/proposalBuilder.js";
export { renderProposalMarkdown, renderProposalPlainText } from "./proposals/proposalRenderer.js";
export { ProposalGenerator, proposalGenerator } from "./proposals/proposalGenerator.js";


export { EMAIL_DRAFT_TYPE, EMAIL_DRAFT_STATUS, EMAIL_TONE } from "./email/emailConstants.js";
export { buildEmailSubject } from "./email/emailSubjectBuilder.js";
export { buildEmailDraftFromLeadIntake, buildEmailDraftFromProposal } from "./email/emailDraftBuilder.js";
export { renderEmailDraftText, renderEmailDraftMarkdown } from "./email/emailDraftRenderer.js";
export { EmailDraftGenerator, emailDraftGenerator } from "./email/emailDraftGenerator.js";
