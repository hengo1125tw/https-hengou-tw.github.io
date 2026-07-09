import { toText } from "../../core/utils/string.js";

export function normalizeLeadInput(input = {}) {
  return {
    leadId: toText(input.leadId || input.lead_id || input.id),
    companyName: toText(input.companyName || input.company_name || input.company),
    contactName: toText(input.contactName || input.contact_name || input.name),
    email: toText(input.email),
    phone: toText(input.phone || input.mobile),
    lineId: toText(input.lineId || input.line_id),
    source: toText(input.source || "Manual"),
    requirement: toText(input.requirement || input.message || input.description || input.note),
    productName: toText(input.productName || input.product_name || input.product),
    businessUnitCode: toText(input.businessUnitCode || input.business_unit_code),
    budget: toText(input.budget),
    timeline: toText(input.timeline || input.dueDate || input.due_date),
    quantity: toText(input.quantity || input.qty),
    specification: toText(input.specification || input.spec || input.size || input.model),
    targetCountry: toText(input.targetCountry || input.target_country || input.country),
    hasAttachment: Boolean(input.hasAttachment || input.has_attachment || input.file || input.image),
    createdAt: toText(input.createdAt || input.created_at) || new Date().toISOString(),
    raw: input
  };
}

export function leadToSearchText(lead = {}) {
  return [
    lead.companyName,
    lead.contactName,
    lead.email,
    lead.phone,
    lead.lineId,
    lead.source,
    lead.requirement,
    lead.productName,
    lead.businessUnitCode,
    lead.budget,
    lead.timeline,
    lead.quantity,
    lead.specification,
    lead.targetCountry
  ].filter(Boolean).join(" ");
}
