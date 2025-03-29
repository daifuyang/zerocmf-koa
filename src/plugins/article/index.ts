import initRouter from "./router/router";
import articleMenus from "./migrate/menus";
import { Cmf } from "@/typings";

export default function init(app: Cmf) {
  const { router, migrate } = app;
  initRouter(router);
  if (migrate) {
    migrate({ menus: articleMenus }); // 迁移数据
    // app自己的迁移逻辑
  }
}
