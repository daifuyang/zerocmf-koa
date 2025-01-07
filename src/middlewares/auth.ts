import jwt from "jsonwebtoken";
import response from "@/lib/response";
import { getUserById } from "@/models/user";
import { jwtSecret } from "@/constants/jwt";
import { Context, Next } from "koa";

export const auth = async (ctx: Context, next: Next) => {
  const token = ctx.headers["authorization"];

  if (!token) {
    ctx.status = 401;
    ctx.body = response.error("用户登录已失效");
    return;
  }

  try {
    const decoded = jwt.verify(token.split(" ")[1], jwtSecret);
    const userId = (decoded as any).userId;
    const user = await getUserById(Number(userId));
    if (!user) {
      ctx.status = 401;
      ctx.body = response.error("用户不存在");
      return;
    }
    const { password, ...result } = user;
    ctx.state.user = result;
    await next();
  } catch (err) {
    console.log(err);
    ctx.status = 500;
    ctx.body = response.error(err.message, err);
  }
};
