---
name: docker-node-executor
description: 在 Windows 環境下，確保 node 指令執行於 Docker 容器內，其餘 Linux 指令執行於 WSL2 或 MSYS2 中。
---

# Docker Node Executor 技能指令

本技能旨在指導 AI 助理在 Windows 宿主機環境下執行命令時，遵循嚴格的容器化與 Linux 環境隔離原則。

## 核心指導原則

1. **Docker 指令不進行調整**：
   * 所有 `docker`、`docker compose` 指令應直接在 Windows 的宿主機 Terminal 中執行，無需加上 `wsl` 或其他前綴。

2. **Node 指令執行於 Docker 中**：
   * 當需要執行專案內的 Node.js 腳本（例如驗證腳本、分析工具等）時，必須將其路由至正在運行的 Docker 容器中執行。
   * 格式範例：
     ```bash
     docker exec <container_name> node <script_path> <arguments>
     ```
   * 在本專案中，開發容器名稱為 `mintlify-dev-server`，工作目錄掛載於 `/app`，因此執行格式為：
     ```bash
     docker exec mintlify-dev-server node tools/inspect.js
     ```

3. **其餘 Linux 指令執行於 WSL2/MSYS2 環境下**：
   * 當需要執行標準的 Linux 工具（如 `curl`、`grep`、`sed` 等）且宿主機是 Windows 時，應透過 `wsl`（特別是 `wsl2 archlinux`）或 `msys2` 環境來執行。
   * 格式範例：
     ```bash
     wsl curl -s http://localhost:3000/...
     ```
     ```bash
     wsl grep -n "keyword" docs.json
     ```
