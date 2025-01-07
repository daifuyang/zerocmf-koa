const Koa = require('koa');
const app = new Koa();

// 响应请求
app.use(async (ctx) => {
  ctx.body = 'Hello, World!';  // 设置响应内容
});

// 启动服务
app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
