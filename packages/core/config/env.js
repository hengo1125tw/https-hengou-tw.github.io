export function getEnv(name, fallback = "") {
  if (typeof window !== "undefined" && window.HG_ENV && Object.prototype.hasOwnProperty.call(window.HG_ENV, name)) {
    return window.HG_ENV[name];
  }
  if (typeof process !== "undefined" && process.env && Object.prototype.hasOwnProperty.call(process.env, name)) {
    return process.env[name];
  }
  return fallback;
}

export function requireEnv(name) {
  const value = getEnv(name);
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}
