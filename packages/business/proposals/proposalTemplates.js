import { PROPOSAL_TEMPLATE_TYPE } from "./proposalConstants.js";

export const PROPOSAL_TEMPLATES = Object.freeze([
  {
    templateId: "TPL-AI-001",
    businessUnitCode: "AI_PLATFORM",
    type: PROPOSAL_TEMPLATE_TYPE.SOFTWARE,
    title: "AI Agent / AI 系統導入提案",
    defaultScope: ["需求訪談", "流程盤點", "AI Prompt 設計", "系統串接", "測試驗收", "教育訓練"],
    implementationPlan: ["需求盤點", "PoC 建置", "試營運", "正式導入", "維護優化"],
    riskNotes: ["需確認資料來源與權限", "需確認 AI 使用成本與模型限制", "正式寄送前需人工審核輸出內容"]
  },
  {
    templateId: "TPL-AOI-001",
    businessUnitCode: "AOI_SOFTWARE",
    type: PROPOSAL_TEMPLATE_TYPE.SOFTWARE,
    title: "AOI 視覺檢測軟體提案",
    defaultScope: ["檢測流程設計", "相機與影像輸入", "OK/NG 判定", "SN 掃碼", "Excel 自動紀錄", "現場測試"],
    implementationPlan: ["樣品與影像確認", "檢測規則定義", "軟體開發", "現場測試", "驗收與教育訓練"],
    riskNotes: ["需確認檢測項目與允收標準", "需確認現場光源與治具條件", "需確認 Excel 欄位與資料格式"]
  },
  {
    templateId: "TPL-3D-001",
    businessUnitCode: "PROTOFAB_3D",
    type: PROPOSAL_TEMPLATE_TYPE.SERVICE,
    title: "3D 列印 / ProtoFab 客製製作提案",
    defaultScope: ["尺寸確認", "材料確認", "列印可行性評估", "小量試作", "成品檢查"],
    implementationPlan: ["確認圖檔或照片", "估價", "試印", "修正", "正式製作"],
    riskNotes: ["需確認 STL / 圖片 / 尺寸", "PETG 會有公差與列印紋", "大型或重載件需額外強度評估"]
  },
  {
    templateId: "TPL-PROC-001",
    businessUnitCode: "TOOLS_PROCUREMENT",
    type: PROPOSAL_TEMPLATE_TYPE.SERVICE,
    title: "工具代購 / 工業品採購協助提案",
    defaultScope: ["規格確認", "供應商比對", "成本試算", "代訂協助", "集運與交付"],
    implementationPlan: ["確認連結或規格", "比價與風險確認", "付款採購", "物流追蹤", "交付"],
    riskNotes: ["需確認商品規格與數量", "海外商品可能有交期與退換貨限制", "特殊品項需先確認報關可行性"]
  },
  {
    templateId: "TPL-PACK-001",
    businessUnitCode: "PACKAGING_MATERIALS",
    type: PROPOSAL_TEMPLATE_TYPE.MATERIAL,
    title: "包材販售 / 包材供應提案",
    defaultScope: ["品項確認", "尺寸與數量確認", "整理分類", "面交或配送安排", "公益提撥紀錄"],
    implementationPlan: ["確認品項", "確認數量", "報價", "安排交付", "紀錄與回饋"],
    riskNotes: ["再利用紙箱外觀與尺寸可能不完全一致", "需確認面交地點或配送方式", "公益提撥以實際利潤計算"]
  },
  {
    templateId: "TPL-COSMO-001",
    businessUnitCode: "COSMO_EQUIPMENT",
    type: PROPOSAL_TEMPLATE_TYPE.EQUIPMENT,
    title: "COSMO 氣密測試設備導入提案",
    defaultScope: ["設備規格確認", "原廠報價協調", "教育訓練", "保固維修窗口", "自動記錄數據軟體"],
    implementationPlan: ["需求確認", "原廠確認", "正式報價", "交期安排", "教育訓練與驗收"],
    riskNotes: ["需確認測試條件與工件規格", "設備交期以原廠回覆為準", "保固範圍需排除人為損壞"]
  },
  {
    templateId: "TPL-EQP-001",
    businessUnitCode: "EQUIPMENT_AGENCY",
    type: PROPOSAL_TEMPLATE_TYPE.EQUIPMENT,
    title: "工業設備代理 / 設備媒合提案",
    defaultScope: ["設備需求確認", "原廠或供應商搜尋", "規格比對", "報價協調", "導入協助"],
    implementationPlan: ["需求訪談", "供應商確認", "規格與成本比對", "正式報價", "交付與售後協調"],
    riskNotes: ["需確認設備型號與製程條件", "原廠報價與交期可能變動", "售後條件需依原廠規範確認"]
  },
  {
    templateId: "TPL-LOG-001",
    businessUnitCode: "LOGISTICS_CUSTOMS",
    type: PROPOSAL_TEMPLATE_TYPE.LOGISTICS,
    title: "物流 / 報關 / 集運服務提案",
    defaultScope: ["貨物資訊確認", "運輸方案", "報關文件", "標籤確認", "出貨追蹤"],
    implementationPlan: ["確認貨物資料", "確認路線與條件", "估價", "文件整理", "出貨追蹤"],
    riskNotes: ["需確認品名、重量、材積與目的地", "危險品需確認 MSDS / IATA 規範", "報關與航班時程可能變動"]
  },
  {
    templateId: "TPL-WEB-001",
    businessUnitCode: "WEBSITE_SYSTEM",
    type: PROPOSAL_TEMPLATE_TYPE.SOFTWARE,
    title: "網站 / 系統客製開發提案",
    defaultScope: ["需求訪談", "頁面或流程設計", "前端開發", "表單串接", "測試與部署"],
    implementationPlan: ["需求確認", "版面與流程確認", "開發", "測試", "上線"],
    riskNotes: ["需確認頁面數量與功能範圍", "第三方服務限制需另行確認", "上線後維護範圍需明確定義"]
  },
  {
    templateId: "TPL-OTHER-001",
    businessUnitCode: "OTHER",
    type: PROPOSAL_TEMPLATE_TYPE.STANDARD,
    title: "人工評估提案",
    defaultScope: ["需求確認", "人工評估", "方案建議"],
    implementationPlan: ["補充資訊", "人工判斷", "提供方案"],
    riskNotes: ["目前分類資訊不足，需人工確認"]
  }
]);
