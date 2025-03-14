import { createMenu, getMenuByName, getMenuByQuery, updateMenu } from "../models/menu";
import { now } from "@/lib/date";
import { sysApi, sysMenu, sysMenuApi } from "@prisma/client";
import { createApi, getApiByMethodAndPath, updateApi } from "../models/api";
import { createMenuApis, getMenuApiByMenuIdAndApiId } from "../models/menuApi";

interface MenuItem {
  perms: string;
  menuName: string;
  path: string;
  status?: number;
  visible?: number;
  menuType?: number;
  apis?: sysApi[];
  children?: MenuItem[]; // 子菜单，递归定义
}

// 递归解析菜单项
async function parseMenuItems(menuItems: MenuItem[], parentId: number = 0) {
  for (const item of menuItems) {
    // 打印菜单的名称和路径
    let menuType = item.menuType || 0;
    menuType = Number(menuType);
    const menu = await getMenuByQuery({
      perms: item.perms,
    });
    let menuModel: sysMenu;
    if (menu?.menuId) {
      menuModel = await updateMenu(menu.menuId, {
        menuName: item.menuName,
        parentId,
        menuType,
        path: item.path,
        perms: item.perms,
        icon: "",
        sortOrder: 0,
        updatedId: 1,
        updatedBy: "admin",
        visible: item?.visible == 0 ? 0 : 1,
        status: item?.status == 0 ? 0 : 1,
        updatedAt: now()
      });
    } else {
      menuModel = await createMenu({
        menuName: item.menuName,
        parentId,
        menuType,
        path: item.path,
        perms: item.perms,
        icon: "",
        sortOrder: 0,
        visible: item?.visible == 0 ? 0 : 1,
        status: item?.status == 0 ? 0 : 1,
        createdId: 1,
        createdBy: "admin",
        updatedId: 1,
        updatedBy: "admin",
        createdAt: now(),
        updatedAt: now()
      });
    }

    const apis = item.apis || [];
    // 如果有api权限，则创建api权限
    let menuApiData: sysMenuApi[] = [];
    for (const api of apis) {
      let apiRes = null;
      const existApi = await getApiByMethodAndPath(api.method, api.path);
      if (existApi) {
        // 更新接口
        apiRes = await updateApi(existApi.id, {
          path: api.path,
          method: api.method,
          description: api.description,
          group: api.group
        });
      } else {
        // 创建接口
        apiRes = await createApi({
          path: api.path,
          method: api.method,
          description: api.description,
          group: api.group
        });
      }

      // 更新menu_api关系
      if (apiRes) {
        const existMenuApi = await getMenuApiByMenuIdAndApiId(menuModel.menuId, apiRes.id);
        if (!existMenuApi) {
          menuApiData.push({
            menuId: menuModel.menuId,
            apiId: apiRes.id
          });
        }
      }
    }

    // 批量提交
    if (menuApiData.length > 0) {
      await createMenuApis(menuApiData);
    }

    // 如果有子菜单，递归调用
    if (item.children && item.children.length > 0) {
      const parentId = menuModel.menuId;
      await parseMenuItems(item.children, parentId);
    }
  }
}

export default async function migrateMenu(menus) {
  parseMenuItems(menus);
}
