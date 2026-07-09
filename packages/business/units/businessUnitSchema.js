import { ValidationError } from "../../core/errors/ValidationError.js";

export function validateBusinessUnit(unit = {}) {
  const errors = [];

  if (!unit.businessUnitId) errors.push("businessUnitId is required");
  if (!unit.code) errors.push("code is required");
  if (!unit.name) errors.push("name is required");
  if (!unit.displayName) errors.push("displayName is required");
  if (!unit.category) errors.push("category is required");
  if (!Array.isArray(unit.mainProducts)) errors.push("mainProducts must be an array");
  if (!Array.isArray(unit.salesKeywords)) errors.push("salesKeywords must be an array");
  if (!unit.status) errors.push("status is required");

  if (errors.length) {
    throw new ValidationError("Business unit validation failed", { errors, unit });
  }

  return true;
}

export function toBusinessUnitSummary(unit = {}) {
  return {
    businessUnitId: unit.businessUnitId,
    code: unit.code,
    name: unit.name,
    displayName: unit.displayName,
    category: unit.category,
    status: unit.status
  };
}
