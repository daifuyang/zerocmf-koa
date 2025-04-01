import { now } from "@/lib/date";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// 获取媒体数量
export const getMediaCount = async (
  where: Prisma.SysMediaWhereInput = {},
  tx = prisma
) => {
  // 先获取所有的文章数量
  const total = tx.sysMedia.count({
    where: {
      deletedAt: 0,
      ...where
    }
  });
  return total;
};

// 获取媒体列表
export const getMediaList = async (
  current: number,
  pageSize: number,
  where: Prisma.SysMediaWhereInput = {},
  tx = prisma
) => {
  const media = await tx.sysMedia.findMany({
    where: {
        deletedAt: 0,
        ...where
    },
    skip: (current - 1) * pageSize,
    take: pageSize,
    orderBy: {
      mediaId: "desc"
    }
  });
  return media;
};

// 保存上传成功的路径信息
export const saveMedia = async (
  media: Prisma.SysMediaCreateInput,
  tx = prisma
) => {
  const result = await tx.sysMedia.create({
    data: media
  });
  return result;
};

// 批量保存
export const saveMediaList = async (
  mediaList: Prisma.SysMediaCreateInput[],
  tx = prisma
) => {
  const result = await tx.sysMedia.createMany({
    data: mediaList
  });
  return result;
};

// 删除
export const deleteMedia = async (
  mediaId: number,
  tx = prisma
) => {
  const result = await tx.sysMedia.update({
    where: {
      mediaId
    },
    data: {
      deletedAt: now()
    }
  });
  return result;
};

// 获取单个媒体信息
export const getMediaById = async (
  mediaId: number,
  tx = prisma
) => {
  return await tx.sysMedia.findUnique({
    where: { mediaId }
  });
};

// 更新媒体信息
export const updateMedia = async (
  mediaId: number,
  data: Prisma.SysMediaUpdateInput,
  tx = prisma
) => {
  const result = await tx.sysMedia.update({
    where: {
      mediaId
    },
    data
  });
  return result;
};
