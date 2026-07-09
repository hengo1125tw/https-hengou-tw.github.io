export const CONTEXT_SECTIONS = Object.freeze({
  COMPANY: "company",
  CONTACT: "contact",
  LEAD: "lead",
  LEAD_INTAKE: "leadIntake",
  PRODUCT: "product",
  PRODUCT_CATALOG: "productCatalog",
  OPPORTUNITY: "opportunity",
  BUSINESS_UNIT: "businessUnit",
  TIMELINE: "timeline",
  KNOWLEDGE: "knowledge",
  PLAYBOOK: "playbook",
  META: "meta"
});

export function createEmptyContext() {
  return {
    company: {},
    contact: {},
    lead: {},
    leadIntake: {
      result: null,
      summary: {}
    },
    product: {},
    productCatalog: {
      selected: null,
      pricingGuidance: "",
      classification: {
        score: 0,
        confidence: 0,
        matches: [],
        candidates: []
      }
    },
    opportunity: {},
    businessUnit: {
      selected: null,
      classification: {
        score: 0,
        confidence: 0,
        matches: [],
        candidates: []
      }
    },
    timeline: {
      latest: "",
      items: []
    },
    knowledge: [],
    playbook: {},
    meta: {
      source: "manual",
      createdAt: new Date().toISOString(),
      contextVersion: "v1"
    }
  };
}
