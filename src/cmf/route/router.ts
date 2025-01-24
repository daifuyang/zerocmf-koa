import Router from "koa-router";
import adminRouter from "./admin";
import { prefix } from "../constants/router";
const v1 = new Router({ prefix });
const routers = {
  adminRouter,
  apiRouter: v1,
};
export { routers };
