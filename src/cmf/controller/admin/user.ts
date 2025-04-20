import { getEnforcer } from "@/casbin";
import { formatFields, now } from "@/lib/date";
import response, { Pagination } from "@/lib/response";
import { generateSalt, hashPassword } from "@/lib/utils";
import { z } from "zod";

import {
  createUserModel,
  deleteUserModel,
  getUserByIdModel,
  getUserCountModel,
  getUserModel,
  getUserListModel,
  updateUserModel
} from "../../models/user";
import { Prisma } from "@prisma/client";

const ListQuerySchema = z.object({
  current: z.string().optional().default("1"),
  pageSize: z.string().optional().default("10"),
  loginName: z.string().optional().default(""),
  phone: z.string().optional().default(""),
  status: z.string().optional()
});

const UserIdSchema = z.object({
  userId: z.string().min(1, "参数错误！")
});

const UserSaveSchema = z.object({
  loginName: z.string().min(1, "登录用户名不能为空！"),
  email: z.string().email("邮箱格式不正确").optional(),
  phone: z.string().optional(),
  nickname: z.string().optional(),
  realname: z.string().optional(),
  password: z.string().optional(),
  gender: z.number().optional(),
  birthday: z.number().optional(),
  avatar: z.string().optional(),
  loginIp: z.string().optional(),
  loginTime: z.string().optional(),
  status: z.number(),
  remark: z.string().optional(),
  roleIds: z.array(z.number()).optional()
});

export const getUsersController = async (ctx: any) => {
  const query = ListQuerySchema.parse(ctx.query || {});
  const { current, pageSize, loginName, phone, status } = query;

  const where: Prisma.SysUserWhereInput = {
    userType: 1
  };

  if (loginName) {
    where.loginName = {
      contains: loginName
    };
  }

  if (phone) {
    where.phone = {
      contains: phone
    };
  }

  if (status) {
    where.status = Number(status);
  }

  const users = await getUserListModel(where, Number(current), Number(pageSize));

  formatFields(users, [
    { fromField: "loginAt", toField: "loginTime" },
    { fromField: "createdAt", toField: "createTime" },
    { fromField: "updatedAt", toField: "updateTime" }
  ]);

  const data = users.map((item: any) => {
    const newItem = { ...item };
    delete newItem.password;
    return newItem;
  });

  let pagination: Pagination;
  if (pageSize !== "0") {
    const total = await getUserCountModel(where);
    pagination = {
      current: Number(current),
      pageSize: Number(pageSize),
      total
    };
  }
  ctx.body = response.success("获取成功！", data, { pagination });
  return;
};

// 获取单个管理员
export const getUserController = async (ctx: any) => {
  const { userId } = UserIdSchema.parse(ctx.params);
  const user = await getUserByIdModel(Number(userId));
  if (!user) {
    ctx.body = response.error("用户不存在！");
    return;
  }

  const { password, ...result } = user;
  const e = await getEnforcer();
  const roleIds = await e.getRolesForUser(`${user.userId}`);
  (result as any).roleIds = roleIds.map((item) => Number(item));
  ctx.body = response.success("获取成功！", result);
};

// 添加管理员
export const addUserController = async (ctx: any) => {
  return saveUser(ctx, null);
};

// 修改管理员
export const updateUserController = async (ctx: any) => {
  const { userId } = ctx.params;
  return saveUser(ctx, userId);
};

// 保存管理员，添加修改逻辑合二为一
const saveUser = async (ctx: any, userId: string | null) => {
  const body = UserSaveSchema.parse(ctx.request.body);
  const {
    loginName,
    email,
    phone,
    nickname,
    realname,
    password,
    gender,
    birthday,
    avatar,
    loginIp,
    loginTime,
    status,
    remark,
    roleIds
  } = body;

  const userModel = await getUserModel({ loginName });
  if (userModel) {
    if (userId === null) {
      ctx.body = response.error("登录用户名已存在！");
      return;
    } else if (userModel.userId !== Number(userId)) {
      // 编辑时，如果用户名相同，则不报错
      ctx.body = response.error("登录用户名已存在！");
      return;
    }
  }

  // 新增用户密码不能为空
  if (userId === null && !password) {
    ctx.body = response.error("密码不能为空！");
    return;
  }

  if (phone) {
    const userModel = await getUserModel({ phone });
    if (userModel) {
      if (userId === null) {
        ctx.body = response.error("手机号已存在！");
        return;
      } else if (userModel.userId !== Number(userId)) {
        ctx.body = response.error("手机号已存在！");
        return;
      }
    }
  }

  if (email) {
    const userModel = await getUserModel({ email });
    if (userModel) {
      if (userId === null) {
        ctx.body = response.error("邮箱已存在！");
        return;
      } else if (userModel.userId !== Number(userId)) {
        ctx.body = response.error("邮箱已存在！");
        return;
      }
    }
  }

  let salt;
  let hashPwd;
  if (userId !== null) {
    const exist = await getUserByIdModel(Number(userId));
    if (!exist) {
      ctx.body = response.error("用户不存在！");
      return;
    }
    salt = exist.salt;
    hashPwd = exist.password;
    if (password) {
      salt = generateSalt();
      hashPwd = await hashPassword(password + salt);
    }
  } else {
    salt = generateSalt();
    hashPwd = await hashPassword(password + salt);
  }

  const data = {
    loginName,
    email,
    phone: phone && `${phone}`,
    nickname,
    realname,
    password: hashPwd,
    salt,
    gender,
    birthday: birthday ? Number(birthday) : undefined,
    userType: 1,
    avatar,
    loginIp,
    loginTime,
    status: Number(status),
    remark,
    createdAt: now(),
    updatedAt: now()
  };

  let user = null;
  let msg = "";
  if (userId !== null) {
    user = await updateUserModel(Number(userId), data);
    msg = "修改成功！";
  } else {
    user = await createUserModel(data);
    msg = "添加成功！";
  }

  // 分配角色
  if (roleIds) {
    const e = await getEnforcer();
    for (const roleId of roleIds) {
      e.addRoleForUser(`${user.userId}`, `${roleId}`);
    }
    await e.savePolicy();
  }
  ctx.body = response.success(msg, user);
};

// 删除管理员
export const deleteUserController = async (ctx: any) => {
  const { userId } = UserIdSchema.parse(ctx.params);
  const numberUserId = Number(userId);

  const exist = await getUserByIdModel(numberUserId);
  if (!exist) {
    ctx.body = response.error("用户不存在！");
    return;
  }

  const user = await deleteUserModel(numberUserId);
  ctx.body = response.success("删除成功！", user);
  return;
};
