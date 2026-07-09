import { classifyProduct } from "../index.js";

const cases = [
  ["我想做 3D列印 洞洞板 PETG 配件", "3D-PEGBOARD"],
  ["我要買紙箱 包材 緩衝材", "PACK-BOX"],
  ["工業膠膜 棧板膜 包裝膜", "PACK-FILM"],
  ["COSMO LS-R902 氣密測試設備", "COSMO-LS-R902"],
  ["AOI 視覺檢測 OK NG Excel 紀錄", "AOI-SW-CUSTOM"],
  ["Google Sheets Apps Script 表單 Gmail 自動化", "SYS-GSHEET"],
  ["淘寶 1688 工具代購 找貨", "PROC-TAOBAO"]
];

const results = cases.map(([text, expected]) => {
  const result = classifyProduct(text);
  const actual = result.product.sku;

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

console.log("Product Classifier check passed.");
console.log(JSON.stringify(results, null, 2));
