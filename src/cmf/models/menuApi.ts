import prisma from "@/lib/prisma";
import redis from "@/lib/redis";
import { serializeData } from "@/lib/utils";
import { Prisma, SysMenuApi } from "@prisma/client";

const menuIapiIdKey = "menuApi:menuId_apiId:";

// 获取列表
export async function getMenuApiListModel(where: Prisma.SysMenuApiWhereInput = {}, tx = prisma): Promise<SysMenuApi[]> {
  const menuApiList = await tx.sysMenuApi.findMany({
    where
  });
  return menuApiList;
}

// 根据menuId和apiId获取
export async function getMenuApiByMenuIdAndApiIdModel(menuId: number, apiId: number, tx = prisma) {
  const cacheKey = `${menuId}-${apiId}`;
  const cache = await redis.get(cacheKey);
  if (cache) {
    return JSON.parse(cache);
  }

  const menuApi = await tx.sysMenuApi.findUnique({
    where: {
      menuId_apiId: {
        menuId,
        apiId
      }
    }
  });

  if (menuApi) {
    await redis.set(cacheKey, serializeData(menuApi));
  }

  return menuApi;
}

// 根据条件获取列表
export async function getMenuApiListByQueryModel(query: Prisma.SysMenuApiWhereInput, tx = prisma) {
  const menuApi = await tx.sysMenuApi.findMany({
    where: query
  });
  return menuApi;
}

// 根据条件获取一条
export async function getMenuApiByQueryModel(query: Prisma.SysMenuApiWhereInput, tx = prisma) {
  const menuApi = await tx.sysMenuApi.findFirst({
    where: query
  });
  return menuApi;
}

// 批量新增
export async function createMenuApisModel(data: Prisma.SysMenuApiCreateManyInput[], tx = prisma) {
  const menuApis = await tx.sysMenuApi.createMany({
    data
  });
  return menuApis;
}

// 修改一条
export async function updateMenuApiModel(
  menuId: number,
  apiId: number,
  data: Prisma.SysMenuApiUncheckedUpdateInput,
  tx = prisma
) {
  const menuApi = await tx.sysMenuApi.update({
    where: {
      menuId_apiId: {
        menuId,
        apiId
      }
    },
    data
  });
  return menuApi;
}

// 删除一条
export async function deleteMenuApiModel(menuId: number, apiId: number, tx = prisma) {
  const menuApi = await tx.sysMenuApi.delete({
    where: {
      menuId_apiId: {
        menuId,
        apiId
      }
    }
  });
  return menuApi;
}

// 根据条件删除
export async function deleteMenuApiByQueryModel(query: Prisma.SysMenuApiWhereInput, tx = prisma) {
  const menuApi = await tx.sysMenuApi.deleteMany({
    where: query
  });
  return menuApi;
}
