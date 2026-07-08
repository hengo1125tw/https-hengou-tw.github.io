import { AIError } from "../errors/AIError.js";

export class BaseProvider {
  constructor(options = {}) {
    this.name = options.name || "base";
    this.model = options.model || "";
    this.apiKey = options.apiKey || "";
    this.baseUrl = options.baseUrl || "";
    this.timeoutMs = options.timeoutMs || 30000;
  }

  async chat() {
    throw new AIError("chat() is not implemented", {
      provider: this.name,
      model: this.model,
      code: "AI_PROVIDER_NOT_IMPLEMENTED"
    });
  }

  async embedding() {
    throw new AIError("embedding() is not implemented", {
      provider: this.name,
      model: this.model,
      code: "AI_PROVIDER_NOT_IMPLEMENTED"
    });
  }

  async vision() {
    throw new AIError("vision() is not implemented", {
      provider: this.name,
      model: this.model,
      code: "AI_PROVIDER_NOT_IMPLEMENTED"
    });
  }

  async image() {
    throw new AIError("image() is not implemented", {
      provider: this.name,
      model: this.model,
      code: "AI_PROVIDER_NOT_IMPLEMENTED"
    });
  }

  assertApiKey() {
    if (!this.apiKey) {
      throw new AIError(`${this.name} API key is missing`, {
        provider: this.name,
        model: this.model,
        code: "AI_PROVIDER_API_KEY_MISSING"
      });
    }
  }
}
