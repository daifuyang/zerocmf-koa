# ZeroCMF-Koa 开发文档

## 目录
1. [项目配置](#项目配置)
2. [开发规范](#开发规范)  
3. [API开发指南](#api开发指南)
4. [数据库操作](#数据库操作)
5. [插件开发](#插件开发)
6. [测试与部署](#测试与部署)

## 项目配置

### 环境要求
- Node.js 18+
- MySQL 8.0+
- PNPM 7+

### 配置文件
```bash
# .env 示例
DATABASE_URL="mysql://user:password@localhost:3306/db"
JWT_SECRET="your_jwt_secret"
```

## 开发规范

### 代码结构
```
src/
├── cmf/       # 核心框架
├── plugins/   # 插件模块
├── config/    # 配置文件
└── typings/   # 类型定义
```

### 编码规范
- 使用TypeScript严格模式
- 遵循RESTful API设计原则
- 控制器方法使用async/await
- 错误处理统一格式

## API开发指南

### 创建新API
1. 在`src/cmf/controller`下创建控制器
2. 在`src/cmf/router`中添加路由
3. 编写Swagger注释

```typescript
// 示例控制器
export const getUser = async (ctx: Context) => {
  // 业务逻辑
}
```

### Swagger集成
```yaml
// swagger注释示例
/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: 获取用户信息
 *     responses:
 *       200:
 *         description: 成功获取用户
 */
```

## 数据库操作

### Prisma使用
```prisma
// schema.prisma 示例
model User {
  id    Int     @id @default(autoincrement())
  name  String
  email String  @unique
}
```

### 常用命令
```bash
# 生成客户端
npx prisma generate

# 数据迁移
npx prisma migrate dev --name init
```

## 插件开发

### 创建插件
1. 在`src/plugins`下创建插件目录
2. 实现标准接口:
   - 控制器
   - 路由
   - 模型
   - 服务

### 插件示例
```typescript
// 文章插件结构
plugins/
└── article/
    ├── controller/
    ├── models/
    ├── router/
    └── service/
```

## 测试与部署

### 单元测试
```bash
npm test
```

### 生产部署
```bash
# 构建
npm run build

# 启动
npm start
```

### 阿里云FC部署
```bash
s deploy
```

## 附录
- [Prisma文档](https://www.prisma.io/docs)
- [Koa文档](https://koajs.com/)
- [Swagger规范](https://swagger.io/specification/)
