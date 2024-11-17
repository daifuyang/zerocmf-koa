import response from "@/lib/response";
import { getMenusModel } from "@/models/menu";
import { sysMenu } from "@prisma/client";
import { Context } from "koa";

type Menu = sysMenu & {
  children?: Menu[]; // For tree structure
}

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
export const getMenus = async (ctx: Context) => {
  const menus = await getMenusModel();
  const treeMenus = arrayToTree(menus);
  ctx.body = response.success("获取成功！", treeMenus);
};
