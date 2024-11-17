import { formatFields, now } from "@/lib/date";
import { parseJson } from "@/lib/request";
import response from "@/lib/response";
import {
  createRoleModel,
  deleteRoleModel,
  getRoleById,
  getRoleByName,
  getRoleCount,
  getRoleList,
  updateRoleModel
} from "@/models/role";
import { Role } from "@/typings/role";
import { Context } from "koa";
import { Prisma } from "@prisma/client";
import redis from "@/lib/redis";

// 获取角色列表
export async function getRoles(ctx: Context) {
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
}

// 查看单个角色
export async function getRole(ctx: Context) {
  const { id } = ctx.params;

  if (Number(id) > 0) {
    const role = await getRoleById(Number(id));
    if (!role) {
      ctx.body = response.error("角色不存在！");
      return;
    }
    ctx.body = response.success("获取成功！", role);
    return;
  }

  ctx.body = response.error("参数错误！");
}

// 新增角色
export async function addRole(ctx: Context) {
  const { name, description, sort, status } = parseJson(ctx) as Role;

  if (!name) {
    ctx.body = response.error("角色名称不能为空！");
    return;
  }

  const nameRole = await getRoleByName(name);
  if (nameRole) {
    ctx.body = response.error("角色名称已存在！");
    return;
  }

  try {
    const role = await createRoleModel({
      name,
      description,
      sort,
      status,
      createdAt: now(),
      updatedAt: now()
    });
    ctx.body = response.success("新增成功！", role);
  } catch (error) {
    ctx.body = response.error("系统出错！");
  }
}

// 修改角色
export async function updateRole(ctx: Context) {
  const { id } = ctx.params;

  if (Number(id) > 0) {
    const { name, description, sort, status } = parseJson(ctx) as Role;

    if (!name) {
      ctx.body = response.error("角色名称不能为空！");
      return;
    }

    const role = await getRoleById(Number(id));
    if (!role) {
      ctx.body = response.error("角色不存在！");
      return;
    }

    const nameRole = await getRoleByName(name);
    if (nameRole && nameRole.id !== Number(id)) {
      ctx.body = response.error("角色名称已存在！");
      return;
    }

    const newRole = await updateRoleModel(Number(id), {
      name,
      description,
      sort,
      status,
      updatedAt: now()
    });

    if (newRole) {
      redis.del(`role:${id}`);
    }

    ctx.body = response.success("更新成功！", newRole);
    return;
  }

  ctx.body = response.error("参数错误！");
}

// 删除角色
export async function deleteRole(ctx: Context) {
  const { id } = ctx.params;

  if (Number(id) > 0) {
    const role = await getRoleById(Number(id));
    if (!role) {
      ctx.body = response.error("角色不存在！");
      return;
    }
    const deleted = await deleteRoleModel(Number(id));
    if (deleted) {
      redis.del(`role:${id}`);
    }
    ctx.body = response.success("删除成功！", deleted);
    return;
  }

  ctx.body = response.error("参数错误！");
}
