import { sysLoginLog } from "@prisma/client";
import prisma from "@/lib/prisma";

/**
 * 创建登录日志
 * @param data 登录日志数据
 * @returns 创建的登录日志记录
 */
export const createLoginLog = async (data: Partial<sysLoginLog>): Promise<sysLoginLog | null> => {
  try {
    return await prisma.sysLoginLog.create({
      data: {
        ...data,
        loginTime: data.loginTime || Math.floor(Date.now() / 1000)
      }
    });
  } catch (error) {
    console.error("创建登录日志失败:", error);
    return null;
  }
};

/**
 * 获取登录日志列表
 * @param params 查询参数
 * @param current 当前页码
 * @param pageSize 每页记录数
 * @returns 登录日志列表和总记录数
 */
export const getLoginLogs = async (
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
  const { ipaddr, loginName, status, startTime, endTime } = params;

  // 构建查询条件
  const where: any = {};

  if (ipaddr) {
    where.ipaddr = {
      contains: ipaddr
    };
  }

  if (loginName) {
    where.loginName = {
      contains: loginName
    };
  }

  if (status !== undefined) {
    where.status = status;
  }

  // 处理时间范围查询
  if (startTime && endTime) {
    where.loginTime = {
      gte: startTime,
      lte: endTime
    };
  } else if (startTime) {
    where.loginTime = {
      gte: startTime
    };
  } else if (endTime) {
    where.loginTime = {
      lte: endTime
    };
  }

  try {
    // 查询总记录数
    const total = await prisma.sysLoginLog.count({ where });

    // 查询分页数据
    const list = await prisma.sysLoginLog.findMany({
      where,
      skip: (current - 1) * pageSize,
      take: pageSize,
      orderBy: {
        loginTime: "desc"
      }
    });

    return {
      list,
      total,
      current,
      pageSize
    };
  } catch (error) {
    console.error("获取登录日志列表失败:", error);
    return {
      list: [],
      total: 0,
      current,
      pageSize
    };
  }
};

/**
 * 根据ID获取登录日志详情
 * @param infoId 日志ID
 * @returns 登录日志详情
 */
export const getLoginLogById = async (infoId: number): Promise<sysLoginLog | null> => {
  try {
    return await prisma.sysLoginLog.findUnique({
      where: { infoId }
    });
  } catch (error) {
    console.error("获取登录日志详情失败:", error);
    return null;
  }
};

/**
 * 删除登录日志
 * @param infoIds 日志ID数组
 * @returns 删除结果
 */
export const deleteLoginLogs = async (infoIds: number[]): Promise<boolean> => {
  try {
    await prisma.sysLoginLog.deleteMany({
      where: {
        infoId: {
          in: infoIds
        }
      }
    });
    return true;
  } catch (error) {
    console.error("删除登录日志失败:", error);
    return false;
  }
};

/**
 * 清空登录日志
 * @returns 清空结果
 */
export const clearLoginLogs = async (): Promise<boolean> => {
  try {
    await prisma.sysLoginLog.deleteMany({});
    return true;
  } catch (error) {
    console.error("清空登录日志失败:", error);
    return false;
  }
};
