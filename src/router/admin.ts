import Router from "koa-router";
import { auth } from "@/middlewares/auth";
import { home } from "@/controller/admin";
import { addRole, getRoles, getRole, updateRole, deleteRole } from "@/controller/admin/role";
import { getUsers, getUser, addUser, updateUser, deleteUser } from "@/controller/admin/user";
import { getMenus } from "@/controller/admin/menu";

const adminRouter = new Router({ prefix: "/admin" });
adminRouter.use(auth);
adminRouter.get("/", home);

// 角色管理路由
adminRouter.get("/roles", getRoles);
adminRouter.get("/roles/:id", getRole);
adminRouter.post("/roles", addRole);
adminRouter.post("/roles/:id", updateRole);
adminRouter.delete("/roles/:id", deleteRole);

// 管理员管理
adminRouter.get("/users", getUsers);
adminRouter.get("/users/:id", getUser);
adminRouter.post("/users", addUser);
adminRouter.post("/users/:id", updateUser);
adminRouter.delete("/users/:id", deleteUser);

// 菜单管理
adminRouter.get("/menus", getMenus);


export default adminRouter;
