import response from "@/lib/response";
import { LoginRequest } from "../typings/controller";
import { Context } from "koa";
import { parseJson } from "@/lib/request";
import {
  accountEnum,
  prepareLoginLogBase,
  recordLoginLog,
  getUserByLoginType,
  validatePassword,
  generateUserTokens
} from "../services/auth";
import { ErrorType, handleLoginError } from "../services/errorHandler";

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

export const Login = async (ctx: Context) => {
  const { account, password, loginType = "account", phoneType } = parseJson<LoginRequest>(ctx);
  
  // 准备登录日志基本信息
  const loginLogBase = prepareLoginLogBase(ctx, account);

  // 验证账号
  if (!account) {
    await handleLoginError(ctx, ErrorType.ACCOUNT_EMPTY, loginLogBase);
    return;
  }

  // 根据登录类型获取用户
  const user = await getUserByLoginType(loginType, account);
  
  // 检查用户是否存在
  if (!user) {
    await handleLoginError(ctx, ErrorType.USER_NOT_EXIST, loginLogBase);
    return;
  }

  // 验证码登录
  if (loginType === "phone" && phoneType === "sms") {
    // 短信验证码登录逻辑待实现
    return;
  }

  // 验证密码
  if (!password) {
    await handleLoginError(ctx, ErrorType.PASSWORD_EMPTY, loginLogBase, user.userId);
    return;
  }

  // 验证密码是否正确
  const isPasswordValid = validatePassword(password, user);
  if (!isPasswordValid) {
    await handleLoginError(ctx, ErrorType.PASSWORD_INVALID, loginLogBase, user.userId);
    return;
  }

  // 生成用户令牌
  const tokens = await generateUserTokens(user.userId);
  if (!tokens) {
    await handleLoginError(ctx, ErrorType.LOGIN_FAILED, loginLogBase, user.userId);
    return;
  }

  // 记录登录成功日志
  await recordLoginLog(loginLogBase, 1, "登录成功", user.userId);

  ctx.body = response.success("登录成功！", tokens);

};
