import initRouter from "./router/router";
import { Cmf } from "@/typings";

export default function init(app: Cmf) {
  const { router, migrate } = app;
  initRouter(router);
}
