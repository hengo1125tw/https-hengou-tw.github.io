import { AppError } from "./AppError.js";

export class ApiError extends AppError {
  constructor(message = "API request failed", options = {}) {
    super(message, {
      code: options.code || "API_ERROR",
      status: options.status || 500,
      details: options.details || null
    });
    this.name = "ApiError";
    this.url = options.url || "";
    this.method = options.method || "";
  }
}
