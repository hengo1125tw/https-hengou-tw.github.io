import { leadIntakeEngine } from "../index.js";

const result = leadIntakeEngine.analyze({
  contactName: "Guest",
  requirement: "COSMO LS-R902 氣密測試設備"
});

const missingLabels = result.missingInfo.map(item => item.label);

if (!missingLabels.includes("公司名稱")) {
  throw new Error("Expected missing company name");
}

if (!missingLabels.includes("Email / 電話 / LINE")) {
  throw new Error("Expected missing contact method");
}

if (!missingLabels.includes("規格 / 型號 / 尺寸")) {
  throw new Error("Expected missing specification");
}

console.log("Lead Missing Info check passed.");
console.log(JSON.stringify({
  status: result.status,
  priority: result.priority,
  score: result.score,
  missingInfo: result.missingInfo,
  nextAction: result.nextAction
}, null, 2));
