import prisma from "@/lib/prisma";
import redis from "@/lib/redis";
import { serializeData } from "@/lib/util";
import { Prisma } from "@prisma/client";

const dictTypeKey = "dict:type:";
const dictDataKey = "dict:data:";

// 根据条件获取字典列表总数
export const getDictTypeCount = async (
  where: Prisma.sysDictTypeWhereInput = {},
  tx = prisma
) => {
  return await tx.sysDictType.count({
    where
  });
};

// 获取字典类型列表
export const getDictTypeList = async (
  where: Prisma.sysDictTypeWhereInput = {},
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
export const getDictTypeById = async (dictId: number, tx = prisma) => {
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
export const getDictTypeByType = async (dictType: string, tx = prisma) => {
  return await tx.sysDictType.findUnique({
    where: {
      dictType
    }
  });
};

// 创建字典类型
export const createDictType = async (data: Prisma.sysDictTypeCreateInput, tx = prisma) => {
  return await tx.sysDictType.create({
    data
  });
};

// 更新字典类型
export const updateDictType = async (dictId: number, data: Prisma.sysDictTypeUpdateInput, tx = prisma) => {
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
export const deleteDictType = async (dictId: number, tx = prisma) => {
  return await tx.$transaction([
    tx.sysDictData.deleteMany({
      where: {
        dictType: (await getDictTypeById(dictId, tx))?.dictType
      }
    }),
    tx.sysDictType.delete({
      where: {
        dictId
      }
    })
  ]);
};

// 获取字典数据列表总数
export const getDictDataCount = async (
  where: Prisma.sysDictDataWhereInput = {},
  tx = prisma
) => {
  return await tx.sysDictData.count({
    where
  });
};

// 获取字典数据列表
export const getDictDataList = async (
  where: Prisma.sysDictDataWhereInput = {},
  page: number = 1,
  pageSize: number = 10,
  tx = prisma
) => {
  const dictData = await tx.sysDictData.findMany({
    where,
    orderBy: {
      dictSort: 'asc'
    },
    take: pageSize,
    skip: (page - 1) * pageSize,
  });

  return dictData;
};

// 获取字典数据详情
export const getDictDataById = async (dictCode: number, tx = prisma) => {
  const cache = await redis.get(`${dictDataKey}${dictCode}`);
  if (cache) {
    return JSON.parse(cache);
  }

  const dictData = await tx.sysDictData.findUnique({
    where: {
      dictCode
    }
  });

  if (dictData) {
    redis.set(`${dictDataKey}${dictCode}`, serializeData(dictData));
  }

  return dictData;
};

// 创建字典数据
export const createDictData = async (data: Prisma.sysDictDataCreateInput, tx = prisma) => {
  return await tx.sysDictData.create({
    data
  });
};

// 更新字典数据
export const updateDictData = async (dictCode: number, data: Prisma.sysDictDataUpdateInput, tx = prisma) => {
  const dictData = await tx.sysDictData.update({
    where: {
      dictCode
    },
    data
  });

  if (dictData) {
    await redis.del(`${dictDataKey}${dictCode}`);
  }

  return dictData;
};

// 删除字典数据
export const deleteDictData = async (dictCode: number, tx = prisma) => {
  const deletedData = await tx.sysDictData.delete({
    where: {
      dictCode
    }
  });

  if (deletedData) {
    await redis.del(`${dictDataKey}${dictCode}`);
  }

  return deletedData;
};

// 批量删除字典数据
export const deleteDictDataBatch = async (dictCodes: number[], tx = prisma) => {
  const deletedData = await tx.sysDictData.deleteMany({
    where: {
      dictCode: {
        in: dictCodes
      }
    }
  });
  if (deletedData) {
    for (const dictCode of dictCodes) {
      await redis.del(`${dictDataKey}${dictCode}`);
    }
  }
  return deletedData;
};