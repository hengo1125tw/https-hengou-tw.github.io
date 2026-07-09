import { normalizeLeadInput } from "./leadNormalizer.js";
import { validateLeadInput } from "./leadIntakeSchema.js";
import { classifyLead } from "./leadClassifier.js";
import { analyzeMissingInfo } from "./missingInfoAnalyzer.js";
import { calculateLeadScore, calculateConfidence } from "./leadScoring.js";
import { recommendNextAction } from "./nextActionRules.js";
import { LEAD_STATUS } from "./leadConstants.js";

export class LeadIntakeEngine {
  analyze(input = {}) {
    const lead = normalizeLeadInput(input);
    validateLeadInput(lead);

    const classification = classifyLead(lead);
    const missingInfo = analyzeMissingInfo(lead, classification);
    const score = calculateLeadScore(lead, classification, missingInfo);
    const confidence = calculateConfidence(classification, missingInfo);
    const nextAction = recommendNextAction(lead, classification, score, missingInfo);

    const requiredMissing = missingInfo.filter(item => item.required).length;

    const status = requiredMissing > 0
      ? LEAD_STATUS.NEEDS_INFO
      : score.score >= 35
        ? LEAD_STATUS.QUALIFIED
        : LEAD_STATUS.LOW_FIT;

    return {
      lead,
      status,
      businessUnit: classification.businessUnit,
      product: classification.product,
      pricingGuidance: classification.pricingGuidance,
      score: score.score,
      priority: score.priority,
      confidence,
      scoreReasons: score.reasons,
      missingInfo,
      nextAction,
      classification: {
        businessUnitConfidence: classification.businessUnitConfidence,
        businessUnitMatches: classification.businessUnitMatches,
        productConfidence: classification.productConfidence,
        productMatches: classification.productMatches
      },
      analyzedAt: new Date().toISOString()
    };
  }
}

export const leadIntakeEngine = new LeadIntakeEngine();
