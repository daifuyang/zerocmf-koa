import Router from "koa-router";
import initAdminRouter from "./admin";
export default function initRouter(routes) {
    initAdminRouter(routes);
}
