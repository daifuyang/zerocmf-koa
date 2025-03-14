import { Context } from "koa";
import response from "@/lib/response";
import { parseJson, parseQuery } from "@/lib/request";
import {
  getLoginLogs,
  getLoginLogById,
  deleteLoginLogs,
  clearLoginLogs
} from "../../models/loginLog";

/**
 * 获取登录日志列表
 * @param ctx Koa上下文
 */
export const getLoginLogList = async (ctx: Context) => {
  const { current, pageSize, ipaddr, loginName, status, startTime, endTime } = parseQuery(ctx.query);

  const result = await getLoginLogs(
    { ipaddr, loginName, status: status !== undefined ? Number(status) : undefined, startTime, endTime },
    current,
    pageSize
  );

  ctx.body = response.success("获取成功！", result);
};

/**
 * 获取登录日志详情
 * @param ctx Koa上下文
 */
export const getLoginLogDetail = async (ctx: Context) => {
  const { id } = ctx.params;
  
  if (!id) {
    ctx.body = response.error("日志ID不能为空！");
    return;
  }

  const infoId = Number(id);
  const loginLog = await getLoginLogById(infoId);

  if (!loginLog) {
    ctx.body = response.error("登录日志不存在！");
    return;
  }

  ctx.body = response.success("获取成功！", loginLog);
};

/**
 * 删除登录日志
 * @param ctx Koa上下文
 */
export const removeLoginLog = async (ctx: Context) => {
  const { ids } = parseJson(ctx);
  
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    ctx.body = response.error("日志ID不能为空");
    return;
  }

  const infoIds = ids.map(id => Number(id));
  const result = await deleteLoginLogs(infoIds);

  if (!result) {
    ctx.body = response.error("删除登录日志失败");
    return;
  }

  ctx.body = response.success("删除登录日志成功");
};

/**
 * 清空登录日志
 * @param ctx Koa上下文
 */
export const cleanLoginLog = async (ctx: Context) => {
  const result = await clearLoginLogs();

  if (!result) {
    ctx.body = response.error("清空登录日志失败");
    return;
  }

  ctx.body = response.success("清空登录日志成功");
};

/**
 * 导出登录日志
 * @param ctx Koa上下文
 */
export const exportLoginLog = async (ctx: Context) => {
  // 这里可以实现导出功能，例如生成CSV或Excel文件
  // 简单实现，返回所有日志数据
  const { ipaddr, loginName, status, startTime, endTime } = ctx.query;
  
  const result = await getLoginLogs({
    ipaddr: ipaddr as string,
    loginName: loginName as string,
    status: status !== undefined ? Number(status) : undefined,
    startTime: startTime ? Number(startTime) : undefined,
    endTime: endTime ? Number(endTime) : undefined
  }, 1, 1000); // 获取较多记录用于导出

  ctx.body = response.success("导出登录日志成功", result.list);
};
