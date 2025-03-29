import initRouter from "./router/router";
import menus from "./migrate/menus";
import { Cmf } from "@/typings";

export default function init(app: Cmf) {
  const { router, migrate } = app;
  initRouter(router);
  if (migrate) {
    migrate({ menus }); // 迁移数据
    // app自己的迁移逻辑
  }
}
