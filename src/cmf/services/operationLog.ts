import {
  getOperationLogTotalModel as modelGetOperationLogTotal,
  getOperationLogListModel as modelGetOperationLogList,
  getOperationLogByIdModel as modelGetOperationLogById,
  deleteOperationLogsModel as modelDeleteOperationLogs,
  clearOperationLogsModel as modelClearOperationLogs
} from "@/cmf/models/operationLog";
import { formatFields } from "@/lib/date";

// 获取操作日志列表
export async function getOperationLogListService(where: any, current: number, pageSize: number) {
  const result = await modelGetOperationLogList(where, current, pageSize);
  formatFields(result, [{ fromField: "operAt", toField: "operTime" }]);
  
  if (pageSize === 0) {
    return result;
  }

  const total = await modelGetOperationLogTotal(where);
  return {
    page: current,
    pageSize: pageSize,
    total,
    data: result
  };
}

// 获取单个操作日志
export async function getOperationLogService(operId: number) {
  return await modelGetOperationLogById(operId);
}

// 删除操作日志
export async function deleteOperationLogService(operId: number) {
  return await modelDeleteOperationLogs([operId]);
}

// 批量删除操作日志
export async function batchDeleteOperationLogService(operIds: number[]) {
  return await modelDeleteOperationLogs(operIds);
}

// 清空操作日志
export async function clearOperationLogsService() {
  return await modelClearOperationLogs();
}

// 导出操作日志
export async function exportOperationLogsService(where: any) {
  return await modelGetOperationLogList(where, 1, 0);
}
