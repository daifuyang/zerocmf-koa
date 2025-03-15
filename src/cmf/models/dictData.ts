import redis from "@/lib/redis";
import { serializeData } from "@/lib/util";
import { Prisma } from "@prisma/client";

const dictDataKey = "dict:data:";

// 获取字典数据列表总数
export const getDictDataCount = async (where: Prisma.sysDictDataWhereInput = {}, tx = prisma) => {
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
      dictSort: "desc"
    },
    take: pageSize,
    skip: (page - 1) * pageSize
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

// 根据值获取数据详情
export const getDictDataBydictTypeAndValue = async (dictType: string, dictValue: string, tx = prisma) => {
    const cache = await redis.get(`${dictDataKey}${dictType}_${dictValue}`);
    if (cache) {
      return JSON.parse(cache);
    }
  const dictData = await tx.sysDictData.findUnique({
    where: {
      dictValue_dictType: {
        dictType,
        dictValue
      }
    }
  });

  if (dictData) {
    redis.set(`${dictDataKey}${dictType}_${dictValue}`, serializeData(dictData));
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
export const updateDictData = async (
  dictCode: number,
  data: Prisma.sysDictDataUpdateInput,
  tx = prisma
) => {
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
