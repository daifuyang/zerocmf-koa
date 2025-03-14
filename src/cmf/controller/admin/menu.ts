import { getEnforcer } from "@/casbin";
import response from "@/lib/response";
import { getMenuById, getMenus, createMenu, updateMenu, deleteMenu } from "../../models/menu";
import { Prisma, sysMenu, sysMenuApi } from "@prisma/client";
import { Context } from "koa";
import prisma from "@/lib/prisma";
import { createMenuApis, deleteMenuApiByQuery, getMenuApiList } from "../../models/menuApi";
import { formatFields } from "@/lib/date";

type Menu = sysMenu & {
  children?: Menu[]; // For tree structure
};

function arrayToTree(menuList: sysMenu[]): Menu[] {
  const menuMap: { [key: number]: Menu } = {};
  const tree: Menu[] = [];

  // Step 1: Create a map with menuId as key
  menuList.forEach((menu) => {
    if (menu.menuId) {
      const menuId = menu.menuId;
      menuMap[menuId] = { ...menu };
    }
  });

  // Step 2: Build the tree structure
  menuList.forEach((menu) => {
    const parent = menuMap[menu.parentId];
    if (parent) {
      if (!parent.children) {
        parent.children = [];
      }

      parent.children!.push(menuMap[menu.menuId]); // Add to parent's children
    } else {
      tree.push(menuMap[menu.menuId]); // Top-level node
    }
  });

  return tree;
}

// 获取菜单列表
export const getMenuListController = async (ctx: Context) => {
  // 获取当前用户id
  const { userId } = ctx.state.user;
  const admin = ctx.state.admin;
  const { menuName, status } = ctx.query;

  // 构建查询条件
  let where: Prisma.sysMenuWhereInput = {};

  if (menuName) {
    where.menuName = {
      contains: menuName as string
    };
  }

  if (status !== undefined) {
    where.status = Number(status);
  }

  const e = await getEnforcer();
  let menus: sysMenu[] = [];
  if (admin === true) {
    menus = await getMenus(where);
  } else {
    const permissions = await e.getPermissionsForUser(`${userId}`);
    const ids = permissions.map((permission) => Number(permission[1]));
    where.menuId = { in: ids };
    menus = await getMenus(where);
  }

  formatFields(menus, [
    { fromField: "createdAt", toField: "createdTime" },
    { fromField: "updatedAt", toField: "updatedTime" }
  ]);

  const treeMenus = arrayToTree(menus);
  ctx.body = response.success("获取成功！", treeMenus);
};

// 获取单个菜单
export const getMenuController = async (ctx: Context) => {
  const { menuId } = ctx.params;
  if (!menuId) {
    ctx.body = response.error("参数错误！");
    return;
  }

  const numberMenuId = Number(menuId);
  if (isNaN(numberMenuId)) {
    ctx.body = response.error("参数错误！");
    return;
  }
  const menu = await getMenuById(numberMenuId);
  if (!menu) {
    ctx.body = response.error("菜单不存在！");
    return;
  }

  const apis = await getMenuApiList({ menuId: numberMenuId });

  const newMeus = {
    ...menu,
    apis: apis.map((api) => api.apiId)
  };

  ctx.body = response.success("获取成功！", newMeus);
  return;
};

// 公共的保存菜单方法
const saveMenu = async (ctx: Context, menuId: number | undefined = undefined) => {
  const {
    menuName,
    path,
    icon,
    parentId = 0,
    sortOrder = 1,
    component,
    query,
    isFrame = 0,
    isCache = 0,
    menuType = 0,
    visible = 1,
    status = 1,
    perms,
    createdId,
    createdBy = "",
    updatedId,
    updatedBy = "",
    remark = "",
    apis = []
  }: {
    [key: string]: any;
    apis: (number | string)[];
  } = ctx.request.body;

  // 校验必填字段
  if (!menuName) {
    ctx.body = response.error("菜单名称不能为空！");
    return;
  }

  try {
    const menuData = {
      menuName,
      path,
      icon,
      parentId,
      sortOrder,
      component,
      query,
      isFrame,
      isCache,
      menuType,
      visible,
      status,
      perms,
      createdId,
      createdBy,
      updatedId,
      updatedBy,
      remark
    };

    let result;
    try {
      result = await prisma.$transaction(async (tx: any) => {
        let menu;

        let existApis = [];

        if (menuId) {
          // 编辑菜单
          menu = await updateMenu(menuId, menuData, tx);
          // 先获取数据库存在的
          existApis = await getMenuApiList({ menuId }, tx);

          // 如果没有api，则删除所有关联的api
          if (!apis || apis?.length === 0) {
            await deleteMenuApiByQuery({ menuId }, tx);
            return menu;
          }
        } else {
          // 新增菜单
          menu = await createMenu(menuData, tx);
          menuId = menu.menuId; // 获取新增菜单的id
        }

        // 更新菜单关系表

        // 如果数据库为空，则全部添加
        if (existApis.length === 0) {
          const addData: sysMenuApi[] = [];
          for (const apiId of apis) {
            addData.push({ menuId: menu.menuId, apiId: Number(apiId) });
          }
          await createMenuApis(addData, tx);
          return menu;
        }

        // 找出新增的api
        const addApis = apis.filter((apiId) => !existApis.some((item) => item.apiId === apiId));
        if (addApis.length > 0) {
          const addData = [];
          for (const apiId of addApis) {
            addData.push({ menuId: menu.menuId, apiId });
          }
          await createMenuApis(addData, tx);
        }

        // 找出删除的api
        const deleteApis = existApis.filter((item) => !apis.some((apiId) => item.apiId === apiId));
        if (deleteApis.length > 0) {
          const deleteIds = [];
          for (const item of deleteApis) {
            deleteIds.push(item.apiId);
          }
          await deleteMenuApiByQuery({ menuId, apiId: { in: deleteIds } }, tx);
        }

        return menu;
      });
    } catch (error) {
      ctx.body = response.error("操作失败！", error);
    }
    if (!result) {
      ctx.body = response.error("操作失败！");
      return;
    }

    ctx.body = response.success("操作成功！", result);
  } catch (error) {
    ctx.body = response.error("操作失败！", error);
  }
};

// 新增菜单
export const addMenuController = async (ctx: Context) => {
  await saveMenu(ctx); // 调用公共方法，menuId 为 undefined
};

// 编辑菜单
export const updateMenuController = async (ctx: Context) => {
  const { menuId } = ctx.params;
  const numberMenuId = Number(menuId);
  if (isNaN(numberMenuId)) {
    ctx.body = response.error("参数错误！");
    return;
  }
  await saveMenu(ctx, numberMenuId); // 调用公共方法，传入 menuId
};

// 删除菜单
export const deleteMenuController = async (ctx: Context) => {
  const { id } = ctx.params;

  if (!id) {
    ctx.body = response.error("参数错误！");
    return;
  }

  const numberId = Number(id);
  if (isNaN(numberId)) {
    ctx.body = response.error("参数错误！");
    return;
  }

  try {
    const menu = await deleteMenu(numberId);
    if (!menu) {
      ctx.body = response.error("菜单不存在！");
      return;
    }

    ctx.body = response.success("删除成功！");
  } catch (error) {
    ctx.body = response.error("删除失败！");
  }
};
