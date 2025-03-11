import { now } from "@/lib/date";
import prisma from "@/lib/prisma";
import redis from "@/lib/redis";
import { serializeData } from "@/lib/util";
import { Prisma } from "@prisma/client";

const mediaCategoryIdKey = "mediaCategory:categoryId:";

// 获取媒体分类数量
export const getMediaCategoryCount = async (
  where: Prisma.sysMediaCategoryWhereInput = {},
  tx = prisma
) => {
  const total = tx.sysMediaCategory.count({
    where: {
      deletedAt: 0,
      ...where
    }
  });
  return total;
};

// 获取媒体分类列表
export const getMediaCategoryList = async (
  current: number,
  pageSize: number,
  where: Prisma.sysMediaCategoryWhereInput = {},
  tx = prisma
) => {
  const skip = pageSize > 0 ? (current - 1) * pageSize : undefined;
  const take = pageSize > 0 ? pageSize : undefined;

  const mediaCategories = await tx.sysMediaCategory.findMany({
    where: {
      deletedAt: 0,
      ...where
    },
    skip,
    take,
    orderBy: {
      categoryId: "desc"
    }
  });
  return mediaCategories;
};

// 保存媒体分类
export const createMediaCategory = async (
  mediaCategory: Prisma.sysMediaCategoryCreateInput,
  tx = prisma
) => {
  const result = await tx.sysMediaCategory.create({
    data: mediaCategory
  });
  return result;
};

// 更新媒体分类
export const updateMediaCategory = async (
  categoryId: number,
  mediaCategory: Prisma.sysMediaCategoryUpdateInput,
  tx = prisma
) => {
  const result = await tx.sysMediaCategory.update({
    where: {
      categoryId
    },
    data: mediaCategory
  });

  if (result) {
    const key = `${mediaCategoryIdKey}${categoryId}`;
    redis.del(key); // 删除缓存
  }

  return result;
};

// 删除媒体分类
export const deleteMediaCategory = async (categoryId: number, tx = prisma) => {
  const result = await tx.sysMediaCategory.update({
    where: {
      categoryId
    },
    data: {
      deletedAt: now()
    }
  });

  if (result) {
    const key = `${mediaCategoryIdKey}${categoryId}`;
    redis.del(key); // 删除缓存
  }

  return result;
};

// 根据id获取单个媒体分类
export const getMediaCategoryById = async (categoryId: number, tx = prisma) => {
  const key = `${mediaCategoryIdKey}${categoryId}`;
  const cache = await redis.get(key);
  if (cache) {
    return JSON.parse(cache);
  }
  const mediaCategory = await tx.sysMediaCategory.findUnique({
    where: {
      categoryId
    }
  });

  if (mediaCategory) {
    redis.set(key, serializeData(mediaCategory));
  }

  return mediaCategory;
};
