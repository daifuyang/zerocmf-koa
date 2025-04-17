# 代码风格规范

## 文件命名规范

1. Controller文件使用`controller`后缀
   - 示例: `user.ts`, `admin.ts`
   
2. Service文件使用`service`后缀  
   - 示例: `user.ts`, `menu.ts`

3. Model文件使用`model`后缀
   - 示例: `user.ts`, `menu.ts`

## 函数命名规范

1. Model层函数统一使用`Model`后缀
   - 示例: 
     ```typescript
     getUserByIdModel()
     createUserModel() 
     updateMenuModel()
     ```

2. Service层函数使用业务语义命名
   - 示例:
     ```typescript
     getUserProfileService()
     saveMenuDataService()
     ```

3. Controller层函数使用RESTful风格命名  
   - 示例:
     ```typescript
     getUserController()
     createUserController()
     updateMenuController()
     ```

## 编程风格要求

1. 使用function编程风格
   - 避免使用class
   - 使用纯函数
   - 函数职责单一

2. 类型定义
   - 使用TypeScript严格类型
   - 接口命名以`I`前缀
   - 类型定义集中管理

3. 文件结构
   ```
   src/
     cmf/
       controller/   # 控制器
       services/     # 服务层  
       models/       # 模型层
       types/        # 类型定义
   ```

4. 其他规范
   - 使用async/await处理异步
   - 错误处理统一格式
   - 日志记录规范
   - 注释要求

## 示例代码

```typescript
// controller示例
export function getUserController(ctx: Context) {
  const user = getUserService(ctx.params.id);
  ctx.body = user;
}

// service示例 
export function getUserService(userId: number) {
  return getUserModel(userId);
}

// model示例
export function getUserModel(userId: number) {
  return prisma.user.findUnique({ where: { id: userId } });
}
