import { LEAD_PRIORITY } from "./leadConstants.js";

function hasCompanyDomain(email = "") {
  const value = String(email || "").toLowerCase();
  if (!value.includes("@")) return false;
  return !["@gmail.", "@yahoo.", "@hotmail.", "@outlook.", "@icloud."].some(domain => value.includes(domain));
}

export function calculateLeadScore(lead = {}, classification = {}, missingInfo = []) {
  let score = 0;
  const reasons = [];

  if (lead.companyName) {
    score += 8;
    reasons.push({ item: "公司名稱完整", score: 8 });
  }

  if (lead.email) {
    score += 6;
    reasons.push({ item: "有 Email", score: 6 });
  }

  if (hasCompanyDomain(lead.email)) {
    score += 10;
    reasons.push({ item: "公司網域 Email", score: 10 });
  }

  if (lead.phone || lead.lineId) {
    score += 8;
    reasons.push({ item: "有電話或 LINE", score: 8 });
  }

  if (lead.requirement?.length >= 30) {
    score += 12;
    reasons.push({ item: "需求描述足夠", score: 12 });
  }

  if (lead.requirement?.length >= 100) {
    score += 8;
    reasons.push({ item: "需求描述完整", score: 8 });
  }

  if (classification.businessUnit?.code && classification.businessUnit.code !== "OTHER") {
    score += 15;
    reasons.push({ item: "可判斷業務線", score: 15 });
  }

  if (classification.product?.sku && classification.product.sku !== "OTHER-MANUAL") {
    score += 15;
    reasons.push({ item: "可推薦產品/服務", score: 15 });
  }

  const highValueBusinessUnits = ["AI_PLATFORM", "AOI_SOFTWARE", "COSMO_EQUIPMENT", "EQUIPMENT_AGENCY", "WEBSITE_SYSTEM"];
  if (highValueBusinessUnits.includes(classification.businessUnit?.code)) {
    score += 10;
    reasons.push({ item: "高價值業務線", score: 10 });
  }

  const requiredMissing = missingInfo.filter(item => item.required).length;
  if (requiredMissing > 0) {
    const penalty = Math.min(25, requiredMissing * 8);
    score -= penalty;
    reasons.push({ item: `缺少必要資訊 ${requiredMissing} 項`, score: -penalty });
  }

  score = Math.max(0, Math.min(100, score));

  return {
    score,
    priority: score >= 85 ? LEAD_PRIORITY.CRITICAL
      : score >= 65 ? LEAD_PRIORITY.HIGH
      : score >= 35 ? LEAD_PRIORITY.MEDIUM
      : LEAD_PRIORITY.LOW,
    reasons
  };
}

export function calculateConfidence(classification = {}, missingInfo = []) {
  const buConfidence = classification.businessUnitConfidence || 0;
  const productConfidence = classification.productConfidence || 0;
  const missingPenalty = Math.min(35, missingInfo.length * 5);

  return Math.max(0, Math.min(100, Math.round(((buConfidence + productConfidence) / 2) - missingPenalty)));
}
