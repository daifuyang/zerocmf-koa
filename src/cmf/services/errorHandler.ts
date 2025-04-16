import { Context } from "koa";
import response from "@/lib/response";
import { recordLoginLog } from "./auth";

/**
 * 错误类型枚举
 */
export enum ErrorType {
  // 通用错误
  SERVER_ERROR = "SERVER_ERROR",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND",
  
  // 认证相关错误
  ACCOUNT_EMPTY = "ACCOUNT_EMPTY",
  PASSWORD_EMPTY = "PASSWORD_EMPTY",
  USER_NOT_EXIST = "USER_NOT_EXIST",
  PASSWORD_INVALID = "PASSWORD_INVALID",
  LOGIN_FAILED = "LOGIN_FAILED",
  TOKEN_INVALID = "TOKEN_INVALID",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  UNAUTHORIZED = "UNAUTHORIZED",
  
  // 登录日志相关错误
  LOG_ID_EMPTY = "LOG_ID_EMPTY",
  LOG_NOT_EXIST = "LOG_NOT_EXIST",
  LOG_DELETE_FAILED = "LOG_DELETE_FAILED",
  LOG_CLEAR_FAILED = "LOG_CLEAR_FAILED"
}

/**
 * 错误消息映射
 */
export const errorMessages = {
  // 通用错误
  [ErrorType.SERVER_ERROR]: "服务器错误",
  [ErrorType.VALIDATION_ERROR]: "数据验证错误",
  [ErrorType.RESOURCE_NOT_FOUND]: "资源不存在",
  
  // 认证相关错误
  [ErrorType.ACCOUNT_EMPTY]: "账号不能为空",
  [ErrorType.PASSWORD_EMPTY]: "密码不能为空",
  [ErrorType.USER_NOT_EXIST]: "用户不存在",
  [ErrorType.PASSWORD_INVALID]: "密码错误",
  [ErrorType.LOGIN_FAILED]: "登录失败",
  [ErrorType.TOKEN_INVALID]: "令牌无效",
  [ErrorType.TOKEN_EXPIRED]: "令牌已过期",
  [ErrorType.UNAUTHORIZED]: "用户未授权",
  
  // 登录日志相关错误
  [ErrorType.LOG_ID_EMPTY]: "日志ID不能为空",
  [ErrorType.LOG_NOT_EXIST]: "登录日志不存在",
  [ErrorType.LOG_DELETE_FAILED]: "删除登录日志失败",
  [ErrorType.LOG_CLEAR_FAILED]: "清空登录日志失败"
};

/**
 * 错误状态码映射
 */
export const errorStatusCodes = {
  // 通用错误
  [ErrorType.SERVER_ERROR]: 500,
  [ErrorType.VALIDATION_ERROR]: 400,
  [ErrorType.RESOURCE_NOT_FOUND]: 404,
  
  // 认证相关错误
  [ErrorType.ACCOUNT_EMPTY]: 400,
  [ErrorType.PASSWORD_EMPTY]: 400,
  [ErrorType.USER_NOT_EXIST]: 404,
  [ErrorType.PASSWORD_INVALID]: 400,
  [ErrorType.LOGIN_FAILED]: 400,
  [ErrorType.TOKEN_INVALID]: 401,
  [ErrorType.TOKEN_EXPIRED]: 401,
  [ErrorType.UNAUTHORIZED]: 401,
  
  // 登录日志相关错误
  [ErrorType.LOG_ID_EMPTY]: 400,
  [ErrorType.LOG_NOT_EXIST]: 404,
  [ErrorType.LOG_DELETE_FAILED]: 500,
  [ErrorType.LOG_CLEAR_FAILED]: 500
};

/**
 * 处理API错误并返回统一响应
 * @param ctx Koa上下文
 * @param errorType 错误类型
 * @param details 错误详情
 */
export const handleApiError = (ctx: Context, errorType: ErrorType, details?: any) => {
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
export const handleServerError = (ctx: Context, error: Error) => {
  console.error("服务器错误:", error);
  return handleApiError(ctx, ErrorType.SERVER_ERROR, { message: error.message });
};

/**
 * 处理登录相关错误
 * @param ctx Koa上下文
 * @param errorType 错误类型
 * @param loginLogBase 登录日志基本信息
 * @param userId 用户ID
 */
export const handleLoginError = async (ctx: Context, errorType: ErrorType, loginLogBase: any, userId?: number) => {
  const message = errorMessages[errorType] || "登录失败";
  
  // 记录登录日志
  await recordLoginLog(loginLogBase, 0, message, userId);
  
  // 返回错误响应
  return handleApiError(ctx, errorType);
};

/**
 * 处理登录日志相关错误
 * @param ctx Koa上下文
 * @param errorType 错误类型
 */
export const handleLoginLogError = (ctx: Context, errorType: ErrorType) => {
  return handleApiError(ctx, errorType);
};