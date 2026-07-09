import { productRegistry } from "./productRegistry.js";

function scoreProduct(product, text) {
  const source = String(text || "").toLowerCase();
  let score = 0;
  const matches = [];

  const fields = [
    { items: product.keywords || [], weight: 10, type: "keyword" },
    { items: [product.displayName, product.name, product.sku], weight: 8, type: "name" },
    { items: product.deliverables || [], weight: 5, type: "deliverable" },
    { items: product.targetCustomers || [], weight: 3, type: "target" }
  ];

  fields.forEach(group => {
    group.items.forEach(item => {
      const value = String(item || "").toLowerCase().trim();
      if (!value) return;
      if (source.includes(value)) {
        const specificityBonus = value.length >= 4 ? Math.min(6, Math.floor(value.length / 2)) : 0;
        const finalWeight = group.weight + specificityBonus;
        score += finalWeight;
        matches.push({ type: group.type, value: item, weight: finalWeight });
      }
    });
  });

  return { score, matches };
}

export function classifyProduct(input = "", options = {}) {
  const text = Array.isArray(input) ? input.join(" ") : String(input || "");
  const products = productRegistry.listActive({
    businessUnitCode: options.businessUnitCode
  });

  const scored = products
    .map(product => {
      const result = scoreProduct(product, text);
      return {
        product,
        score: result.score,
        matches: result.matches
      };
    })
    .sort((a, b) => b.score - a.score);

  const best = scored[0];

  if (!best || best.score <= 0) {
    return {
      product: productRegistry.getBySku("OTHER-MANUAL"),
      score: 0,
      confidence: 0,
      matches: [],
      candidates: scored.slice(0, options.limit || 5)
    };
  }

  return {
    product: best.product,
    score: best.score,
    confidence: Math.min(100, Math.round(best.score * 4)),
    matches: best.matches,
    candidates: scored.slice(0, options.limit || 5)
  };
}

export function classifyLeadProduct(lead = {}, options = {}) {
  const text = [
    lead.companyName,
    lead.contactName,
    lead.requirement,
    lead.message,
    lead.description,
    lead.productName,
    lead.businessUnitCode
  ].filter(Boolean).join(" ");

  return classifyProduct(text, options);
}
