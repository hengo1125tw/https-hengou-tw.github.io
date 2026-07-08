export const LOG_LEVELS = Object.freeze({
  DEBUG: "debug",
  INFO: "info",
  WARN: "warn",
  ERROR: "error"
});

function writeLog(level, scope, message, data = null) {
  const entry = { level, scope, message, data, timestamp: new Date().toISOString() };
  const method = level === LOG_LEVELS.ERROR ? "error" : level === LOG_LEVELS.WARN ? "warn" : "log";
  console[method]("[HengGouOS]", entry);
  return entry;
}

export function createLogger(scope = "app") {
  return {
    debug(message, data = null) { return writeLog(LOG_LEVELS.DEBUG, scope, message, data); },
    info(message, data = null) { return writeLog(LOG_LEVELS.INFO, scope, message, data); },
    warn(message, data = null) { return writeLog(LOG_LEVELS.WARN, scope, message, data); },
    error(message, data = null) { return writeLog(LOG_LEVELS.ERROR, scope, message, data); }
  };
}

export const logger = createLogger("core");
