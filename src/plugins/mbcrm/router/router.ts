import Router from "koa-router";
import initAdminRouter from "./admin";
export default function initRouter(router) {
  initAdminRouter(router);
}
