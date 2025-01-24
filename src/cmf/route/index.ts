import Router from "koa-router";
import { Login } from "../controller/login";
import { currentUser } from "../controller/user";
import { routers } from "./router";

let router = new Router();
function registerRoutes() {
  const { adminRouter, apiRouter } = routers;
  // 用户登录
  apiRouter.post("/login", Login);
  // 用户鉴权
  apiRouter.get("/currentUser", currentUser);
  apiRouter.use(adminRouter.routes());
  router.use(apiRouter.routes());
  return router;
}
export { routers, registerRoutes };
export default router;
