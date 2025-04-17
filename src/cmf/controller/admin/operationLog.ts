import response from "@/lib/response";
import { parseJson } from "@/lib/request";
import {
  getOperationLogListService,
  getOperationLogService,
  deleteOperationLogService,
  batchDeleteOperationLogService,
  clearOperationLogsService,
  exportOperationLogsService
} from "@/cmf/services/operationLog";

/**
 * 获取操作日志列表
 * @param ctx Koa上下文
 */
export const getOperationLogListController = async (ctx: any) => {
  // 获取查询参数
  const query = ctx.query || {};
  const {
    current = "1",
    pageSize = "10",
    title = "",
    operName = "",
    businessType,
    status,
    operIp = "",
    startTime,
    endTime
  } = query;

  const where: {
    title?: any;
    operName?: any;
    businessType?: number;
    status?: number;
    operIp?: any;
    operTime?: any;
  } = {};

  if (title) {
    where.title = {
      contains: title
    };
  }

  if (operName) {
    where.operName = {
      contains: operName
    };
  }

  if (businessType !== undefined) {
    where.businessType = Number(businessType);
  }

  if (status !== undefined) {
    where.status = Number(status);
  }

  if (operIp) {
    where.operIp = {
      contains: operIp
    };
  }

  // 处理时间范围查询
  if (startTime && endTime) {
    where.operTime = {
      gte: Number(startTime),
      lte: Number(endTime)
    };
  } else if (startTime) {
    where.operTime = {
      gte: Number(startTime)
    };
  } else if (endTime) {
    where.operTime = {
      lte: Number(endTime)
    };
  }

  const pagination = await getOperationLogListService(
    where,
    Number(current),
    Number(pageSize)
  );

  ctx.body = response.success("获取成功！", pagination);
  return;
};

/**
 * 获取操作日志详情
 * @param ctx Koa上下文
 */
export const getOperationLogController = async (ctx: any) => {
  const { operId } = ctx.params;

  if (!operId) {
    ctx.body = response.error("参数错误！");
    return;
  }

  const numberOperId = Number(operId);
  if (isNaN(numberOperId)) {
    ctx.body = response.error("参数错误！");
    return;
  }

  const operationLog = await getOperationLogService(numberOperId);

  if (!operationLog) {
    ctx.body = response.error("操作日志不存在！");
    return;
  }

  ctx.body = response.success("获取成功！", operationLog);
  return;
};

/**
 * 删除操作日志
 * @param ctx Koa上下文
 */
export const deleteOperationLogController = async (ctx: any) => {
  const { operId } = ctx.params;

  if (!operId) {
    ctx.body = response.error("参数错误！");
    return;
  }

  const numberOperId = Number(operId);
  if (isNaN(numberOperId)) {
    ctx.body = response.error("参数错误！");
    return;
  }

  const exist = await getOperationLogService(numberOperId);
  if (!exist) {
    ctx.body = response.error("操作日志不存在！");
    return;
  }

  const result = await deleteOperationLogService(numberOperId);
  if (!result) {
    ctx.body = response.error("删除失败！");
    return;
  }

  ctx.body = response.success("删除成功！");
  return;
};

/**
 * 批量删除操作日志
 * @param ctx Koa上下文
 */
export const batchDeleteOperationLogController = async (ctx: any) => {
  const { ids } = parseJson(ctx);

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    ctx.body = response.error("参数错误！");
    return;
  }

  const operIds = ids.map((id) => Number(id));
  const result = await batchDeleteOperationLogService(operIds);

  if (!result) {
    ctx.body = response.error("批量删除失败！");
    return;
  }

  ctx.body = response.success("批量删除成功！");
  return;
};

/**
 * 清空操作日志
 * @param ctx Koa上下文
 */
export const cleanOperationLogController = async (ctx: any) => {
  const result = await clearOperationLogsService();

  if (!result) {
    ctx.body = response.error("清空失败！");
    return;
  }

  ctx.body = response.success("清空成功！");
  return;
};

/**
 * 导出操作日志
 * @param ctx Koa上下文
 */
export const exportOperationLogController = async (ctx: any) => {
  // 获取查询参数
  const query = ctx.query || {};
  const {
    title = "",
    operName = "",
    businessType,
    status,
    operIp = "",
    startTime,
    endTime
  } = query;

  const where: {
    title?: any;
    operName?: any;
    businessType?: number;
    status?: number;
    operIp?: any;
    operTime?: any;
  } = {};

  if (title) {
    where.title = {
      contains: title
    };
  }

  if (operName) {
    where.operName = {
      contains: operName
    };
  }

  if (businessType !== undefined) {
    where.businessType = Number(businessType);
  }

  if (status !== undefined) {
    where.status = Number(status);
  }

  if (operIp) {
    where.operIp = {
      contains: operIp
    };
  }

  // 处理时间范围查询
  if (startTime && endTime) {
    where.operTime = {
      gte: Number(startTime),
      lte: Number(endTime)
    };
  } else if (startTime) {
    where.operTime = {
      gte: Number(startTime)
    };
  } else if (endTime) {
    where.operTime = {
      lte: Number(endTime)
    };
  }

  // 获取较多记录用于导出
  const result = await exportOperationLogsService(where);

  ctx.body = response.success("导出成功！", result);
  return;
};
