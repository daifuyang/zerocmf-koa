import { Context } from "koa";
import response from "@/lib/response";
import { DictDataRequest, DictDataWhere, DictDataBatchDeleteRequest } from "@/cmf/typings/controller";
import {
  getDictDataList,
  getDictDataById,
  createDictData,
  updateDictData,
  deleteDictData,
  getDictDataCount,
  deleteDictDataBatch
} from "@/cmf/models/dictData";
import { now } from "@/lib/date";

// 获取字典数据列表
export const getDictDataListController = async (ctx: Context) => {
  try {
    const { dictType, dictLabel, current = 1, pageSize = 10 } = ctx.query;

    if (!dictType) {
      ctx.body = response.error("字典类型不能为空");
      return;
    }

    const where: DictDataWhere = {
      dictType: dictType as string
    };

    if (dictLabel) {
      where.dictLabel = {
        contains: dictLabel as string
      };
    }

    const total = await getDictDataCount(where);
    
    // 处理分页逻辑
    const parsedPageSize = String(pageSize) === "0" ? 0 : parseInt(pageSize as string);
    const data = parsedPageSize === 0 
      ? await getDictDataList(where) 
      : await getDictDataList(
          where,
          parseInt(current as string),
          parsedPageSize
        );

    // 根据是否分页返回不同格式的数据
    let result;
    if (parsedPageSize === 0) {
      result = data;
    } else {
      result = {
        total,
        current: parseInt(current as string),
        pageSize: parsedPageSize,
        data
      };
    }

    ctx.body = response.success("获取成功", result);
  } catch (err) {
    ctx.body = response.error("获取失败");
  }
};

// 根据字典类型获取字典数据
export const getDictDataByTypeController = async (ctx: Context) => {
  try {
    const { dictType } = ctx.params;

    const dictData = await getDictDataList({
      dictType
    });

    ctx.body = response.success("获取成功", dictData);
  } catch (err) {
    ctx.body = response.error("获取失败");
  }
};

// 获取字典数据详情
export const getDictDataInfoController = async (ctx: Context) => {
  try {
    const { dictCode } = ctx.params;

    const dictData = await getDictDataById(parseInt(dictCode));

    if (!dictData) {
      ctx.body = response.error("字典数据不存在");
      return;
    }

    ctx.body = response.success("获取成功", dictData);
  } catch (err) {
    ctx.body = response.error("获取失败");
  }
};

// 创建字典数据
export const createDictDataController = async (ctx: Context) => {
  const { userId, loginName } = ctx.state.user;

  try {
    const body = ctx.request.body as DictDataRequest;
    const {
      dictSort,
      dictLabel,
      dictValue,
      dictType,
      cssClass,
      listClass,
      isDefault,
      status,
      remark
    } = body;

    // 必填字段校验
    if (!dictLabel?.trim() || !dictValue?.trim() || !dictType?.trim()) {
      ctx.body = response.error("字典标签、键值和类型不能为空");
      return;
    }

    // 设置带默认值的参数
    const params: DictDataRequest = {
      dictLabel: dictLabel.trim(),
      dictValue: dictValue.trim(),
      dictType: dictType.trim(),
      dictSort: Number(dictSort) || 0,
      cssClass: cssClass?.trim() || "",
      listClass: listClass?.trim() || "",
      isDefault: Number(isDefault) || 0,
      status: Number(status) || 0,
      remark: remark?.trim() || "",
      createdBy: loginName,
      updatedBy: loginName,
      createdAt: now(),
      updatedAt: now()
    };

    const newDictData = await createDictData(params);

    ctx.body = response.success("创建成功", newDictData);
  } catch (err) {
    console.log("err", err);
    ctx.body = response.error("创建失败");
  }
};

// 更新字典数据
export const updateDictDataController = async (ctx: Context) => {
  try {
    const { dictCode } = ctx.params;
    const body = ctx.request.body as DictDataRequest;
    const {
      dictSort,
      dictLabel,
      dictValue,
      dictType,
      cssClass,
      listClass,
      isDefault,
      status,
      remark
    } = body;

    if (!dictSort || !dictLabel || !dictValue || !dictType) {
      ctx.body = response.error("必填参数不能为空");
      return;
    }

    const updatedDictData = await updateDictData(parseInt(dictCode), {
      dictSort,
      dictLabel,
      dictValue,
      dictType,
      cssClass: cssClass || "",
      listClass: listClass || "",
      isDefault: Number(isDefault) || 0,
      status: Number(status) || 0,
      remark: remark || ""
    });

    ctx.body = response.success("更新成功", updatedDictData);
  } catch (err) {
    ctx.body = response.error("更新失败");
  }
};

// 删除字典数据
export const deleteDictDataController = async (ctx: Context) => {
  try {
    const { dictCode } = ctx.params;

    await deleteDictData(parseInt(dictCode));

    ctx.body = response.success("删除成功");
  } catch (err) {
    ctx.body = response.error("删除失败");
  }
};

// 批量删除字典数据
export const deleteDictDataBatchController = async (ctx: Context) => {
  try {
    const { dictCodes } = ctx.request.body as DictDataBatchDeleteRequest;

    if (!Array.isArray(dictCodes) || dictCodes.length === 0) {
      ctx.body = response.error("请选择要删除的数据");
      return;
    }

    // 使用 Prisma 的 deleteMany 方法批量删除
    const res = await deleteDictDataBatch(dictCodes);
    console.log("res", res);
    if (!res) {
      ctx.body = response.error("批量删除失败");
      return;
    }
    ctx.body = response.success("批量删除成功");
  } catch (err) {
    ctx.body = response.error("批量删除失败");
  }
};
