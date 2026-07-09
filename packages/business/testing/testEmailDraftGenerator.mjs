import { emailDraftGenerator, EMAIL_DRAFT_TYPE } from "../index.js";

const result = emailDraftGenerator.generateFromLead({
  companyName: "奇鋐科技",
  contactName: "Bill",
  email: "bill@avc.com.tw",
  requirement: "想評估 AOI 視覺檢測 OK NG Excel 紀錄。",
  specification: "水冷板外觀瑕疵"
}, {
  type: EMAIL_DRAFT_TYPE.MISSING_INFO
});

if (!result.draft.draftId) throw new Error("draftId missing");
if (!result.draft.subject.includes("AOI")) throw new Error("subject should include AOI");
if (!result.text.includes("To: bill@avc.com.tw")) throw new Error("recipient missing");

console.log("Email Draft Generator check passed.");
console.log(JSON.stringify({
  draftId: result.draft.draftId,
  subject: result.draft.subject,
  bodyPreview: result.draft.body.slice(0, 400),
  related: result.draft.related
}, null, 2));
