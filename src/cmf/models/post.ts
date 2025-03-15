import { formatFields, now } from "@/lib/date";
import prisma from "@/lib/prisma";
import redis from "@/lib/redis";
import { serializeData } from "@/lib/util";
import { Prisma } from "@prisma/client";

const postIdKey = "post:id:";

// 获取岗位列表
export const getPostList = async (
  where: Prisma.sysPostWhereInput = {},
  page: number = 1,
  pageSize: number = 10,
  tx = prisma
) => {
  const args: {
    skip?: number;
    take?: number;
    where?: Prisma.sysPostWhereInput;
    orderBy?: Prisma.sysPostOrderByWithRelationInput;
  } = 
    pageSize === 0
      ? {}
      : {
          skip: (page - 1) * pageSize,
          take: pageSize
        };

  args.where = {
    ...where,
    deletedAt: 0
  };

  args.orderBy = {
    sortOrder: 'asc'
  };

  const posts = await tx.sysPost.findMany({
    ...args
  });

  formatFields(posts, [
    { fromField: "createdAt", toField: "createTime" },
    { fromField: "updatedAt", toField: "updateTime" }
  ]);

  return posts;
};

// 根据id获取岗位详情
export const getPostById = async (postId: number, tx = prisma) => {
  const cache = await redis.get(`${postIdKey}${postId}`);
  if (cache) {
    return JSON.parse(cache);
  }

  const post = await tx.sysPost.findUnique({
    where: {
      postId,
      deletedAt: 0
    }
  });

  if (post) {
    redis.set(`${postIdKey}${postId}`, serializeData(post));
  }

  return post;
};

// 根据岗位编码获取岗位
export const getPostByCode = async (postCode: string, tx = prisma) => {
  return await tx.sysPost.findFirst({
    where: {
      postCode,
      deletedAt: 0
    }
  });
};

// 根据岗位名称获取岗位
export const getPostByName = async (postName: string, tx = prisma) => {
  return await tx.sysPost.findFirst({
    where: {
      postName,
      deletedAt: 0
    }
  });
};

// 获取岗位总数
export const getPostCount = async (where: Prisma.sysPostWhereInput = {}, tx = prisma) => {
  return await tx.sysPost.count({
    where: {
      ...where,
      deletedAt: 0
    }
  });
};

// 创建岗位
export const createPost = async (data, tx = prisma) => {
  const post = await tx.sysPost.create({
    data
  });
  
  return post;
};

// 更新岗位
export const updatePost = async (postId: number, data: Prisma.sysPostUpdateInput, tx = prisma) => {
  const post = await tx.sysPost.update({
    where: {
      postId
    },
    data
  });
  
  if (post) {
    redis.del(`${postIdKey}${postId}`);
  }
  
  return post;
};

// 删除岗位
export const deletePost = async (postId: number, tx = prisma) => {
  // 检查是否有关联用户
  const userCount = await tx.sysUserPost.count({
    where: {
      postId
    }
  });
  
  if (userCount > 0) {
    throw new Error('岗位存在关联用户，不允许删除');
  }
  
  const post = await tx.sysPost.update({
    where: {
      postId
    },
    data: {
      deletedAt: now()
    }
  });
  
  if (post) {
    redis.del(`${postIdKey}${postId}`);
  }
  
  return post;
};

// 检查岗位编码是否唯一
export const checkPostCodeUnique = async (postCode: string, postId: number = 0, tx = prisma) => {
  const post = await tx.sysPost.findFirst({
    where: {
      postCode,
      deletedAt: 0,
      NOT: postId > 0 ? { postId } : undefined
    }
  });
  
  return !post;
};

// 检查岗位名称是否唯一
export const checkPostNameUnique = async (postName: string, postId: number = 0, tx = prisma) => {
  const post = await tx.sysPost.findFirst({
    where: {
      postName,
      deletedAt: 0,
      NOT: postId > 0 ? { postId } : undefined
    }
  });
  
  return !post;
};

// 根据用户ID获取岗位列表
export const getPostsByUserId = async (userId: number, tx = prisma) => {
  const userPosts = await tx.sysUserPost.findMany({
    where: {
      userId
    }
  });
  
  const postIds = userPosts.map(up => up.postId);
  
  if (postIds.length === 0) {
    return [];
  }
  
  return await tx.sysPost.findMany({
    where: {
      postId: {
        in: postIds
      },
      deletedAt: 0
    }
  });
};