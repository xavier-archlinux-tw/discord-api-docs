# Stage 1: 建置階段
FROM node:20-slim AS builder

# 安裝 git 等必要相依項
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 全域安裝 Mintlify 開發工具 (需要 Node.js 20.17 或更高版本)
RUN npm install -g mintlify@latest

# Stage 2: 運行階段
FROM node:20-slim AS runner

# 運行階段也需要 git 才能使 Mintlify 正確讀取文件變動
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 從 builder 階段複製已安裝的全域 node 模組與執行檔
COPY --from=builder /usr/local/lib/node_modules /usr/local/lib/node_modules
COPY --from=builder /usr/local/bin /usr/local/bin

# Mintlify 開發伺服器預設的 3000 port
EXPOSE 3000

# 啟動 Mintlify 開發伺服器
CMD ["mintlify", "dev", "--port", "3000"]
