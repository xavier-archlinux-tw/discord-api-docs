# Discord 說明文件繁中化與雙語切換實作計劃 (Batch 4 - 9)

本計劃旨在為 Discord 說明文件庫中剩餘的所有未完成頁面，分批建立高品質的「台灣正體中文翻譯」與「雙欄雙語對照版」，並整合 `LanguageSelector` 與左側導覽列。

每個批次完成後，我們都會**暫停並主動請求您的許可**，得到您確認後才會開始下一個批次的翻譯。您有權選擇跳過或不許可特定批次。

---

## 🌟 優先翻譯推薦與目錄用途分類對照表

我們將剩餘的所有文件目錄依據 **「與 Activities 的相關度」** 與 **「必備通識程度」** 進行分類，以方便您評估是否核可該批次的執行：

| 優先級 | 目錄/主題 | 用途與說明 | 建議執行決策 |
| :--- | :--- | :--- | :--- |
| **P0 (極高) ⭐⭐⭐⭐⭐** | `monetization/`<br>`topics/` | **用途**：Activities 營利變現（IAP/訂閱）、API 速率限制 (Rate Limits) 與 OAuth2 授權流。<br>➔ 開發活動與 API 交互的**核心硬性必備知識**。 | **高度推薦執行** |
| **P1 (高) ⭐⭐⭐⭐** | `rich-presence/`<br>`discovery/` | **用途**：玩家個人檔案狀態即時顯示（Rich Presence）與官方目錄探索分發。<br>➔ 提升活動社交傳播力與曝光率的關鍵文件。 | **推薦執行** |
| **P2 (中) ⭐⭐⭐** | `interactions/`<br>`platform/` | **用途**：斜線指令接收/回覆機制，以及平台通用功能通識。 | **選備執行** |
| **P3 (低) ⭐⭐** | `resources/`<br>`gateway/`<br>`events/` | **用途**：API JSON 資料結構規格書，以及機器人專用的 WebSocket Gateway 長連線。<br>➔ 對 Activities 網頁開發來說通常只需速查英文欄位，不需深讀。 | **可不許可/跳過** |
| **P4 (極低) ⭐** | `discord-social-sdk/` | **用途**：原生 PC 遊戲（如 Unity/Unreal 獨立執行檔）整合 Discord 社交功能。<br>➔ **與 Activities (Embedded App) 是完全不同的技術，開發活動完全用不到**。 | **不推薦執行** |

---

## 💡 翻譯注意事項與技術排版原則

為確保後續批次能保持與 Batch 1-3 一致的高品質，並避免重複踩坑，在動工前必須嚴格遵守以下三大注意事項：

### 1. 技術排版與 MDX 語法規範
* **Frontmatter 完整性**：每個 MDX 檔案開頭的 Frontmatter 必須以 `---` 開始，並**必須以 `---` 結束**。絕對不能遺漏關閉標記（例如 `development-guides.mdx` 曾發生的錯誤），否則會破壞隨後的 `import { LanguageSelector }` 編譯。
* **LanguageSelector 配置**：英文版頁面填寫 `current="en"`，繁中版填寫 `current="zh-tw"`，雙語版填寫 `current="bilingual"`。`path` 參數必須為不含 `.mdx` 後綴的完整路由（例如 `path="/developers/en-us/activities/overview"`）。
* **雙語版 (Bilingual) 分段 Grid 排版**：對於長度較長的文件，**禁止將整頁包在一個巨大的 Grid 中**，這會導致標籤閉合出錯與編譯速度極慢。正確做法是：以「章節」或「步驟」為單位，將每個局部段落或程式碼單獨用 `<div className="grid grid-cols-1 md:grid-cols-2 gap-8">` 包裹。

### 2. 頁面內超連結語言化 (Localization of Links)
* 當編寫中文版（`zh-tw`）和雙語版（`bilingual`）時，頁面內部的所有連結（如 `<Card>` 的 `href` 屬性或一般 Markdown 連結 `[text](/link)`），如果它指向 `/developers/en-us/...`，則**必須手動改寫**為對應的語言分段路徑（例如改為 `/developers/zh-tw/...` 或 `/developers/bilingual/...`）。
* 這樣能確保使用者在點擊頁面內的跳轉卡片時，依然能維持在當前選擇的語言環境中。

### 3. 台灣繁體中文 (Taiwanese Chinese) 翻譯與術語一致性
* **專有名詞精準對照**（依據 `translation-helper` 技能）：
  * `Application` ➔ 應用程式
  * `Activity / Activities` ➔ 互動活動
  * `Client` ➔ 用戶端（非客戶端）
  * `Channel` ➔ 頻道
  * `Instance` ➔ 實例（非執行個體）
  * `Server / Guild` ➔ 伺服器
  * `Proxy` ➔ 代理伺服器
  * `Session` ➔ 活動階段 / 連線階段
  * `OAuth scopes` ➔ 授權範圍 / 權限範圍
* **程式碼中的處理**：程式碼、API 屬性欄位與 JSON key 必須 100% 保持英文。但程式碼內的**註解 (Comments)**與輸出訊息，應翻譯為高品質台灣正體中文，以提供極佳的開發者體驗。
* **雙語括號對照**：在翻譯重要的技術名詞或 API 指令時，應在中文後方以括號附帶英文原文，以便開發者對照 SDK（例如：`開啟外部連結 (Open External Link)`、`速率限制 (Rate Limits)`）。

---

## 📅 翻譯批次與詳細排程

### [Batch 4] 營利機制與豐富狀態 (優先級：P0 ~ P1 🎯)
主要實作 Activities 的收費金流、訂閱、內購與玩家個人檔案狀態同步。
- `[NEW]` [zh-tw/bilingual] `monetization/overview.mdx`
- `[NEW]` [zh-tw/bilingual] `monetization/enabling-monetization.mdx`
- `[NEW]` [zh-tw/bilingual] `monetization/managing-skus.mdx`
- `[NEW]` [zh-tw/bilingual] `monetization/implementing-app-subscriptions.mdx`
- `[NEW]` [zh-tw/bilingual] `monetization/implementing-one-time-purchases.mdx`
- `[NEW]` [zh-tw/bilingual] `monetization/implementing-iap-for-activities.mdx`
- `[NEW]` [zh-tw/bilingual] `rich-presence/using-with-the-embedded-app-sdk.mdx`
- `[MODIFY]` [en-us] 對應的 7 個英文檔案（引入 `LanguageSelector`）

### [Batch 5] 核心開發通識與基礎 (優先級：P0 ~ P2 💡)
API 速率限制限制、OAuth2 授權流與互動回覆指令。
- `[NEW]` [zh-tw/bilingual] `topics/rate-limits.mdx`
- `[NEW]` [zh-tw/bilingual] `topics/oauth2.mdx`
- `[NEW]` [zh-tw/bilingual] `topics/permissions.mdx`
- `[NEW]` [zh-tw/bilingual] `interactions/overview.mdx`
- `[NEW]` [zh-tw/bilingual] `interactions/receiving-and-responding.mdx`
- `[NEW]` [zh-tw/bilingual] `interactions/application-commands.mdx`
- `[MODIFY]` [en-us] 對應的 6 個英文檔案（引入 `LanguageSelector`）

### [Batch 6] 探索推廣與平台其他功能 (優先級：P1 ~ P2)
發布、探索發現與平台通用功能。
- `[NEW]` [zh-tw/bilingual] `discovery/overview.mdx`
- `[NEW]` [zh-tw/bilingual] `discovery/enabling-discovery.mdx`
- `[NEW]` [zh-tw/bilingual] `discovery/best-practices.mdx`
- `[NEW]` [zh-tw/bilingual] `platform/oauth2-and-permissions.mdx`
- `[NEW]` [zh-tw/bilingual] `platform/activities.mdx`
- `[NEW]` [zh-tw/bilingual] `platform/app-monetization.mdx`
- `[NEW]` [zh-tw/bilingual] `platform/discovery.mdx`
- `[NEW]` [zh-tw/bilingual] `platform/rich-presence.mdx`
- `[MODIFY]` [en-us] 對應的 8 個英文檔案（引入 `LanguageSelector`）

### [Batch 7] 變更日誌與索引首頁 (優先級：P2)
- `[NEW]` [zh-tw/bilingual] `change-log.mdx`
- `[NEW]` [zh-tw/bilingual] `guides.mdx`
- `[NEW]` [zh-tw/bilingual] `reference.mdx`
- `[MODIFY]` [en-us] 對應的 3 個英文檔案（引入 `LanguageSelector`）

### [Batch 8] 通用技術主題與 API 參考 (優先級：P3 ⚠️)
API 參考規格書，與 WebSocket Gateway 長連線機制。
- `[NEW]` [zh-tw/bilingual] `resources/` 目錄下的所有模型定義檔案 (共約 25 個)
- `[NEW]` [zh-tw/bilingual] `gateway/` 及 `events/` 目錄下的長連線相關檔案 (共約 6 個)
- `[MODIFY]` [en-us] 對應的所有英文檔案（引入 `LanguageSelector`）

### [Batch 9] Discord 社交 SDK (優先級：P4 ❌)
原生遊戲（如 Unity/Unreal 獨立客戶端）專用的 C++/C# 社交 SDK。
- `[NEW]` [zh-tw/bilingual] `discord-social-sdk/` 目錄下的所有檔案 (共約 40 個)
- `[MODIFY]` [en-us] 對應的所有英文檔案（引入 `LanguageSelector`）

---

## 🛠️ 實作、整合與驗證方案

每完成一個批次的翻譯，我們將執行以下工作：
1. **結構生成**：建立對應的 `zh-tw` 和 `bilingual` 檔案，套用高品質台灣正體中文。
2. **語系切換整合**：在對應英文檔案中引入並配置 `<LanguageSelector current="en" path="..." />`.
3. **Docs 導覽選單同步**：執行 `restructure_docs_json.py` 腳本，自動將新增的頁面以對應的雙語翻譯隱藏群組註冊到 `docs.json`，確保左側 Sidebar 選單正常亮起且章節名稱顯示正確。
4. **驗證與測試**：在本地伺服器 (`http://localhost:3000`) 進行 HTTP 200 狀態測試，確認所有頁面健康運行。
