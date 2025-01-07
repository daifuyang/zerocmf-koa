import Router from "koa-router";
import { auth } from "@/middlewares/auth";
import { home } from "@/controller/admin";
import {
  addRoleController,
  getRolesController,
  getRoleController,
  updateRoleController,
  deleteRoleController
} from "@/controller/admin/role";
import {
  getUsersController,
  getUserController,
  addUserController,
  updateUserController,
  deleteUserController
} from "@/controller/admin/user";
import {
  getMenusController,
  getMenuController,
  addMenuController,
  updateMenuController,
  deleteMenuController
} from "@/controller/admin/menu";

import { getApisController } from "@/controller/admin/api";

import { adminPrefix } from "@/constants/router";

const adminRouter = new Router({ prefix: adminPrefix });
adminRouter.use(auth);
adminRouter.get("/", home);

// 角色管理路由
adminRouter.get("/roles", getRolesController);
adminRouter.get("/roles/:roleId", getRoleController);
adminRouter.post("/roles", addRoleController);
adminRouter.put("/roles/:roleId", updateRoleController);
adminRouter.delete("/roles/:roleId", deleteRoleController);

// 管理员管理
adminRouter.get("/users", getUsersController);
adminRouter.get("/users/:userId", getUserController);
adminRouter.post("/users", addUserController);
adminRouter.put("/users/:userId", updateUserController);
adminRouter.delete("/users/:userId", deleteUserController);

// 菜单管理
adminRouter.get("/menus", getMenusController);
adminRouter.get("/menus/:menuId", getMenuController);
adminRouter.post("/menus", addMenuController);
adminRouter.put("/menus/:id", updateMenuController);
adminRouter.delete("/menus/:id", deleteMenuController);

//  接口管理
adminRouter.get("/apis", getApisController);
export default adminRouter;
