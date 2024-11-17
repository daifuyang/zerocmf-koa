import prisma from "@/lib/prisma";
import redis from "@/lib/redis";
import { Prisma } from "@prisma/client";

const menuIdKey = "menu:id:";

// 获取全部菜单列表
export const getMenusModel = async (tx = prisma) => {
  const menuList = await tx.sysMenu.findMany();
  return menuList;
}

// 获取当个菜单
export const getMenuByName = async (menuName: string, tx = prisma) => {
  const menu = await tx.sysMenu.findFirst({
    where: {
      menuName
    }
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
