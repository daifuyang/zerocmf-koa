import { MENU_JSON } from "@/constants/path";
import { getFileJson } from "@/lib/file";
// 从文件夹读取菜单

export const systemMenus = getFileJson(MENU_JSON);

export const migrateMenu = async (menus: any) => {
  if (menus) {
    systemMenus.push(...menus);
    return systemMenus;
  }
  return [];
};
