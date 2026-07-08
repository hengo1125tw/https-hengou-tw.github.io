export class AppError extends Error {
  constructor(message = "Application error", options = {}) {
    super(message);
    this.name = "AppError";
    this.code = options.code || "APP_ERROR";
    this.status = options.status || 500;
    this.details = options.details || null;
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      status: this.status,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp
    };
  }
}
