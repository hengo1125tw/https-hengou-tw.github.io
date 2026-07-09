import { businessUnitRegistry, classifyBusinessUnit } from "../../business/index.js";

export function buildBusinessUnitContext(input = {}) {
  if (input.businessUnitCode) {
    const unit = businessUnitRegistry.getByCode(input.businessUnitCode);
    if (unit) {
      return {
        selected: unit,
        classification: {
          score: 100,
          confidence: 100,
          matches: [{ type: "manual", value: input.businessUnitCode, weight: 100 }]
        }
      };
    }
  }

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

  const result = classifyBusinessUnit(text);

  return {
    selected: result.businessUnit,
    classification: {
      score: result.score,
      confidence: result.confidence,
      matches: result.matches,
      candidates: result.candidates?.map(candidate => ({
        code: candidate.unit.code,
        displayName: candidate.unit.displayName,
        score: candidate.score
      })) || []
    }
  };
}
