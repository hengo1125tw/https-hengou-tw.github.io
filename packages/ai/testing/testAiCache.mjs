import { AICache } from "../index.js";
const cache = new AICache({ defaultTtlMs: 1000 });
const key = cache.createKey({ provider: "openrouter", model: "openai/gpt-4o-mini", promptId: "PRM-TEST", messages: [{ role: "user", content: "hello" }] });
cache.set(key, { value: "ok" });
if (!cache.has(key)) throw new Error("Expected cache hit");
const value = cache.get(key);
if (value.value !== "ok") throw new Error("Cache value mismatch");
console.log("AI Cache check passed.");
console.log(JSON.stringify({ key, value }, null, 2));
