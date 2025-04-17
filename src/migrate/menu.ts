import { MENU_JSON } from "../constants/path";
import { getFileJson } from "../lib/file";
import { MenuItem } from "../cmf/migrate/menu";
// 从文件夹读取菜单

const systemMenus = getFileJson(MENU_JSON);

export default async function migrateMenu(menus: MenuItem[]) {
  if (menus) {
    systemMenus.push(...menus);
    return systemMenus;
  }
  return [];
};

export { systemMenus };
