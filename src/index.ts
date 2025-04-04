import "dotenv/config";
import Koa from "koa";
import bodyParser from "koa-body";
import koaStatic from "koa-static";
import { registerCmfRoutes } from "@/cmf/router";
import swaggerRouter from "@/cmf/router/swagger";
import { install } from "./lib/install";
import registerPlugins from "./plugins";
import fs from "fs";
import { ADMIN_PATH, PUBLIC_PATH, TEMPLATE_PATH } from "./constants/path";
import path from "path";
import { Cmf } from "./typings/index";

// 注册核心路由
const router = registerCmfRoutes();

const cmf: Cmf = {
  router,
  migrate: null
}; // 核心容器

install(cmf);
registerPlugins(cmf);

if (cmf.migrate) {
  cmf.migrate().commit();
}

// 检查并创建上传目录
const uploadPath = path.resolve(PUBLIC_PATH, "tmp");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true }); // recursive: true 确保创建多级目录
}

const app = new Koa();

app.use(
  bodyParser({
    multipart: true,
    formidable: {
      uploadDir: uploadPath,
      keepExtensions: true
    }
  })
);

const port = process.env.PORT || 3000;
app.use(router.routes());

// 加载swagger.json
app.use(swaggerRouter.routes());

app.use(koaStatic(TEMPLATE_PATH));

app.use(async (ctx) => {
  if (ctx.path.startsWith("/admin")) {
    try {
      ctx.set("Content-Type", "text/html");
      ctx.body = fs.readFileSync(path.join(ADMIN_PATH, "index.html"));
    } catch (error) {
      ctx.body = "<h1>404 Not Found</h1>";
    }
  }
});

app.listen(port, () => {
  console.log(`🚀 Server is running on port http://localhost:${port}/`);
});
