import { ValidationError } from "../../core/errors/ValidationError.js";

export function validateProduct(product = {}) {
  const errors = [];

  if (!product.productId) errors.push("productId is required");
  if (!product.sku) errors.push("sku is required");
  if (!product.name) errors.push("name is required");
  if (!product.displayName) errors.push("displayName is required");
  if (!product.businessUnitCode) errors.push("businessUnitCode is required");
  if (!product.type) errors.push("type is required");
  if (!product.pricingModel) errors.push("pricingModel is required");
  if (!Array.isArray(product.keywords)) errors.push("keywords must be an array");
  if (!Array.isArray(product.deliverables)) errors.push("deliverables must be an array");
  if (!product.status) errors.push("status is required");

  if (errors.length) {
    throw new ValidationError("Product validation failed", { errors, product });
  }

  return true;
}

export function toProductSummary(product = {}) {
  return {
    productId: product.productId,
    sku: product.sku,
    name: product.name,
    displayName: product.displayName,
    businessUnitCode: product.businessUnitCode,
    type: product.type,
    pricingModel: product.pricingModel,
    status: product.status
  };
}
