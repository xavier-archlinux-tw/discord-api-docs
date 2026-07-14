---
name: verification-guidelines
description: 網頁功能驗證指南。不使用瀏覽器 mcp，優先使用 CLI 指令分析，必要時改用 Playwright Docker 映像檔。
---

# 網頁功能驗證指南技能

本技能指導 AI 助理在對專案中的網頁功能、DOM 結構與 client-side JS 行為進行驗證時，如何遵循正確的測試工具路徑。

## 核心指導原則

1. **禁用瀏覽器 MCP 工具**：
   * 絕不要使用任何瀏覽器 MCP 工具（例如 `browser_subagent` 等）來打開或操作網頁。

2. **優先使用 CLI 命令分析**：
   * 優先透過 Linux 終端機（WSL2 / MSYS2 或 Docker 容器內）的 `curl` 或是 `grep` 命令，將 HTML 下載到本地並以靜態檔案方式分析 DOM 結構。
   * 格式範例：
     ```bash
     wsl curl -s http://localhost:3000/path/to/page | grep "element-id"
     ```

3. **複雜 Client-side JS 改用 Playwright 容器驗證**：
   * 若網頁 DOM 元素是由客戶端 JavaScript（例如 React `useEffect`）動態生成，且 CLI 靜態分析已不堪使用時，必須採用 **Playwright 官方 Docker 映像檔** 來運行無頭 (headless) 測試。
   * **語言規範**：Playwright 測試腳本**必須優先使用 TypeScript (TS)** 編寫，並在容器內透過 `npx tsx` 工具執行。
   * 映像檔版本推薦：`mcr.microsoft.com/playwright:v1.61.1`。
   * 執行格式範例（已在 `docker-compose.yml` 配置 `playwright` 服務，推薦使用一鍵指令）：
     ```bash
     docker compose run --rm playwright
     ```
   * 備用覆寫指令格式（用以執行其他自訂 TS 測試腳本）：
     ```bash
     docker compose run --rm playwright npx tsx tools/other-test.ts
     ```
