import { createProvider, listSupportedProviders } from "../index.js";

const providers = listSupportedProviders();

if (!providers.includes("openrouter")) {
  throw new Error("openrouter provider is not registered");
}

const provider = createProvider("openrouter", {
  apiKey: "test-key",
  model: "openai/gpt-4o-mini"
});

if (provider.name !== "openrouter") {
  throw new Error("provider factory returned wrong provider");
}

console.log("Provider factory check passed.");
