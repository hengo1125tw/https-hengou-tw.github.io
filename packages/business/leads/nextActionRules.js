import { LEAD_PRIORITY } from "./leadConstants.js";

export function recommendNextAction(lead = {}, classification = {}, scoreResult = {}, missingInfo = []) {
  const requiredMissing = missingInfo.filter(item => item.required);

  if (requiredMissing.length > 0) {
    return {
      action: "Request Missing Info",
      title: "先補齊必要資訊",
      description: `請先向客戶確認：${requiredMissing.map(item => item.label).join("、")}。`,
      dueInDays: 0
    };
  }

  const businessUnitCode = classification.businessUnit?.code;

  if (businessUnitCode === "COSMO_EQUIPMENT" || businessUnitCode === "EQUIPMENT_AGENCY") {
    return {
      action: "Prepare Equipment Qualification",
      title: "確認設備規格與原廠可供性",
      description: "先確認型號、用途、測試條件、交期與原廠報價，再進入正式報價。",
      dueInDays: scoreResult.priority === LEAD_PRIORITY.CRITICAL ? 0 : 1
    };
  }

  if (businessUnitCode === "PROTOFAB_3D") {
    return {
      action: "Request Drawing Or Photo",
      title: "確認列印圖檔、照片或尺寸",
      description: "請客戶提供 STL、圖片、尺寸、材質需求、數量與用途，才能估價。",
      dueInDays: 0
    };
  }

  if (businessUnitCode === "PACKAGING_MATERIALS") {
    return {
      action: "Confirm Quantity And Pickup",
      title: "確認數量與取貨方式",
      description: "確認包材品項、尺寸、重量、數量、面交或配送方式。",
      dueInDays: 0
    };
  }

  if (businessUnitCode === "TOOLS_PROCUREMENT") {
    return {
      action: "Prepare Sourcing List",
      title: "建立找貨與成本試算",
      description: "確認商品連結、規格、數量、交期、運送方式與是否需報關。",
      dueInDays: 1
    };
  }

  if (businessUnitCode === "AOI_SOFTWARE" || businessUnitCode === "AI_PLATFORM" || businessUnitCode === "WEBSITE_SYSTEM") {
    return {
      action: "Schedule Discovery Call",
      title: "安排需求訪談",
      description: "先確認流程、現況痛點、資料來源、導入時程與預算範圍。",
      dueInDays: scoreResult.priority === LEAD_PRIORITY.CRITICAL ? 0 : 2
    };
  }

  if (businessUnitCode === "LOGISTICS_CUSTOMS") {
    return {
      action: "Request Shipment Details",
      title: "確認貨物與目的地資訊",
      description: "請客戶提供品名、重量、材積、目的地、是否危險品、文件需求。",
      dueInDays: 0
    };
  }

  return {
    action: "Manual Review",
    title: "人工判斷案件",
    description: "目前資訊不足或類型不明，建議人工確認後再分類。",
    dueInDays: 1
  };
}
