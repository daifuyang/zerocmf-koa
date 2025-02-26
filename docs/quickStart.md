# ZEROCMF-KOA后端框架文档

## 简介

- 框架概述：介绍ZEROCMF-KOA的目的、特点以及主要功能。
- 技术栈：列出构建此框架使用的主要技术（如Koa.js, TypeScript等）。

## 快速开始

### 安装指南

```bash
# 安装依赖
yarn 
# 启动程序
yarn run dev
```

### 配置文件

通过环境变量来配置项目。修改.env路径

### 部署

1 本地打包

``` bash
npm run build
```

2 根目录下执行部署脚本

```bash
 node ./scripts/deploy.js
```

3 生成函数计算服务器所需的依赖

```bash
s build
```

4 执行数据库迁移 prisma

```bash
npx prisma migrate dev --name init
```

5 将生成的.prisma拷贝到layer/prisma/nodejs下

```bash
mv dist/node_modules/.prisma layer/prisma/nodejs
```

