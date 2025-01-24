import initRouter from "./router/router";
import articleMenus from "./migrate/menus";

export default function init(app) {
  const { routers, migrate } = app;
  initRouter(routers);
  // 已经安装无需迁移
  if (migrate) {
      migrate().migrateMenu(articleMenus); // 迁移数据
      // app自己的迁移逻辑
  }
}
