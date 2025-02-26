import Router from "koa-router";
import initAdminRouter from "./admin";
import initWebRouter from "./web";
export default function initRouter(router) {
  const v1 = new Router({ prefix: "/api/v1" });
  const adminRouter = initAdminRouter();
  const webRouter = initWebRouter();
  v1.use(adminRouter.routes());
  v1.use(webRouter.routes());
  router.use(v1.routes());
}
