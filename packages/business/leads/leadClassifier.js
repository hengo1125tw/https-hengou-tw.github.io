import { classifyBusinessUnit } from "../units/businessUnitClassifier.js";
import { classifyProduct } from "../products/productClassifier.js";
import { getPricingGuidance } from "../products/pricingRules.js";
import { leadToSearchText } from "./leadNormalizer.js";

export function classifyLead(lead = {}) {
  const text = leadToSearchText(lead);

  const businessUnitResult = lead.businessUnitCode
    ? classifyBusinessUnit(lead.businessUnitCode)
    : classifyBusinessUnit(text);

  const businessUnitCode = businessUnitResult.businessUnit?.code || "OTHER";
  const productResult = classifyProduct(text, { businessUnitCode });

  return {
    businessUnit: businessUnitResult.businessUnit,
    businessUnitConfidence: businessUnitResult.confidence,
    businessUnitMatches: businessUnitResult.matches,
    product: productResult.product,
    productConfidence: productResult.confidence,
    productMatches: productResult.matches,
    pricingGuidance: getPricingGuidance(productResult.product)
  };
}
