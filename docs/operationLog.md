# 操作日志功能使用指南

ZeroCMF 系统提供了完善的操作日志记录功能，可以记录管理员在后台的各种操作，方便系统审计和问题排查。

## 功能特点

- 自动记录用户操作信息，包括操作人员、操作时间、操作类型等
- 自动关联API与菜单，获取操作模块信息
- 根据HTTP方法自动推断业务类型
- 记录操作的请求参数和响应结果
- 记录操作的 IP 地址和地理位置
- 支持按模块、操作人员、操作类型等条件查询日志
- 支持导出日志数据

## 数据库结构

操作日志存储在 `sys_operation_log` 表中，主要字段包括：

| 字段名 | 说明 |
| ----- | ---- |
| oper_id | 日志主键 |
| title | 模块标题 |
| business_type | 业务类型（0其它 1新增 2修改 3删除 4授权 5导出 6导入 7强退 8清空数据） |
| method | 方法名称 |
| request_method | 请求方式 |
| operator_type | 操作类别（0其它 1后台用户 2手机端用户） |
| oper_name | 操作人员 |
| dept_name | 部门名称 |
| oper_url | 请求URL |
| oper_ip | 主机地址 |
| oper_location | 操作地点 |
| oper_param | 请求参数 |
| json_result | 返回参数 |
| status | 操作状态（0异常 1正常） |
| error_msg | 错误消息 |
| oper_time | 操作时间 |
| user_id | 用户ID |

## 使用方法

### 1. 使用中间件记录操作日志

ZeroCMF 提供了 `operationLog` 中间件，可以在路由中使用该中间件来记录操作日志。

```typescript
import { operationLog } from "@/cmf/middlewares/operationLog";
import { BusinessType } from "@/cmf/models/operationLog";

// 用户管理 - 添加用户（完整配置）
adminRouter.post(
  "/users",
  operationLog({
    title: "用户管理",
    businessType: BusinessType.INSERT,
    isSaveRequestData: true
  }),
  addUserController
);

// 用户管理 - 自动推断（不提供任何配置）
adminRouter.post(
  "/users",
  operationLog(),
  addUserController
);
```

### 2. 中间件配置选项

`operationLog` 中间件接受以下配置选项（所有选项均为可选）：

| 选项 | 类型 | 说明 | 默认值 |
| ---- | ---- | ---- | ----- |
| title | string | 模块标题 | 自动从关联菜单获取 |
| businessType | BusinessType | 业务类型 | 根据HTTP方法和菜单权限标识推断 |
| operatorType | OperatorType | 操作者类型 | OperatorType.ADMIN (1) |
| isSaveRequestData | boolean | 是否保存请求参数 | true |
| isSaveResponseData | boolean | 是否保存响应结果 | true |

### 3. 业务类型枚举

```typescript
export enum BusinessType {
  OTHER = 0,  // 其它
  INSERT = 1, // 新增
  UPDATE = 2, // 修改
  DELETE = 3, // 删除
  GRANT = 4,  // 授权
  EXPORT = 5, // 导出
  IMPORT = 6, // 导入
  FORCE = 7,  // 强退
  CLEAN = 8   // 清空数据
}
```

### 4. 操作者类型枚举

```typescript
export enum OperatorType {
  OTHER = 0,    // 其它
  ADMIN = 1,    // 后台用户
  MOBILE = 2    // 手机端用户
}
```

## 自动推断机制

改进后的操作日志中间件具有智能推断功能：

1. **业务类型推断**：
   - 根据HTTP方法自动推断业务类型：
     - POST → INSERT（新增）
     - PUT/PATCH → UPDATE（修改）
     - DELETE → DELETE（删除）
     - GET → OTHER（其它）
   - 如果菜单有权限标识(perms)，也会尝试从权限标识中推断业务类型

2. **模块标题推断**：
   - 通过API路径和方法查找对应的API记录
   - 通过API关联查找对应的菜单
   - 使用菜单名称作为模块标题

## 最佳实践

### 1. 全局记录所有管理后台操作

可以在管理后台路由中全局使用操作日志中间件，记录所有操作：

```typescript
// 全局记录所有管理后台操作（自动推断业务类型和模块标题）
adminRouter.use(
  operationLog({
    isSaveRequestData: true,
    isSaveResponseData: false
  })
);
```

### 2. 针对特定路由使用

也可以针对特定路由使用，更精确地记录操作类型：

```typescript
// 用户管理 - 添加用户（自动推断）
adminRouter.post(
  "/users",
  operationLog(),
  addUserController
);

// 用户管理 - 修改用户（覆盖自动推断的值）
adminRouter.put(
  "/users/:userId",
  operationLog({
    title: "用户管理",
    businessType: BusinessType.UPDATE,
    isSaveRequestData: true
  }),
  updateUserController
);

// 用户管理 - 删除用户
adminRouter.delete(
  "/users/:userId",
  operationLog({
    title: "用户管理",
    businessType: BusinessType.DELETE
  }),
  deleteUserController
);
```

### 3. 敏感数据处理

对于包含敏感信息的请求，可以设置 `isSaveRequestData` 为 `false`，避免记录敏感信息：

```typescript
// 用户登录 - 不记录请求参数（避免记录密码）
adminRouter.post(
  "/login",
  operationLog({
    title: "用户登录",
    isSaveRequestData: false
  }),
  loginController
);
```

## API 接口

系统提供了以下 API 接口用于操作日志的管理：

- `GET /api/v1/admin/operation-logs` - 获取操作日志列表
- `GET /api/v1/admin/operation-logs/:id` - 获取操作日志详情
- `DELETE /api/v1/admin/operation-logs` - 删除操作日志
- `DELETE /api/v1/admin/operation-logs/clean` - 清空操作日志
- `GET /api/v1/admin/operation-logs/export` - 导出操作日志

## 示例代码

完整的示例代码可以参考：

- 模型：`src/cmf/models/operationLog.ts`
- 中间件：`src/cmf/middlewares/operationLog.ts`
- 控制器：`src/cmf/controller/admin/operationLog.ts`
- 路由：`src/cmf/route/admin.ts`
- 示例：`src/cmf/controller/admin/example.ts` 和 `src/cmf/route/example.ts`
