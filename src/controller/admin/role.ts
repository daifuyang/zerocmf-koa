import { formatFields, now } from "@/lib/date";
import { parseJson } from "@/lib/request";
import response from "@/lib/response";
import {
  createRole,
  deleteRole,
  getRoleById,
  getRoleByName,
  getRoleCount,
  getRoleList,
  updateRole
} from "@/models/role";
import { Role } from "@/typings/role";
import { Context } from "koa";
import redis from "@/lib/redis";
import { getEnforcer } from "@/casbin";

// 获取角色列表
export async function getRolesController(ctx: Context) {
  // 获取查询参数
  const query = ctx.query || {};
  const { current = "1", pageSize = "10", name = "", description = "", status = "" } = query;

  const where: {
    name?: any;
    description?: any;
    status?: any;
  } = {};

  if (name) {
    where.name = {
      contains: name
    };
  }

  if (description) {
    where.description = {
      contains: description
    };
  }

  if (status) {
    where.status = Number(status);
  }

  const roleList = await getRoleList(Number(current), Number(pageSize), where);

  formatFields(roleList, [
    { fromField: "createdAt", toField: "createTime" },
    { fromField: "updatedAt", toField: "updateTime" }
  ]);

  let pagination = {};
  if (pageSize === "0") {
    pagination = roleList;
  } else {
    const total = await getRoleCount();
    pagination = {
      page: Number(current),
      pageSize: Number(pageSize),
      total,
      data: roleList
    };
  }
  ctx.body = response.success("获取成功！", pagination);
  return;
}

// 查看单个角色
export async function getRoleController(ctx: Context) {
  const { roleId } = ctx.params;
  const numberRoleId = Number(roleId);

  if (isNaN(numberRoleId)) {
    ctx.body = response.error("参数错误！");
    return;
  }

  if (numberRoleId > 0) {
    const role = await getRoleById(numberRoleId);
    const menuIds: number[] = [];
    const e = await getEnforcer();
    const rules = await e.getFilteredPolicy(0, roleId);
    rules.forEach((rule) => {
      menuIds.push(Number(rule[1]));
    });
    role.menuIds = menuIds;
    if (!role) {
      ctx.body = response.error("角色不存在！");
      return;
    }
    ctx.body = response.success("获取成功！", role);
    return;
  }
  ctx.body = response.error("参数错误！");
  return;
}

// 新增角色
export async function addRoleController(ctx: Context) {
  return saveRole(ctx, null);
}

// 修改角色
export async function updateRoleController(ctx: Context) {
  const { roleId } = ctx.params;
  const numberRoleId = Number(roleId);
  if (isNaN(numberRoleId)) {
    ctx.body = response.error("参数错误！");
    return;
  }
  return saveRole(ctx, numberRoleId);
}

// 保存角色
async function saveRole(ctx: Context, roleId: number | null) {

  const edit = roleId !== null;

  const { name, description, sortOrder, status, menuIds = [] } = parseJson(ctx) as Role;
  if (!name) {
    ctx.body = response.error("角色名称不能为空！");
    return;
  }

  const nameRole = await getRoleByName(name);
  if (nameRole) {
    if (!edit) {
      ctx.body = response.error("角色名称已存在！");
      return;
    } else if (nameRole.roleId !== roleId) {
      ctx.body = response.error("角色名称已存在！");
      return;
    }
  }

  let role = null;
  let msg = '';
  try {

    if (!edit) {
      role = await createRole({
        name,
        description,
        sortOrder,
        status,
        createdAt: now(),
        updatedAt: now()
      });
      msg = '新增成功！';
    } else {
      role = await updateRole(roleId, {
        name,
        description,
        sortOrder,
        status,
        updatedAt: now()
      });
      msg = '修改成功！';
    }

    // 更新权限
    if (role) {
      const e = await getEnforcer();
      for (const menuId of menuIds) {
        e.addPermissionForUser(`${roleId}`, `${menuId}`);
      }
      await e.savePolicy();
      if (edit) {
        redis.del(`role:${roleId}`);
      }
    }
    ctx.body = response.success(msg, role);
  } catch (error) {
    ctx.body = response.error("系统出错！");
    return;
  }
}

// 删除角色
export async function deleteRoleController(ctx: Context) {
  const { roleId } = ctx.params;
  const numberRoleId = Number(roleId);

  if (isNaN(numberRoleId)) {
    ctx.body = response.error("参数错误！");
    return;
  }

  if (numberRoleId > 0) {
    const role = await getRoleById(numberRoleId);
    if (!role) {
      ctx.body = response.error("角色不存在！");
      return;
    }
    const deleted = await deleteRole(numberRoleId);
    if (deleted) {
      redis.del(`role:${roleId}`);
    }
    ctx.body = response.success("删除成功！", deleted);
    return;
  }

  ctx.body = response.error("参数错误！");
  return;
}
