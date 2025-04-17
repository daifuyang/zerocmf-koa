import Router from "koa-router";
import { Migrate } from "../migrate";
import Koa from "koa";

export interface Cmf {
  app: Koa;
  router: Router;
  migrate: Migrate;
}
