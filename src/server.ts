import Koa from 'koa';
import { AppConfig } from './config/app';

export const startServer = (port: number) => (app: Koa) => {
  // 美化启动日志
  const startTime = new Date();
  
  const server = app.listen(port, () => {
    console.log(`
    🚀 ZeroCMF Server started
    ➡️  Port: ${port}
    ⏱️  Started at: ${startTime.toISOString()}
    `);
  });

  // 错误处理
  server.on('error', (err) => {
    console.error('Server error:', err);
  });

  return app;
};
