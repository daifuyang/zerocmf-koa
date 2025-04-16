import { Context } from "koa";
import { SysUser } from "@prisma/client";
import { getUser } from "../models/user";
import { getClientInfo } from "@/lib/clientInfo";
import { createLoginLogModel } from "../models/loginLog";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createUserToken } from "../models/userToken";
import { calculateExpiresAt } from "@/lib/date";
import {
  jwtRefreshSecret,
  jwtRefreshSecretExpire,
  jwtSecret,
  jwtSecretExpire
} from "@/cmf/constants/jwt";

/**
 * 账号类型枚举
 */
export const accountEnum = {
  email: "邮箱",
  phone: "手机号",
  account: "账号"
};

/**
 * 准备登录日志基本信息
 * @param ctx Koa上下文
 * @param account 用户账号
 * @returns 登录日志基本信息
 */
export const prepareLoginLogBase = (ctx: Context, account: string) => {
  const clientInfo = getClientInfo(ctx);

  return {
    loginName: account,
    ipaddr: clientInfo.ip,
    loginLocation: clientInfo.location,
    browser: clientInfo.browser,
    os: clientInfo.os,
    loginTime: Math.floor(Date.now() / 1000)
  };
};

/**
 * 记录登录日志
 * @param logData 日志数据
 * @param status 状态(0:失败,1:成功)
 * @param msg 消息
 * @param userId 用户ID
 */
export const recordLoginLog = async (
  logBase: ReturnType<typeof prepareLoginLogBase>,
  status: number,
  msg: string,
  userId?: number
) => {
  return await createLoginLogModel({
    ...logBase,
    status,
    msg,
    userId
  });
};

/**
 * 根据登录类型获取用户
 * @param loginType 登录类型
 * @param account 账号
 * @returns 用户信息
 */
export const getUserByLoginType = async (
  loginType: string,
  account: string
): Promise<SysUser | null> => {
  switch (loginType) {
    case "email":
      return await getUser({ email: account });
    case "phone":
      return await getUser({ phone: account });
    case "account":
    default:
      return await getUser({ loginName: account });
  }
};

/**
 * 验证用户密码
 * @param password 输入的密码
 * @param user 用户信息
 * @returns 密码是否有效
 */
export const validatePassword = (password: string, user: SysUser): boolean => {
  if (!user?.password || !user?.salt) return false;

  const pwd = `${password}${user.salt}`;
  return bcrypt.compareSync(pwd, user.password);
};

/**
 * 生成用户令牌
 * @param userId 用户ID
 * @returns 令牌信息
 */
export const generateUserTokens = async (userId: number) => {
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

  if (!userToken) return null;

  return {
    accessToken,
    refreshToken,
    expiresAt,
    reExpiresAt
  };
};

/**
 * 验证令牌
 * @param token 令牌
 * @returns 解码后的用户ID
 */
export const verifyToken = (token: string): number | null => {
  try {
    const decoded = jwt.verify(token, jwtSecret);
    return (decoded as any).userId;
  } catch (err) {
    return null;
  }
};
