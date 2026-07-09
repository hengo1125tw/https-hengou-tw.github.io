import { EMAIL_DRAFT_TYPE } from "./emailConstants.js";

export function buildEmailSubject(type, context = {}) {
  const company = context.companyName || context.customer?.companyName || "貴公司";
  const product = context.productName || context.product?.displayName || "服務方案";

  switch (type) {
    case EMAIL_DRAFT_TYPE.MISSING_INFO:
      return `關於${product}需求資訊確認｜${company}`;
    case EMAIL_DRAFT_TYPE.PROPOSAL:
      return `${product}初步提案｜${company}`;
    case EMAIL_DRAFT_TYPE.QUOTATION:
      return `${product}報價前資訊確認｜${company}`;
    case EMAIL_DRAFT_TYPE.DEMO_INVITATION:
      return `${product}需求訪談 / Demo 安排｜${company}`;
    case EMAIL_DRAFT_TYPE.THANK_YOU:
      return `感謝交流｜${company}`;
    case EMAIL_DRAFT_TYPE.FOLLOW_UP:
      return `${product}後續追蹤｜${company}`;
    case EMAIL_DRAFT_TYPE.INTRODUCTION:
    default:
      return `${product}服務初步說明｜${company}`;
  }
}
