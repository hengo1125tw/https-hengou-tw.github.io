import { ContextBuilder } from "../index.js";

const builder = new ContextBuilder();

const cases = [
  ["我想做 3D列印 洞洞板 PETG 配件，數量 10 個，規格 26mm", "PROTOFAB_3D", "3D-PEGBOARD"],
  ["我要買紙箱 包材 緩衝材，數量 500g", "PACKAGING_MATERIALS", "PACK-BOX"],
  ["COSMO LS-R902 氣密測試設備，型號 LS-R902", "COSMO_EQUIPMENT", "COSMO-LS-R902"],
  ["AOI 視覺檢測 OK NG Excel 紀錄，規格 水冷板", "AOI_SOFTWARE", "AOI-SW-CUSTOM"]
];

const results = cases.map(([message, expectedBu, expectedSku]) => {
  const context = builder.buildForLead({
    lead: { message },
    company: { company_name: "測試公司" },
    contact: { display_name: "測試客戶", email: "test@example.com" }
  });

  if (context.businessUnit.selected.code !== expectedBu) {
    throw new Error(`Expected BU ${expectedBu}, got ${context.businessUnit.selected.code}`);
  }

  if (context.productCatalog.selected.sku !== expectedSku) {
    throw new Error(`Expected SKU ${expectedSku}, got ${context.productCatalog.selected.sku}`);
  }

  return {
    message,
    businessUnit: context.businessUnit.selected.code,
    product: context.productCatalog.selected.sku,
    productName: context.productCatalog.selected.displayName,
    pricingGuidance: context.productCatalog.pricingGuidance
  };
});

console.log("Product Catalog Context check passed.");
console.log(JSON.stringify(results, null, 2));
