import { Context } from "koa";
import response from "@/lib/response";
import { getLoginLogsModel, getLoginLogByIdModel, deleteLoginLogsModel, clearLoginLogsModel } from "../models/loginLog";
import { ErrorType, handleLoginLogErrorService } from "./errorHandler";

/**
 * 获取登录日志列表
 * @param params 查询参数
 * @param current 当前页码
 * @param pageSize 每页记录数
 * @returns 登录日志列表和分页信息
 */
export const getLoginLogsListService = async (
  params: {
    ipaddr?: string;
    loginName?: string;
    status?: number;
    startTime?: number;
    endTime?: number;
  },
  current: number = 1,
  pageSize: number = 10
) => {
  try {
    const result = await getLoginLogsModel(params, current, pageSize);
    return response.success("获取成功！", result);
  } catch (error) {
    console.error("获取登录日志列表失败:", error);
    return response.success("获取成功！", {
      list: [],
      total: 0,
      current,
      pageSize
    });
  }
};

/**
 * 获取登录日志详情
 * @param ctx Koa上下文
 * @param id 日志ID
 * @returns 是否成功获取
 */
export const getLoginLogDetailService = async (ctx: Context, id: string | number) => {
  if (!id) {
    handleLoginLogErrorService(ctx, ErrorType.LOG_ID_EMPTY);
    return false;
  }

  const infoId = Number(id);
  const loginLog = await getLoginLogByIdModel(infoId);

  if (!loginLog) {
    handleLoginLogErrorService(ctx, ErrorType.LOG_NOT_EXIST);
    return false;
  }

  ctx.body = response.success("获取成功！", loginLog);
  return true;
};

/**
 * 删除登录日志
 * @param ctx Koa上下文
 * @param ids 日志ID数组
 * @returns 是否删除成功
 */
export const removeLoginLogsService = async (ctx: Context, ids: any[]) => {
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    handleLoginLogErrorService(ctx, ErrorType.LOG_ID_EMPTY);
    return false;
  }

  const infoIds = ids.map(id => Number(id));
  const result = await deleteLoginLogsModel(infoIds);

  if (!result) {
    handleLoginLogErrorService(ctx, ErrorType.LOG_DELETE_FAILED);
    return false;
  }

  ctx.body = response.success("删除登录日志成功");
  return true;
};

/**
 * 清空登录日志
 * @param ctx Koa上下文
 * @returns 是否清空成功
 */
export const cleanAllLoginLogsService = async (ctx: Context) => {
  const result = await clearLoginLogsModel();

  if (!result) {
    handleLoginLogErrorService(ctx, ErrorType.LOG_CLEAR_FAILED);
    return false;
  }

  ctx.body = response.success("清空登录日志成功");
  return true;
};

/**
 * 导出登录日志
 * @param ctx Koa上下文
 * @returns 是否导出成功
 */
export const exportLoginLogsService = async (ctx: Context) => {
  const { ipaddr, loginName, status, startTime, endTime } = ctx.query;
  
  const result = await getLoginLogsModel({
    ipaddr: ipaddr as string,
    loginName: loginName as string,
    status: status !== undefined ? Number(status) : undefined,
    startTime: startTime ? Number(startTime) : undefined,
    endTime: endTime ? Number(endTime) : undefined
  }, 1, 1000); // 获取较多记录用于导出

  ctx.body = response.success("导出登录日志成功", result.list);
  return true;
};
