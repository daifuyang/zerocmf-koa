import { formatFields, now } from "@/lib/date";
import response from "@/lib/response";
import { generateSalt, hashPassword } from "@/lib/util";
import {
  createUserModel,
  deleteUserModel,
  getUserById,
  getUserCount,
  getUserModel,
  getUsersModel,
  updateUserModel
} from "@/models/user";

// 获取管理员列表
export const getUsers = async (ctx: any) => {
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

  const users = await getUsersModel(Number(current), Number(pageSize), where);

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
export const getUser = async (ctx: any) => {
  const { id } = ctx.params;
  if (!id) {
    ctx.body = response.error("参数错误！");
    return;
  }
  const user = await getUserById(Number(id));
  if (!user) {
    ctx.body = response.error("用户不存在！");
    return;
  }
  ctx.body = response.success("获取成功！", user);
};

// 添加管理员
export const addUser = async (ctx: any) => {
  const {
    loginName,
    email,
    phone,
    nickname,
    realName,
    password,
    gender,
    birthday,
    avatar,
    loginIp,
    loginTime,
    status
  } = ctx.request.body;

  if (!loginName) {
    ctx.body = response.error("登录用户名不能为空！");
    return;
  }

  const userModel = await getUserModel({ loginName });
  if (userModel) {
    ctx.body = response.error("登录用户名已存在！");
    return;
  }

  if (!password) {
    ctx.body = response.error("密码不能为空！");
    return;
  }

  if (phone) {
    const userModel = await getUserModel({ phone });
    if (userModel) {
      ctx.body = response.error("手机号已存在！");
      return;
    }
  }

  if (email) {
    const userModel = await getUserModel({ email });
    if (userModel) {
      ctx.body = response.error("邮箱已存在！");
      return;
    }
  }

  const salt = generateSalt();
  const hashPwd = await hashPassword(password + salt);

  const data = {
    loginName,
    email,
    phone: phone && `${phone}`,
    nickname,
    realName,
    password: hashPwd,
    gender,
    birthday,
    userType: 1,
    avatar,
    loginIp,
    loginTime,
    status,
    createdAt: now(),
    updatedAt: now()
  };

  const user = await createUserModel(data);
  ctx.body = response.success("添加成功！", user);
};

// 修改管理员
export const updateUser = async (ctx: any) => {
  const { id } = ctx.params;
  const {
    loginName,
    email,
    phone,
    nickname,
    realName,
    password,
    gender,
    birthday,
    userType,
    avatar,
    loginIp,
    loginTime,
    status
  } = ctx.request.body;

  if (!loginName) {
    ctx.body = response.error("登录用户名不能为空！");
    return;
  }

  const userModel = await getUserModel({ loginName });
  if (userModel && userModel.id !== Number(id)) {
    ctx.body = response.error("登录用户名已存在！");
    return;
  }

  if (!password) {
    ctx.body = response.error("密码不能为空！");
    return;
  }

  if (phone) {
    const userModel = await getUserModel({ phone });
    if (userModel && userModel.id !== Number(id)) {
      ctx.body = response.error("手机号已存在！");
      return;
    }
  }

  const exist = await getUserById(Number(id));
  if (!exist) {
    ctx.body = response.error("用户不存在！");
    return;
  }

  const salt = generateSalt();
  const hashPwd = await hashPassword(password + salt);

  const data = {
    loginName,
    email,
    phone: `${phone}`,
    nickname,
    realName,
    password: hashPwd,
    gender,
    birthday,
    userType,
    avatar,
    loginIp,
    loginTime,
    status,
    createdAt: now(),
    updatedAt: now()
  };

  const user = await updateUserModel(Number(id), data);
  ctx.body = response.success("修改成功！", user);
};

// 删除管理员
export const deleteUser = async (ctx: any) => {
  const { id } = ctx.params;

  if (!id) {
    ctx.body = response.error("参数错误！");
    return;
  }

  const exist = await getUserById(Number(id));
  if (!exist) {
    ctx.body = response.error("用户不存在！");
    return;
  }

  const user = await deleteUserModel(Number(id));
  ctx.body = response.success("删除成功！", user);
};
