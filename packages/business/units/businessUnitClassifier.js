import { businessUnitRegistry } from "./businessUnitRegistry.js";

function scoreUnit(unit, text) {
  const source = String(text || "").toLowerCase();
  let score = 0;
  const matches = [];

  const fields = [
    { items: unit.salesKeywords || [], weight: 10, type: "keyword" },
    { items: unit.mainProducts || [], weight: 8, type: "product" },
    { items: [unit.displayName, unit.name, unit.code], weight: 6, type: "name" },
    { items: unit.targetCustomers || [], weight: 3, type: "target" }
  ];

  fields.forEach(group => {
    group.items.forEach(item => {
      const value = String(item || "").toLowerCase().trim();
      if (!value) return;
      if (source.includes(value)) {
        score += group.weight;
        matches.push({ type: group.type, value: item, weight: group.weight });
      }
    });
  });

  return { score, matches };
}

export function classifyBusinessUnit(input = "", options = {}) {
  const text = Array.isArray(input) ? input.join(" ") : String(input || "");
  const units = options.units || businessUnitRegistry.list({ status: "active" });

  const scored = units
    .map(unit => {
      const result = scoreUnit(unit, text);
      return {
        unit,
        score: result.score,
        matches: result.matches
      };
    })
    .sort((a, b) => b.score - a.score);

  const best = scored[0];

  if (!best || best.score <= 0) {
    return {
      businessUnit: businessUnitRegistry.getByCode("OTHER"),
      score: 0,
      confidence: 0,
      matches: [],
      candidates: scored.slice(0, options.limit || 5)
    };
  }

  const confidence = Math.min(100, Math.round(best.score * 4));

  return {
    businessUnit: best.unit,
    score: best.score,
    confidence,
    matches: best.matches,
    candidates: scored.slice(0, options.limit || 5)
  };
}

export function classifyLeadBusinessUnit(lead = {}) {
  const text = [
    lead.companyName,
    lead.contactName,
    lead.email,
    lead.phone,
    lead.requirement,
    lead.message,
    lead.description,
    lead.source
  ].filter(Boolean).join(" ");

  return classifyBusinessUnit(text);
}
