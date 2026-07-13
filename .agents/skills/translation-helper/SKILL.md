---
name: translation-helper
description: 專用於 Discord API 說明文件的繁體中文翻譯與語系切換整合技能。
---

# Discord API Docs 翻譯與切換整合技能

本技能專門用於指導與確保 Antigravity 在翻譯 Discord API 的 MDX 文件時，遵循最高品質的台灣在地化繁體中文標準，並正確整合語系切換功能與資料夾架構。

---

## 1. 檔案與目錄架構

所有 MDX 文件在 `developers/` 底下必須採用以下對稱的三語系架構：
* **英文版 (Original)**：存放在 `developers/en-us/` 中。
* **繁中版 (Traditional Chinese)**：存放在 `developers/zh-tw/` 中。
* **雙語版 (Bilingual)**：存放在 `developers/bilingual/` 中。

---

## 2. 即時語系切換欄規範

所有翻譯或更新的 MDX 檔案，必須在 Frontmatter (以 `---` 包夾的區塊) 的正下方，插入以下 HTML 切換連結欄：
* **路由變換規則**：
  * 清理後的基礎路徑為 `base_route`，例如 `/developers/en-us/quick-start/overview-of-apps`。
  * 英文路徑為 `/developers/en-us/...`
  * 繁中路徑為 `/developers/zh-tw/...`
  * 雙語路徑為 `/developers/bilingual/...`
* **目前閱讀指示**：
  * 當前語系項目應以 `<span>` 顯示（純文字，無底線）。
  * 其他語系項目應以 `<a>` 顯示（可點選的超連結）。
* **HTML 樣式代碼**：
  ```html
  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', fontSize: '14px', marginBottom: '20px', borderBottom: '1px solid var(--border-color, #e5e7eb)', paddingBottom: '10px' }}>
    <a href="/developers/en-us/...">🇬🇧 English</a>
    <span>|</span>
    <span>🇹🇼 繁體中文</span>
    <span>|</span>
    <a href="/developers/bilingual/...">📖 雙語對照</a>
  </div>
  ```

---

## 3. 雙語版對照結構

雙語版檔案應保留原始英文版 Frontmatter（但標題 title 可以加上 ` (雙語/Bilingual)`），並在 Frontmatter 結束後插入「即時語系切換欄」。
正文內容必須使用 Mintlify 的 `<Tabs>` 元件，將英文與繁中以 Tab 的方式分開展示：
```mdx
<Tabs>
  <Tab title="🇬🇧 English">
    [原始英文內容（不含 Frontmatter）]
  </Tab>
  <Tab title="🇹🇼 繁體中文">
    [翻譯後的繁中內容（不含 Frontmatter）]
  </Tab>
</Tabs>
```

---

## 4. 台灣在地化資工技術名詞對照表

翻譯時必須嚴格使用台灣在地的專業技術用語，嚴禁簡轉繁不自然的中國用語。對照表如下：

| 英文原文 | 台灣習慣用語 (應使用) | 避免使用 (中國用語) |
| :--- | :--- | :--- |
| Repository | 儲存庫 / 專案儲存庫 | 倉庫 |
| Plan | 實作計畫 / 計畫 | 實現 / 計劃 |
| Walkthrough | 工作歷程 / 導覽 | 演示 / 走查 |
| Task | 任務 / 工作項目 | 任務 |
| Code | 程式碼 / 原始碼 | 代碼 / 源碼 |
| Build | 建置 / 編譯 | 構建 / 編譯 |
| Database | 資料庫 | 數據庫 |
| Network / Internet | 網路 / 網際網路 | 網絡 / 互聯網 |
| Software / Program | 軟體 / 程式 | 軟件 / 程序 |
| Context | 上下文 / 語境 | 上下文 |
| Project | 專案 | 項目 |
| Client / Server | 用戶端 / 伺服器 | 客戶端 / 服務端 |
| App / Application | 應用程式 / App | 應用 / 程序 |
| User / Member | 使用者 / 成員 | 用戶 / 成員 |
| Channel / Message | 頻道 / 訊息 | 通道 / 消息 |
| Guild | 伺服器 | 公會 / 伺服器 |
| Bot | 機器人 | 機械人 / 機器人 |
| Permission / Role | 權限 / 身分組 | 權限 / 角色 |

---

## 5. 斷點續傳進度追蹤

* 翻譯進度儲存在 `docs/translation_progress.json`。
* 內容格式：
  ```json
  {
    "completed_pages": {
      "developers/en-us/path/to/file": {
        "status": "completed",
        "translated_at": "YYYY-MM-DDTHH:MM:SSZ"
      }
    },
    "failed_pages": {}
  }
  ```
* 每次執行翻譯前，必須讀取該進度檔案，跳過已完成的頁面。
