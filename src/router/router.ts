import Router from "koa-router";
import initAdminRouter from "./admin";
export default function initRouter(routes: { adminRouter: Router; router: Router }) {
  const { adminRouter } = routes;
  initAdminRouter(adminRouter);
}
