# Like System

一個使用 **TypeScript + Express + Prisma + MySQL** 建立的按讚系統範例，包含 React 前端介面。

## 目錄

- [專案介紹](#專案介紹)
- [環境需求](#環境需求)
- [快速開始](#快速開始)
- [從零開始建立](#從零開始建立)
  - [Step 1：建立專案並安裝套件](#step-1建立專案並安裝套件)
  - [Step 2：設定 TypeScript](#step-2設定-typescript)
  - [Step 3：設定資料庫（Docker）](#step-3設定資料庫docker)
  - [Step 4：設定 Prisma](#step-4設定-prisma)
  - [Step 5：撰寫後端程式碼](#step-5撰寫後端程式碼)
  - [Step 6：建立前端介面](#step-6建立前端介面)
- [API 文件](#api-文件)
- [專案結構](#專案結構)
- [常見問題](#常見問題)

---

## 專案介紹

這個專案實作了一個簡單的按讚系統，功能包含：

- 按讚 / 取消按讚
- 查詢按讚數
- 檢查用戶是否已按讚

**技術棧：**

| 層級 | 技術 |
|------|------|
| 前端 | React + TypeScript + Vite |
| 後端 | Express + TypeScript |
| ORM | Prisma 7 |
| 資料庫 | MySQL 8.0 |
| 容器化 | Docker Compose |

---

## 環境需求

開始之前，請確保你的電腦已安裝：

- **Node.js** 20.19.0 以上（建議 22.x）
- **Docker Desktop**（用來跑 MySQL）

**檢查版本：**

```bash
node -v   # 應顯示 v20.19.0 或更高
docker -v # 應顯示 Docker version xx.x.x
```

---

## 快速開始

如果你已經 clone 了這個專案，按照以下步驟啟動：

```bash
# 1. 安裝後端套件
npm install

# 2. 啟動 MySQL（需要 Docker）
docker-compose up -d

# 3. 建立資料表
npx prisma migrate dev

# 4. 生成 Prisma Client
npx prisma generate

# 5. 啟動後端伺服器
npm run dev
```

開啟另一個終端機視窗：

```bash
# 5. 安裝前端套件
cd vite-project
npm install

# 6. 啟動前端
npm run dev
```

開啟瀏覽器訪問 http://localhost:5173

---

## 從零開始建立

以下是從零開始建立這個專案的完整步驟。

### Step 1：建立專案並安裝套件

#### 1.1 建立專案資料夾

```bash
mkdir ts-like-system
cd ts-like-system
npm init -y
```

#### 1.2 安裝所有需要的套件

```bash
# TypeScript 開發工具
npm install -D typescript @types/node tsx @types/express @types/cors

# Prisma ORM（Prisma 7 必須使用 adapter）
npm install prisma @prisma/client @prisma/adapter-mariadb mariadb

# Express 網頁框架
npm install express cors

# 環境變數
npm install dotenv
```

**套件說明：**

| 套件 | 用途 |
|------|------|
| `typescript` | TypeScript 編譯器 |
| `tsx` | 直接執行 TypeScript 檔案 |
| `prisma` | Prisma CLI 工具 |
| `@prisma/client` | Prisma 客戶端 |
| `@prisma/adapter-mariadb` | MySQL/MariaDB 連接器 |
| `express` | Web 伺服器框架 |
| `cors` | 處理跨域請求 |
| `dotenv` | 讀取 .env 環境變數 |

#### 1.3 設定 package.json

在 `package.json` 中加入以下設定：

```json
{
  "type": "module",
  "scripts": {
    "dev": "tsx --watch src/server.ts",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio"
  }
}
```

或使用指令設定：

```bash
npm pkg set type="module"
npm pkg set scripts.dev="tsx --watch src/server.ts"
npm pkg set scripts.db:migrate="prisma migrate dev"
npm pkg set scripts.db:studio="prisma studio"
```

---

### Step 2：設定 TypeScript

#### 2.1 初始化 TypeScript 設定

```bash
npx tsc --init
```

#### 2.2 修改 tsconfig.json

將 `tsconfig.json` 的內容替換成：

```json
{
  "compilerOptions": {
    "module": "nodenext",
    "target": "esnext",
    "types": ["node"],
    "sourceMap": true,
    "declaration": true,
    "declarationMap": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "strict": true,
    "jsx": "react-jsx",
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "noUncheckedSideEffectImports": true,
    "moduleDetection": "force",
    "skipLibCheck": true
  }
}
```

---

### Step 3：設定資料庫（Docker）

#### 3.1 建立環境變數檔案

建立 `.env` 檔案：

```bash
touch .env
```

寫入以下內容：

```env
# 資料庫設定
DB_PASSWORD=your_password_here
DB_NAME=like_system
DB_PORT=3306

# Redis 設定（選用）
REDIS_PORT=6379

# Kafka 設定（選用）
KAFKA_PORT=9092

# Prisma 連線字串
DATABASE_URL="mysql://root:${DB_PASSWORD}@127.0.0.1:${DB_PORT}/${DB_NAME}"
```

> **重要**：請將 `your_password_here` 改成你自己的密碼

#### 3.2 建立 Docker Compose 設定

建立 `docker-compose.yml` 檔案：

```yaml
services:
  mysql:
    image: mysql:8.0
    container_name: hyperscale-mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_DATABASE: ${DB_NAME}
    ports:
      - "${DB_PORT}:3306"

  redis:
    image: redis:alpine
    container_name: hyperscale-redis
    ports:
      - "${REDIS_PORT}:6379"

  kafka:
    image: apache/kafka:latest
    container_name: hyperscale-kafka
    ports:
      - "${KAFKA_PORT}:9092"
    environment:
      - KAFKA_NODE_ID=1
      - KAFKA_PROCESS_ROLES=broker,controller
      - KAFKA_CONTROLLER_QUORUM_VOTERS=1@kafka:9093
      - KAFKA_LISTENERS=PLAINTEXT://:9092,CONTROLLER://:9093
      - KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://localhost:${KAFKA_PORT}
      - KAFKA_LISTENER_SECURITY_PROTOCOL_MAP=CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT
      - KAFKA_CONTROLLER_LISTENER_NAMES=CONTROLLER
      - KAFKA_INTER_BROKER_LISTENER_NAME=PLAINTEXT
      - KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1
      - CLUSTER_ID=MkU3OEVBNTcwNTJENDM2Qk
```

#### 3.3 啟動 Docker 容器

```bash
docker-compose up -d
```

確認服務已啟動：

```bash
docker ps
```

應該會看到 `hyperscale-mysql` 正在執行。

#### 3.4 建立 .gitignore

建立 `.gitignore` 檔案：

```
node_modules
.env
```

---

### Step 4：設定 Prisma

#### 4.1 初始化 Prisma

```bash
npx prisma init
```

這會產生：
- `prisma/schema.prisma` - 資料模型定義
- `prisma.config.ts` - Prisma 設定

#### 4.2 修改 prisma.config.ts

將內容替換成：

```typescript
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

#### 4.3 定義資料模型

修改 `prisma/schema.prisma`：

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "mysql"
}

// 按讚記錄
model LikeRecord {
  id        Int      @id @default(autoincrement())
  userId    String   @map("user_id")
  postId    String   @map("post_id")
  createdAt DateTime @default(now()) @map("created_at")

  @@unique([userId, postId])
}

// 文章統計
model PostStats {
  postId    String @id @map("post_id")
  likeCount Int    @default(0) @map("like_count")
}
```

**Schema 語法說明：**

| 語法 | 說明 |
|------|------|
| `@id` | 主鍵 |
| `@default(autoincrement())` | 自動遞增 |
| `@default(now())` | 預設為當前時間 |
| `@map("xxx")` | 對應到資料庫的欄位名稱 |
| `@@unique([a, b])` | 複合唯一鍵（同一用戶不能重複按讚同一篇文章） |

#### 4.4 執行 Migration（建立資料表）

```bash
npx prisma migrate dev --name init
```

這會：
1. 在 MySQL 建立資料表
2. 產生 Prisma Client 到 `src/generated/prisma/`

---

### Step 5：撰寫後端程式碼

#### 5.1 建立資料夾結構

```bash
mkdir -p src/lib
```

#### 5.2 建立 Prisma 連線實例

建立 `src/lib/prisma.ts`：

```typescript
import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const url = new URL(process.env.DATABASE_URL!);

const adapter = new PrismaMariaDb({
  host: url.hostname,
  port: Number(url.port) || 3306,
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1),
  connectionLimit: 10,
});

export const prisma = new PrismaClient({ adapter });
```

#### 5.3 建立資料庫服務

建立 `src/db_service.ts`：

```typescript
import { prisma } from "./lib/prisma.js";

async function addLike(userId: string, postId: string) {
  console.log(`用戶 ${userId} 點讚了 ${postId}`);

  // 用 transaction 確保數據一致性
  await prisma.$transaction(async (tx) => {
    await tx.likeRecord.create({
      data: { userId, postId },
    });

    await tx.postStats.upsert({
      where: { postId },
      create: { postId, likeCount: 1 },
      update: { likeCount: { increment: 1 } },
    });
  });

  console.log("點讚成功");
}

async function removeLike(userId: string, postId: string) {
  console.log(`用戶 ${userId} 取消點讚 ${postId}`);

  await prisma.$transaction(async (tx) => {
    await tx.likeRecord.delete({
      where: { userId_postId: { userId, postId } },
    });

    await tx.postStats.update({
      where: { postId },
      data: { likeCount: { decrement: 1 } },
    });
  });

  console.log("取消點讚成功");
}

async function getLikeCount(postId: string) {
  const stats = await prisma.postStats.findUnique({
    where: { postId },
  });
  if (stats === null){
    return 0;
  }
  return stats.likeCount;
}

async function hasUserLiked(userId: string, postId: string) {
  const record = await prisma.likeRecord.findUnique({
    where: { userId_postId: { userId, postId } },
  });
  return record !== null;
}

export { addLike, removeLike, getLikeCount, hasUserLiked };
```

**程式碼說明：**

| 函數 | 功能 | Prisma 方法 |
|------|------|-------------|
| `addLike` | 按讚 | `create` + `upsert` |
| `removeLike` | 取消按讚 | `delete` + `update` |
| `getLikeCount` | 查詢按讚數 | `findUnique` |
| `hasUserLiked` | 檢查是否已按讚 | `findUnique` |

#### 5.4 建立 Express API 伺服器

建立 `src/server.ts`：

```typescript
import express from "express";
import cors from "cors";
import {
  addLike,
  removeLike,
  getLikeCount,
  hasUserLiked,
} from "./db_service.js";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/like", async (req, res) => {
  const { userId, postId } = req.body;
  try {
    await addLike(userId, postId);
    res.json({ message: "按讚成功" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "按讚失敗" });
  }
});

app.post("/api/unlike", async (req, res) => {
  const { userId, postId } = req.body;
  try {
    await removeLike(userId, postId);
    res.json({ message: "取消按讚成功" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "取消按讚失敗" });
  }
});

app.get("/api/like-count/:postId", async (req, res) => {
  const { postId } = req.params;
  try {
    const count = await getLikeCount(postId);
    res.json({ count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "查詢失敗" });
  }
});

app.get("/api/has-liked/:userId/:postId", async (req, res) => {
  const { userId, postId } = req.params;
  try {
    const liked = await hasUserLiked(userId, postId);
    res.json({ liked });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "查詢失敗" });
  }
});

app.listen(3000, () => {
  console.log("服務已啟動於 Port 3000");
});
```

#### 5.5 測試後端

啟動伺服器：

```bash
npm run dev
```

使用 curl 測試 API：

```bash
# 按讚
curl -X POST http://localhost:3000/api/like \
  -H "Content-Type: application/json" \
  -d '{"userId": "user1", "postId": "post1"}'

# 查詢按讚數
curl http://localhost:3000/api/like-count/post1

# 檢查是否已按讚
curl http://localhost:3000/api/has-liked/user1/post1

# 取消按讚
curl -X POST http://localhost:3000/api/unlike \
  -H "Content-Type: application/json" \
  -d '{"userId": "user1", "postId": "post1"}'
```

---

### Step 6：建立前端介面

#### 6.1 建立 Vite 專案

在專案根目錄執行：

```bash
npm create vite@latest vite-project -- --template react-ts
cd vite-project
npm install
```

#### 6.2 設定 API 代理

修改 `vite-project/vite.config.ts`：

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
})
```

> 這樣前端的 `/api/*` 請求會自動轉發到後端的 `http://localhost:3000/api/*`

#### 6.3 修改 index.html

修改 `vite-project/index.html`，加入 Google Material Icons：

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Like System</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:FILL@1" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

#### 6.4 建立 React 元件

修改 `vite-project/src/App.tsx`：

```tsx
import { useState, useEffect } from 'react'
import './App.css'

const USER_ID = 'user1'
const POST_ID = 'post1'

function App() {
  const [likeCount, setLikeCount] = useState(0)
  const [hasLiked, setHasLiked] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    const [countRes, likedRes] = await Promise.all([
      fetch(`/api/like-count/${POST_ID}`),
      fetch(`/api/has-liked/${USER_ID}/${POST_ID}`)
    ])
    const countData = await countRes.json()
    const likedData = await likedRes.json()
    setLikeCount(countData.count ?? 0)
    setHasLiked(likedData.liked ?? false)
  }

  const handleToggleLike = async () => {
    if (loading) return
    setLoading(true)

    const endpoint = hasLiked ? '/api/unlike' : '/api/like'

    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: USER_ID, postId: POST_ID })
      })
      await fetchStatus()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <div className="post-card">
        <div className="post-header">
          <div className="avatar"></div>
          <div className="user-info">
            <span className="username">Sean Tsai</span>
            <span className="time">剛剛</span>
          </div>
        </div>

        <div className="post-content">
          <p>這是一則測試貼文</p>
        </div>

        <div className="post-stats">
          <span>{likeCount} 個讚</span>
        </div>

        <div className="post-actions">
          <button
            className={`like-btn ${hasLiked ? 'liked' : ''}`}
            onClick={handleToggleLike}
            disabled={loading}
          >
            <span className={hasLiked ? 'material-symbols-rounded' : 'material-symbols-outlined'}>
              thumb_up
            </span>
            <span>{hasLiked ? '已按讚' : '按讚'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
```

#### 6.5 建立樣式

修改 `vite-project/src/App.css`：

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app {
  min-height: 100vh;
  background: #f0f2f5;
  display: flex;
  justify-content: center;
  padding: 40px 20px;
  font-family: system-ui, -apple-system, sans-serif;
}

.post-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
}

.post-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.user-info {
  margin-left: 12px;
  display: flex;
  flex-direction: column;
}

.username {
  font-weight: 600;
  font-size: 15px;
  color: #050505;
}

.time {
  font-size: 13px;
  color: #65676b;
}

.post-content {
  padding: 0 16px 12px;
}

.post-content p {
  font-size: 15px;
  line-height: 1.5;
  color: #050505;
}

.post-stats {
  padding: 12px 16px;
  font-size: 15px;
  color: #65676b;
  border-bottom: 1px solid #e4e6eb;
}

.post-actions {
  padding: 4px 16px;
}

.like-btn {
  width: 100%;
  padding: 12px;
  border: none;
  background: transparent;
  font-size: 15px;
  font-weight: 600;
  color: #65676b;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.like-btn:hover {
  background: #f0f2f5;
}

.like-btn.liked {
  color: #1877f2;
}

.like-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
```

修改 `vite-project/src/index.css`：

```css
body {
  margin: 0;
}
```

#### 6.6 啟動前端

```bash
cd vite-project
npm run dev
```

開啟瀏覽器訪問 http://localhost:5173

---

## API 文件

| 方法 | 端點 | 說明 | Request Body |
|------|------|------|--------------|
| POST | `/api/like` | 按讚 | `{ "userId": "xxx", "postId": "xxx" }` |
| POST | `/api/unlike` | 取消按讚 | `{ "userId": "xxx", "postId": "xxx" }` |
| GET | `/api/like-count/:postId` | 取得按讚數 | - |
| GET | `/api/has-liked/:userId/:postId` | 檢查是否已按讚 | - |

**回應格式：**

```json
// 成功
{ "message": "按讚成功" }
{ "count": 10 }
{ "liked": true }

// 失敗
{ "error": "按讚失敗" }
```

---

## 專案結構

```
ts-like-system/
├── prisma/
│   ├── schema.prisma        # 資料模型定義
│   └── migrations/          # 資料庫遷移記錄（自動生成）
├── src/
│   ├── generated/prisma/    # Prisma Client（自動生成）
│   ├── lib/
│   │   └── prisma.ts        # Prisma 連線實例
│   ├── db_service.ts        # 資料庫操作邏輯
│   └── server.ts            # Express API 伺服器
├── vite-project/            # React 前端
│   ├── src/
│   │   ├── App.tsx          # 主元件
│   │   └── App.css          # 樣式
│   └── vite.config.ts       # Vite 設定
├── .env                     # 環境變數（不要上傳到 Git）
├── docker-compose.yml       # Docker 服務設定
├── package.json             # 後端套件設定
├── prisma.config.ts         # Prisma 設定
└── tsconfig.json            # TypeScript 設定
```

**自動生成 vs 手動建立：**

| 檔案 | 來源 |
|------|------|
| `prisma/migrations/` | `npx prisma migrate dev` 自動生成 |
| `src/generated/prisma/` | `npx prisma generate` 自動生成 |
| `prisma/schema.prisma` | `npx prisma init` 生成，需手動修改 |
| `src/*.ts` | 手動建立 |
| `vite-project/src/*.tsx` | 手動建立 |

---

## 常見問題

### Q1：Docker 容器無法啟動

確認 Docker Desktop 已啟動，然後重新執行：

```bash
docker-compose down
docker-compose up -d
```

### Q2：Prisma 型別沒有自動補全

執行：

```bash
npx prisma generate
```

### Q3：Migration 失敗

檢查 `.env` 中的 `DATABASE_URL` 是否正確，密碼是否與 `DB_PASSWORD` 一致。

### Q4：前端無法連接後端 API

1. 確認後端已啟動（`npm run dev`）
2. 確認 `vite.config.ts` 中的 proxy 設定正確
3. 檢查瀏覽器開發者工具的 Network 頁籤

### Q5：重複按讚報錯

因為有 `@@unique([userId, postId])` 限制，同一用戶不能重複按讚。
前端已處理這個邏輯，會自動切換按讚/取消按讚。

### Q6：如何重置資料庫

```bash
npx prisma migrate reset
```

> 這會刪除所有資料並重新建立資料表

### Q7：如何查看資料庫內容

```bash
npm run db:studio
```

這會開啟一個網頁介面，可以直接查看和編輯資料。

---

## 常用指令

| 指令 | 說明 |
|------|------|
| `npm run dev` | 啟動後端伺服器（有 hot reload） |
| `npm run db:migrate` | 執行資料庫遷移 |
| `npm run db:studio` | 開啟 Prisma Studio |
| `npx prisma generate` | 重新生成 Prisma Client |
| `npx prisma migrate reset` | 重置資料庫 |
| `docker-compose up -d` | 啟動 Docker 容器 |
| `docker-compose down` | 停止 Docker 容器 |

---

## 下一步練習：打造 Hyperscale 架構

目前的系統是單機架構，每次操作都直接讀寫 MySQL。以下練習將逐步優化，學習如何打造可處理大規模流量的系統架構。

**目標架構：** Client -> Express -> Redis (讀取快取) -> Kafka (異步寫入) -> MySQL

---

### 練習一：加入 Redis 快取層

**練習目標：** 學習使用 Redis 快取，減少資料庫查詢次數。

**解決的問題：** 每次查詢按讚數都要讀取 MySQL，高流量時資料庫壓力大。

**學習重點：**

- Redis 基本操作（GET、SET、INCR、DECR）
- Redis Set 資料結構（SADD、SREM、SISMEMBER）
- 快取策略設計（Cache-Aside）
- 快取與資料庫的一致性處理

**預期效果：**

| 操作 | 改善前 | 改善後 |
|------|--------|--------|
| 查詢按讚數 | 每次查 MySQL | 從 Redis 讀取，延遲降低約 10 倍 |
| 查詢是否已按讚 | 每次查 MySQL | 用 Redis Set 判斷，O(1) 複雜度 |

**啟動 Redis：**

```bash
docker-compose up -d redis
```

---

### 練習二：加入 Kafka 異步寫入

**練習目標：** 學習使用訊息佇列處理高併發寫入，實現削峰填谷。

**解決的問題：** 大量用戶同時按讚時，MySQL 寫入會成為瓶頸，甚至導致請求超時。

**學習重點：**

- Kafka Producer / Consumer 基本概念
- 訊息佇列的異步處理模式
- 最終一致性（Eventual Consistency）vs 強一致性
- 錯誤處理與重試機制

**預期效果：**

| 操作 | 改善前 | 改善後 |
|------|--------|--------|
| 按讚寫入 | 同步寫 MySQL，高併發會塞車 | 先寫 Kafka，Consumer 異步寫入 MySQL |
| 回應速度 | 等待 MySQL 寫入完成 | 寫入 Kafka 即返回，延遲大幅降低 |
| 系統穩定性 | 流量突增時可能崩潰 | Kafka 緩衝流量，平滑處理 |

**啟動 Kafka：**

```bash
docker-compose up -d kafka
```

---

### 練習三：水平擴展與負載均衡

**練習目標：** 學習如何將單機服務擴展為多實例，並透過負載均衡分散流量。

**解決的問題：** 單台伺服器的處理能力有限，且存在單點故障風險。

**學習重點：**

- Docker Compose 多實例部署（scale）
- Nginx 負載均衡設定
- 無狀態服務設計（Stateless）
- 健康檢查與故障轉移

**預期效果：**

| 面向 | 改善前 | 改善後 |
|------|--------|--------|
| 處理能力 | 單機上限 | 線性擴展，加機器就能提升 |
| 可用性 | 單點故障 | 一台掛掉，其他繼續服務 |
| 部署 | 停機更新 | 滾動更新，不中斷服務 |

---

### 練習總覽

| 階段 | 技術 | 解決問題 | 難度 |
|------|------|----------|------|
| 練習一 | Redis | 讀取效能 | 中 |
| 練習二 | Kafka | 寫入效能 | 中高 |
| 練習三 | Nginx + Docker Scale | 水平擴展 | 中高 |

完成這三個練習後，系統架構就具備了處理大規模流量的基本能力。
