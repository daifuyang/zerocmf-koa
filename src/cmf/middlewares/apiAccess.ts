// 接口权限

import { getEnforcer } from "@/casbin";
import { getApiByMethodAndPath } from "../models/api";
import { getMenuApiListByQuery } from "../models/menuApi";
import { getCurrentUser } from "@/lib/userinfo";

export default async function apiAccess(ctx: any, next: any) {
  // 获取当前用户id
  const { userId } = getCurrentUser(ctx);
  const e = await getEnforcer();
  // 根据id获取用户角色
  const roleIds = await e.getRolesForUser(`${userId}`);

  // 获取当前请求信息
  const { url, method } = ctx.request;
  if (userId === 2 && method !== "GET") {
    ctx.body = {
      code: 0,
      msg: "演示模式，禁止操作！"
    };
    return;
  }

  if (userId === 1 || roleIds.includes("1")) {
    ctx.state.admin = true;
    await next();
    return;
  }

  const pathname = url.split("?")[0];

  // 如果接口不在权限表中
  const api = await getApiByMethodAndPath(method, pathname);
  if (api) {
    // 根据apiId获取权限信息
    const menuApis = await getMenuApiListByQuery({ apiId: api.id });
    let menuIds: string[] = [];
    for (const api of menuApis) {
      menuIds.push(api.menuId.toString());
    }
    const access = await e.hasPermissionForUser(userId.toString(), ...menuIds);
    if (!access) {
      ctx.status = 403;
      ctx.body = {
        code: 403,
        message: "没有权限访问该接口"
      };
      return;
    }
  }

  await next();
}
