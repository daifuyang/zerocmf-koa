import Router from "koa-router";
import { Migrate } from "../migrate";

export interface Cmf {
  router: Router;
  migrate: Migrate;
}
