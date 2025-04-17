import { DictDataRequest, DictDataWhere } from "@/cmf/typings/controller";
import {
  getDictDataListModel,
  getDictDataByIdModel,
  createDictDataModel,
  updateDictDataModel,
  deleteDictDataModel,
  getDictDataCountModel,
  deleteDictDataBatchModel
} from "@/cmf/models/dictData";
import { now } from "@/lib/date";
import { SysUser } from "@prisma/client";

// 获取字典数据列表服务
export const getDictDataListService = async (
  dictType: string,
  dictLabel?: string,
  current: number = 1,
  pageSize: number = 10
) => {
  if (!dictType) {
    throw new Error("字典类型不能为空");
  }

  const where: DictDataWhere = {
    dictType: dictType
  };

  if (dictLabel) {
    where.dictLabel = {
      contains: dictLabel
    };
  }

  const total = await getDictDataCountModel(where);

  // 处理分页逻辑
  const parsedPageSize = pageSize === 0 ? 0 : pageSize;
  const data = parsedPageSize === 0
    ? await getDictDataListModel(where)
    : await getDictDataListModel(
        where,
        current,
        parsedPageSize
      );

  // 根据是否分页返回不同格式的数据
  if (parsedPageSize === 0) {
    return data;
  } else {
    return {
      total,
      current,
      pageSize: parsedPageSize,
      data
    };
  }
};

// 根据字典类型获取字典数据服务
export const getDictDataByTypeService = async (dictType: string) => {
  if (!dictType) {
    throw new Error("字典类型不能为空");
  }
  return await getDictDataListModel({ dictType });
};

// 获取字典数据详情服务
export const getDictDataInfoService = async (dictCode: number) => {
  const dictData = await getDictDataByIdModel(dictCode);
  if (!dictData) {
    throw new Error("字典数据不存在");
  }
  return dictData;
};

// 创建字典数据服务
export const createDictDataService = async (body: DictDataRequest, user: SysUser) => {
  const { userId, loginName } = user;
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
    throw new Error("字典标签、键值和类型不能为空");
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

  return await createDictDataModel(params);
};

// 更新字典数据服务
export const updateDictDataService = async (dictCode: number, body: DictDataRequest, user: SysUser) => {
  const { loginName } = user;
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
    throw new Error("字典标签、键值和类型不能为空");
  }

  const existingData = await getDictDataByIdModel(dictCode);
  if (!existingData) {
    throw new Error("字典数据不存在");
  }

  const params = {
    dictSort: Number(dictSort) || 0,
    dictLabel: dictLabel.trim(),
    dictValue: dictValue.trim(),
    dictType: dictType.trim(),
    cssClass: cssClass?.trim() || "",
    listClass: listClass?.trim() || "",
    isDefault: Number(isDefault) || 0,
    status: Number(status) || 0,
    remark: remark?.trim() || "",
    updatedBy: loginName,
    updatedAt: now()
  };

  return await updateDictDataModel(dictCode, params);
};

// 删除字典数据服务
export const deleteDictDataService = async (dictCode: number) => {
  const existingData = await getDictDataByIdModel(dictCode);
  if (!existingData) {
    throw new Error("字典数据不存在");
  }
  return await deleteDictDataModel(dictCode);
};

// 批量删除字典数据服务
export const deleteDictDataBatchService = async (dictCodes: number[]) => {
  if (!Array.isArray(dictCodes) || dictCodes.length === 0) {
    throw new Error("请选择要删除的数据");
  }
  const res = await deleteDictDataBatchModel(dictCodes);
  if (!res || res.count === 0) {
     throw new Error("批量删除失败或没有数据被删除");
  }
  return res;
};
