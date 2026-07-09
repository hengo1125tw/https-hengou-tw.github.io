import { leadIntakeEngine, toLeadIntakeSummary } from "../../business/index.js";

export function buildLeadIntakeContext(input = {}) {
  const leadInput = {
    companyName: input.company?.name || input.company?.company_name,
    contactName: input.contact?.name || input.contact?.display_name,
    email: input.contact?.email,
    phone: input.contact?.phone,
    lineId: input.contact?.lineId || input.contact?.line_id,
    source: input.lead?.source || input.source,
    requirement: input.lead?.requirement || input.lead?.message || input.rawText,
    productName: input.product?.name || input.product?.product_name,
    businessUnitCode: input.businessUnitCode,
    budget: input.lead?.budget || input.budget,
    timeline: input.lead?.timeline || input.timeline,
    quantity: input.lead?.quantity || input.quantity,
    specification: input.lead?.specification || input.specification,
    targetCountry: input.lead?.targetCountry || input.targetCountry,
    hasAttachment: input.lead?.hasAttachment || input.hasAttachment
  };

  const result = leadIntakeEngine.analyze(leadInput);

  return {
    result,
    summary: toLeadIntakeSummary(result)
  };
}
