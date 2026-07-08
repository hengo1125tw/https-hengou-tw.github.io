import { AppError } from "./AppError.js";

export class ValidationError extends AppError {
  constructor(message = "Validation failed", details = null) {
    super(message, { code: "VALIDATION_ERROR", status: 400, details });
    this.name = "ValidationError";
  }
}
