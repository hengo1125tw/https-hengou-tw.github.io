import { ContextBuilder } from "../index.js";

const builder = new ContextBuilder();

const context = builder.buildForLead({
  company: { company_name: "奇鋐科技" },
  contact: { display_name: "Bill", email: "bill@avc.com.tw" },
  lead: {
    message: "想評估 AOI 視覺檢測 OK NG Excel 紀錄，需求是水冷板重工檢測。",
    specification: "水冷板外觀瑕疵"
  }
});

if (context.leadIntake.summary.businessUnit !== "AOI 視覺檢測軟體") {
  throw new Error("Lead intake business unit summary failed");
}

if (!context.leadIntake.summary.product.includes("AOI")) {
  throw new Error("Lead intake product summary failed");
}

console.log("Lead Intake Context check passed.");
console.log(JSON.stringify(context.leadIntake.summary, null, 2));
