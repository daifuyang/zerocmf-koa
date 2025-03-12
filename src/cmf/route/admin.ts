import Router from "koa-router";
import { auth } from "../middlewares/auth";
import { home } from "../controller/admin";
import {
  addRoleController,
  getRolesController,
  getRoleController,
  updateRoleController,
  deleteRoleController
} from "../controller/admin/role";
import {
  getUsersController,
  getUserController,
  addUserController,
  updateUserController,
  deleteUserController
} from "../controller/admin/user";
import {
  getMenusController,
  getMenuController,
  addMenuController,
  updateMenuController,
  deleteMenuController
} from "../controller/admin/menu";

import { getApisController } from "../controller/admin/api";

import { adminPrefix } from "../constants/router";
import apiAccess from "../middlewares/apiAccess";

import { getOptionController, setOptionController } from "../controller/admin/options";
import { addMediaController, deleteMediaController, getMediaListController } from "../controller/admin/media";
import { addMediaCategoryController, deleteMediaCategoryController, getMediaCategoryController, getMediaCategoryListController, getMediaCategoryTreeController, updateMediaCategoryController } from "../controller/admin/mediaCategory";
import {
  getDeptListController,
  getDeptTreeController,
  getDeptController,
  createDeptController,
  updateDeptController,
  deleteDeptController,
} from "../controller/admin/dept";

const adminRouter = new Router({ prefix: adminPrefix });
adminRouter.use(auth, apiAccess);
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
adminRouter.put("/menus/:menuId", updateMenuController);
adminRouter.delete("/menus/:menuId", deleteMenuController);

// 接口管理
adminRouter.get("/apis", getApisController);

// 系统设置
adminRouter.get("/options/:name", getOptionController);
adminRouter.post("/options/:name", setOptionController);

// 媒体管理
adminRouter.get("/medias", getMediaListController)
// adminRouter.get("/medias/:mediaId", )
adminRouter.post("/medias", addMediaController)
// adminRouter.put("/medias/:mediaId")
adminRouter.delete("/medias/:mediaId", deleteMediaController)

// 媒体分类管理
adminRouter.get("/media-categories", getMediaCategoryListController)
adminRouter.get("/media-categories/tree", getMediaCategoryTreeController)
adminRouter.get("/media-categories/:categoryId", getMediaCategoryController)
adminRouter.post("/media-categories", addMediaCategoryController)
adminRouter.put("/media-categories/:categoryId", updateMediaCategoryController)
adminRouter.delete("/media-categories/:categoryId", deleteMediaCategoryController)

// 部门管理
adminRouter.get("/depts", getDeptListController)
adminRouter.get("/depts/tree", getDeptTreeController)
adminRouter.get("/depts/:deptId", getDeptController)
adminRouter.post("/depts", createDeptController)
adminRouter.put("/depts/:deptId", updateDeptController)
adminRouter.delete("/depts/:deptId", deleteDeptController)

export default adminRouter;
