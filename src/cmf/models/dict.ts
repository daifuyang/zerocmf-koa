import prisma from "@/lib/prisma";
import redis from "@/lib/redis";
import { serializeData } from "@/lib/utils";
import { Prisma } from "@prisma/client";

const dictTypeKey = "dict:type:";

// 根据条件获取字典列表总数
export const getDictTypeCountModel = async (
  where: Prisma.SysDictTypeWhereInput = {},
  tx = prisma
) => {
  return await tx.sysDictType.count({
    where
  });
};

// 获取字典类型列表
export const getDictTypeListModel = async (
  where: Prisma.SysDictTypeWhereInput = {},
  page: number = 1,
  pageSize: number = 10,
  tx = prisma
) => {
 
  const data = await tx.sysDictType.findMany({
    where,
    orderBy: {
      dictId: 'asc'
    },
    take: pageSize,
    skip: (page - 1) * pageSize,
  })

  return data;

};

// 获取字典类型详情
export const getDictTypeByIdModel = async (dictId: number, tx = prisma) => {
  const cache = await redis.get(`${dictTypeKey}${dictId}`);
  if (cache) {
    return JSON.parse(cache);
  }

  const dictType = await tx.sysDictType.findUnique({
    where: {
      dictId
    }
  });

  if (dictType) {
    redis.set(`${dictTypeKey}${dictId}`, serializeData(dictType));
  }

  return dictType;
};

// 根据字典类型获取字典类型详情
export const getDictTypeByTypeModel = async (dictType: string, tx = prisma) => {
  return await tx.sysDictType.findUnique({
    where: {
      dictType
    }
  });
};

// 创建字典类型
export const createDictTypeModel = async (data: Prisma.SysDictTypeCreateInput, tx = prisma) => {
  return await tx.sysDictType.create({
    data
  });
};

// 更新字典类型
export const updateDictTypeModel = async (dictId: number, data: Prisma.SysDictTypeUpdateInput, tx = prisma) => {
  const dictType = await tx.sysDictType.update({
    where: {
      dictId
    },
    data
  });

  if (dictType) {
    await redis.del(`${dictTypeKey}${dictId}`);
  }

  return dictType;
};

// 删除字典类型
export const deleteDictTypeModel = async (dictId: number, tx = prisma) => {
  return await tx.$transaction([
    tx.sysDictData.deleteMany({
      where: {
        dictType: (await getDictTypeByIdModel(dictId, tx))?.dictType
      }
    }),
    tx.sysDictType.delete({
      where: {
        dictId
      }
    })
  ]);
};
