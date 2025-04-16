import Router from "koa-router";
import { Login } from "../controller/login";
import { currentUser } from "../controller/user";
import { apiv1 } from "../constants/router";
import adminRouter from "./admin";
export const router = (() => {
  const router = new Router();
  const v1 = new Router({ prefix: apiv1 });
  
  v1.post("/login", Login);
  v1.get("/currentUser", currentUser);
  
  router.use(v1.routes());
  router.use(adminRouter.routes());
  return router;
})();
