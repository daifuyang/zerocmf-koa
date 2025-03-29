import Router from "koa-router";
import initAdminRouter from "./admin";
import initWebRouter from "./web";
export default function initRouter(router) {
  const adminRouter = initAdminRouter();
  const webRouter = initWebRouter();
  router.use(adminRouter.routes());
  router.use(webRouter.routes());
}
