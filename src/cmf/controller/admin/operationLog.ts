import response from "@/lib/response";
import { parseJson } from "@/lib/request";
import {
  getOperationLogTotal,
  getOperationLogList,
  getOperationLogById,
  deleteOperationLogs,
  clearOperationLogs
} from "../../models/operationLog";
import { formatFields } from "@/lib/date";

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

  const result = await getOperationLogList(where, Number(current), Number(pageSize));

  formatFields(result, [{ fromField: "operAt", toField: "operTime" }]);

  let pagination = {};
  if (pageSize === "0") {
    pagination = result;
  } else {
    const total = await getOperationLogTotal(where);
    pagination = {
      page: Number(current),
      pageSize: Number(pageSize),
      total,
      data: result
    };
  }

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

  const operationLog = await getOperationLogById(numberOperId);

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

  const exist = await getOperationLogById(numberOperId);
  if (!exist) {
    ctx.body = response.error("操作日志不存在！");
    return;
  }

  const result = await deleteOperationLogs([numberOperId]);
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
  const result = await deleteOperationLogs(operIds);

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
  const result = await clearOperationLogs();

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
  const result = await getOperationLogList(where, 1, 0);

  ctx.body = response.success("导出成功！", result);
  return;
};
