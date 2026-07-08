import { ValidationError } from "../errors/ValidationError.js";

export function required(value, fieldName = "field") {
  if (value === undefined || value === null || String(value).trim() === "") {
    throw new ValidationError(`${fieldName} is required`, { fieldName });
  }
  return true;
}

export function validateEmail(value) {
  if (!value) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
}

export function validateURL(value) {
  if (!value) return true;
  try { new URL(value); return true; } catch { return false; }
}

export function maxLength(value, max, fieldName = "field") {
  if (String(value || "").length > max) {
    throw new ValidationError(`${fieldName} exceeds max length ${max}`, { fieldName, max });
  }
  return true;
}
