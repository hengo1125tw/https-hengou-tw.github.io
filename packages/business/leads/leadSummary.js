export function toLeadIntakeSummary(result = {}) {
  return {
    status: result.status,
    priority: result.priority,
    score: result.score,
    confidence: result.confidence,
    businessUnit: result.businessUnit?.displayName || "",
    businessUnitCode: result.businessUnit?.code || "",
    product: result.product?.displayName || "",
    sku: result.product?.sku || "",
    missingInfo: (result.missingInfo || []).map(item => item.label),
    nextAction: result.nextAction?.title || "",
    pricingGuidance: result.pricingGuidance || ""
  };
}
