import { estimateTokens } from "../utils/tokenEstimator.js";

export function createContextPreview(context = {}) {
  const json = JSON.stringify(context, null, 2);

  return {
    sections: Object.keys(context),
    estimatedTokens: estimateTokens(json),
    characterCount: json.length,
    json
  };
}
