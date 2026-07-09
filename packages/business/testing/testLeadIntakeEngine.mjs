import { leadIntakeEngine } from "../index.js";

const cases = [
  {
    input: {
      companyName: "奇鋐科技",
      contactName: "Bill",
      email: "bill@avc.com.tw",
      phone: "0912345678",
      requirement: "想評估 AOI 視覺檢測 OK NG Excel 紀錄，需求是水冷板重工檢測。",
      specification: "水冷板，需判斷外觀瑕疵",
      timeline: "本季評估"
    },
    expectedBu: "AOI_SOFTWARE",
    expectedSku: "AOI-SW-CUSTOM"
  },
  {
    input: {
      companyName: "測試工作室",
      contactName: "Amy",
      lineId: "amy123",
      requirement: "我想做 3D列印 洞洞板 PETG 配件，數量 20 個。",
      quantity: "20",
      specification: "26mm 六角洞洞板"
    },
    expectedBu: "PROTOFAB_3D",
    expectedSku: "3D-PEGBOARD"
  },
  {
    input: {
      companyName: "出貨商",
      contactName: "Jason",
      phone: "0900000000",
      requirement: "我要買紙箱 包材 緩衝材，先試 500g。",
      quantity: "500g"
    },
    expectedBu: "PACKAGING_MATERIALS",
    expectedSku: "PACK-BOX"
  }
];

const results = cases.map(({ input, expectedBu, expectedSku }) => {
  const result = leadIntakeEngine.analyze(input);

  if (result.businessUnit.code !== expectedBu) {
    throw new Error(`Expected BU ${expectedBu}, got ${result.businessUnit.code}`);
  }

  if (result.product.sku !== expectedSku) {
    throw new Error(`Expected SKU ${expectedSku}, got ${result.product.sku}`);
  }

  return {
    status: result.status,
    priority: result.priority,
    score: result.score,
    confidence: result.confidence,
    businessUnit: result.businessUnit.code,
    product: result.product.sku,
    missingInfo: result.missingInfo.map(item => item.label),
    nextAction: result.nextAction.title
  };
});

console.log("Lead Intake Engine check passed.");
console.log(JSON.stringify(results, null, 2));
