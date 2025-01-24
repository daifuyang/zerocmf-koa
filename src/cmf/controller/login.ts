import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import response from "@/lib/response";
import { LoginReq } from "../typings/login";
import { sysUser } from "@prisma/client";
import { Context } from "koa";
import { getUser } from "../models/user";
import { parseJson } from "@/lib/request";
import { createUserToken } from "../models/userToken";
import { calculateExpiresAt } from "@/lib/date";
import {
  jwtRefreshSecret,
  jwtRefreshSecretExpire,
  jwtSecret,
  jwtSecretExpire
} from "@/cmf/constants/jwt";

/**
 * 处理用户登录请求，根据提供的登录类型进行身份验证。
 *
 * @param {Context} ctx - Koa 的上下文对象，包含请求和响应对象。
 * @returns {Promise<void>} - 当登录处理完成时返回一个 Promise。
 *
 * @typedef {Object} LoginReq
 * @property {string} account - 用户账号，可以是用户名、邮箱或手机号。
 * @property {string} password - 用户的密码。
 * @property {string} loginType - 登录类型，例如 "email"、"phone" 或 "username"。
 * @property {string} phoneType - 如果 `loginType` 是 "phone"，则为手机号类型，例如 "mobile" 或 "landline"。
 *
 * @author daifuyang
 * @date 2024-08-14
 */

const accountEnum = {
  email: "邮箱",
  phone: "手机号",
  account: "账号"
};

export const Login = async (ctx: Context) => {
  
  const { account, password, loginType = "account", phoneType } = parseJson(ctx) as LoginReq;

  if (!account) {
    ctx.body = response.error(`${accountEnum[loginType]}不能为空`);
    return;
  }

  // 根据登录类型进行身份验证
  let user: sysUser | null = null;
  switch (loginType) {
    case "email":
      // 邮箱登录逻辑
      user = await getUser({ email: account });
      break;
    case "phone":
      // 手机号登录逻辑
      user = await getUser({ phone: account });
      break;
    case "account":
      // 用户名登录逻辑
      user = await getUser({ loginName: account });
      break;
  }
  // 检查用户是否存在
  if (!user) {
    ctx.body = response.error("用户不存在");
    return;
  }

  // 验证码登录
  if (loginType === "phone" && phoneType === "sms") {
    return;
  }

  if (!password) {
    ctx.body = response.error("密码不能为空");
    return;
  }

  if (user?.password) {
    const pwd = password + user.salt;

    // 验证密码
    const isPasswordValid = await bcrypt.compare(pwd, user.password);
    if (!isPasswordValid) {
      ctx.body = response.error("密码错误");
      return;
    }
  } else {
    ctx.body = response.error("密码错误");
    return;
  }

  const { userId } = user;

  // 生成JWT token
  const expiresIn = jwtSecretExpire;
  const accessToken = jwt.sign({ userId }, jwtSecret, { expiresIn });

  // 生成refresh token
  const reExpiresIn = jwtRefreshSecretExpire;
  const refreshToken = jwt.sign({ userId }, jwtRefreshSecret, {
    expiresIn: reExpiresIn
  });

  const expiresAt = calculateExpiresAt(expiresIn);
  const reExpiresAt = calculateExpiresAt(reExpiresIn);

  const userToken = await createUserToken({
    userId,
    accessToken,
    refreshToken,
    expiresAt,
    reExpiresAt
  });

  if (!userToken) {
    ctx.body = response.error("登录失败");
    return;
  }

  ctx.body = response.success("登录成功！", { accessToken, expiresAt, refreshToken, reExpiresAt });
};
