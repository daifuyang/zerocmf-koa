import Router from "koa-router";
import { Login } from "../controller/login";
import { currentUser } from "../controller/user";
import { prefix } from "../constants/router";
import adminRouter from "./admin";
let router = new Router();
export function registerRoutes() {
  const v1 = new Router({ prefix });
  // 用户登录
  v1.post("/login", Login);
  // 用户鉴权
  v1.get("/currentUser", currentUser);
  v1.use(adminRouter.routes());
  router.use(v1.routes());
}
export default router;
