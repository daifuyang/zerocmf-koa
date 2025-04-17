import {
  getDictTypeCountModel,
  getDictTypeListModel,
  getDictTypeByIdModel,
  createDictTypeModel,
  updateDictTypeModel,
  deleteDictTypeModel
} from "@/cmf/models/dict";
import { Prisma, SysUser } from "@prisma/client";
import { formatFields, now } from "@/lib/date";

// 定义 DictRequest 接口
export interface DictRequest {
  dictName: string;
  dictType: string;
  status?: number;
  remark?: string;
  createdAt?: number;
  createdId?: number;
  createdBy?: string;
  updatedAt?: number;
  updatedId?: number;
  updatedBy?: string;
}

// 获取字典类型列表服务
export const getDictTypeListService = async (
  dictName?: string,
  dictType?: string,
  status?: string,
  current: number = 1,
  pageSize: number = 10
) => {
  const where: Prisma.SysDictTypeWhereInput = {};

  if (dictName) {
    where.dictName = {
      contains: dictName
    };
  }

  if (dictType) {
    where.dictType = {
      contains: dictType
    };
  }

  if (status) {
    where.status = parseInt(status);
  }

  const total = await getDictTypeCountModel(where);
  const data = await getDictTypeListModel(where);

  // 时间格式化
  formatFields(data, [
    { fromField: "createdAt", toField: "createdTime" }
  ]);

  return {
    total,
    current,
    pageSize,
    data
  };
};

// 获取字典类型详情服务
export const getDictTypeInfoService = async (dictId: number) => {
  const dictType = await getDictTypeByIdModel(dictId);
  if (!dictType) {
    throw new Error("字典类型不存在");
  }
  return dictType;
};

// 保存字典类型服务（创建/更新）
export const saveDictTypeService = async (
  body: DictRequest,
  user: SysUser,
  dictId?: number
) => {
  const { dictName, dictType, status, remark } = body;
  const { userId, loginName } = user;

  if (!dictName || !dictType) {
    throw new Error("字典名称和字典类型不能为空");
  }

  const params: Partial<DictRequest> = {
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
    return await updateDictTypeModel(dictId, params);
  } else {
    // 创建操作
    params.createdId = userId;
    params.createdAt = now();
    params.createdBy = loginName;
    return await createDictTypeModel(params as DictRequest); // Cast needed as create expects full object
  }
};

// 删除字典类型服务
export const deleteDictTypeService = async (dictId: number) => {
  await deleteDictTypeModel(dictId);
};
