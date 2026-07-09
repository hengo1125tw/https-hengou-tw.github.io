import { classifyProduct, productRegistry, getPricingGuidance } from "../../business/index.js";

export function buildProductCatalogContext(input = {}) {
  if (input.productSku) {
    const product = productRegistry.getBySku(input.productSku);
    if (product) {
      return {
        selected: product,
        pricingGuidance: getPricingGuidance(product),
        classification: {
          score: 100,
          confidence: 100,
          matches: [{ type: "manual", value: input.productSku, weight: 100 }],
          candidates: []
        }
      };
    }
  }

  const businessUnitCode = input.businessUnit?.selected?.code || input.businessUnitCode || "";
  const text = [
    input.company?.name,
    input.company?.company_name,
    input.contact?.name,
    input.lead?.requirement,
    input.lead?.message,
    input.product?.name,
    input.product?.product_name,
    input.opportunity?.title,
    input.rawText
  ].filter(Boolean).join(" ");

  const result = classifyProduct(text, { businessUnitCode });

  return {
    selected: result.product,
    pricingGuidance: getPricingGuidance(result.product),
    classification: {
      score: result.score,
      confidence: result.confidence,
      matches: result.matches,
      candidates: result.candidates?.map(candidate => ({
        sku: candidate.product.sku,
        displayName: candidate.product.displayName,
        businessUnitCode: candidate.product.businessUnitCode,
        score: candidate.score
      })) || []
    }
  };
}
