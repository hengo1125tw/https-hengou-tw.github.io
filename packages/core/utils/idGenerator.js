import { ID_PREFIX } from "../config/constants.js";

export function generateSequentialId(prefix, sequence, size = 6) {
  const number = Number(sequence || 0);
  if (!prefix) throw new Error("ID prefix is required");
  if (!Number.isFinite(number) || number < 0) throw new Error("ID sequence must be a positive number");
  return `${prefix}-${String(number).padStart(size, "0")}`;
}

export const nextCompanyId = sequence => generateSequentialId(ID_PREFIX.COMPANY, sequence);
export const nextContactId = sequence => generateSequentialId(ID_PREFIX.CONTACT, sequence);
export const nextProductId = sequence => generateSequentialId(ID_PREFIX.PRODUCT, sequence);
export const nextOpportunityId = sequence => generateSequentialId(ID_PREFIX.OPPORTUNITY, sequence);
