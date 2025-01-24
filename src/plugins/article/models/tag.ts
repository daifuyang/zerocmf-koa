import prisma from "@/lib/prisma";
import redis from "@/lib/redis";
import { Prisma } from "@prisma/client";

const tagIdKey = `tag:tagId:`;

// 根据条件获取标签总数
export async function getTagCount(where: any = {}, tx = prisma) {
  return await tx.cmsArticleTag.count({
    where: {
      ...where,
    }
  });
}

// 根据条件获取标签列表
export async function getTagList(
  current: number, // 当前页码
  pageSize: number, // 每页条数
  where: Prisma.cmsArticleTagWhereInput = {}, // 查询条件
  orderBy: Prisma.cmsArticleTagOrderByWithRelationInput = { tagId: "desc" }, // 排序条件
  tx = prisma // 事务实例
) {
  // 初始化查询参数
  let args: {
    skip?: number;
    take?: number;
    where?: Prisma.cmsArticleTagWhereInput;
    orderBy?: Prisma.cmsArticleTagOrderByWithRelationInput;
  } = {};

  // 分页逻辑
  if (pageSize !== 0) {
    const offset = (current - 1) * pageSize;
    args.skip = offset;
    args.take = pageSize;
  }

  // 查询条件
  args.where = {
    ...where // 合并传入的查询条件
  };

  // 排序条件
  args.orderBy = orderBy;

  // 查询标签列表
  return await tx.cmsArticleTag.findMany({
    ...args
  });
}

// 根据id获取tag详情
export async function getTagById(
  tagId: number, // 标签 ID
  tx = prisma // 事务实例
): Promise<Prisma.cmsArticleTagGetPayload<{}> | null> {
  const cacheKey = tagIdKey + tagId; // 缓存键
  const cache = await redis.get(cacheKey); // 从 Redis 获取缓存

  let tag: Prisma.cmsArticleTagGetPayload<{}> | null = null;

  // 如果缓存存在，直接返回缓存数据
  if (cache) {
    tag = JSON.parse(cache);
  } else {
    // 如果缓存不存在，从数据库查询
    tag = await tx.cmsArticleTag.findUnique({
      where: {
        tagId
      }
    });

    // 如果查询到数据，将其缓存到 Redis
    if (tag) {
      await redis.set(cacheKey, JSON.stringify(tag)); // 设置缓存，过期时间为 1 小时
    }
  }

  return tag;
}

// 根据条件获取tag详情
export async function getTagByQuery(
  where: Prisma.cmsArticleTagWhereInput = {},
  tx = prisma // 事务实例
) {
  return tx.cmsArticleTag.findFirst({
    where
  });
}

/**
 * 创建标签
 * @param tag 标签数据
 * @param tx 事务实例，默认为全局的 prisma 实例
 * @returns 创建的标签
 */
export async function createTag(
  tag: Prisma.cmsArticleTagCreateInput,
  tx = prisma
) {
  const result = await tx.cmsArticleTag.create({
    data: tag
  });
  return result;
}

/**
 * 更新标签
 * @param id 标签 ID
 * @param tag 更新的标签数据
 * @param tx 事务实例，默认为全局的 prisma 实例
 * @returns 更新后的标签
 */
export async function updateTag(
  tagId: number,
  tag: Prisma.cmsArticleTagUpdateInput,
  tx = prisma
): Promise<Prisma.cmsArticleTagGetPayload<{}> | null> {
  const result = await tx.cmsArticleTag.update({
    where: {
      tagId
    },
    data: tag
  });

  // 如果更新成功，清除缓存
  if (result) {
    const cacheKey = tagIdKey + tagId;
    await redis.del(cacheKey);
  }

  return result;
}

// 根据id删除标签
export async function deleteTagById(
  tagId: number, // 标签 ID
  tx = prisma // 事务实例
) {
  const result = await tx.cmsArticleTag.delete({
    where: {
      tagId
    }
  });

  // 如果删除成功，清除缓存
  if (result) {
    const cacheKey = tagIdKey + tagId;
    await redis.del(cacheKey);
 }
 return result;
}