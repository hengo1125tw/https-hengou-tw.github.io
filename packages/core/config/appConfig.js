import { APP_CONSTANTS } from "./constants.js";
import { getEnv } from "./env.js";

export const appConfig = Object.freeze({
  appName: APP_CONSTANTS.APP_NAME,
  version: getEnv("HG_VERSION", "v1.2.0-alpha.1"),
  apiBaseUrl: getEnv("HG_API_BASE_URL", ""),
  openRouterUrl: getEnv("HG_OPENROUTER_URL", "https://openrouter.ai/api/v1"),
  locale: APP_CONSTANTS.DEFAULT_LOCALE,
  timezone: APP_CONSTANTS.DEFAULT_TIMEZONE,
  currency: APP_CONSTANTS.DEFAULT_CURRENCY
});
