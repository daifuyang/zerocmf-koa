import { Context } from "koa";
import response from "@/lib/response";
import {
  getDictDataListService,
  getDictDataByTypeService,
  getDictDataInfoService,
  createDictDataService,
  updateDictDataService,
  deleteDictDataService,
  deleteDictDataBatchService
} from "@/cmf/services/dictData";
import { DictDataRequest, DictDataBatchDeleteRequest } from "@/cmf/typings/controller";
import { SysUser } from "@prisma/client";

// 获取字典数据列表
export const getDictDataListController = async (ctx: Context) => {
  try {
    const { dictType, dictLabel, current = 1, pageSize = 10 } = ctx.query;
    const parsedPageSize = String(pageSize) === "0" ? 0 : parseInt(pageSize as string);
    const result = await getDictDataListService(
      dictType as string,
      dictLabel as string,
      parseInt(current as string),
      parsedPageSize
    );
    ctx.body = response.success("获取成功", result);
  } catch (err: any) {
    ctx.body = response.error(err.message || "获取失败");
  }
};

// 根据字典类型获取字典数据
export const getDictDataByTypeController = async (ctx: Context) => {
  try {
    const { dictType } = ctx.params;
    const dictData = await getDictDataByTypeService(dictType);
    ctx.body = response.success("获取成功", dictData);
  } catch (err: any) {
    ctx.body = response.error(err.message || "获取失败");
  }
};

// 获取字典数据详情
export const getDictDataInfoController = async (ctx: Context) => {
  try {
    const { dictCode } = ctx.params;
    const dictData = await getDictDataInfoService(parseInt(dictCode));
    ctx.body = response.success("获取成功", dictData);
  } catch (err: any) {
    ctx.body = response.error(err.message || "获取失败");
  }
};

// 创建字典数据
export const createDictDataController = async (ctx: Context) => {
  try {
    const body = ctx.request.body as DictDataRequest;
    const user = ctx.state.user as SysUser;
    const newDictData = await createDictDataService(body, user);
    ctx.body = response.success("创建成功", newDictData);
  } catch (err: any) {
    ctx.body = response.error(err.message || "创建失败");
  }
};

// 更新字典数据
export const updateDictDataController = async (ctx: Context) => {
  try {
    const { dictCode } = ctx.params;
    const body = ctx.request.body as DictDataRequest;
    const user = ctx.state.user as SysUser;
    const updatedDictData = await updateDictDataService(parseInt(dictCode), body, user);
    ctx.body = response.success("更新成功", updatedDictData);
  } catch (err: any) {
    ctx.body = response.error(err.message || "更新失败");
  }
};

// 删除字典数据
export const deleteDictDataController = async (ctx: Context) => {
  try {
    const { dictCode } = ctx.params;
    await deleteDictDataService(parseInt(dictCode));
    ctx.body = response.success("删除成功");
  } catch (err: any) {
    ctx.body = response.error(err.message || "删除失败");
  }
};

// 批量删除字典数据
export const deleteDictDataBatchController = async (ctx: Context) => {
  try {
    const { dictCodes } = ctx.request.body as DictDataBatchDeleteRequest;
    await deleteDictDataBatchService(dictCodes);
    ctx.body = response.success("批量删除成功");
  } catch (err: any) {
    ctx.body = response.error(err.message || "批量删除失败");
  }
};
