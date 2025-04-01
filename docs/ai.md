# AI 辅助开发指南

## 目录
1. [概述](#概述)
2. [代码生成规范](#代码生成规范)
3. [控制器生成](#控制器生成)
4. [模型生成](#模型生成)
5. [Swagger文档生成](#swagger文档生成)
6. [最佳实践](#最佳实践)

## 概述

ZeroCMF-Koa 支持使用 AI 工具辅助开发，可快速生成：
- 控制器代码
- 数据模型
- Swagger 文档
- 数据库迁移脚本

## 代码生成规范

### 基本要求
- 遵循项目 TypeScript 规范
- 使用 async/await 处理异步
- 统一使用项目响应格式
- 保持代码风格一致

### 示例提示词
```markdown
在 [插件名] 下完成 [功能] 功能，包含：
1. 功能点1描述
2. 功能点2描述

请按照以下规范生成代码：
- 使用项目标准响应格式
- 包含完整类型定义
- 添加必要的错误处理
```

## 控制器生成

### 标准模板
```typescript
import response from '@/lib/response';
import { Context } from 'koa';

export const getList = async (ctx: Context) => {
  try {
    // 业务逻辑
    const data = await service.getList();
    ctx.body = response.success("获取成功", data);
  } catch (error) {
    ctx.body = response.error(error.message);
  }
};
```

### 生成示例
```typescript
// 获取接口列表 - AI 生成示例
export const getApisController = async (ctx: Context) => {
  const apis = await getApis();
  if (!apis) {
    return response.error("获取失败！");
  }
  ctx.body = response.success("获取成功！", apis);
};
```

## 模型生成

### Prisma 模型规范
```prisma
model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  createdAt DateTime @default(now())
}
```

### 生成提示词
```markdown
请帮我完成model层代码，需包含以下字段：
1. id: 自增主键
2. name: 字符串
3. createdAt: 创建时间
4. updatedAt: 更新时间

请参考项目其他model的代码规范
```

## Swagger文档生成

### 注释规范
```typescript
/**
 * @swagger
 * /api/v1/admin/apis:
 *   get:
 *     tags: [Admin]
 *     summary: 获取接口列表
 *     responses:
 *       200:
 *         description: 成功获取接口列表
 */
```

### 生成提示词
```markdown
请帮我完成swagger配置代码：
- 路由前缀: /api/v1/admin
- 包含分页参数
- 有详细的响应示例
```

## 最佳实践

1. **验证生成代码**：AI生成的代码必须人工验证
2. **保持风格一致**：调整生成代码符合项目规范
3. **分步生成**：复杂功能拆解为多个生成任务
4. **文档同步**：代码生成后立即补充文档

## 附录
- [Prisma 模型参考](https://www.prisma.io/docs/concepts/components/prisma-schema/data-model)
- [Swagger 注释规范](https://swagger.io/specification/)
