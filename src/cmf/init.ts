import Koa from "koa";
import { Cmf } from "./typings";
import { install } from "../lib/install";
import { registerPlugins } from "../plugins";
import { router } from "./router";

export const initializeCmf = (): Koa => {
  // 创建Koa应用
  const app = new Koa();
  
  const cmf: Cmf = {
    app,
    router, 
    migrate: null
  };

  install(cmf);
  registerPlugins(cmf);

  if (cmf.migrate) {
    cmf.migrate().commit();
  }

  // 将cmf实例绑定到app.context上，确保在中间件中可以访问
  app.context.cmf = cmf;
  
  return app
};
