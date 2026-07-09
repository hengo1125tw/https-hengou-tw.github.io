import { ContextBuilder, createContextPreview } from "../index.js";

const builder = new ContextBuilder();

const context = builder.buildForLead({
  company: {
    company_name: "奇鋐科技",
    industry: "Thermal / Electronics",
    country: "Taiwan"
  },
  contact: {
    display_name: "Bill",
    email: "bill@example.com",
    job_title: "Manager"
  },
  lead: {
    message: "想評估 AOI 視覺檢測與 AI Agent 導入。",
    source: "Website"
  },
  product: {
    product_name: "AOI Software",
    business_unit: "AOI"
  },
  timeline: [
    {
      event_type: "Lead Created",
      title: "Website inquiry",
      description: "客戶詢問 AOI 與 AI Agent 導入可行性。"
    }
  ],
  knowledge: [
    {
      title: "AOI Software Intro",
      content: "AOI 軟體可進行影像檢測、OK/NG 判定、Excel 匯出與資料追蹤。"
    }
  ],
  playbook: {
    name: "AOI Sales Playbook",
    current_step: "Initial Inquiry",
    next_step: "Needs Interview",
    steps: [
      { name: "需求訪談", description: "確認檢測項目、產線環境、節拍與資料需求。" },
      { name: "Demo", description: "展示 AOI 軟體基本流程。" }
    ]
  }
});

if (context.company.name !== "奇鋐科技") throw new Error("Company context failed");
if (context.contact.name !== "Bill") throw new Error("Contact context failed");
if (context.timeline.items.length !== 1) throw new Error("Timeline context failed");
if (context.knowledge.length !== 1) throw new Error("Knowledge context failed");

console.log("Context builder check passed.");
console.log(JSON.stringify(createContextPreview(context), null, 2));
