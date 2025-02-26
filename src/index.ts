import "dotenv/config";
import Koa from "koa";
import { koaSwagger } from "koa2-swagger-ui";
import bodyParser from "koa-body";
import koaStatic from "koa-static";
import router, { registerRoutes } from "@/cmf/route";
import swaggerRouter from "./router/swagger";
import { install } from "./lib/install";
import registerPlugins from "./plugins";
import fs from "fs";
import { PUBLIC_PATH, UPLOAD_DIR } from "./constants/path";

const cmf = {
  router,
  migrate: null
}; // 核心容器

install(cmf);
registerPlugins(cmf);
registerRoutes();

if (cmf.migrate) {
  cmf.migrate().commit();
}

// 检查并创建上传目录
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true }); // recursive: true 确保创建多级目录
}

const app = new Koa();

app.use(async (ctx, next) => {
  try {
    global.request = ctx.request;
    await next();
  } catch (err) {
    console.error(err);
    ctx.status = err.status || 500;
    ctx.body = {
      code: ctx.status,
      message: err.message
    };
  }
});

app.use(
  koaStatic(PUBLIC_PATH, {
    gzip: true
  })
);

app.use(
  bodyParser({
    multipart: true,
    formidable: {
      uploadDir: UPLOAD_DIR,
      keepExtensions: true
    }
  })
);

const port = process.env.PORT || 3000;
app.use(router.routes());

// 加载swagger.json
app.use(swaggerRouter.routes());
// 加载swagger-ui
app.use(
  koaSwagger({
    routePrefix: "/swagger",
    swaggerOptions: {
      url: "/swagger.json"
    }
  })
);

app.listen(port, () => {
  console.log(`🚀 Server is running on port http://localhost:${port}/`);
});
