import { parseJson, parseQuery } from "@/lib/request";
import { Context } from "koa";
import response from "@/lib/response";
import {
  createHospital,
  getHospitalById,
  getHospitalCount,
  getHospitalList,
  updateHospital,
  deleteHospital
} from "../models/hospital";
import { formatField, formatFields, now } from "@/lib/date";
import { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/userinfo";
import { z } from "zod";

// 定义医院验证schema
const hospitalSchema = z.object({
  loginName: z.string().min(1, "用户名不能为空"),
  password: z.string().min(6, "密码不能少于6个字符"),
  hospitalName: z.string().min(1, "医院名称不能为空"),
  email: z.string().email("请输入有效的邮箱地址"),
  province: z.string().min(1, "省份不能为空"),
  city: z.string().min(1, "城市不能为空"),
  district: z.string().min(1, "区域不能为空"),
  address: z.string().min(1, "详细地址不能为空"),
  phone: z.string().optional(),
  avgPrice: z.number().optional().nullable(),
  website: z.string().optional(),
  hospitalType: z.number().optional(),
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),
  contactQQ: z.string().optional(),
  contactWechat: z.string().optional(),
  frontName: z.string().optional(),
  frontPhone: z.string().optional(),
  frontQQ: z.string().optional(),
  frontWechat: z.string().optional(),
  busStation: z.string().optional(),
  busRoute: z.string().optional(),
  metroStation: z.string().optional(),
  metroRoute: z.string().optional(),
  memberDiscount: z.string().optional(),
  rebate: z.number().optional().nullable(),
  introduction: z.string().optional(),
  status: z.number().optional()
});

// 定义更新医院验证schema
const updateHospitalSchema = hospitalSchema.partial().extend({
  hospitalName: z.string().min(1, "医院名称不能为空"),
  email: z.string().email("请输入有效的邮箱地址"),
  province: z.string().min(1, "省份不能为空"),
  city: z.string().min(1, "城市不能为空"),
  district: z.string().min(1, "区域不能为空"),
  address: z.string().min(1, "详细地址不能为空")
});

// 获取医院列表
export async function getHospitalListController(ctx: Context) {
  const query = ctx.query || {};
  const { current, pageSize, hospitalName } = parseQuery(query);

  // 动态构建查询条件
  const where: Prisma.MbcrmHospitalWhereInput = {};

  // 如果 name 存在，添加到查询条件
  if (hospitalName) {
    where.hospitalName = { contains: hospitalName };
  }

  // 查询总数
  const total = await getHospitalCount(where);

  // 查询医院列表
  const list = await getHospitalList(where, current, pageSize);

  // 格式化字段
  formatFields(list, [
    { fromField: "createdAt", toField: "createdTime" },
    { fromField: "updatedAt", toField: "updatedTime" }
  ]);

  // 返回结果
  ctx.body = response.success("获取成功！", { total, data: list, current, pageSize });
  return;
}

// 获取医院详情
export async function getHospitalController(ctx: Context) {
  const { hospitalId } = ctx.params;
  const hospitalIdNumber = Number(hospitalId);
  if (isNaN(hospitalIdNumber)) {
    ctx.body = response.error("参数错误！");
    return;
  }
  const hospital = await getHospitalById(hospitalIdNumber);

  if (!hospital) {
    ctx.body = response.error("医院不存在！");
    return;
  }

  // 格式化字段
  formatField(hospital, [
    { fromField: "createdAt", toField: "createdTime" },
    { fromField: "updatedAt", toField: "updatedTime" }
  ]);

  ctx.body = response.success("获取成功！", hospital);
  return;
}

// 创建医院
export async function createHospitalController(ctx: Context) {
    const { userId: createdId } = getCurrentUser(ctx);
  // 获取请求体数据
  const requestData = parseJson(ctx.request.body);
  const {
    loginName, // 新增用户名参数
    password, // 新增密码参数
    hospitalName,
    email, // 医院推送邮箱
    province,
    city,
    district,
    address,
    phone,
    avgPrice,
    website,
    hospitalType,
    contactName,
    contactPhone,
    contactQQ,
    contactWechat,
    frontName,
    frontPhone,
    frontQQ,
    frontWechat,
    busStation,
    busRoute,
    metroStation,
    metroRoute,
    memberDiscount,
    rebate,
    introduction,
    status
  } = requestData;

  // 使用Zod验证数据
  const validationResult = hospitalSchema.safeParse(requestData);
  if (!validationResult.success) {
    const errorMessage = validationResult.error.errors[0]?.message || "数据验证失败";
    ctx.body = response.error(errorMessage);
    return;
  }

  // 导入用户相关模块
  const { getUser, createUser } = await import("@/cmf/models/user");
  const { hashPassword, generateSalt } = await import("@/lib/utils");

  // 查找用户是否存在，如果不存在则创建新用户
  let userId;
  let userInfo = await getUser({ loginName });

  if (userInfo) {
    userId = userInfo.userId;
  } else {
    // 生成密码盐
    const salt = generateSalt();
    // 加密密码
    const hashedPassword = await hashPassword(`${password}${salt}`);

    // 创建新用户
    const userData = {
      loginName,
      password: hashedPassword,
      salt,
      email,
      userType: 1, // 管理员
      status: 1, // 正常
      createdAt: now(),
      updatedAt: now(),
      deletedAt: 0
    };

    const newUser = await createUser(userData);
    userId = newUser.userId;
  }

  // 创建医院数据
  const hospitalData: Prisma.MbcrmHospitalCreateInput = {
    hospitalName,
    email: email,
    province: province,
    city: city,
    district: district,
    address: address,
    phone: phone || "",
    avgPrice: avgPrice ? parseFloat(avgPrice) : null,
    website: website || "",
    hospitalType: hospitalType || 0,

    // 就医联系人信息
    contactName: contactName || "",
    contactPhone: contactPhone || "",
    contactQQ: contactQQ || "",
    contactWechat: contactWechat || "",

    // 前台联系人信息
    frontName: frontName || "",
    frontPhone: frontPhone || "",
    frontQQ: frontQQ || "",
    frontWechat: frontWechat || "",

    // 交通信息
    busStation: busStation || "",
    busRoute: busRoute || "",
    metroStation: metroStation || "",
    metroRoute: metroRoute || "",

    // 其他信息
    memberDiscount: memberDiscount || "",
    rebate: rebate ? parseFloat(rebate) : null,
    introduction: introduction || "",

    // 系统字段
    status: status || 1,
    createdId,
    createdAt: now(),
    // 用户关联 - 使用新创建的用户或已存在的用户ID
    user: { connect: { userId } }
  };

  try {
    const hospital = await createHospital(hospitalData);
    ctx.body = response.success("创建成功！", hospital);
  } catch (error) {
    console.error("创建医院失败:", error);
    ctx.body = response.error("创建失败！");
  }
  return;
}

// 更新医院
export async function updateHospitalController(ctx: Context) {
  const { hospitalId } = ctx.params;
  const hospitalIdNumber = Number(hospitalId);
  if (isNaN(hospitalIdNumber)) {
    ctx.body = response.error("参数错误！");
    return;
  }

  // 检查医院是否存在
  const hospital = await getHospitalById(hospitalIdNumber);
  if (!hospital) {
    ctx.body = response.error("医院不存在！");
    return;
  }

  // 获取请求体数据
  const requestData = parseJson(ctx.request.body);
  const {
    loginName, // 新增用户名参数
    password, // 新增密码参数
    hospitalName,
    email,
    province,
    city,
    district,
    address,
    phone,
    avgPrice,
    website,
    hospitalType,
    contactName,
    contactPhone,
    contactQQ,
    contactWechat,
    frontName,
    frontPhone,
    frontQQ,
    frontWechat,
    busStation,
    busRoute,
    metroStation,
    metroRoute,
    memberDiscount,
    rebate,
    introduction,
    status
  } = requestData;

  // 使用Zod验证数据
  const validationResult = updateHospitalSchema.safeParse(requestData);
  if (!validationResult.success) {
    const errorMessage = validationResult.error.errors[0]?.message || "数据验证失败";
    ctx.body = response.error(errorMessage);
    return;
  }

  // 初始化医院数据
  let hospitalData: Prisma.MbcrmHospitalUpdateInput = {
    hospitalName,
    email,
    province,
    city,
    district,
    address,
    phone,
    avgPrice: avgPrice ? parseFloat(avgPrice) : undefined,
    website,
    hospitalType,

    // 就医联系人信息
    contactName,
    contactPhone,
    contactQQ,
    contactWechat,

    // 前台联系人信息
    frontName,
    frontPhone,
    frontQQ,
    frontWechat,

    // 交通信息
    busStation,
    busRoute,
    metroStation,
    metroRoute,

    // 其他信息
    memberDiscount,
    rebate: rebate ? parseFloat(rebate) : undefined,
    introduction,

    // 系统字段
    status,
    updatedAt: now()
  };

  // 如果提供了用户名和密码，则更新或创建用户
  if (loginName && password) {
    const { getUser, createUser, updateUser } = await import("@/cmf/models/user");
    const { hashPassword, generateSalt } = await import("@/lib/utils");

    // 查找用户是否存在
    let userInfo = await getUser({ loginName });

    // 生成密码盐和加密密码
    const salt = generateSalt();
    const hashedPassword = await hashPassword(`${password}${salt}`);

    if (userInfo) {
      // 更新用户信息
      await updateUser(userInfo.userId, {
        password: hashedPassword,
        salt,
        email,
        updatedAt: now()
      });
    } else {
      // 创建新用户
      const userData = {
        loginName,
        password: hashedPassword,
        salt,
        email,
        userType: 1, // 管理员
        status: 1, // 正常
        createdAt: now(),
        updatedAt: now(),
        deletedAt: 0
      };

      const newUser = await createUser(userData);

      // 更新医院用户关联
      hospitalData = {
        ...hospitalData,
        user: { connect: { userId: newUser.userId } }
      };
    }
  }

  try {
    const updatedHospital = await updateHospital(hospitalIdNumber, hospitalData);
    ctx.body = response.success("更新成功！", updatedHospital);
  } catch (error) {
    console.error("更新医院失败:", error);
    ctx.body = response.error("更新失败！");
  }
  return;
}

// 删除医院
export async function deleteHospitalController(ctx: Context) {
  const { hospitalId } = ctx.params;
  const hospitalIdNumber = Number(hospitalId);
  if (isNaN(hospitalIdNumber)) {
    ctx.body = response.error("参数错误！");
    return;
  }

  // 检查医院是否存在
  const hospital = await getHospitalById(hospitalIdNumber);
  if (!hospital) {
    ctx.body = response.error("医院不存在！");
    return;
  }

  try {
    await deleteHospital(hospitalIdNumber);
    ctx.body = response.success("删除成功！");
  } catch (error) {
    console.error("删除医院失败:", error);
    ctx.body = response.error("删除失败！");
  }
  return;
}
