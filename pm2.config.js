module.exports = {
    apps: [
      {
        name: "zerocmf-koa",
        script: "node index.js", // 使用npm作为启动脚本
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: "1G",
        env: {
          NODE_ENV: "production" // 默认设置为生产环境
        }
      }
    ]
  };
  