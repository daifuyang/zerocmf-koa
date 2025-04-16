import { Context } from "koa";
import response from "@/lib/response";
import { DictRequest, DictWhere } from "@/cmf/typings/controller";
import {
  getDictTypeCount,
  getDictTypeList,
  getDictTypeById,
  createDictType,
  updateDictType,
  deleteDictType
} from "@/cmf/models/dict";
import { SysUser } from "@prisma/client";
import { formatFields, now } from "@/lib/date";

// 获取字典类型列表
export const getDictTypeListController = async (ctx: Context) => {
  try {
    const { dictName, dictType, status, current = 1, pageSize = 10 } = ctx.query;
    const where: DictWhere = {};

    if (dictName) {
      where.dictName = {
        contains: dictName as string
      };
    }

    if (dictType) {
      where.dictType = {
        contains: dictType as string
      };
    }

    if (status) {
      where.status = parseInt(status as string);
    }

    const total = await getDictTypeCount(where);
    const data = await getDictTypeList(where);

    // 时间格式化
    formatFields(data, [
      { fromField: "createdAt", toField: "createdTime" }
    ]);

    ctx.body = response.success("获取成功", {
      total,
      current: parseInt(current as string),
      pageSize: parseInt(pageSize as string),
      data
    });
  } catch (err) {
    ctx.body = response.error("获取失败");
  }
};

// 获取字典类型详情
export const getDictTypeInfoController = async (ctx: Context) => {
  try {
    const { dictId } = ctx.params;
    const dictType = await getDictTypeById(parseInt(dictId));

    if (!dictType) {
      ctx.body = response.error("字典类型不存在");
      return;
    }

    ctx.body = response.success("获取成功", dictType);
  } catch (err) {
    ctx.body = response.error("获取失败");
  }
};

// 保存字典类型（创建/更新）
const saveDictType = async (ctx: Context, dictId?: number) => {
  try {
    const body = ctx.request.body as DictRequest;
    const { dictName, dictType, status, remark } = body;
    const { userId, loginName } = ctx.state.user as SysUser;

    if (!dictName || !dictType) {
      ctx.body = response.error("字典名称和字典类型不能为空");
      return;
    }

    const params: DictRequest = {
      dictName,
      dictType,
      remark,
      status
    };

    if (dictId) {
      // 更新操作
      params.updatedAt = now();
      params.updatedId = userId;
      params.updatedBy = loginName;
      const updatedDictType = await updateDictType(dictId, params);
      ctx.body = response.success("更新成功", updatedDictType);
    } else {
      // 创建操作
      params.createdId = userId;
      params.createdAt = now();
      params.createdBy = loginName;
      const newDictType = await createDictType(params);
      ctx.body = response.success("创建成功", newDictType);
    }
  } catch (err) {
    ctx.body = response.error(dictId ? "更新失败" : "创建失败");
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

    await deleteDictType(parseInt(dictId));

    ctx.body = response.success("删除成功");
  } catch (err) {
    ctx.body = response.error("删除失败");
  }
};
