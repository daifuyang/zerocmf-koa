import Router from "koa-router";
import { LoginController } from "../controller/login";
import { currentUserController } from "../controller/user";
import { apiv1 } from "../constants/router";
import adminRouter from "./admin";
export const router = (() => {
  const router = new Router();
  const v1 = new Router({ prefix: apiv1 });
  
  v1.post("/login", LoginController);
  v1.get("/currentUser", currentUserController);
  
  router.use(v1.routes());
  router.use(adminRouter.routes());
  return router;
})();
