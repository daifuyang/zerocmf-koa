import { Context } from "koa";

export const home = (ctx: Context) => {
  const user = ctx.state.user;

  ctx.body = {
    msg: "hello admin",
    code: 1,
    data: user
  };
};
