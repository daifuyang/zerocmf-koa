# ZeroCMF Koa 快速入门指南

## 1. 项目初始化

```bash
# 克隆项目
git clone https://github.com/zerocmf/zerocmf-koa.git
cd zerocmf-koa

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑.env文件配置数据库等
```

## 2. 基本配置

项目采用分层配置系统：

- `config/core.ts` - 核心不可变配置
- `config/env.ts` - 环境相关配置
- `config/plugin.ts` - 插件配置

启动配置示例：
```typescript
// src/index.ts
import { createApp } from './server';
import { createAppConfig } from './config/app';

const config = createAppConfig();
const app = createApp(config);

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
```

## 3. 路由定义

路由定义在`src/cmf/router/`目录下：

```typescript
// 示例路由定义
import { RouteSpec } from '../../typings/router';

export const routes: RouteSpec[] = [
  {
    method: 'get',
    path: '/api/users',
    handler: async (ctx) => {
      ctx.body = { users: [] };
    }
  }
];
```

## 4. 插件使用

插件定义在`src/plugins/`目录下：

```typescript
// 示例插件定义
export default {
  name: 'my-plugin',
  install(cmf) {
    // 插件初始化逻辑
  },
  start(cmf) {
    // 插件启动逻辑  
  }
};
```

注册插件：
```typescript
// src/index.ts
import myPlugin from './plugins/my-plugin';

const config = createAppConfig([myPlugin]);
```

## 5. 中间件配置

中间件系统采用配置驱动方式，核心文件在`src/middlewares/`目录下。

### 默认中间件
框架已内置以下中间件：
- 错误处理(errorHandler)
- 静态文件服务(static)
- 请求体解析(bodyParser)
- 路由(router)
- Swagger文档(swagger)

### 自定义中间件
1. 创建中间件文件：
```typescript
// src/middlewares/myMiddleware.ts
import { MiddlewareSpec } from '../config/middleware';

export const myMiddleware: MiddlewareSpec = {
  name: 'my-middleware',
  middleware: async (ctx, next) => {
    console.log('My middleware executed');
    await next();
  },
  config: {
    enable: true,
    order: 250, // 执行顺序
    description: '我的自定义中间件'
  }
};
```

2. 注册中间件：
```typescript
// src/index.ts
import { myMiddleware } from './middlewares/myMiddleware';
import { setupMiddlewares } from './middlewares';

const app = new Koa();
setupMiddlewares(config)(app)
  .use(myMiddleware.middleware);
```

### 中间件配置选项
每个中间件可配置以下参数：
```typescript
interface MiddlewareConfig {
  enable?: boolean;  // 是否启用
  order?: number;    // 执行顺序(数字越小越先执行)
  [key: string]: any; // 其他自定义配置
}
```

### 禁用默认中间件
在config/middleware.ts中配置：
```typescript
export const middlewareConfig = {
  'static': { enable: false }, // 禁用静态文件中间件
  'bodyParser': { order: 300 } // 修改bodyParser执行顺序
};
```

## 6. 启动项目

```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

## 7. 项目结构

```
src/
├── config/        # 配置系统
├── cmf/           # 核心框架
├── middlewares/   # 中间件
├── plugins/       # 插件系统
├── typings/       # 类型定义
└── index.ts       # 入口文件
