import { Context } from "koa";
import { parseJson, parseQuery } from "@/lib/request";
import { LoginLogRequest } from "@/cmf/typings/request";
import {
  getLoginLogsListService,
  getLoginLogDetailService,
  removeLoginLogsService,
  cleanAllLoginLogsService,
  exportLoginLogsService
} from "../../services/loginLog";

/**
 * 获取登录日志列表
 * @param ctx Koa上下文
 */
export const getLoginLogListController = async (ctx: Context) => {
  const { current, pageSize, ipaddr, loginName, status, startTime, endTime } = parseQuery(ctx.query);

  const result = await getLoginLogsListService(
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
  await getLoginLogDetailService(ctx, id);
};

/**
 * 删除登录日志
 * @param ctx Koa上下文
 */
export const removeLoginLogController = async (ctx: Context) => {
  const { ids } = parseJson<LoginLogRequest>(ctx);
  await removeLoginLogsService(ctx, ids);
};

/**
 * 清空登录日志
 * @param ctx Koa上下文
 */
export const cleanLoginLogController = async (ctx: Context) => {
  await cleanAllLoginLogsService(ctx);
};

/**
 * 导出登录日志
 * @param ctx Koa上下文
 */
export const exportLoginLogController = async (ctx: Context) => {
  await exportLoginLogsService(ctx);
};
