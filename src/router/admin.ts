import apiAccess from "@/cmf/middlewares/apiAccess";
import { auth } from "@/cmf/middlewares/auth";
import { adminPrefix, apiv1 } from "@/constants/router";
import Router from "koa-router";
export default function initAdminRouter(router: Router) {
  const adminRouter = new Router({ prefix: apiv1 + adminPrefix });
  adminRouter.use(auth, apiAccess);
  adminRouter.get("/test", (ctx) => {
    ctx.body = "hello world";
  });
  router.use(adminRouter.routes());
}
