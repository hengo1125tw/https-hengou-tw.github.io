import { MISSING_INFO_TYPE } from "./leadConstants.js";

function hasText(value) {
  return String(value || "").trim().length > 0;
}

export function analyzeMissingInfo(lead = {}, classification = {}) {
  const missing = [];

  if (!hasText(lead.companyName)) {
    missing.push({
      type: MISSING_INFO_TYPE.COMPANY_NAME,
      label: "公司名稱",
      reason: "缺少公司名稱，較難判斷客戶產業與正式報價對象。",
      required: true
    });
  }

  if (!hasText(lead.contactName)) {
    missing.push({
      type: MISSING_INFO_TYPE.CONTACT_NAME,
      label: "聯絡人",
      reason: "缺少聯絡人，後續追蹤較不穩定。",
      required: false
    });
  }

  if (!hasText(lead.email) && !hasText(lead.phone) && !hasText(lead.lineId)) {
    missing.push({
      type: MISSING_INFO_TYPE.EMAIL,
      label: "Email / 電話 / LINE",
      reason: "缺少可追蹤的聯絡方式。",
      required: true
    });
  }

  if (!hasText(lead.requirement) || lead.requirement.length < 12) {
    missing.push({
      type: MISSING_INFO_TYPE.REQUIREMENT,
      label: "需求描述",
      reason: "需求描述不足，無法精準判斷產品與報價方式。",
      required: true
    });
  }

  const businessUnitCode = classification.businessUnit?.code || "";

  if (["PACKAGING_MATERIALS", "PROTOFAB_3D", "TOOLS_PROCUREMENT"].includes(businessUnitCode) && !hasText(lead.quantity)) {
    missing.push({
      type: MISSING_INFO_TYPE.QUANTITY,
      label: "數量",
      reason: "此類案件通常需要數量才能估價。",
      required: true
    });
  }

  if (["PROTOFAB_3D", "COSMO_EQUIPMENT", "EQUIPMENT_AGENCY", "AOI_SOFTWARE"].includes(businessUnitCode) && !hasText(lead.specification)) {
    missing.push({
      type: MISSING_INFO_TYPE.SPECIFICATION,
      label: "規格 / 型號 / 尺寸",
      reason: "此類案件需要規格或型號才能判斷可行性。",
      required: true
    });
  }

  if (["LOGISTICS_CUSTOMS", "TOOLS_PROCUREMENT"].includes(businessUnitCode) && !hasText(lead.targetCountry)) {
    missing.push({
      type: MISSING_INFO_TYPE.TARGET_COUNTRY,
      label: "目的地國家 / 地區",
      reason: "物流、報關或集運案件需確認目的地。",
      required: true
    });
  }

  if (["AI_PLATFORM", "AOI_SOFTWARE", "WEBSITE_SYSTEM", "EQUIPMENT_AGENCY", "COSMO_EQUIPMENT"].includes(businessUnitCode) && !hasText(lead.timeline)) {
    missing.push({
      type: MISSING_INFO_TYPE.TIMELINE,
      label: "導入時程 / 需求期限",
      reason: "專案型案件需確認時程以安排評估與報價。",
      required: false
    });
  }

  if (["AI_PLATFORM", "AOI_SOFTWARE", "WEBSITE_SYSTEM", "EQUIPMENT_AGENCY", "COSMO_EQUIPMENT"].includes(businessUnitCode) && !hasText(lead.budget)) {
    missing.push({
      type: MISSING_INFO_TYPE.BUDGET,
      label: "預算範圍",
      reason: "專案型案件有預算範圍會更容易提供合適方案。",
      required: false
    });
  }

  return missing;
}
