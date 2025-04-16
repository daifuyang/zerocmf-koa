import "dotenv/config";
import { pipe } from "fp-ts/function";
import fs from "fs";
import { createAppConfig } from "./config/app";
import { setupMiddlewares } from "./middlewares";
import { initializeCmf } from "./cmf/init";
import { startServer } from "./server";

// 应用配置
const config = createAppConfig();

// 检查并创建上传目录
if (!fs.existsSync(config.uploadDir)) {
  fs.mkdirSync(config.uploadDir, { recursive: true });
}

// 初始化CMF（创建app实例、注册路由、插件和迁移）
const app = initializeCmf();

// 组合式应用初始化
pipe(
  app,
  // 设置中间件（包含错误处理、静态文件、请求解析等）
  setupMiddlewares(config),
  // 启动服务器
  startServer(config.port)
);
