import { Context } from "koa";
import response from "@/lib/response";
import { getUserByIdModel } from "../models/user";
import { jwtSecret } from "../constants/jwt";
import { verifyTokenService } from "../services/auth";

export const auth = async (ctx: Context, next: () => Promise<void>) => {
  const token = ctx.headers["authorization"];

  if (!token) {
    ctx.status = 401;
    ctx.body = response.error("用户登录已失效");
    return;
  }

  try {
    // 使用服务层方法验证token
    const userId = verifyTokenService(token.split(" ")[1]);
    if (!userId) {
      ctx.status = 401;
      ctx.body = response.error("令牌无效或已过期");
      return;
    }
    
    const user = await getUserByIdModel(Number(userId));
    if (!user) {
      ctx.status = 401;
      ctx.body = response.error("用户不存在");
      return;
    }
    
    // 移除敏感信息
    const { password, ...result } = user;
    ctx.state.user = result;
    await next();
  } catch (err) {
    console.error("认证中间件错误:", err);
    ctx.status = 401;
    ctx.body = response.error("认证失败", { message: err.message });
  }
};
