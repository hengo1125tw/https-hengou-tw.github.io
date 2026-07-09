import { createProvider } from "../providers/providerFactory.js";
import { aiConfig } from "../config/aiConfig.js";
import { renderTemplate } from "./templateRenderer.js";
import { validatePrompt, validatePromptContext } from "./promptValidator.js";
import { estimateMessagesTokens } from "../utils/tokenEstimator.js";

export class PromptEngine {
  constructor(options = {}) {
    this.providerFactory = options.providerFactory || createProvider;
    this.defaultProvider = options.defaultProvider || aiConfig.defaultProvider;
  }

  buildMessages(prompt, context = {}, options = {}) {
    validatePrompt(prompt);

    const contextCheck = validatePromptContext(prompt, context);
    const strict = options.strict ?? false;

    const systemRendered = renderTemplate(prompt.systemPrompt || "", context, { strict });
    const userRendered = renderTemplate(prompt.userTemplate || "", context, { strict });

    const missing = Array.from(new Set([
      ...contextCheck.missing,
      ...systemRendered.missing,
      ...userRendered.missing
    ]));

    const messages = [];

    if (systemRendered.output.trim()) {
      messages.push({
        role: "system",
        content: systemRendered.output
      });
    }

    messages.push({
      role: "user",
      content: userRendered.output
    });

    return {
      messages,
      missing,
      estimatedTokens: estimateMessagesTokens(messages)
    };
  }

  async run(prompt, context = {}, options = {}) {
    const built = this.buildMessages(prompt, context, options);

    if ((options.failOnMissing ?? true) && built.missing.length) {
      return {
        ok: false,
        error: {
          code: "PROMPT_CONTEXT_MISSING",
          message: "Prompt context is missing required variables",
          missing: built.missing
        },
        messages: built.messages,
        result: null
      };
    }

    const providerName = options.provider || prompt.provider || this.defaultProvider;
    const provider = options.providerInstance || this.providerFactory(providerName, {
      apiKey: options.apiKey,
      model: options.model || prompt.model || aiConfig.defaultModel
    });

    const result = await provider.chat({
      messages: built.messages,
      model: options.model || prompt.model || aiConfig.defaultModel,
      temperature: options.temperature ?? prompt.temperature ?? aiConfig.defaults.temperature,
      maxTokens: options.maxTokens ?? prompt.maxTokens ?? aiConfig.defaults.maxTokens,
      metadata: {
        promptId: prompt.promptId,
        promptName: prompt.name,
        version: prompt.version || "v1",
        ...options.metadata
      }
    });

    return {
      ok: true,
      error: null,
      messages: built.messages,
      missing: built.missing,
      estimatedTokens: built.estimatedTokens,
      result
    };
  }
}

export const promptEngine = new PromptEngine();
