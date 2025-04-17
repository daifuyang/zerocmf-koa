import type { Cmf } from "@/cmf/typings";
import articlePlugin from "./article";

export interface Plugin {
  name: string;
  dependencies?: string[];
  config?: Record<string, unknown>;
  install?: (cmf: Cmf) => void;
  start?: (cmf: Cmf) => void;
  stop?: (cmf: Cmf) => void;
}

export class PluginManager {
  private plugins: Map<string, Plugin> = new Map();
  private cmf: Cmf;

  constructor(cmf: Cmf) {
    this.cmf = cmf;
  }

  register(plugin: Plugin) {
    // 检查依赖
    if (plugin.dependencies) {
      for (const dep of plugin.dependencies) {
        if (!this.plugins.has(dep)) {
          throw new Error(`Plugin ${plugin.name} requires ${dep} but it's not registered`);
        }
      }
    }

    this.plugins.set(plugin.name, plugin);
    
    // 执行安装
    if (plugin.install) {
      plugin.install(this.cmf);
    }
  }

  startAll() {
    for (const [name, plugin] of this.plugins) {
      if (plugin.start) {
        plugin.start(this.cmf);
      }
    }
  }

  stopAll() {
    for (const [name, plugin] of this.plugins) {
      if (plugin.stop) {
        plugin.stop(this.cmf);
      }
    }
  }
}

// 兼容旧版
export const registerPlugins = (cmf: Cmf): void => {
  const manager = new PluginManager(cmf);
  manager.register(articlePlugin);
  manager.startAll();
};

export default registerPlugins;
