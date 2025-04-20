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

import { getUserModel, createUserModel, updateUserModel } from "@/cmf/models/user";
import { hashPassword, generateSalt } from "@/lib/utils";

// 定义医院验证schema
const hospitalSchema = z.object({
  loginName: z.string().min(1, "用户名不能为空"),
  password: z.string().min(6, "密码不能少于6个字符"),
  hospitalName: z.string().min(1, "医院名称不能为空"),
  email: z.string().email("请输入有效的邮箱地址")
});

// 定义更新医院验证schema
const updateHospitalSchema = hospitalSchema.partial().extend({
  hospitalName: z.string().min(1, "医院名称不能为空"),
  email: z.string().email("请输入有效的邮箱地址")
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
  const hospital = await getHospitalById(hospitalIdNumber, {
    include: {
      user: {
        select: {
          userId: true,
          loginName: true
        }
      }
    }
  });

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

// 处理用户创建/更新逻辑
async function handleUserCreation(loginName: string, password: string, email: string) {
  let userInfo = await getUserModel({ loginName });
  let userId: number;

  if (userInfo) {
    userId = userInfo.userId;
    // 更新用户密码
    const salt = generateSalt();
    const hashedPassword = await hashPassword(`${password}${salt}`);
    await updateUserModel(userId, {
      password: hashedPassword,
      salt,
      email,
      updatedAt: now()
    });
  } else {
    // 创建新用户
    const salt = generateSalt();
    const hashedPassword = await hashPassword(`${password}${salt}`);
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
    const newUser = await createUserModel(userData);
    userId = newUser.userId;
  }

  return userId;
}

// 构建医院数据
function buildHospitalData(
  requestData,
  isUpdate = false
): Prisma.MbcrmHospitalCreateInput | Prisma.MbcrmHospitalUpdateInput {
  const {
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
    createId,
    status
  } = requestData;

  const baseData = {
    hospitalName,
    email,
    province,
    city,
    district,
    address,
    phone: phone || "",
    avgPrice: avgPrice ? parseFloat(avgPrice) : null,
    website: website || "",
    hospitalType: hospitalType || 0,
    contactName: contactName || "",
    contactPhone: contactPhone || "",
    contactQQ: contactQQ || "",
    contactWechat: contactWechat || "",
    frontName: frontName || "",
    frontPhone: frontPhone || "",
    frontQQ: frontQQ || "",
    frontWechat: frontWechat || "",
    busStation: busStation || "",
    busRoute: busRoute || "",
    metroStation: metroStation || "",
    metroRoute: metroRoute || "",
    memberDiscount: memberDiscount || "",
    rebate: rebate ? parseFloat(rebate) : null,
    introduction: introduction || "",
    status: status || 1,
    createId
  };

  if (isUpdate) {
    return {
      ...baseData,
      updatedAt: now()
    };
  } else {
    return {
      ...baseData,
      createdAt: now()
    };
  }
}

// 保存医院信息（创建或更新）
async function saveHospital(ctx: Context, isUpdate = false) {
  const { userId: createdId } = getCurrentUser(ctx);
  const requestData = parseJson(ctx);
  const { loginName, password } = requestData;

  // 使用Zod验证数据
  const schema = isUpdate ? updateHospitalSchema : hospitalSchema;
  const validationResult = schema.safeParse(requestData);
  if (!validationResult.success) {
    const errorMessage = validationResult.error.errors[0]?.message || "数据验证失败";
    ctx.body = response.error(errorMessage);
    return null;
  }

  // 处理用户信息
  let userId: number | undefined;
  if (loginName && password) {
    try {
      userId = await handleUserCreation(loginName, password, requestData.email);
    } catch (error) {
      console.error("处理用户信息失败:", error);
      ctx.body = response.error("处理用户信息失败！");
      return null;
    }
  }

  requestData.createdId = createdId;

  // 构建医院数据
  const hospitalData = buildHospitalData(requestData, isUpdate);

  // 如果是更新操作且提供了用户ID，更新用户关联
  if (!isUpdate && userId) {
    (hospitalData as Prisma.MbcrmHospitalUpdateInput).user = {
      connect: { userId }
    };
  }

  return hospitalData;
}

// 创建医院
export async function createHospitalController(ctx: Context) {
  const hospitalData = await saveHospital(ctx);
  if (!hospitalData) return;

  try {
    const hospital = await createHospital(hospitalData as Prisma.MbcrmHospitalCreateInput);
    ctx.body = response.success("创建成功！", hospital);
  } catch (error) {
    console.error("创建医院失败:", error);
    ctx.body = response.error("创建失败！");
  }
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

  const hospitalData = await saveHospital(ctx, true);
  if (!hospitalData) return;

  try {
    const updatedHospital = await updateHospital(
      hospitalIdNumber,
      hospitalData as Prisma.MbcrmHospitalUpdateInput
    );
    ctx.body = response.success("更新成功！", updatedHospital);
  } catch (error) {
    console.error("更新医院失败:", error);
    ctx.body = response.error("更新失败！");
  }
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
