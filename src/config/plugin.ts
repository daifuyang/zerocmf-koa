interface PluginConfig {
  name: string;
  config?: Record<string, unknown>;
}

export const mergePluginConfigs = (
  base: Record<string, unknown>,
  plugins: PluginConfig[]
) => {
  return plugins.reduce((config, plugin) => {
    return {
      ...config,
      [plugin.name]: plugin.config
    };
  }, base);
};
