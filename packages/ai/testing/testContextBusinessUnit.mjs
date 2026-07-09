import { ContextBuilder } from "../index.js";

const builder = new ContextBuilder();

const context = builder.buildForLead({
  company: { company_name: "客戶公司" },
  contact: { display_name: "客戶" },
  lead: { message: "我想做 3D列印 洞洞板 PETG 配件" },
  product: {}
});

if (context.businessUnit.selected.code !== "PROTOFAB_3D") {
  throw new Error(`Expected PROTOFAB_3D, got ${context.businessUnit.selected.code}`);
}

console.log("Context Business Unit check passed.");
console.log(JSON.stringify(context.businessUnit, null, 2));
