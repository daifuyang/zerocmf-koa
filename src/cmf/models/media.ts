import prisma from "@/lib/prisma";
import redis from "@/lib/redis";
import { serializeData } from "@/lib/util";
import { Prisma } from "@prisma/client";

// 获取媒体数量
export const getMediaCount = async (
  where: Prisma.sysMediaWhereInput = {},
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
  where: Prisma.sysMediaWhereInput = {},
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
