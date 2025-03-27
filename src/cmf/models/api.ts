import prisma from "@/lib/prisma";
import redis from "@/lib/redis";
import { serializeData } from "@/lib/utils";
import { Prisma } from "@prisma/client";

const apiIdKey = "api:id:";

// 获取所有api
export async function getApis(where: Prisma.sysApiWhereInput = {}, tx = prisma) {
  const apis = await tx.sysApi.findMany({
    where
  });
  return apis;
}

// 根据id获取api
export async function getApiById(id: number, tx = prisma) {
  const key = `${apiIdKey}${id}`;
  const cache = await redis.get(key);
  if (cache) {
    return JSON.parse(cache);
  }
  const api = await tx.sysApi.findUnique({
    where: {
      id
    }
  });
  if (api) {
    redis.set(key, serializeData(api));
  }
  return api;
}

// 根据method和path获取api
export async function getApiByMethodAndPath(method: string, path: string, tx = prisma) {
  const api = await tx.sysApi.findUnique({
    where: {
      path_method: {
        method,
        path
      }
    }
  });
  return api;
}

// 创建单条api
export async function createApi(data: any, tx = prisma) {
  try {
    return await tx.sysApi.create({
      data
    });
  } catch (error) {
    console.log("createApi error", data);
    console.log(error);
  }
}

// 更新单条api
export async function updateApi(id: number, data: any, tx = prisma) {
  return await tx.sysApi.update({
    where: {
      id
    },
    data
  });
}

// 创建多条api
export async function createApis(data: any, tx = prisma) {
  return await tx.sysApi.createMany({
    data
  });
}
