import { ValidationError } from "../../core/errors/ValidationError.js";

export function validateProposal(proposal = {}) {
  const errors = [];

  if (!proposal.proposalId) errors.push("proposalId is required");
  if (!proposal.title) errors.push("title is required");
  if (!proposal.businessUnit) errors.push("businessUnit is required");
  if (!proposal.product) errors.push("product is required");
  if (!Array.isArray(proposal.sections)) errors.push("sections must be an array");

  if (errors.length) {
    throw new ValidationError("Proposal validation failed", { errors, proposal });
  }

  return true;
}
