import { getEnforcer } from "@/casbin";
import response from "@/lib/response";
import { getMenuById, getMenus, createMenu, updateMenu, deleteMenu } from "@/models/menu";
import { sysMenu } from "@prisma/client";
import { Context } from "koa";

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
export const getMenusController = async (ctx: Context) => {
  // 获取当前用户id
  const { userId } = ctx.state.user;

  const e = await getEnforcer();
  // 根据id获取用户角色
  const roleIds = await e.getUsersForRole(`${userId}`);

  let menus: sysMenu[] = [];
  if (userId === 1 || roleIds.includes("1")) {
    menus = await getMenus();
  } else {
    const permissions = await e.getPermissionsForUser(`${userId}`);
    const ids = permissions.map((permission) => Number(permission[1]));
    menus = await getMenus({
      menuId: { in: ids }
    });
  }
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
  ctx.body = response.success("获取成功！", menu);
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
  } = ctx.request.body;

  // 校验必填字段
  if (!menuName || !path) {
    ctx.body = response.error("菜单名称和路径不能为空！");
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
      remark,
    };

    let menu;
    if (menuId) {
      // 编辑菜单
      menu = await updateMenu(menuId, menuData);
    } else {
      // 新增菜单
      menu = await createMenu(menuData);
    }

    if (!menu) {
      ctx.body = response.error("操作失败！");
      return;
    }

    ctx.body = response.success("操作成功！", menu);
  } catch (error) {
    ctx.body = response.error("操作失败！");
  }
};

// 新增菜单
export const addMenuController = async (ctx: Context) => {
  await saveMenu(ctx); // 调用公共方法，menuId 为 undefined
};

// 编辑菜单
export const updateMenuController = async (ctx: Context) => {
  const { id } = ctx.params;
  const menuId = Number(id);
  if (isNaN(menuId)) {
    ctx.body = response.error("参数错误！");
    return;
  }
  await saveMenu(ctx, menuId); // 调用公共方法，传入 menuId
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
