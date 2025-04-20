# Swagger API 规范指南

## 基础规范
1. 使用OpenAPI 3.0标准
2. 所有定义放在`.yaml`文件中
3. 使用`$ref`实现组件复用

## 路径规范
- 所有API路径必须以`/api/v1`开头
- 管理接口路径包含`/admin/`
- 示例：
  ```yaml
  paths:
    /api/v1/admin/users:
      get:
        operationId: getUsers
    /api/v1/public/data:
      get: 
        operationId: getPublicData
  ```

## 参数规范
1. 查询参数必须与控制器中的zod验证schema保持一致
2. 示例：
   ```yaml
   parameters:
     - name: current
       in: query
       schema:
         type: string  # 与zod的string类型一致
       default: "1"
     - name: status
       in: query
       schema:
         type: string  # 保持和控制器一致
   ```

## 响应规范
1. 统一响应结构：
   ```yaml
   components:
     schemas:
       Response:
         type: object
         properties:
           code:
             type: integer
           msg:
             type: string 
           data:
             type: object
   ```

2. 分页响应扩展：
   ```yaml
   UserListResp:
     allOf:
       - $ref: "#/components/schemas/Response"
       - type: object
         properties:
           data:
             type: array
             items:
               $ref: "#/components/schemas/User"
           page:
             type: integer
           pageSize:
             type: integer
           total:
             type: integer
   ```

## 安全规范
1. 所有管理接口必须包含安全认证：
   ```yaml
   security:
     - BearerAuth: []
   ```

2. operationId规范：
   - 必须为每个操作定义唯一的operationId
   - 命名规则：动词+名词（如getUsers, addUser）
   - 与控制器方法名保持一致

## 与Prisma模型一致性
1. 字段类型必须与Prisma模型定义一致
2. 时间字段处理：
   ```yaml
   properties:
     createdAt:
       type: string  # Prisma返回时间戳字符串
       example: "1723613053"
   ```

## 检查清单
- [ ] 所有查询参数类型与zod schema匹配
- [ ] 分页参数保持string类型
- [ ] 状态字段类型与控制器一致
- [ ] 时间字段使用字符串类型
- [ ] 嵌套对象结构与Prisma返回结果一致
