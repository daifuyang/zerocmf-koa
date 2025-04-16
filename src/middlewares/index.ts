import Koa from "koa";
import koaStatic from "koa-static";
import koaBody from "koa-body";
import { AppConfig } from "../config/app";
import { PUBLIC_PATH, TEMPLATE_PATH } from "../constants/path";
import { Cmf } from "../cmf/typings";
import { MiddlewareSpec } from "../config/middleware";
import { errorHandler } from "./common";
import { router } from "../cmf/router";
import { swaggerRouter } from "../cmf/router/swagger";

declare module "koa" {
  interface BaseContext {
    cmf: Cmf;
  }
}

export class MiddlewareManager {
  private middlewares: MiddlewareSpec[] = [];
  private app: Koa;

  constructor(app: Koa, config: AppConfig) {
    if (!config) {
      throw new Error("MiddlewareManager requires a valid config");
    }
    this.app = app;
  }

  register(middleware: MiddlewareSpec) {
    this.middlewares.push(middleware);
    return this;
  }

  setup() {
    // 按order排序
    this.middlewares.sort((a, b) => (a.config?.order || 0) - (b.config?.order || 0));

    // 注册启用的中间件
    for (const mw of this.middlewares) {
      if (mw.config?.enable !== false) {
        this.app.use(mw.middleware);
      }
    }
    return this.app;
  }
}

// 默认中间件配置
export const setupMiddlewares = (config: AppConfig) => (app: Koa) => {
  const manager = new MiddlewareManager(app, config);

  manager
    .register({
      name: "errorHandler",
      middleware: errorHandler(config),
      config: {
        name: "errorHandler",
        enable: true,
        order: -1000,
        description: "全局错误处理中间件"
      }
    })
    .register({
      name: "static",
      middleware: koaStatic(PUBLIC_PATH, config.staticOptions),
      config: {
        name: "static",
        enable: true,
        order: 100,
        description: "静态文件服务中间件"
      }
    })
    .register({
      name: "staticTemplate",
      middleware: koaStatic(TEMPLATE_PATH, config.staticOptions),
      config: {
        name: "staticTemplate",
        enable: true,
        order: 150,
        description: "模板静态文件服务中间件"
      }
    })
    .register({
      name: "bodyParser",
      middleware: koaBody({
        multipart: true,
        formidable: { uploadDir: config.uploadDir }
      }),
      config: {
        name: "bodyParser",
        enable: true,
        order: 200,
        description: "请求体解析中间件"
      }
    })
    .register({
      name: "cmfContext",
      middleware: async (ctx, next) => {
        ctx.cmf = ctx.cmf || app.context.cmf;
        await next();
      },
      config: {
        name: "cmfContext",
        enable: true,
        order: 300,
        description: "CMF上下文注入中间件"
      }
    })
    .register({
      name: "router",
      middleware: router.routes(),
      config: {
        name: "router",
        enable: true,
        order: 400,
        description: "核心路由中间件"
      }
    })
    .register({
      name: "swagger",
      middleware: swaggerRouter.routes(),
      config: {
        name: "swagger",
        enable: true,
        order: 500,
        description: "Swagger文档中间件"
      }
    });

  return manager.setup();
};
