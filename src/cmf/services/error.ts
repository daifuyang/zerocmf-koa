import { Context } from "koa";
import response from "@/lib/response";

/**
 * 错误类型枚举
 */
export enum ErrorType {
  ACCOUNT_EMPTY = "ACCOUNT_EMPTY",
  PASSWORD_EMPTY = "PASSWORD_EMPTY",
  USER_NOT_EXIST = "USER_NOT_EXIST",
  PASSWORD_INVALID = "PASSWORD_INVALID",
  LOGIN_FAILED = "LOGIN_FAILED",
  TOKEN_INVALID = "TOKEN_INVALID",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  UNAUTHORIZED = "UNAUTHORIZED",
  SERVER_ERROR = "SERVER_ERROR"
}

/**
 * 错误消息映射
 */
export const errorMessages = {
  [ErrorType.ACCOUNT_EMPTY]: "账号不能为空",
  [ErrorType.PASSWORD_EMPTY]: "密码不能为空",
  [ErrorType.USER_NOT_EXIST]: "用户不存在",
  [ErrorType.PASSWORD_INVALID]: "密码错误",
  [ErrorType.LOGIN_FAILED]: "登录失败",
  [ErrorType.TOKEN_INVALID]: "令牌无效",
  [ErrorType.TOKEN_EXPIRED]: "令牌已过期",
  [ErrorType.UNAUTHORIZED]: "用户未授权",
  [ErrorType.SERVER_ERROR]: "服务器错误"
};

/**
 * 错误状态码映射
 */
export const errorStatusCodes = {
  [ErrorType.ACCOUNT_EMPTY]: 400,
  [ErrorType.PASSWORD_EMPTY]: 400,
  [ErrorType.USER_NOT_EXIST]: 404,
  [ErrorType.PASSWORD_INVALID]: 400,
  [ErrorType.LOGIN_FAILED]: 400,
  [ErrorType.TOKEN_INVALID]: 401,
  [ErrorType.TOKEN_EXPIRED]: 401,
  [ErrorType.UNAUTHORIZED]: 401,
  [ErrorType.SERVER_ERROR]: 500
};

/**
 * 处理API错误并返回统一响应
 * @param ctx Koa上下文
 * @param errorType 错误类型
 * @param details 错误详情
 */
export const handleApiErrorService = (ctx: Context, errorType: ErrorType, details?: any) => {
  const message = errorMessages[errorType] || "未知错误";
  const statusCode = errorStatusCodes[errorType] || 500;
  
  ctx.status = statusCode;
  ctx.body = response.error(message, details);
  return { message, statusCode };
};

/**
 * 处理服务器内部错误
 * @param ctx Koa上下文
 * @param error 错误对象
 */
export const handleServerErrorService = (ctx: Context, error: Error) => {
  console.error("服务器错误:", error);
  return handleApiErrorService(ctx, ErrorType.SERVER_ERROR, { message: error.message });
};
