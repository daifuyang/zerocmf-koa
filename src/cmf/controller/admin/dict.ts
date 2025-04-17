import { Context } from "koa";
import response from "@/lib/response";
import {
  getDictTypeListService,
  getDictTypeInfoService,
  saveDictTypeService,
  deleteDictTypeService,
  DictRequest // 导入服务层定义的接口
} from "@/cmf/services/dict";
import { SysUser } from "@prisma/client";

// 获取字典类型列表
export const getDictTypeListController = async (ctx: Context) => {
  try {
    const { dictName, dictType, status, current = 1, pageSize = 10 } = ctx.query;
    const result = await getDictTypeListService(
      dictName as string,
      dictType as string,
      status as string,
      parseInt(current as string),
      parseInt(pageSize as string)
    );
    ctx.body = response.success("获取成功", result);
  } catch (err: any) {
    ctx.body = response.error(err.message || "获取失败");
  }
};

// 获取字典类型详情
export const getDictTypeInfoController = async (ctx: Context) => {
  try {
    const { dictId } = ctx.params;
    const dictType = await getDictTypeInfoService(parseInt(dictId));
    ctx.body = response.success("获取成功", dictType);
  } catch (err: any) {
    ctx.body = response.error(err.message || "获取失败");
  }
};

// 保存字典类型（创建/更新）
const saveDictType = async (ctx: Context, dictId?: number) => {
  try {
    const body = ctx.request.body as DictRequest;
    const user = ctx.state.user as SysUser;
    const result = await saveDictTypeService(body, user, dictId);
    ctx.body = response.success(dictId ? "更新成功" : "创建成功", result);
  } catch (err: any) {
    ctx.body = response.error(err.message || (dictId ? "更新失败" : "创建失败"));
  }
};

// 创建字典类型
export const createDictTypeController = async (ctx: Context) => {
  await saveDictType(ctx);
};

// 更新字典类型
export const updateDictTypeController = async (ctx: Context) => {
  const { dictId } = ctx.params;
  await saveDictType(ctx, parseInt(dictId));
};

// 删除字典类型
export const deleteDictTypeController = async (ctx: Context) => {
  try {
    const { dictId } = ctx.params;
    await deleteDictTypeService(parseInt(dictId));
    ctx.body = response.success("删除成功");
  } catch (err: any) {
    ctx.body = response.error(err.message || "删除失败");
  }
};
