import { PROPOSAL_STATUS, PROPOSAL_SECTION } from "./proposalConstants.js";
import { proposalTemplateRegistry } from "./proposalTemplateRegistry.js";
import { validateProposal } from "./proposalSchema.js";

function nextProposalId() {
  return `PROP-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function section(type, title, content, items = []) {
  return { type, title, content, items };
}

export function buildProposalFromLeadIntake(leadIntakeResult = {}, options = {}) {
  const businessUnit = leadIntakeResult.businessUnit || {};
  const product = leadIntakeResult.product || {};
  const template = proposalTemplateRegistry.getByBusinessUnit(businessUnit.code);

  const proposal = {
    proposalId: options.proposalId || nextProposalId(),
    status: PROPOSAL_STATUS.DRAFT,
    title: options.title || `${template.title}｜${leadIntakeResult.lead?.companyName || "客戶"}`,
    customer: {
      companyName: leadIntakeResult.lead?.companyName || "",
      contactName: leadIntakeResult.lead?.contactName || "",
      email: leadIntakeResult.lead?.email || "",
      phone: leadIntakeResult.lead?.phone || ""
    },
    businessUnit: {
      code: businessUnit.code || "OTHER",
      displayName: businessUnit.displayName || "其他"
    },
    product: {
      sku: product.sku || "OTHER-MANUAL",
      displayName: product.displayName || "未分類服務",
      description: product.description || ""
    },
    lead: leadIntakeResult.lead || {},
    score: leadIntakeResult.score,
    priority: leadIntakeResult.priority,
    confidence: leadIntakeResult.confidence,
    nextAction: leadIntakeResult.nextAction,
    missingInfo: leadIntakeResult.missingInfo || [],
    pricingGuidance: leadIntakeResult.pricingGuidance || "",
    sections: [
      section(
        PROPOSAL_SECTION.EXECUTIVE_SUMMARY,
        "一、提案摘要",
        `本提案依據目前客戶需求，初步判斷適合導入「${product.displayName || "相關服務"}」。目前案件優先級為 ${leadIntakeResult.priority || "Unknown"}，系統信心分數為 ${leadIntakeResult.confidence ?? 0}。`
      ),
      section(
        PROPOSAL_SECTION.CUSTOMER_NEEDS,
        "二、客戶需求",
        leadIntakeResult.lead?.requirement || "目前需求描述不足，需補充資料。"
      ),
      section(
        PROPOSAL_SECTION.SOLUTION,
        "三、建議方案",
        `${businessUnit.displayName || "恒構企業社"} 將依據客戶實際需求，提供「${product.displayName || "相關服務"}」之評估、規劃與執行協助。`
      ),
      section(
        PROPOSAL_SECTION.PRODUCT_SCOPE,
        "四、服務範圍",
        "初步服務範圍如下，正式範圍仍需依需求訪談或規格確認後調整。",
        template.defaultScope || []
      ),
      section(
        PROPOSAL_SECTION.IMPLEMENTATION_PLAN,
        "五、導入流程",
        "建議流程如下。",
        template.implementationPlan || []
      ),
      section(
        PROPOSAL_SECTION.PRICING_GUIDANCE,
        "六、報價邏輯",
        leadIntakeResult.pricingGuidance || "需人工確認後報價。"
      ),
      section(
        PROPOSAL_SECTION.MISSING_INFO,
        "七、需補充資訊",
        (leadIntakeResult.missingInfo || []).length
          ? "正式報價前建議先補充以下資訊。"
          : "目前無必要補充資訊，可進入下一步確認。",
        (leadIntakeResult.missingInfo || []).map(item => `${item.label}：${item.reason}`)
      ),
      section(
        PROPOSAL_SECTION.NEXT_STEPS,
        "八、下一步",
        leadIntakeResult.nextAction?.description || "建議進行人工確認。",
        [leadIntakeResult.nextAction?.title || "人工確認"]
      ),
      section(
        PROPOSAL_SECTION.COMPANY_PROFILE,
        "九、恒構企業社角色",
        "恒構企業社負責需求釐清、方案規劃、供應商或技術協調、交付追蹤與後續服務窗口。"
      )
    ],
    riskNotes: template.riskNotes || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  validateProposal(proposal);
  return proposal;
}
