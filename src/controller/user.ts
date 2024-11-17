import { Context } from "koa";
import jwt from "jsonwebtoken";
import response from "@/lib/response";
import { getUserById } from "@/models/user";
import { excludeFields } from "@/lib/util";
import { jwtSecret } from "@/constants/jwt";

export const currentUser = async (ctx: Context) => {
  const token = ctx.headers["authorization"];

  if (!token) {
    ctx.status = 401;
    ctx.body = response.error("非法访问");
    return;
  }

  try {
    const decoded = jwt.verify(token.split(" ")[1], jwtSecret);
    const userId = (decoded as any).userId;
    const user = await getUserById(Number(userId));
    ctx.body = response.success("获取成功！", excludeFields(user, ["password"]));
  } catch (err) {
    console.log(err);
    ctx.status = 401;
    ctx.body = response.error("用户身份已过期");
  }
};
