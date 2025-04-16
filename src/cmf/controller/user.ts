import { Context } from "koa";
import { CurrentUserRequest } from "../typings/controller";
import jwt from "jsonwebtoken";
import response from "@/lib/response";
import { getUserById } from "../models/user";
import { jwtSecret } from "@/cmf/constants/jwt";

export const currentUser = async (ctx: Context & CurrentUserRequest) => {
  const token = ctx.headers["authorization"];

  if (!token) {
    ctx.status = 401;
    ctx.body = response.error("非法访问");
    return;
  }

  try {
    const decoded = jwt.verify(token.split(" ")[1], jwtSecret) as { userId: string };
    const userId = decoded.userId;
    const user = await getUserById(Number(userId));
    if (!user) {
      ctx.body = response.error("用户不存在");
      return;
    }

    const { password, salt, ...result } = user;

    ctx.body = response.success("获取成功！", result);
  } catch (error: unknown) {
    // 改成日志输出错误
    let message = "";
    if (error instanceof Error) {
      message = error.message;
    }
    ctx.body = response.error(message, error, true);
  }
};
