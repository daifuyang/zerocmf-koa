import { Context } from "koa";

export const parseJson = (ctx: Context) => {
    return ctx.request.body || {};
  };