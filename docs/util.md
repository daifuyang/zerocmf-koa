# Response 响应处理模块

`response.ts` 模块提供了统一的响应处理功能，用于规范化接口返回格式，简化响应处理逻辑。

## 响应结构

### JsonResult 通用响应结构

```typescript
interface JsonResult<T> {
  code: number;   // 响应状态码
  msg: string;    // 响应消息
  data: T | null; // 响应数据
}
```

### Pagination 分页数据结构

```typescript
type Pagination<T> = {
  total: number;    // 总记录数
  data: T[];        // 分页数据列表
  current: number;   // 当前页码
  pageSize: number; // 每页条数
};
```

## 核心方法

### success(msg: string, data?: any)

返回成功响应

- 参数
  - msg: 成功提示消息
  - data: 响应数据（可选）
- 返回值: JsonResult对象
- 示例:
```typescript
// 返回成功消息
response.success("操作成功");
// 返回带数据的成功响应
response.success("获取成功", { id: 1, name: "示例" });
```

### error(msg: string, data?: any, log?: boolean)

返回错误响应

- 参数
  - msg: 错误提示消息
  - data: 错误相关数据（可选）
  - log: 是否记录日志（可选）
- 返回值: JsonResult对象
- 示例:
```typescript
// 返回错误消息
response.error("操作失败");
// 返回带数据的错误响应
response.error("验证失败", { field: "username", message: "用户名已存在" });
```

### errorWithCode(code: number, msg: string, data?: any)

返回自定义错误码的错误响应

- 参数
  - code: 自定义错误码
  - msg: 错误提示消息
  - data: 错误相关数据（可选）
- 返回值: JsonResult对象
- 示例:
```typescript
// 返回自定义错误码响应
response.errorWithCode(401, "未授权访问");
// 返回带数据的自定义错误响应
response.errorWithCode(403, "权限不足", { requiredRole: "admin" });
```