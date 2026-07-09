import { classifyBusinessUnit } from "../index.js";

const cases = [
  ["我想做 3D列印 洞洞板 PETG 配件", "PROTOFAB_3D"],
  ["我要買紙箱 包材 緩衝材 膠膜", "PACKAGING_MATERIALS"],
  ["COSMO LS-R902 氣密測試設備", "COSMO_EQUIPMENT"],
  ["淘寶 1688 工具代購 找貨", "TOOLS_PROCUREMENT"],
  ["AOI 視覺檢測 OK NG Excel 紀錄", "AOI_SOFTWARE"],
  ["我需要 AI Agent CRM 自動化", "AI_PLATFORM"],
  ["越南 空運 報關 集運", "LOGISTICS_CUSTOMS"],
  ["企業網站 LINE OA Google Sheets 系統", "WEBSITE_SYSTEM"]
];

const results = cases.map(([text, expected]) => {
  const result = classifyBusinessUnit(text);
  const actual = result.businessUnit.code;
  if (actual !== expected) {
    throw new Error(`Expected ${expected}, got ${actual} for text: ${text}`);
  }
  return {
    text,
    expected,
    actual,
    confidence: result.confidence,
    matches: result.matches
  };
});

console.log("Business Unit Classifier check passed.");
console.log(JSON.stringify(results, null, 2));
