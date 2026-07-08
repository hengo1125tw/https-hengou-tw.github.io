import { aiConfig } from "../config/aiConfig.js";
import { AIError } from "../errors/AIError.js";
import { OpenRouterProvider } from "./OpenRouterProvider.js";

export function createProvider(providerName = aiConfig.defaultProvider, options = {}) {
  const normalized = String(providerName || "").toLowerCase();

  if (normalized === "openrouter") {
    return new OpenRouterProvider({
      apiKey: options.apiKey ?? aiConfig.openRouter.apiKey,
      baseUrl: options.baseUrl ?? aiConfig.openRouter.baseUrl,
      model: options.model ?? aiConfig.defaultModel,
      timeoutMs: options.timeoutMs ?? aiConfig.defaults.timeoutMs,
      appName: options.appName ?? aiConfig.openRouter.appName,
      siteUrl: options.siteUrl ?? aiConfig.openRouter.siteUrl
    });
  }

  throw new AIError(`Unsupported AI provider: ${providerName}`, {
    provider: providerName,
    code: "AI_PROVIDER_UNSUPPORTED"
  });
}

export function listSupportedProviders() {
  return ["openrouter"];
}
