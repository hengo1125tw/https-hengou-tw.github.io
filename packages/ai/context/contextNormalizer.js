import { toText } from "../../core/utils/string.js";

export function normalizeCompany(company = {}) {
  return {
    id: toText(company.id || company.company_id),
    name: toText(company.name || company.company_name),
    taxId: toText(company.taxId || company.tax_id),
    industry: toText(company.industry),
    website: toText(company.website),
    country: toText(company.country || "Taiwan"),
    notes: toText(company.notes)
  };
}

export function normalizeContact(contact = {}) {
  const displayName = toText(contact.name || contact.display_name || `${contact.first_name || ""} ${contact.last_name || ""}`);
  return {
    id: toText(contact.id || contact.contact_id),
    name: displayName,
    email: toText(contact.email),
    phone: toText(contact.phone || contact.mobile),
    department: toText(contact.department),
    title: toText(contact.title || contact.job_title),
    lineId: toText(contact.lineId || contact.line_id)
  };
}

export function normalizeLead(lead = {}) {
  return {
    id: toText(lead.id || lead.lead_id),
    source: toText(lead.source || "Manual"),
    requirement: toText(lead.requirement || lead.message || lead.description),
    status: toText(lead.status || "New"),
    priority: toText(lead.priority),
    createdAt: toText(lead.createdAt || lead.created_at)
  };
}

export function normalizeProduct(product = {}) {
  return {
    id: toText(product.id || product.product_id),
    name: toText(product.name || product.product_name),
    category: toText(product.category),
    businessUnit: toText(product.businessUnit || product.business_unit),
    description: toText(product.description),
    standardPrice: product.standardPrice ?? product.standard_price ?? null
  };
}

export function normalizeOpportunity(opportunity = {}) {
  return {
    id: toText(opportunity.id || opportunity.opportunity_id),
    title: toText(opportunity.title),
    stage: toText(opportunity.stage || "New"),
    amount: opportunity.amount ?? opportunity.expected_amount ?? null,
    probability: opportunity.probability ?? null,
    expectedCloseDate: toText(opportunity.expectedCloseDate || opportunity.expected_close_date),
    risk: toText(opportunity.risk),
    nextAction: toText(opportunity.nextAction || opportunity.next_action)
  };
}
