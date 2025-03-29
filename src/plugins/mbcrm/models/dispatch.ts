import { now } from "@/lib/date";
import prisma from "@/lib/prisma";
import redis from "@/lib/redis";
import { serializeData } from "@/lib/utils";
import { MbcrmDispatch, Prisma } from "@prisma/client";

const dispatchIdKey = "mbcrm:dispatch:id:";

// 获取派单列表
export const getDispatchList = async (
  where: Prisma.MbcrmDispatchWhereInput = {},
  page: number = 1,
  pageSize: number = 10,
  tx = prisma
) => {
  const args: {
    skip?: number;
    take?: number;
    where?: Prisma.MbcrmDispatchWhereInput;
    orderBy?: Prisma.MbcrmDispatchOrderByWithRelationInput;
  } = pageSize === 0
    ? {}
    : {
        skip: (page - 1) * pageSize,
        take: pageSize
      };

  args.where = {
    ...where,
    deletedAt: 0,
  };

  args.orderBy = {
    createdAt: "desc"
  };

  const dispatches = await tx.mbcrmDispatch.findMany(args);
  return dispatches;
};

// 获取派单总数
export const getDispatchCount = async (
  where: Prisma.MbcrmDispatchWhereInput = {},
  tx = prisma
) => {
  return await tx.mbcrmDispatch.count({
    where: {
      ...where,
      deletedAt: 0
    }
  });
};

// 根据ID获取派单
export const getDispatchById = async (id: number, tx = prisma) => {
  const cache = await redis.get(`${dispatchIdKey}${id}`);
  let dispatch: MbcrmDispatch | null = null;
  if (cache) {
    dispatch = JSON.parse(cache);
  }

  if (!dispatch) {
    dispatch = await tx.mbcrmDispatch.findUnique({
      where: {
        dispatchId: id,
        deletedAt: 0
      }
    });

    if (dispatch) {
      redis.set(`${dispatchIdKey}${id}`, serializeData(dispatch));
    }
  }

  return dispatch;
};

// 创建派单
export const createDispatch = async (
  data: Prisma.MbcrmDispatchCreateInput,
  tx = prisma
) => {
  const dispatch = await tx.mbcrmDispatch.create({
    data: {
      ...data,
      status: data.status || 0, // 默认状态为待派单(0)
      createdAt: now(),
      updatedAt: now()
    }
  });
  return dispatch;
};

// 更新派单
export const updateDispatch = async (
  id: number,
  data: Prisma.MbcrmDispatchUpdateInput,
  tx = prisma
) => {
  const dispatch = await tx.mbcrmDispatch.update({
    where: { dispatchId: id },
    data: {
      ...data,
      updatedAt: now()
    }
  });
  if (dispatch) {
    redis.del(`${dispatchIdKey}${id}`);
  }
  return dispatch;
};

// 删除派单(软删除)
export const deleteDispatch = async (id: number, tx = prisma) => {
  const dispatch = await tx.mbcrmDispatch.update({
    where: { dispatchId: id },
    data: {
      deletedAt: now()
    }
  });
  if (dispatch) {
    redis.del(`${dispatchIdKey}${id}`);
  }
  return dispatch;
};
