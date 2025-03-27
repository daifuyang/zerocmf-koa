import prisma from "@/lib/prisma";
import redis from "@/lib/redis";
import { serializeData } from "@/lib/utils";
import { Prisma, sysMenu } from "@prisma/client";

const menuIdKey = "menu:id:";

// 获取全部菜单列表
export const getMenus = async (where: Prisma.sysMenuWhereInput = {}, tx = prisma) => {
  const menuList = await tx.sysMenu.findMany({
    where
  });
  return menuList;
};

// 根据id获取单个菜单
export const getMenuById = async (id: number, tx = prisma): Promise<sysMenu> => {
  const key = `${menuIdKey}${id}`
  const cache = await redis.get(key);
  if (cache) {
    return JSON.parse(cache);
  }
  const menu = await tx.sysMenu.findUnique({
    where: {
      menuId: id
    }
  });

  if (menu) {
    redis.set(key, serializeData(menu));
  }

  return menu;
};

// 根据名称获取单个菜单
export const getMenuByName = async (menuName: string, tx = prisma) => {
  const menu = await tx.sysMenu.findFirst({
    where: {
      menuName
    }
  });
  return menu;
};

// 根据条件获取单个菜单
export const getMenuByQuery = async (where: Prisma.sysMenuWhereInput, tx = prisma) => {
  const menu = await tx.sysMenu.findFirst({
    where
  });
  return menu;
};

// 创建单个菜单
export const createMenu = async (menu: Prisma.sysMenuCreateInput, tx = prisma) => {
  return await tx.sysMenu.create({
    data: menu
  });
};

//更新单个菜单
export const updateMenu = async (id: number, data: Prisma.sysMenuUpdateInput, tx = prisma) => {
  const menu = await tx.sysMenu.update({
    where: {
      menuId: id
    },
    data
  });

  if (menu) {
    await redis.del(`${menuIdKey}${id}`);
  }

  return menu;
};

// 删除单个菜单
export const deleteMenu = async (id: number, tx = prisma) => {
  const deletedMenu = await tx.sysMenu.delete({
    where: {
      menuId: id,
    },
  });

  if (deletedMenu) {
    const key = `${menuIdKey}${id}`;
    redis.del(key); // 清除缓存
  }

  return deletedMenu;
};
