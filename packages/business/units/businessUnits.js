export const BUSINESS_UNIT_STATUS = Object.freeze({
  ACTIVE: "active",
  INACTIVE: "inactive",
  PLANNED: "planned"
});

export const BUSINESS_UNIT_CATEGORY = Object.freeze({
  AI: "AI",
  SOFTWARE: "Software",
  HARDWARE: "Hardware",
  SERVICE: "Service",
  TRADE: "Trade",
  LOGISTICS: "Logistics",
  MANUFACTURING: "Manufacturing",
  OTHER: "Other"
});

export const BUSINESS_UNITS = Object.freeze([
  {
    businessUnitId: "BU-000001",
    code: "AI_PLATFORM",
    name: "AI Platform",
    displayName: "AI Agent / AI 系統開發",
    category: BUSINESS_UNIT_CATEGORY.AI,
    description: "企業 AI Agent、CRM 自動化、AI 工作流、內部營運平台與 AI 顧問導入。",
    targetCustomers: ["中小企業", "製造業", "物流業", "業務團隊", "需要自動化的公司"],
    mainProducts: ["AI Agent Enterprise", "HengGou OS", "AI 顧問導入", "CRM 自動化", "Gmail / Calendar 自動化"],
    salesKeywords: ["AI", "Agent", "自動化", "CRM", "OpenRouter", "OpenAI", "Claude", "Gemini", "流程優化", "營運平台"],
    proposalTemplate: "TPL-AI-001",
    quotationRule: "AI_PROJECT_OR_SUBSCRIPTION",
    status: BUSINESS_UNIT_STATUS.ACTIVE
  },
  {
    businessUnitId: "BU-000002",
    code: "AOI_SOFTWARE",
    name: "AOI Software",
    displayName: "AOI 視覺檢測軟體",
    category: BUSINESS_UNIT_CATEGORY.SOFTWARE,
    description: "AOI 視覺檢測、OK/NG 判定、SN 掃碼、自動拍照、Excel 紀錄、資料追蹤與客製化檢測流程。",
    targetCustomers: ["科技廠", "電子製造業", "重工檢測", "品質部門", "產線主管"],
    mainProducts: ["AOI 視覺檢測軟體", "AOI 客製開發", "SN 掃碼紀錄", "Excel 自動紀錄", "影像判定系統"],
    salesKeywords: ["AOI", "視覺檢測", "Camera", "OK/NG", "SN", "條碼", "Excel", "重工", "檢測", "影像辨識"],
    proposalTemplate: "TPL-AOI-001",
    quotationRule: "AOI_PROJECT_OR_LICENSE",
    status: BUSINESS_UNIT_STATUS.ACTIVE
  },
  {
    businessUnitId: "BU-000003",
    code: "PROTOFAB_3D",
    name: "ProtoFab 3D Printing",
    displayName: "3D 列印 / ProtoFab 3D 工坊",
    category: BUSINESS_UNIT_CATEGORY.MANUFACTURING,
    description: "3D 列印設計、代印、治具、洞洞板配件、浮雕相框、LED 相框、客製小物與 PETG 實用品開發。",
    targetCustomers: ["個人客戶", "工作室", "小型工廠", "維修單位", "3D 列印需求者"],
    mainProducts: ["3D 列印代工", "洞洞板配件", "客製治具", "浮雕相框", "LED 相框", "PETG 配件"],
    salesKeywords: ["3D列印", "3D 列印", "PETG", "洞洞板", "相框", "浮雕", "治具", "Bambu", "P1S", "客製", "列印代工"],
    proposalTemplate: "TPL-3D-001",
    quotationRule: "MATERIAL_TIME_COMPLEXITY",
    status: BUSINESS_UNIT_STATUS.ACTIVE
  },
  {
    businessUnitId: "BU-000004",
    code: "TOOLS_PROCUREMENT",
    name: "Tools Procurement",
    displayName: "工具代購 / 工業品代購",
    category: BUSINESS_UNIT_CATEGORY.TRADE,
    description: "淘寶、1688、台灣與海外工業品找貨、工具代購、私人集運、採購協助與報關前置確認。",
    targetCustomers: ["工廠", "維修單位", "工作室", "個人買家", "工具需求者"],
    mainProducts: ["工具代購", "工業品代購", "淘寶代訂", "1688 找貨", "私人集運", "報關協助"],
    salesKeywords: ["工具", "代購", "淘寶", "1688", "集運", "報關", "找貨", "工業品", "五金", "電子材料"],
    proposalTemplate: "TPL-PROC-001",
    quotationRule: "COST_PLUS_SERVICE_FEE",
    status: BUSINESS_UNIT_STATUS.ACTIVE
  },
  {
    businessUnitId: "BU-000005",
    code: "PACKAGING_MATERIALS",
    name: "Packaging Materials",
    displayName: "包材販售",
    category: BUSINESS_UNIT_CATEGORY.TRADE,
    description: "再利用包材、紙箱、緩衝材、工業膠膜、棧板膜、包裝耗材與公益提撥透明紀錄。",
    targetCustomers: ["影印店", "電商賣家", "小型出貨商", "工作室", "物流需求者"],
    mainProducts: ["紙箱", "緩衝材", "工業膠膜", "棧板膜", "包材試用包", "包裝耗材"],
    salesKeywords: ["包材", "紙箱", "緩衝材", "膠膜", "棧板膜", "出貨", "回收再利用", "公益", "影印紙", "包裝"],
    proposalTemplate: "TPL-PACK-001",
    quotationRule: "WEIGHT_OR_UNIT_PRICE",
    status: BUSINESS_UNIT_STATUS.ACTIVE
  },
  {
    businessUnitId: "BU-000006",
    code: "COSMO_EQUIPMENT",
    name: "COSMO Equipment Agency",
    displayName: "COSMO 代理 / 氣密測試設備",
    category: BUSINESS_UNIT_CATEGORY.HARDWARE,
    description: "COSMO 氣密測試設備代理、LS-R902、設備導入、教育訓練、保固維修窗口與測試數據軟體整合。",
    targetCustomers: ["科技廠", "水冷產業", "汽車零件廠", "氣密測試需求客戶", "品保部門"],
    mainProducts: ["COSMO LS-R902", "氣密測試設備", "教育訓練", "保固維修協調", "自動記錄數據軟體"],
    salesKeywords: ["COSMO", "LS-R902", "氣密", "測漏", "Leak", "測試設備", "水冷", "保固", "教育訓練", "數據紀錄"],
    proposalTemplate: "TPL-COSMO-001",
    quotationRule: "EQUIPMENT_COST_PLUS_SERVICE",
    status: BUSINESS_UNIT_STATUS.ACTIVE
  },
  {
    businessUnitId: "BU-000007",
    code: "EQUIPMENT_AGENCY",
    name: "General Equipment Agency",
    displayName: "其他設備代理",
    category: BUSINESS_UNIT_CATEGORY.HARDWARE,
    description: "熱交換機、熱特性測試儀、清洗烘乾設備、氦檢、真空設備與其他工業設備代理或媒合。",
    targetCustomers: ["科技廠", "製造業", "實驗室", "設備採購", "工程部門"],
    mainProducts: ["熱特性測試儀", "清洗烘乾設備", "氦檢設備", "真空設備", "工業設備代理"],
    salesKeywords: ["設備", "代理", "熱交換", "熱特性", "清洗", "烘乾", "氦檢", "真空", "測試儀", "工業設備"],
    proposalTemplate: "TPL-EQP-001",
    quotationRule: "EQUIPMENT_PROJECT",
    status: BUSINESS_UNIT_STATUS.ACTIVE
  },
  {
    businessUnitId: "BU-000008",
    code: "LOGISTICS_CUSTOMS",
    name: "Logistics Customs",
    displayName: "物流 / 報關 / 集運",
    category: BUSINESS_UNIT_CATEGORY.LOGISTICS,
    description: "國際物流、空運、海運、越南物流、報關、私人集運、出口文件與危險品標籤協助。",
    targetCustomers: ["科技廠", "出口商", "代購客戶", "中小企業", "跨境電商"],
    mainProducts: ["國際空運", "國際海運", "越南物流", "報關服務", "集運", "出口文件協助"],
    salesKeywords: ["物流", "報關", "集運", "空運", "海運", "越南", "出口", "CIP", "MSDS", "IATA", "標籤"],
    proposalTemplate: "TPL-LOG-001",
    quotationRule: "FREIGHT_PLUS_SERVICE_FEE",
    status: BUSINESS_UNIT_STATUS.ACTIVE
  },
  {
    businessUnitId: "BU-000009",
    code: "WEBSITE_SYSTEM",
    name: "Website System Development",
    displayName: "網站 / 系統客製",
    category: BUSINESS_UNIT_CATEGORY.SOFTWARE,
    description: "企業形象網站、GitHub Pages、Google Sheets 系統、Line OA、Gmail 自動化與內部營運工具開發。",
    targetCustomers: ["中小企業", "個人品牌", "工作室", "業務團隊", "需要數位化的公司"],
    mainProducts: ["企業形象網站", "GitHub Pages 網站", "Google Sheets 系統", "LINE OA 自動回覆", "表單串接", "內部系統"],
    salesKeywords: ["網站", "系統", "GitHub Pages", "LINE OA", "Google Sheets", "表單", "自動回覆", "CRM", "Apps Script"],
    proposalTemplate: "TPL-WEB-001",
    quotationRule: "PROJECT_SCOPE",
    status: BUSINESS_UNIT_STATUS.ACTIVE
  },
  {
    businessUnitId: "BU-999999",
    code: "OTHER",
    name: "Other",
    displayName: "其他",
    category: BUSINESS_UNIT_CATEGORY.OTHER,
    description: "尚未分類或需要人工判斷的案件。",
    targetCustomers: ["未分類"],
    mainProducts: ["未分類服務"],
    salesKeywords: [],
    proposalTemplate: "TPL-OTHER-001",
    quotationRule: "MANUAL_REVIEW",
    status: BUSINESS_UNIT_STATUS.ACTIVE
  }
]);
