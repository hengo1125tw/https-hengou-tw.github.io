import { PRICING_MODEL } from "./productConstants.js";

export function getPricingGuidance(product = {}) {
  switch (product.pricingModel) {
    case PRICING_MODEL.COST_PLUS:
      return "成本加成：先確認成本、運費、風險、服務費，再報價。";
    case PRICING_MODEL.PROJECT_SCOPE:
      return "專案估價：先確認需求範圍、交付項目、時程、維護責任，再報價。";
    case PRICING_MODEL.SUBSCRIPTION:
      return "訂閱制：確認月費、授權數、功能範圍、最短合約期。";
    case PRICING_MODEL.UNIT_PRICE:
      return "單價制：確認規格、數量、包裝、交期與運費。";
    case PRICING_MODEL.WEIGHT:
      return "重量制：確認重量、材積、運費、耗材與服務費。";
    case PRICING_MODEL.HOURLY:
      return "工時計價：確認時薪、預估時數、驗收範圍。";
    case PRICING_MODEL.FIXED:
      return "固定價格：確認是否含稅、運費、售後與例外條款。";
    case PRICING_MODEL.MANUAL:
    default:
      return "人工評估：資訊不足，需人工確認後報價。";
  }
}
