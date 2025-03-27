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
npm install

# 2.配置数据库
新增.env文件，并设置数据库连接信息。按照以下格式设置：
DATABASE_URL="mysql://you_name:you_password@localhost:3306/you_database"  

# 2.数据库迁移
npx prisma migrate dev --name init
```

## 系统启动

```bash
npm run dev
```

## 推荐环境

- node 18.15.0
- mysql 8.0.32
- pnpm 7.18.1
- koa 2.14.1

## 部署

### 阿里云函数计算

1.打包代码
```bash
npm run build
```

2.进入fc模型环境，安装node_modules
```bash
s build --use-sandbox
npm install
```

3.发布node_modules为层
```bash
 s layer publish --region cn-shanghai --layer-name zerocmf- --code ./ --compatible-runtime custom.debian10
```