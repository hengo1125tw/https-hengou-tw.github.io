import { toText, truncate } from "../../core/utils/string.js";

export function buildKnowledgeContext(documents = [], options = {}) {
  const maxItems = options.maxItems ?? 5;
  const maxChars = options.maxChars ?? 1200;

  return (Array.isArray(documents) ? documents : [])
    .slice(0, maxItems)
    .map(doc => ({
      id: toText(doc.id || doc.document_id),
      title: toText(doc.title || doc.name),
      source: toText(doc.source || doc.file || "Knowledge"),
      content: truncate(toText(doc.content || doc.summary || doc.text), maxChars)
    }))
    .filter(doc => doc.title || doc.content);
}
