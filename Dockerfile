# =========================================================
# Stage 1: 建置環境（安裝依賴與 Mintlify）
# =========================================================
FROM node:20-slim AS builder

# 安裝 git 等必要相依項
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 全域安裝 Mintlify 開發工具
RUN npm install -g mintlify@latest


# =========================================================
# Stage 2: 驗證階段（執行 validate 與 broken-links）
# =========================================================
FROM builder AS validator

# 將專案內所有的文件內容複製進來以供驗證
COPY . .

# 0. 修正雙語 MDX 檔案中的 div 縮排
RUN node tools/java-script/fix-mdx-divs.js

# 1. 驗證文件結構與設定檔
RUN mintlify validate

# 2. 檢查死連結 (本地開發建置時僅作提示，不阻擋建置)
RUN mintlify broken-links || true


# =========================================================
# Stage 3: 運行階段
# =========================================================
FROM node:20-slim AS runner

# 運行階段也需要 git 才能使 Mintlify 正確讀取文件變動
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 從 builder 階段複製已安裝的全域 node 模組與執行檔
COPY --from=builder /usr/local/lib/node_modules /usr/local/lib/node_modules
COPY --from=builder /usr/local/bin /usr/local/bin

# 複製經驗證無誤的文件檔案至運行環境
COPY --from=validator /app /app

# Mintlify 開發伺服器預設的 3000 port
EXPOSE 3000

# 啟動 Mintlify 開發伺服器
CMD ["sh", "-c", "node tools/java-script/fix-mdx-divs.js && mintlify dev --port 3000"]