# ZeroCMF 架构文档

## 技术栈

- **核心框架**: Koa 2 (Node.js)
- **开发语言**: TypeScript  
- **数据库**: MySQL + Prisma ORM
- **权限控制**: Casbin RBAC
- **缓存**: Redis
- **API文档**: Swagger
- **函数式编程**: fp-ts

## 系统架构

### 核心架构

ZeroCMF 采用模块化、插件化的架构设计，基于 Koa 框架构建，使用函数式编程范式组织应用流程。

```
应用入口 → 配置加载 → CMF初始化 → 中间件设置 → 服务启动
```

### 启动流程

1. **配置加载**: 通过 `createAppConfig()` 创建应用配置
2. **上传目录初始化**: 检查并创建文件上传目录
3. **CMF初始化**: 通过 `initializeCmf()` 创建Koa实例、注册路由和插件
4. **中间件设置**: 通过 `setupMiddlewares()` 配置全局中间件
5. **服务启动**: 通过 `startServer()` 启动HTTP服务

整个流程通过 fp-ts 的 `pipe` 函数实现组合式应用初始化，提高代码可读性和可维护性。

## 核心模块

### CMF 初始化 (src/cmf/init.ts)

- 创建 Koa 应用实例
- 初始化 CMF 上下文对象
- 执行安装流程
- 注册插件系统
- 执行数据迁移
- 将 CMF 实例绑定到 Koa 上下文

### 中间件系统 (src/middlewares/index.ts)

按顺序加载以下中间件：
- 全局错误处理
- 静态文件服务
- 请求体解析
- CMF 上下文注入
- 健康检查
- 管理后台页面处理
- 核心路由
- Swagger API 文档

### 路由系统 (src/cmf/router/index.ts)

- 基于 koa-router 实现
- API 版本控制 (/api/v1)
- 登录和用户信息接口
- 管理后台路由

### 插件系统 (src/plugins/index.ts)

- 可扩展的插件注册机制
- 文章管理插件示例
- 插件可访问 CMF 上下文

### 数据库连接 (src/lib/prisma.ts)

- 基于 Prisma ORM
- 全局单例模式
- 开发环境下保持连接

## 功能模块

### 用户认证

- JWT 认证
- 密码加盐存储
- Token 刷新机制

### 权限管理

- 角色管理
- 菜单权限
- API访问控制
- 数据权限

### 系统管理

- 用户管理
- 角色管理
- 部门/岗位管理
- 系统参数配置

### 内容管理

- 媒体文件上传/管理
- 文件分类管理
- 文件元数据记录

### 系统监控

- 登录日志
- 操作日志审计
- 异常记录

## 项目结构

```
src/
├── casbin/         # 权限控制
├── cmf/            # 核心功能
│   ├── constants/  # 常量定义
│   ├── controller/ # 控制器
│   ├── init.ts     # 初始化逻辑
│   ├── middlewares/# CMF中间件
│   ├── migrate/    # 数据迁移
│   ├── models/     # 数据模型
│   ├── router/     # 路由定义
│   └── typings/    # 类型定义
├── config/         # 配置文件
├── constants/      # 全局常量
├── index.ts        # 应用入口
├── lib/            # 工具库
├── middlewares/    # 全局中间件
├── migrate/        # 迁移工具
├── plugins/        # 插件系统
└── server.ts       # 服务器启动

prisma/             # 数据库配置
  ├── migrations/   # 数据库迁移
  └── schema/       # 数据模型定义
```

## 安全设计

- 请求参数过滤
- 接口访问权限控制
- 操作日志全记录
- 密码加盐哈希存储
- JWT Token认证
