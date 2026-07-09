import { validatePrompt } from "./promptValidator.js";

export class PromptRegistry {
  constructor(initialPrompts = []) {
    this.prompts = new Map();
    initialPrompts.forEach(prompt => this.register(prompt));
  }

  register(prompt) {
    validatePrompt(prompt);
    this.prompts.set(prompt.promptId, {
      version: "v1",
      status: "active",
      provider: "openrouter",
      model: "",
      temperature: 0.2,
      maxTokens: 1200,
      ...prompt,
      updatedAt: new Date().toISOString()
    });

    return this.get(prompt.promptId);
  }

  get(promptId) {
    return this.prompts.get(promptId) || null;
  }

  list(filter = {}) {
    return Array.from(this.prompts.values()).filter(prompt => {
      if (filter.category && prompt.category !== filter.category) return false;
      if (filter.status && prompt.status !== filter.status) return false;
      if (filter.provider && prompt.provider !== filter.provider) return false;
      return true;
    });
  }

  remove(promptId) {
    return this.prompts.delete(promptId);
  }
}

export const promptRegistry = new PromptRegistry();
