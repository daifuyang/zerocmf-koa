import "dotenv/config";
import Koa from "koa";
import { koaSwagger } from "koa2-swagger-ui";
import bodyParser from "koa-body";
import { router } from "./router/router";
import swaggerRouter from "./router/swagger";
import { install } from "./lib/install";

install();

const app = new Koa();
app.use(bodyParser());

const port = process.env.PORT || 3000;
app.use(router.routes());

// 加载swagger.json
app.use(swaggerRouter.routes());
// 加载swagger-ui
app.use(koaSwagger({
  routePrefix: "/swagger",
  swaggerOptions: {
    url: "/swagger.json",
  },
}))

app.listen(port, () => {
  console.log(`🚀 Server is running on port http://localhost:${port}/`);
});
