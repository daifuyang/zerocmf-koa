import prisma from "@/lib/prisma";
import redis from "@/lib/redis";
import { cmsArticle, Prisma } from "@prisma/client";

const articleIdKey = `article:articleId:`;

// 根据条件获取文章总数
export async function getArticleCount(where: Prisma.cmsArticleWhereInput = {}, tx = prisma) {
  return await tx.cmsArticle.count({
    where: {
      deletedAt: 0,
      ...where
    }
  });
}

// 根据条件获取文章列表
export async function getArticleList(
  current: number,
  pageSize: number,
  where: Prisma.cmsArticleWhereInput = {},
  tx = prisma
) {
  let args: {
    orderBy?: Prisma.cmsArticleOrderByWithRelationInput;
    skip?: number;
    take?: number;
    where?: Prisma.cmsArticleWhereInput;
  } = {};

  if (pageSize !== 0) {
    const offset = (current - 1) * pageSize;
    args = {
      skip: offset,
      take: pageSize
    };
  } else {
    args = {};
  }

  args.where = {
    deletedAt: 0,
    ...where
  };

  args.orderBy = {
    articleId: "desc"
  };

  return await tx.cmsArticle.findMany({
    ...args
  });
}

// 根据id获取文章
export async function getArticleById(articleId: number, tx = prisma) {
  const cacheKey = articleIdKey + articleId;
  const cache = await redis.get(cacheKey);

  let article: cmsArticle | null = null;
  if (cache) {
    article = JSON.parse(cache);
  } else {
    article = await prisma.cmsArticle.findUnique({
      where: {
        articleId,
        deletedAt: 0
      }
    });

    if (article) {
      redis.set(cache, JSON.stringify(article));
    }
  }
  return article;
}

// 创建文章
export async function createArticle(article: Prisma.cmsArticleCreateInput, tx = prisma) {
  const result = await tx.cmsArticle.create({
    data: article
  });
  return result;
}

// 更新文章
export async function updateArticle(
  articleId: number,
  article: Prisma.cmsArticleUpdateInput,
  tx = prisma
) {
  const result = await tx.cmsArticle.update({
    where: {
      articleId
    },
    data: article
  });

  if (result) {
    const cacheKey = articleIdKey + articleId;
    redis.del(cacheKey);
  }

  return result;
}
