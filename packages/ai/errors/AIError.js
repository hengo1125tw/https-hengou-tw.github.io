import { AppError } from "../../core/errors/AppError.js";

export class AIError extends AppError {
  constructor(message = "AI provider error", options = {}) {
    super(message, {
      code: options.code || "AI_ERROR",
      status: options.status || 500,
      details: options.details || null
    });

    this.name = "AIError";
    this.provider = options.provider || "";
    this.model = options.model || "";
  }
}
