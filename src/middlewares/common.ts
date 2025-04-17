import fs from "fs";
import path from "path";
import { ADMIN_PATH } from "../constants/path";
import { AppConfig } from "../config/app";

// 错误处理中间件
export const errorHandler = (config?: AppConfig) => async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = {
      error: err.message,
      code: err.code || 'INTERNAL_ERROR',
      ...(config?.env === 'development' && { stack: err.stack })
    };
    ctx.app.emit('error', err, ctx);
  }
};

// 健康检查中间件
export const healthCheck = () => async (ctx, next) => {
  if (ctx.path === '/health') {
    ctx.body = { status: 'UP' };
    return;
  }
  await next();
};

// 处理管理后台页面
export const adminPageHandler = () => async (ctx, next) => {
  if (ctx.path.startsWith("/admin")) {
    try {
      ctx.set("Content-Type", "text/html");
      ctx.body = fs.readFileSync(path.join(ADMIN_PATH, "index.html"));
    } catch {
      ctx.status = 404;
      ctx.body = "<h1>404 Not Found</h1>";
    }
    return;
  }
  await next();
};
