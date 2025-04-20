import type { Cmf } from "@/cmf/typings";
import articlePlugin from "./article";
import mbcrmPlugin from "./mbcrm";

export interface Plugin {
  name: string;
  dependencies?: string[];
  config?: Record<string, unknown>;
  install?: (cmf: Cmf) => void;
  start?: (cmf: Cmf) => void;
  stop?: (cmf: Cmf) => void;
}

export function createPluginManager(cmf: Cmf) {
  const plugins: Map<string, Plugin> = new Map();

  function register(plugin: Plugin) {
    // 检查依赖
    if (plugin.dependencies) {
      for (const dep of plugin.dependencies) {
        if (!plugins.has(dep)) {
          throw new Error(`Plugin ${plugin.name} requires ${dep} but it's not registered`);
        }
      }
    }

    plugins.set(plugin.name, plugin);
    
    // 执行安装
    if (plugin.install) {
      plugin.install(cmf);
    }
  }

  function startAll() {
    for (const [name, plugin] of plugins) {
      if (plugin.start) {
        plugin.start(cmf);
      }
    }
  }

  function stopAll() {
    for (const [name, plugin] of plugins) {
      if (plugin.stop) {
        plugin.stop(cmf);
      }
    }
  }

  return {
    register,
    startAll,
    stopAll
  };
}

// 兼容旧版
export const registerPlugins = (cmf: Cmf): void => {
  const manager = createPluginManager(cmf);
  manager.register(articlePlugin);
  manager.register(mbcrmPlugin);
  manager.startAll();
};

export default registerPlugins;
