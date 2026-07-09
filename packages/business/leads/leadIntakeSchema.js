import { ValidationError } from "../../core/errors/ValidationError.js";

export function validateLeadInput(lead = {}) {
  const errors = [];

  if (!lead.companyName && !lead.contactName && !lead.email && !lead.phone && !lead.requirement) {
    errors.push("At least one lead field is required");
  }

  if (lead.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
    errors.push("email format is invalid");
  }

  if (lead.requirement && lead.requirement.length > 5000) {
    errors.push("requirement exceeds 5000 characters");
  }

  if (errors.length) {
    throw new ValidationError("Lead input validation failed", { errors, lead });
  }

  return true;
}
