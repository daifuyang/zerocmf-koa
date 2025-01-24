import { getEnforcer } from "@/casbin";
import { formatFields, now } from "@/lib/date";
import response from "@/lib/response";
import { generateSalt, hashPassword } from "@/lib/util";
import {
  createUser,
  deleteUser,
  getUserById,
  getUserCount,
  getUser,
  getUserList,
  updateUser
} from "../../models/user";

// 获取管理员列表
export const getUsersController = async (ctx: any) => {
  // 获取查询参数
  const query = ctx.query || {};
  const { current = "1", pageSize = "10", loginName = "", phone = "", status } = query;

  const where: {
    userType: 1;
    loginName?: any;
    phone?: any;
    status?: any;
  } = {
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

  const users = await getUserList(Number(current), Number(pageSize), where);

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

  let pagination = {};
  if (pageSize === "0") {
    pagination = data;
  } else {
    const total = await getUserCount(where);
    pagination = {
      page: Number(current),
      pageSize: Number(pageSize),
      total,
      data: data
    };
  }
  ctx.body = response.success("获取成功！", pagination);
  return;
};

// 获取单个管理员
export const getUserController = async (ctx: any) => {
  const { userId } = ctx.params;
  if (!userId) {
    ctx.body = response.error("参数错误！");
    return;
  }
  const user = await getUserById(Number(userId));
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
  } = ctx.request.body;

  if (!loginName) {
    ctx.body = response.error("登录用户名不能为空！");
    return;
  }

  const userModel = await getUser({ loginName });
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
    const userModel = await getUser({ phone });
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
    const userModel = await getUser({ email });
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

  const salt = generateSalt();
  const hashPwd = await hashPassword(password + salt);

  // 编辑逻辑
  if (userId !== null) {
    const exist = await getUserById(Number(userId));
    if (!exist) {
      ctx.body = response.error("用户不存在！");
      return;
    }
    let salt = exist.salt;
    let hashPwd = exist.password;
    if (!password) {
      salt = generateSalt();
      hashPwd = await hashPassword(password + salt);
    }
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
    birthday,
    userType: 1,
    avatar,
    loginIp,
    loginTime,
    status,
    remark,
    createdAt: now(),
    updatedAt: now()
  };

  let user = null;
  let msg = "";
  if (userId !== null) {
    user = await updateUser(Number(userId), data);
    msg = "修改成功！";
  } else {
    user = await createUser(data);
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
  const { userId } = ctx.params;

  if (!userId) {
    ctx.body = response.error("参数错误！");
    return;
  }

  const numberUserId = Number(userId);
  if (isNaN(numberUserId)) {
    ctx.body = response.error("参数错误！");
    return;
  }

  const exist = await getUserById(numberUserId);
  if (!exist) {
    ctx.body = response.error("用户不存在！");
    return;
  }

  const user = await deleteUser(numberUserId);
  ctx.body = response.success("删除成功！", user);
  return;
};
