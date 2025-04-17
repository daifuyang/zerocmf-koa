import { Context } from "koa";
import response from "@/lib/response";
import { 
  getMenuListService,
  getMenuService,
  saveMenuService,
  deleteMenuService
} from "@/cmf/services/menu";
import { Prisma } from "@prisma/client";

// 获取菜单列表
export const getMenuListController = async (ctx: Context) => {
  const { userId } = ctx.state.user;
  const admin = ctx.state.admin;
  const { menuName, status } = ctx.query;

  // 构建查询条件
  let where: Prisma.SysMenuWhereInput = {};

  if (menuName) {
    where.menuName = {
      contains: menuName as string
    };
  }

  if (status !== undefined) {
    where.status = Number(status);
  }

  try {
    const treeMenus = await getMenuListService(where, userId, admin);
    ctx.body = response.success("获取成功！", treeMenus);
  } catch (error) {
    ctx.body = response.error("获取失败！", error);
  }
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

  try {
    const menu = await getMenuService(numberMenuId);
    if (!menu) {
      ctx.body = response.error("菜单不存在！");
      return;
    }
    ctx.body = response.success("获取成功！", menu);
  } catch (error) {
    ctx.body = response.error("获取失败！", error);
  }
};

// 公共的保存菜单方法
const saveMenuHandler = async (ctx: Context, menuId: number | undefined = undefined) => {
  const body = ctx.request.body as {
    menuName: string;
    path?: string;
    icon?: string;
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
  };

  const {
    menuName,
    path = '',
    icon = '',
    parentId = 0,
    sortOrder = 1,
    component = '',
    query = '',
    isFrame = 0,
    isCache = 0,
    menuType = 0,
    visible = 1,
    status = 1,
    perms = '',
    createdId,
    createdBy = "",
    updatedId,
    updatedBy = "",
    remark = "",
    apis = []
  } = body;

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
      remark,
      apis
    };

    const result = await saveMenuService(menuData, menuId);
    ctx.body = response.success("操作成功！", result);
  } catch (error) {
    ctx.body = response.error("操作失败！", error);
  }
};

// 新增菜单
export const addMenuController = async (ctx: Context) => {
  await saveMenuHandler(ctx);
};

// 编辑菜单
export const updateMenuController = async (ctx: Context) => {
  const { menuId } = ctx.params;
  const numberMenuId = Number(menuId);
  if (isNaN(numberMenuId)) {
    ctx.body = response.error("参数错误！");
    return;
  }
  await saveMenuHandler(ctx, numberMenuId);
};

// 删除菜单
export const deleteMenuController = async (ctx: Context) => {
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

  try {
    await deleteMenuService(numberMenuId);
    ctx.body = response.success("删除成功！");
  } catch (error) {
    ctx.body = response.error("删除失败！", error);
  }
};
