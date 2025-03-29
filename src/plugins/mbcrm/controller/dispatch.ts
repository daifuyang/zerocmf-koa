import { parseJson, parseQuery } from "@/lib/request";
import { Context } from "koa";
import {
  createDispatch,
  getDispatchById,
  getDispatchCount,
  getDispatchList,
  updateDispatch,
  deleteDispatch
} from "../models/dispatch";
import response from "@/lib/response";
import { formatField, formatFields, now } from "@/lib/date";
import { PrismaClient } from "@prisma/client";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Zod验证schema
const dispatchSchema = z.object({
  hospitalId: z.number().int().min(1, "医院ID不能为空"),
  customerId: z.number().int().min(1, "客户ID不能为空"),
  project: z.string().min(1, "整形项目不能为空"),
  dispatchTime: z.number().int().min(0).default(now()),
  dispatcherId: z.number().int().min(1, "派单客服ID不能为空"),
  status: z.number().int().min(0).max(4).default(0),
  message: z.string().optional()
});

// 获取派单列表
export async function getDispatchListController(ctx: Context) {
  const query = ctx.query || {};
  const { current, pageSize, hospitalId, customerId, status } = parseQuery(query);

  // 构建查询条件
  const where: any = {};

  if (hospitalId) {
    where.hospitalId = Number(hospitalId);
  }

  if (customerId) {
    where.customerId = Number(customerId);
  }

  if (status !== undefined) {
    where.status = Number(status);
  }

  // 查询总数
  const total = await getDispatchCount(where);

  // 查询派单列表
  const list = await getDispatchList(where, current, pageSize);

  // 格式化字段
  formatFields(list, [
    { fromField: "createdAt", toField: "createdTime" },
    { fromField: "updatedAt", toField: "updatedTime" },
    { fromField: "dispatchTime", toField: "dispatchTimeStr" }
  ]);

  // 返回结果
  ctx.body = response.success("获取成功", { 
    total, 
    data: list, 
    current, 
    pageSize
  });
}

// 获取派单详情
export async function getDispatchController(ctx: Context) {
  const { dispatchId } = ctx.params;
  const dispatchIdNumber = Number(dispatchId);
  
  if (isNaN(dispatchIdNumber)) {
    ctx.body = response.error("参数错误");
    return;
  }

  const dispatch = await getDispatchById(dispatchIdNumber);

  if (!dispatch) {
    ctx.body = response.error("派单不存在");
    return;
  }

  formatField(dispatch, [
    { fromField: "createdAt", toField: "createdTime" },
    { fromField: "updatedAt", toField: "updatedTime" },
    { fromField: "dispatchTime", toField: "dispatchTimeStr" }
  ]);

  ctx.body = response.success("获取成功", dispatch);
}

// 创建派单
export async function createDispatchController(ctx: Context) {
  const { userId, loginName } = ctx.state.user;

  try {
    const json = await parseJson(ctx);
    
    // 验证输入数据
    const validatedData = dispatchSchema.parse(json);

    const result = await prisma.$transaction(async (tx: PrismaClient) => {
      // 检查关联记录是否存在
      const [hospital, customer, dispatcher] = await Promise.all([
        tx.mbcrmHospital.findUnique({ where: { hospitalId: validatedData.hospitalId } }),
        tx.mbcrmCustomer.findUnique({ where: { customerId: validatedData.customerId } }),
        tx.sysUser.findUnique({ where: { userId: validatedData.dispatcherId } })
      ]);

      if (!hospital) {
        throw new Error("医院不存在");
      }
      if (!customer) {
        throw new Error("客户不存在");
      }
      if (!dispatcher) {
        throw new Error("派单客服不存在");
      }

      const dispatch = await createDispatch(
        {
          project: validatedData.project,
          dispatchTime: validatedData.dispatchTime,
          status: validatedData.status,
          message: validatedData.message,
          hospital: { connect: { hospitalId: validatedData.hospitalId } },
          customer: { connect: { customerId: validatedData.customerId } },
          dispatcher: { connect: { userId: validatedData.dispatcherId } },
          createdId: userId,
          createdBy: loginName,
          updatedId: userId,
          updatedBy: loginName
        },
        tx
      );
      return dispatch;
    });

    ctx.body = response.success("创建成功", result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      ctx.body = response.error(error.errors[0].message);
    } else {
      ctx.body = response.error(error.message);
    }
  }
}

// 更新派单
export async function updateDispatchController(ctx: Context) {
  const { dispatchId } = ctx.params;
  const dispatchIdNumber = Number(dispatchId);
  const { userId, loginName } = ctx.state.user;
  
  if (isNaN(dispatchIdNumber)) {
    ctx.body = response.error("参数错误");
    return;
  }

  const exist = await getDispatchById(dispatchIdNumber);
  if (!exist) {
    ctx.body = response.error("派单不存在");
    return;
  }

  try {
    const json = await parseJson(ctx);
    
    // 验证输入数据
    const validatedData = dispatchSchema.parse(json);

    const result = await prisma.$transaction(async (tx: PrismaClient) => {
      const dispatch = await updateDispatch(
        dispatchIdNumber,
        {
          ...validatedData,
          updatedId: userId,
          updatedBy: loginName
        },
        tx
      );
      return dispatch;
    });

    ctx.body = response.success("更新成功", result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      ctx.body = response.error(error.errors[0].message);
    } else {
      ctx.body = response.error(error.message);
    }
  }
}

// 删除派单
export async function deleteDispatchController(ctx: Context) {
  const { dispatchId } = ctx.params;
  const dispatchIdNumber = Number(dispatchId);
  
  if (isNaN(dispatchIdNumber)) {
    ctx.body = response.error("参数错误");
    return;
  }

  const exist = await getDispatchById(dispatchIdNumber);
  if (!exist) {
    ctx.body = response.error("派单不存在");
    return;
  }

  await deleteDispatch(dispatchIdNumber);
  ctx.body = response.success("删除成功");
}
