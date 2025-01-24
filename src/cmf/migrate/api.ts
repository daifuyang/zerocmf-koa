import { createApi, getApiByMethodAndPath, updateApi } from "../models/api";
import { adminPrefix, prefix } from "../constants/router";
import router from "../route";
const migrateApi = async () => {
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
    .filter((layer) => layer.path.includes(prefix + adminPrefix + "/"));

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

export default migrateApi;
