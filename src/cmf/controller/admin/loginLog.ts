import { Context } from "koa";
import { parseJson, parseQuery } from "@/lib/request";
import { LoginLogRequest } from "@/cmf/typings/request";
import {
  getLoginLogsList,
  getLoginLogDetail,
  removeLoginLogs,
  cleanAllLoginLogs,
  exportLoginLogs
} from "../../services/loginLog";

/**
 * 获取登录日志列表
 * @param ctx Koa上下文
 */
export const getLoginLogListController = async (ctx: Context) => {
  const { current, pageSize, ipaddr, loginName, status, startTime, endTime } = parseQuery(ctx.query);

  const result = await getLoginLogsList(
    { ipaddr, loginName, status: status !== undefined ? Number(status) : undefined, startTime, endTime },
    current,
    pageSize
  );

  ctx.body = result;
};

/**
 * 获取登录日志详情
 * @param ctx Koa上下文
 */
export const getLoginLogDetailController = async (ctx: Context) => {
  const { id } = ctx.params;
  await getLoginLogDetail(ctx, id);
};

/**
 * 删除登录日志
 * @param ctx Koa上下文
 */
export const removeLoginLogController = async (ctx: Context) => {
  const { ids } = parseJson<LoginLogRequest>(ctx);
  await removeLoginLogs(ctx, ids);
};

/**
 * 清空登录日志
 * @param ctx Koa上下文
 */
export const cleanLoginLogController = async (ctx: Context) => {
  await cleanAllLoginLogs(ctx);
};

/**
 * 导出登录日志
 * @param ctx Koa上下文
 */
export const exportLoginLogController = async (ctx: Context) => {
  await exportLoginLogs(ctx);
};
