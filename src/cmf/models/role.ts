import { formatFields, now } from "@/lib/date";
import prisma from "@/lib/prisma";
import redis from "@/lib/redis";
import { serializeData } from "@/lib/utils";
import { Prisma } from "@prisma/client";

const roleIdKey = "role:id:";

// 获取角色列表
export const getRoleListModel = async (
  page: number = 1,
  pageSize: number,
  where: Prisma.SysRoleWhereInput = {},
  tx = prisma
) => {
  const args: {
    skip?: number;
    take?: number;
    where?: Prisma.SysRoleWhereInput;
  } =
    pageSize === 0
      ? {}
      : {
          skip: (page - 1) * pageSize,
          take: pageSize
        };

  args.where = {
    ...where,
    deletedAt: 0
  };

  const roles = await tx.sysRole.findMany({
    ...args
  });

  formatFields(roles, [
    { fromField: "createdAt", toField: "createTime" },
    { fromField: "updatedAt", toField: "updateTime" }
  ]);

  return roles;
};

// 根据id获取角色详情
export const getRoleByIdModel = async (roleId: number, tx = prisma) => {
  const cache = await redis.get(`${roleIdKey}${roleId}`);
  if (cache) {
    return JSON.parse(cache);
  }

  const role = await tx.sysRole.findUnique({
    where: {
      roleId,
      deletedAt: 0
    }
  });

  if (role) {
    redis.set(`${roleIdKey}${roleId}`, serializeData(role));
  }

  return role;
};

export const getRoleByNameModel = async (name: string, tx = prisma) => {
  return await tx.sysRole.findFirst({
    where: {
      name,
      deletedAt: 0
    }
  });
};

// 获取角色总数
export const getRoleCountModel = async (tx = prisma) => {
  return await tx.sysRole.count({
    where: {
      deletedAt: 0
    }
  });
};

// 创建角色
export const createRoleModel = async (data: any, tx = prisma) => {
  const role = await tx.sysRole.create({
    data
  });
  
  return role;
};

// 更新角色
export const updateRoleModel = async (roleId: number, data: Prisma.SysRoleUpdateInput, tx = prisma) => {
  const role = await tx.sysRole.update({
    where: {
      roleId
    },
    data
  });

  if (role) {
    redis.del(`${roleIdKey}${roleId}`);
  }

  return role;
};

// 删除角色
export const deleteRoleModel = async (roleId: number, tx = prisma) => {
  const role = await tx.sysRole.update({
    where: {
      roleId
    },
    data: {
      deletedAt: now()
    }
  });
  return role;
};
