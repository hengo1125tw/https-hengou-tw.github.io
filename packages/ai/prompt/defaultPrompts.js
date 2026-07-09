export const DEFAULT_PROMPTS = Object.freeze([
  {
    promptId: "PRM-000001",
    name: "Lead Analysis Basic",
    category: "Analysis",
    provider: "openrouter",
    model: "openai/gpt-4o-mini",
    version: "v1",
    status: "active",
    temperature: 0.2,
    maxTokens: 900,
    systemPrompt: "你是 HengGou OS 的 B2B 業務分析助理。請用繁體中文、客觀、精簡地分析。恒構企業社是多業務公司，AI 是營運工具，不是唯一產品。",
    userTemplate: `請分析以下 Lead：

公司：{{company.name}}
聯絡人：{{contact.name}}
Email：{{contact.email}}
需求：{{lead.requirement}}

系統判斷業務線：{{leadIntake.summary.businessUnit}}
系統推薦產品/服務：{{leadIntake.summary.product}}
案件狀態：{{leadIntake.summary.status}}
優先級：{{leadIntake.summary.priority}}
分數：{{leadIntake.summary.score}}
信心：{{leadIntake.summary.confidence}}
缺少資訊：{{leadIntake.summary.missingInfo}}
下一步：{{leadIntake.summary.nextAction}}
報價邏輯：{{leadIntake.summary.pricingGuidance}}

請輸出：
1. 產業判斷
2. 業務線是否正確
3. 推薦產品/服務是否正確
4. 商機價值
5. 缺少資訊
6. 下一步建議`
  },
  {
    promptId: "PRM-000002",
    name: "Gmail Follow-up Draft",
    category: "Gmail",
    provider: "openrouter",
    model: "openai/gpt-4o-mini",
    version: "v1",
    status: "active",
    temperature: 0.3,
    maxTokens: 900,
    systemPrompt: "你是 HengGou OS 的商務郵件助理。請撰寫自然、不浮誇、可直接寄出的繁體中文 Email 草稿。",
    userTemplate: `客戶公司：{{company.name}}
聯絡人：{{contact.name}}
業務線：{{leadIntake.summary.businessUnit}}
產品/服務：{{leadIntake.summary.product}}
目前進度：{{opportunity.stage}}
最近互動：{{timeline.latest}}
缺少資訊：{{leadIntake.summary.missingInfo}}
建議下一步：{{leadIntake.summary.nextAction}}

請產生：
Subject:
Body:
Next Follow-up:`
  }
,
  {
    promptId: "PRM-000003",
    name: "Proposal Polish",
    category: "Proposal",
    provider: "openrouter",
    model: "openai/gpt-4o-mini",
    version: "v1",
    status: "active",
    temperature: 0.25,
    maxTokens: 1600,
    systemPrompt: "你是 HengGou OS 的 B2B 提案助理。請保留事實，不可捏造價格、交期、保固、法規承諾。語氣務實、可直接給客戶初步審閱。",
    userTemplate: `請將以下提案草稿潤飾成正式客戶版，保持繁體中文。

業務線：{{leadIntake.summary.businessUnit}}
產品/服務：{{leadIntake.summary.product}}
案件狀態：{{leadIntake.summary.status}}
缺少資訊：{{leadIntake.summary.missingInfo}}

提案草稿：
{{proposal.draft}}

請輸出：
1. 客戶版提案
2. 待確認事項
3. 建議下一步`
  }
,
  {
    promptId: "PRM-000004",
    name: "Gmail Draft Polish",
    category: "Gmail",
    provider: "openrouter",
    model: "openai/gpt-4o-mini",
    version: "v1",
    status: "active",
    temperature: 0.25,
    maxTokens: 1000,
    systemPrompt: "你是 HengGou OS 的 Gmail 草稿助理。請保留事實，不可捏造價格、交期、保固、法規承諾。語氣務實、清楚、可直接寄出。",
    userTemplate: `請將以下 Email 草稿潤飾成正式可寄出的繁體中文商務信。

業務線：{{leadIntake.summary.businessUnit}}
產品/服務：{{leadIntake.summary.product}}
缺少資訊：{{leadIntake.summary.missingInfo}}
建議下一步：{{leadIntake.summary.nextAction}}

草稿：
{{email.draft}}

請輸出：
Subject:
Body:
Follow-up Note:`
  }

]);
