import Router from "koa-router";
import initAdminRouter from "./admin";
import initWebRouter from "./web";
export default function initRouter(routes: { adminRouter: Router, apiRouter: Router }) {
  const { adminRouter, apiRouter } = routes;
  initAdminRouter(adminRouter);
  initWebRouter(apiRouter);
}
