import initRouter from "./router/router";
import menus from "./migrate/menus";
import { Cmf } from "@/typings";

const mbcrmPlugin = {
  name: "mbcrm",
  install(app: Cmf) {
    const { migrate } = app;
    if (migrate) {
      migrate({ menus }); // 迁移数据
      // app自己的迁移逻辑
    }
  },
  start(app: Cmf) {
    const { router } = app;
    initRouter(router);
  }
};

export default mbcrmPlugin;
