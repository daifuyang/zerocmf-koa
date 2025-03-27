import Router from "koa-router";
import { migrate } from "./migrate";

export interface Cmf {
  router: Router;
  migrate: Migrate;
}
