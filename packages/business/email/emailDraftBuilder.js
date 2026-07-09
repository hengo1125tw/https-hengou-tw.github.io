import { EMAIL_DRAFT_STATUS, EMAIL_DRAFT_TYPE, EMAIL_TONE } from "./emailConstants.js";
import { buildEmailSubject } from "./emailSubjectBuilder.js";

function nextDraftId() {
  return `DRF-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function greeting(contactName = "") {
  return contactName ? `${contactName} 您好：` : "您好：";
}

function closing() {
  return [
    "以上先提供您參考。",
    "若方便，請回覆目前可補充的資訊，我們再協助整理下一步方案。",
    "",
    "謝謝。"
  ].join("\n");
}

function missingInfoLines(missingInfo = []) {
  if (!missingInfo.length) return "目前初步資訊已足夠進入下一步確認。";
  return missingInfo.map((item, index) => `${index + 1}. ${item.label || item}`).join("\n");
}

export function buildEmailDraftFromLeadIntake(leadIntakeResult = {}, options = {}) {
  const type = options.type || EMAIL_DRAFT_TYPE.MISSING_INFO;
  const lead = leadIntakeResult.lead || {};
  const product = leadIntakeResult.product || {};
  const businessUnit = leadIntakeResult.businessUnit || {};
  const nextAction = leadIntakeResult.nextAction || {};
  const missingInfo = leadIntakeResult.missingInfo || [];

  const subject = buildEmailSubject(type, {
    companyName: lead.companyName,
    productName: product.displayName
  });

  const lines = [];
  lines.push(greeting(lead.contactName));
  lines.push("");

  if (type === EMAIL_DRAFT_TYPE.PROPOSAL) {
    lines.push(`針對您目前提到的需求，我們先整理「${product.displayName || "相關服務"}」的初步方向供您參考。`);
    lines.push("");
    lines.push(`目前系統初步判斷業務線為：${businessUnit.displayName || "待確認"}`);
    lines.push(`建議產品 / 服務為：${product.displayName || "待確認"}`);
    lines.push("");
    lines.push("正式報價前，仍需依實際規格、數量、時程與交付範圍確認。");
  } else if (type === EMAIL_DRAFT_TYPE.DEMO_INVITATION) {
    lines.push(`關於「${product.displayName || "相關服務"}」的需求，我們建議先安排一次需求訪談或 Demo。`);
    lines.push("");
    lines.push("會議中可以先確認使用情境、目前痛點、規格條件、導入時程與預算範圍。");
  } else if (type === EMAIL_DRAFT_TYPE.FOLLOW_UP) {
    lines.push(`想跟您追蹤「${product.displayName || "相關服務"}」的後續評估狀況。`);
    lines.push("");
    lines.push(nextAction.description || "若您目前已有進一步資料，我們可以協助整理下一步方案。");
  } else {
    lines.push(`我們已收到您關於「${product.displayName || "相關服務"}」的需求。`);
    lines.push("");
    lines.push("為了讓後續評估與報價更準確，想先跟您確認以下資訊：");
    lines.push("");
    lines.push(missingInfoLines(missingInfo));
  }

  lines.push("");
  lines.push(closing());

  return {
    draftId: options.draftId || nextDraftId(),
    type,
    status: EMAIL_DRAFT_STATUS.DRAFT,
    tone: options.tone || EMAIL_TONE.DIRECT,
    to: lead.email || "",
    subject,
    body: lines.join("\n"),
    related: {
      businessUnitCode: businessUnit.code || "",
      sku: product.sku || "",
      leadStatus: leadIntakeResult.status || "",
      priority: leadIntakeResult.priority || "",
      score: leadIntakeResult.score ?? null,
      confidence: leadIntakeResult.confidence ?? null
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export function buildEmailDraftFromProposal(proposal = {}, options = {}) {
  const subject = buildEmailSubject(options.type || EMAIL_DRAFT_TYPE.PROPOSAL, {
    customer: proposal.customer,
    product: proposal.product
  });

  const lines = [
    greeting(proposal.customer?.contactName),
    "",
    `針對「${proposal.product?.displayName || "相關服務"}」，我們先整理一份初步提案供您參考。`,
    "",
    "本提案目前為初步版本，正式報價仍需依實際規格、數量、時程與交付範圍確認。",
    "",
    "提案重點如下：",
    `1. 業務線：${proposal.businessUnit?.displayName || ""}`,
    `2. 產品 / 服務：${proposal.product?.displayName || ""}`,
    `3. 建議下一步：${proposal.nextAction?.title || "需求確認"}`,
    "",
    closing()
  ];

  return {
    draftId: options.draftId || nextDraftId(),
    type: options.type || EMAIL_DRAFT_TYPE.PROPOSAL,
    status: EMAIL_DRAFT_STATUS.DRAFT,
    tone: options.tone || EMAIL_TONE.DIRECT,
    to: proposal.customer?.email || "",
    subject,
    body: lines.join("\n"),
    related: {
      proposalId: proposal.proposalId,
      businessUnitCode: proposal.businessUnit?.code || "",
      sku: proposal.product?.sku || "",
      priority: proposal.priority || "",
      confidence: proposal.confidence ?? null
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}
