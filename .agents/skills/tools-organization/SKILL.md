---
name: tools-organization
description: 確保在 tools 資料夾內建立的腳本，依其程式語言（JavaScript, TypeScript, Python 等）存放於對應的子資料夾中。
---

# Tools 腳本分類管理技能

本技能旨在規範與引導 Antigravity 在開發或整理專案自動化腳本與工具時，遵循專案的語言分類存放結構。

## 核心指導原則

1. **分類存儲規範**：
   * 嚴禁直接在 `tools/` 根目錄下建立任何可執行腳本或工具檔案。
   * 所有新增的腳本檔案，必須根據其程式語言，儲存於以下對應的子目錄中：
     * **JavaScript 檔案 (.js / .cjs / .mjs)** ➔ 存放在 `tools/java-script/`
     * **TypeScript 檔案 (.ts / .tsx)** ➔ 存放在 `tools/type-script/`
     * **Python 檔案 (.py)** ➔ 存放在 `tools/python/`

2. **指令調用路徑變更**：
   * 當需要調用腳本時，必須在指令中使用完整的子資料夾路徑。例如，使用 `docker-node-executor` 技能執行 Node 腳本時：
     * *不正確*：`docker exec mintlify-dev-server node tools/audit-translations.js`
     * *正確*：`docker exec mintlify-dev-server node tools/java-script/audit-translations.js`
