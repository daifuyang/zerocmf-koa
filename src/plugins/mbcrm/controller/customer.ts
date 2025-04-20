import { parseJson, parseQuery } from "@/lib/request";
import { Context } from "koa";
import {
  createCustomer,
  getCustomerById,
  getCustomerCount,
  getCustomerList,
  getCustomerStatusOptions,
  updateCustomer,
  deleteCustomer
} from "../models/customer";
import response from "@/lib/response";
import { formatField, formatFields, now } from "@/lib/date";
import { PrismaClient } from "@prisma/client";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { getCurrentUser } from "@/lib/userinfo";

// Zod验证schema
const customerSchema = z.object({
  name: z.string().min(1, "会员名称不能为空"),
  birthDate: z.string().min(1, "出生日期不能为空"),
  gender: z.string().min(1, "性别不能为空"),
  province: z.string().min(1, "省份不能为空"),
  city: z.string().min(1, "城市不能为空"),
  district: z.string().min(1, "区县不能为空"),
  address: z.string().min(1, "详细地址不能为空"),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  wechat: z.string().optional(),
  qq: z.string().optional(),
  project: z.string().optional(),
  status: z.number().int().min(0).max(4).default(0),
  remark: z.string().optional(),
  operator: z.number().int().optional()
});

// 获取客户列表
export async function getCustomerListController(ctx: Context) {
  const query = ctx.query || {};
  const { current, pageSize, name, mobile, status } = parseQuery(query);

  // 构建查询条件
  const where: any = {};

  if (name) {
    where.name = { contains: name };
  }

  if (mobile) {
    where.mobile = { contains: mobile };
  }

  if (status !== undefined) {
    where.status = Number(status);
  }

  // 查询总数
  const total = await getCustomerCount(where);

  // 查询客户列表
  const list = await getCustomerList(current, pageSize, where);

  // 格式化字段
  formatFields(list, [
    { fromField: "createdAt", toField: "createdTime" },
    { fromField: "updatedAt", toField: "updatedTime" },
    { fromField: "birthDate", toField: "birthDateStr", format: "YYYY-MM-DD" }
  ]);

  // 返回结果
  ctx.body = response.success("获取成功", {
    total,
    data: list,
    current,
    pageSize,
    statusOptions: getCustomerStatusOptions()
  });
}

// 获取客户详情
export async function getCustomerController(ctx: Context) {
  const { customerId } = ctx.params;
  const customerIdNumber = Number(customerId);

  if (isNaN(customerIdNumber)) {
    ctx.body = response.error("参数错误");
    return;
  }

  const customer = await getCustomerById(customerIdNumber);

  if (!customer) {
    ctx.body = response.error("客户不存在");
    return;
  }

  formatField(customer, [
    { fromField: "createdAt", toField: "createdTime" },
    { fromField: "updatedAt", toField: "updatedTime" },
    { fromField: "birthDate", toField: "birthDateStr", format: "YYYY-MM-DD" }
  ]);

  ctx.body = response.success("获取成功", customer);
}

// 保存客户信息
export async function saveCustomer(ctx: Context, customerId: number | null) {
  const { userId, loginName } = getCurrentUser(ctx);

  try {
    const json = await parseJson(ctx);

    // 验证输入数据
    const validatedData = customerSchema.parse(json);

    // 处理操作客服逻辑
    const operatorData = { connect: { userId } };

    const creatorData = {
      connect: { userId }
    };

    const edit = customerId !== null;
    let msg = null;

    const result = await prisma.$transaction(async (tx: PrismaClient) => {
      let customer = null;

      if (edit) {
        customer = await updateCustomer(
          customerId,
          {
            ...validatedData,
            operator: operatorData,
            updatedId: userId,
            updatedBy: loginName,
            updatedAt: now()
          },
          tx
        );
        msg = "更新成功";
      } else {
        customer = await createCustomer(
          {
            name: validatedData.name,
            birthDate: validatedData.birthDate,
            gender: validatedData.gender,
            province: validatedData.province,
            city: validatedData.city,
            district: validatedData.district,
            address: validatedData.address,
            phone: validatedData.phone,
            mobile: validatedData.mobile,
            wechat: validatedData.wechat,
            qq: validatedData.qq,
            project: validatedData.project,
            status: validatedData.status,
            remark: validatedData.remark,
            operator: operatorData,
            creator: creatorData,
            createdBy: loginName,
            createdAt: now(),
            updatedId: userId,
            updatedBy: loginName,
            updatedAt: now()
          },
          tx
        );
        msg = "创建成功";
      }
      return customer;
    });

    ctx.body = response.success(msg, result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      ctx.body = response.error(error.errors[0].message);
    } else {
      ctx.body = response.error(error.message);
    }
  }
}

// 创建客户
export async function createCustomerController(ctx: Context) {
  await saveCustomer(ctx, null);
}

// 更新客户
export async function updateCustomerController(ctx: Context) {
  const { customerId } = ctx.params;
  const customerIdNumber = Number(customerId);

  if (isNaN(customerIdNumber)) {
    ctx.body = response.error("参数错误");
    return;
  }

  const exist = await getCustomerById(customerIdNumber);
  if (!exist) {
    ctx.body = response.error("客户不存在");
    return;
  }

  await saveCustomer(ctx, customerIdNumber);
}

// 删除客户
export async function deleteCustomerController(ctx: Context) {
  const { customerId } = ctx.params;
  const customerIdNumber = Number(customerId);

  if (isNaN(customerIdNumber)) {
    ctx.body = response.error("参数错误");
    return;
  }

  const exist = await getCustomerById(customerIdNumber);
  if (!exist) {
    ctx.body = response.error("客户不存在");
    return;
  }

  await deleteCustomer(customerIdNumber);
  ctx.body = response.success("删除成功");
}
