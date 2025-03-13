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
  getLoginLogList,
  getLoginLogDetail,
  removeLoginLog,
  cleanLoginLog,
  exportLoginLog
} from "../controller/admin/loginLog";
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
import {
  getPostListController,
  getPostController,
  createPostController,
  updatePostController,
  deletePostController
} from "../controller/admin/post";
import {
  getDictTypeListController,
  getDictTypeInfoController,
  createDictTypeController,
  updateDictTypeController,
  deleteDictTypeController,
  getDictDataListController,
  getDictDataByTypeController,
  getDictDataInfoController,
  createDictDataController,
  updateDictDataController,
  deleteDictDataController
} from "../controller/admin/dict";

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

// 岗位管理
adminRouter.get("/posts", getPostListController)
adminRouter.get("/posts/:postId", getPostController)
adminRouter.post("/posts", createPostController)
adminRouter.put("/posts/:postId", updatePostController)
adminRouter.delete("/posts/:postId", deletePostController)

// 登录日志管理
adminRouter.get("/login-logs", getLoginLogList)
adminRouter.get("/login-logs/:id", getLoginLogDetail)
adminRouter.delete("/login-logs", removeLoginLog)
adminRouter.delete("/login-logs/clean", cleanLoginLog)
adminRouter.get("/login-logs/export", exportLoginLog)

// 字典类型管理
adminRouter.get("/dict/types", getDictTypeListController);
adminRouter.get("/dict/types/:dictId", getDictTypeInfoController);
adminRouter.post("/dict/types", createDictTypeController);
adminRouter.put("/dict/types/:dictId", updateDictTypeController);
adminRouter.delete("/dict/types/:dictId", deleteDictTypeController);

// 字典数据管理
adminRouter.get("/dict/data", getDictDataListController);
adminRouter.get("/dict/data/type/:dictType", getDictDataByTypeController);
adminRouter.get("/dict/data/:dictCode", getDictDataInfoController);
adminRouter.post("/dict/data", createDictDataController);
adminRouter.put("/dict/data/:dictCode", updateDictDataController);
adminRouter.delete("/dict/data/:dictCode", deleteDictDataController);

export default adminRouter;
