import { createCoreConfig } from './core';
import { loadEnvConfig } from './env';
import { mergePluginConfigs } from './plugin';
import { Plugin } from '../plugins';
import path from "path";
import { PUBLIC_PATH } from "../constants/path";

export const createAppConfig = (plugins: Plugin[] = []) => {
  const core = createCoreConfig();
  const env = loadEnvConfig(core);
  const pluginConfigs = mergePluginConfigs({}, plugins);

  return {
    ...core,
    ...env,
    plugins: pluginConfigs,
    // 保持原有配置结构
    staticOptions: {
      gzip: true,
      maxAge: 86400000
    },
    uploadDir: path.resolve(PUBLIC_PATH, "tmp"),
    staticDir: PUBLIC_PATH // 添加静态文件目录配置
  };
};

// 保持原有类型导出
export type AppConfig = ReturnType<typeof createAppConfig>;
