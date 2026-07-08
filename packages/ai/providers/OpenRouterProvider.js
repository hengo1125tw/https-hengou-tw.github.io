import { BaseProvider } from "./BaseProvider.js";
import { AIError } from "../errors/AIError.js";
import { estimateMessagesTokens } from "../utils/tokenEstimator.js";

function normalizeMessages(messages = []) {
  if (!Array.isArray(messages)) {
    throw new AIError("messages must be an array", {
      provider: "openrouter",
      code: "AI_INVALID_MESSAGES"
    });
  }

  return messages.map(message => ({
    role: message.role || "user",
    content: String(message.content || "")
  }));
}

export class OpenRouterProvider extends BaseProvider {
  constructor(options = {}) {
    super({
      name: "openrouter",
      model: options.model || "openai/gpt-4o-mini",
      apiKey: options.apiKey || "",
      baseUrl: options.baseUrl || "https://openrouter.ai/api/v1",
      timeoutMs: options.timeoutMs || 30000
    });

    this.appName = options.appName || "HengGou OS";
    this.siteUrl = options.siteUrl || "";
  }

  async chat({
    messages = [],
    model = this.model,
    temperature = 0.2,
    maxTokens = 1200,
    responseFormat = null,
    metadata = {}
  } = {}) {
    this.assertApiKey();

    const normalizedMessages = normalizeMessages(messages);
    const startedAt = Date.now();

    const body = {
      model,
      messages: normalizedMessages,
      temperature,
      max_tokens: maxTokens
    };

    if (responseFormat) {
      body.response_format = responseFormat;
    }

    const headers = {
      "Authorization": `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": this.siteUrl,
      "X-Title": this.appName
    };

    let response;
    let payload;

    try {
      response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers,
        body: JSON.stringify(body)
      });

      const text = await response.text();

      try {
        payload = text ? JSON.parse(text) : {};
      } catch {
        payload = { raw: text };
      }

      if (!response.ok) {
        throw new AIError("OpenRouter request failed", {
          provider: this.name,
          model,
          status: response.status,
          code: "OPENROUTER_REQUEST_FAILED",
          details: payload
        });
      }

      const output = payload?.choices?.[0]?.message?.content || "";
      const usage = payload?.usage || {};

      return {
        provider: this.name,
        model,
        output,
        raw: payload,
        usage: {
          promptTokens: usage.prompt_tokens ?? estimateMessagesTokens(normalizedMessages),
          completionTokens: usage.completion_tokens ?? null,
          totalTokens: usage.total_tokens ?? null
        },
        meta: {
          latencyMs: Date.now() - startedAt,
          cached: false,
          metadata
        }
      };
    } catch (error) {
      if (error instanceof AIError) throw error;

      throw new AIError(error.message || "OpenRouter provider failed", {
        provider: this.name,
        model,
        code: "OPENROUTER_PROVIDER_FAILED",
        details: error
      });
    }
  }
}
