# CRM

## Sheets

### Leads
主要 Lead 資料表。網站表單送出後會自動寫入。

欄位包含：

- Lead ID
- 建立時間
- 來源
- 公司名稱
- 姓名
- Email
- LINE ID
- AI 需求
- 備註
- UTM
- Referrer
- Device
- 狀態
- 負責人
- Follow Up
- 內部備註

### API Logs
記錄每次 API 請求結果，方便除錯。

### Config
集中管理 API、通知與 CRM 基礎設定。

### Dashboard
基礎統計：

- Total Leads
- Status Count
- Needs Count
- Source Count

## 狀態欄位

建議流程：

1. 未聯絡
2. 已聯絡
3. 評估中
4. 已報價
5. 已成交
6. 暫不合作
