export const PROPOSAL_STATUS = Object.freeze({
  DRAFT: "draft",
  READY: "ready",
  REVIEW: "review",
  SENT: "sent",
  ARCHIVED: "archived"
});

export const PROPOSAL_SECTION = Object.freeze({
  COVER: "cover",
  EXECUTIVE_SUMMARY: "executive_summary",
  CUSTOMER_NEEDS: "customer_needs",
  SOLUTION: "solution",
  PRODUCT_SCOPE: "product_scope",
  DELIVERABLES: "deliverables",
  IMPLEMENTATION_PLAN: "implementation_plan",
  PRICING_GUIDANCE: "pricing_guidance",
  MISSING_INFO: "missing_info",
  NEXT_STEPS: "next_steps",
  COMPANY_PROFILE: "company_profile"
});

export const PROPOSAL_TEMPLATE_TYPE = Object.freeze({
  STANDARD: "standard",
  EQUIPMENT: "equipment",
  SOFTWARE: "software",
  SERVICE: "service",
  MATERIAL: "material",
  LOGISTICS: "logistics"
});
