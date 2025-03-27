import { Prisma, SysOperationLog } from "@prisma/client";
import prisma from "@/lib/prisma";
import { now } from "@/lib/date";

/**
 * 业务操作类型枚举
 */
export enum BusinessType {
  OTHER = 0, // 其它
  INSERT = 1, // 新增
  UPDATE = 2, // 修改
  DELETE = 3, // 删除
  GRANT = 4, // 授权
  EXPORT = 5, // 导出
  IMPORT = 6, // 导入
  FORCE = 7, // 强退
  CLEAN = 8 // 清空数据
}

/**
 * 操作者类型枚举
 */
export enum OperatorType {
  OTHER = 0, // 其它
  ADMIN = 1, // 后台用户
  MOBILE = 2 // 手机端用户
}

/**
 * 获取操作日志的总数。
 *
 * @param where - Prisma 的查询条件对象，用于过滤操作日志记录。
 *               类型为 `Prisma.SysOperationLogWhereInput`。
 * @param tx - 可选参数，Prisma 客户端实例，默认值为 `prisma`。
 *            用于执行数据库操作，支持事务传递。
 * @returns 返回一个 Promise，解析为操作日志的总数（number 类型）。
 *          如果发生错误，则返回 0。
 */
export const getOperationLogTotal = async (
  where: Prisma.SysOperationLogWhereInput,
  tx = prisma
) => {
  try {
    return await tx.sysOperationLog.count({ where });
  } catch (error) {
    console.error("获取操作日志总数失败:", error);
    return 0;
  }
};

/**
 * 获取操作日志列表的异步函数。
 *
 * @param where - Prisma 的查询条件对象，用于筛选操作日志记录。
 *                类型为 `Prisma.SysOperationLogWhereInput`。
 * @param tx - 可选参数，指定 Prisma 客户端实例，默认值为 `prisma`。
 *             用于执行数据库查询操作。
 * @returns 返回一个包含操作日志记录的数组。如果查询失败，则返回空数组。
 */
export const getOperationLogList = async (
  where: Prisma.SysOperationLogWhereInput,
  current: number,
  pageSize: number,
  tx = prisma
) => {
  try {
    let take = undefined;
    let skip = undefined;

    // 计算分页
    if (pageSize !== 0) {
      take = pageSize;
      skip = (current - 1) * pageSize;
    }

    return await tx.sysOperationLog.findMany({ where, take, skip, orderBy: { operAt: "desc" } });
  } catch (error) {
    console.error("获取操作日志列表失败:", error);
    return [];
  }
};

/**
 * 创建操作日志
 * @param data 操作日志数据
 * @returns 创建的操作日志记录
 */
export const createOperationLog = async (
  data: Partial<SysOperationLog>,
  tx = prisma
): Promise<SysOperationLog | null> => {
  try {
    return await tx.sysOperationLog.create({
      data
    });
  } catch (error) {
    console.error("创建操作日志失败:", error);
    return null;
  }
};

/**
 * 根据ID获取操作日志详情
 * @param operId 日志ID
 * @returns 操作日志详情
 */
export const getOperationLogById = async (
  operId: number,
  tx = prisma
): Promise<SysOperationLog | null> => {
  try {
    return await tx.sysOperationLog.findUnique({
      where: { operId }
    });
  } catch (error) {
    console.error("获取操作日志详情失败:", error);
    return null;
  }
};

/**
 * 删除操作日志
 * @param operIds 日志ID数组
 * @returns 删除结果
 */
export const deleteOperationLogs = async (operIds: number[], tx = prisma): Promise<boolean> => {
  try {
    await tx.sysOperationLog.deleteMany({
      where: {
        operId: {
          in: operIds
        }
      }
    });
    return true;
  } catch (error) {
    console.error("删除操作日志失败:", error);
    return false;
  }
};

/**
 * 清空操作日志
 * @returns 清空结果
 */
export const clearOperationLogs = async (tx = prisma): Promise<boolean> => {
  try {
    await tx.sysOperationLog.deleteMany({});
    return true;
  } catch (error) {
    console.error("清空操作日志失败:", error);
    return false;
  }
};
