# Lost & Found 后端（Node.js + MySQL）

## 1. 准备环境变量

复制一份配置文件：

- Windows PowerShell：
  - `copy .env.example .env`

然后编辑 `.env`，把 MySQL 连接信息改成你的：

- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`

## 2. 安装依赖

在 `server/` 目录下执行：

- `npm install`

## 3. 启动

- 开发模式（自动重启）：`npm run dev`
- 生产模式：`npm start`

健康检查：

- `GET http://localhost:3001/api/health`

接口：

- `GET http://localhost:3001/api/items`
- `POST http://localhost:3001/api/items`

