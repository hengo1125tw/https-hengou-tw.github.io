import { ValidationError } from "../../core/errors/ValidationError.js";
import { extractPromptVariables } from "./variableExtractor.js";

export function validatePrompt(prompt = {}) {
  const errors = [];

  if (!prompt.promptId) errors.push("promptId is required");
  if (!prompt.name) errors.push("name is required");
  if (!prompt.category) errors.push("category is required");
  if (!prompt.userTemplate) errors.push("userTemplate is required");

  if (prompt.temperature !== undefined) {
    const temperature = Number(prompt.temperature);
    if (!Number.isFinite(temperature) || temperature < 0 || temperature > 2) {
      errors.push("temperature must be between 0 and 2");
    }
  }

  if (prompt.maxTokens !== undefined) {
    const maxTokens = Number(prompt.maxTokens);
    if (!Number.isFinite(maxTokens) || maxTokens <= 0) {
      errors.push("maxTokens must be a positive number");
    }
  }

  if (errors.length) {
    throw new ValidationError("Prompt validation failed", { errors });
  }

  return {
    ok: true,
    variables: extractPromptVariables(prompt)
  };
}

export function validatePromptContext(prompt = {}, context = {}) {
  const variables = extractPromptVariables(prompt).all;
  const missing = variables.filter(key => {
    const value = String(key)
      .split(".")
      .reduce((current, part) => current?.[part], context);

    return value === undefined || value === null || value === "";
  });

  return {
    ok: missing.length === 0,
    missing
  };
}
