# zerocmf api

base on koa

## 环境变量

.env
请设置您真实的mysql数据库连接信息

```bash
DATABASE_URL="mysql://root:123456@localhost:3306/nextcms"
```

## 系统安装

```bash
# 1.依赖安装
pnpm install

# 2.数据库迁移
npx prisma migrate dev --name init
```

## 系统启动

```bash
pnpm run dev
```

## 推荐环境

- node 18.15.0
- mysql 8.0.32
- pnpm 7.18.1
- koa 2.14.1
