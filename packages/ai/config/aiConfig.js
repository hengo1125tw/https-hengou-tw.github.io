import { getEnv } from "../../core/config/env.js";

export const aiConfig = Object.freeze({
  defaultProvider: getEnv("HG_AI_PROVIDER", "openrouter"),
  defaultModel: getEnv("HG_AI_MODEL", "openai/gpt-4o-mini"),
  openRouter: {
    baseUrl: getEnv("HG_OPENROUTER_URL", "https://openrouter.ai/api/v1"),
    apiKey: getEnv("HG_OPENROUTER_API_KEY", ""),
    appName: getEnv("HG_APP_NAME", "HengGou OS"),
    siteUrl: getEnv("HG_SITE_URL", "https://hengou1125tw.github.io")
  },
  defaults: {
    temperature: Number(getEnv("HG_AI_TEMPERATURE", "0.2")),
    maxTokens: Number(getEnv("HG_AI_MAX_TOKENS", "1200")),
    timeoutMs: Number(getEnv("HG_AI_TIMEOUT_MS", "30000"))
  }
});
