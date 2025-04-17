import { Prisma, SysMenu, SysMenuApi } from "@prisma/client";
import { getEnforcer } from "@/casbin";
import prisma from "@/lib/prisma";
import { formatFields } from "@/lib/date";
import {
  getMenusModel,
  getMenuByIdModel,
  createMenuModel,
  updateMenuModel,
  deleteMenuModel
} from "@/cmf/models/menu";
import {
  getMenuApiListModel,
  createMenuApisModel,
  deleteMenuApiByQueryModel
} from "@/cmf/models/menuApi";

type Menu = SysMenu & {
  children?: Menu[];
};

export function arrayToTreeService(menuList: SysMenu[]): Menu[] {
  const menuMap: { [key: number]: Menu } = {};
  const tree: Menu[] = [];

  menuList.forEach((menu) => {
    if (menu.menuId) {
      const menuId = menu.menuId;
      menuMap[menuId] = { ...menu };
    }
  });

  menuList.forEach((menu) => {
    const parent = menuMap[menu.parentId];
    if (parent) {
      if (!parent.children) {
        parent.children = [];
      }
      parent.children!.push(menuMap[menu.menuId]);
    } else {
      tree.push(menuMap[menu.menuId]);
    }
  });

  return tree;
}

export async function getMenuListService(where: Prisma.SysMenuWhereInput, userId: number, admin: boolean) {
  const e = await getEnforcer();
  let menus: SysMenu[] = [];
  
  if (admin === true) {
    menus = await getMenusModel(where);
  } else {
    const permissions = await e.getPermissionsForUser(`${userId}`);
    const ids = permissions.map((permission) => Number(permission[1]));
    where.menuId = { in: ids };
    menus = await getMenusModel(where);
  }

  formatFields(menus, [
    { fromField: "createdAt", toField: "createdTime" },
    { fromField: "updatedAt", toField: "updatedTime" }
  ]);

  return arrayToTreeService(menus);
}

export async function getMenuService(menuId: number) {
  const menu = await getMenuByIdModel(menuId);
  if (!menu) {
    return null;
  }

  const apis = await getMenuApiListModel({ menuId });

  return {
    ...menu,
    apis: apis.map((api) => api.apiId)
  };
}

export async function saveMenuService(menuData: {
  menuName: string;
  path?: string;
  icon: string;
  parentId?: number;
  sortOrder?: number;
  component?: string;
  query?: string;
  isFrame?: number;
  isCache?: number;
  menuType?: number;
  visible?: number;
  status?: number;
  perms?: string;
  createdId?: number;
  createdBy?: string;
  updatedId?: number;
  updatedBy?: string;
  remark?: string;
  apis?: (number | string)[];
}, menuId?: number) {
  return await prisma.$transaction(async (tx: any) => {
    let menu;

    let existApis = [];

    if (menuId) {
      menu = await updateMenuModel(menuId, menuData, tx);
      existApis = await getMenuApiListModel({ menuId }, tx);

      if (!menuData.apis || menuData.apis?.length === 0) {
        await deleteMenuApiByQueryModel({ menuId }, tx);
        return menu;
      }
    } else {
      menu = await createMenuModel({
        ...menuData,
        icon: menuData.icon || ''
      }, tx);
      menuId = menu.menuId;
    }

    if (existApis.length === 0) {
      const addData: SysMenuApi[] = [];
      for (const apiId of menuData.apis || []) {
        addData.push({ menuId: menu.menuId, apiId: Number(apiId) });
      }
      await createMenuApisModel(addData, tx);
      return menu;
    }

    const addApis = (menuData.apis || []).filter((apiId) => 
      !existApis.some((item) => item.apiId === apiId)
    );
    if (addApis.length > 0) {
      const addData = [];
      for (const apiId of addApis) {
        addData.push({ menuId: menu.menuId, apiId });
      }
      await createMenuApisModel(addData, tx);
    }

    const deleteApis = existApis.filter((item) => 
      !(menuData.apis || []).some((apiId) => item.apiId === apiId)
    );
    if (deleteApis.length > 0) {
      const deleteIds = [];
      for (const item of deleteApis) {
        deleteIds.push(item.apiId);
      }
      await deleteMenuApiByQueryModel({ menuId, apiId: { in: deleteIds } }, tx);
    }

    return menu;
  });
}

export async function deleteMenuService(menuId: number) {
  const children = await getMenusModel({ parentId: menuId });
  if (children && children.length > 0) {
    throw new Error("请先删除子菜单！");
  }

  return await deleteMenuModel(menuId);
}
