import { createMenu, getMenuByName, updateMenu } from "@/models/menu";
import { now } from "@/lib/date";
import { sysMenu } from "@prisma/client";
import path from "path";
import { getFileJson } from "@/lib/file";

interface MenuItem {
  perms: string;
  menuName: string;
  path: string;
  status?: number;
  visible?: number;
  menuType?: number;
  children?: MenuItem[]; // 子菜单，递归定义
}

// 递归解析菜单项
async function parseMenuItems(menuItems: MenuItem[], parentId: number = 0) {
  for (const item of menuItems) {
    // 打印菜单的名称和路径
    let menuType = item.menuType || 0;
    menuType = Number(menuType);
    const menu = await getMenuByName(item.menuName);
    let menuModel: sysMenu
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
        createdAt: now(),
        updatedAt: now(),
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
        updatedAt: now(),
      });
    }
    // 如果有子菜单，递归调用
    if (item.children && item.children.length > 0) {
      const parentId = menuModel.menuId;
      await parseMenuItems(item.children, parentId);
    } 
  };
}

export default async function migrateMenu() {

  const filePath = path.join(global.ROOT_PATH, 'config/migrate/menus.json');
  // fs从本地文件读取json文件
  const menus = getFileJson(filePath);
  parseMenuItems(menus);
}
