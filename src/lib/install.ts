import fs from "fs";
import path from "path";
import migrateUser from "../migrate/user";
import migrateMenu from "../migrate/menu";
import migrateRole from "@/migrate/role";
import type Router from "koa-router";
import { createApi, getApiByMethodAndPath, updateApi } from "@/models/api";
import { adminPrefix, prefix } from "@/constants/router";

const isDevelopment = process.env.NODE_ENV === "development";

const migrateApi = async (router: Router) => {
  const routes = router.stack
    .filter((layer) => layer.methods.length > 0) // 只取有方法的路由
    .filter((layer) => layer.path && layer.path.trim() !== "") // 只取有路径的路由
    .flatMap((layer) => {
      // 如果方法有多个，分别列出
      return layer.methods.map((method) => {
        return {
          method,
          path: layer.path
        };
      });
    })
    .filter((layer) => layer.method.includes("HEAD") === false)
    .filter((layer) => layer.path.includes( prefix + adminPrefix + "/" ));

  for (const route of routes) {
    const method = route.method.toLowerCase();
    const path = route.path;
    const existApi = await getApiByMethodAndPath(method, path);
    if (existApi) {
      updateApi(existApi.id, {
        method,
        path
      });
    } else {
      // 创建api
      createApi({
        method,
        path
      });
    }
  }
};

export const install = async (router: Router) => {
  const lockDir = path.resolve(global.ROOT_PATH, "install");
  const lockFile = path.resolve(lockDir, "install.lock");
  if (fs.existsSync(lockFile) && !isDevelopment) {
    console.log("已经安装过");
    return;
  }

  migrateUser();
  migrateRole();
  migrateMenu();

  migrateApi(router);

  // 创建安装锁

  if (!fs.existsSync(lockDir)) {
    fs.mkdirSync(lockDir);
  }

  fs.writeFileSync(lockFile, "");
};
