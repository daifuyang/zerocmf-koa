import { SysUser } from "@prisma/client";
import { Context } from "koa";

export const getCurrentUser = (ctx: Context): SysUser => {
  const user = ctx.state.user;
  if (!user) {
    return null;
  }
  return user;
};
