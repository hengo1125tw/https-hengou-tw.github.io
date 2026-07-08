export { createApiClient } from "./api/apiClient.js";
export { ENDPOINTS } from "./api/endpoints.js";
export { ok, fail } from "./api/response.js";

export { appConfig } from "./config/appConfig.js";
export { APP_CONSTANTS, ID_PREFIX } from "./config/constants.js";
export { getEnv, requireEnv } from "./config/env.js";

export { logger, createLogger, LOG_LEVELS } from "./logger/logger.js";

export { MemoryCache, memoryCache } from "./cache/memoryCache.js";
export { cacheKey, CACHE_NAMESPACE } from "./cache/cacheKeys.js";

export { AppError } from "./errors/AppError.js";
export { ValidationError } from "./errors/ValidationError.js";
export { ApiError } from "./errors/ApiError.js";

export { nowISO, formatDate, addDays } from "./utils/date.js";
export { toText, normalizeKeyword, truncate } from "./utils/string.js";
export { required, validateEmail, validateURL, maxLength } from "./utils/validation.js";
export { formatCurrency, formatPhone, formatFileSize } from "./utils/formatter.js";
export { generateSequentialId, nextCompanyId, nextContactId, nextProductId, nextOpportunityId } from "./utils/idGenerator.js";
