module.exports = {
    apps: [
      {
        name: "zerocmf-koa",
        script: "npm", // 使用npm作为启动脚本
        args: "start", // npm start 命令的参数
        cwd: "/usr/local/workspace/www/zerocmf/api", // 设置工作目录
        env: {
          NODE_ENV: "development" // 开发环境下的环境变量
        },
        env_production: {
          NODE_ENV: "production" // 生产环境下的环境变量
        }
      }
    ]
  };
  