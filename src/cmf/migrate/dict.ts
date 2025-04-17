import { now } from "@/lib/date";
import { createDictTypeModel, getDictTypeByTypeModel } from "../models/dict";
import { createDictDataModel, getDictDataBydictTypeAndValueModel, getDictDataListModel } from "../models/dictData";

const SYS_GENDER = "sys_gender";
const SYS_STATUS = "sys_status";

/**
 * 创建字典类型及其数据
 * @param dictType 字典类型编码
 * @param dictName 字典类型名称
 * @param dictDataList 字典数据列表
 */
async function createDictAndData(dictType: string, dictName: string, dictDataList: Array<{dictLabel: string, dictValue: string}>) {
  // 创建字典类型
  const typeExists = await getDictTypeByTypeModel(dictType);
  if (!typeExists) {
    await createDictTypeModel({
      dictType,
      dictName,
      createdAt: now(),
      updatedAt: now()
    });
  }

  // 创建字典数据
  let index = dictDataList.length;
  for (const item of dictDataList) {
    index--;
    const exist = await getDictDataBydictTypeAndValueModel(dictType, item.dictValue);
    if (!exist) {
      await createDictDataModel({
        dictSort: index,
        dictLabel: item.dictLabel,
        dictValue: item.dictValue,
        dictType,
        createdAt: now(),
        updatedAt: now(),
        createdId: 1,
        createdBy: "admin"
      });
    }
  }
}

export default async function migrateDict() {
  // 性别字典
  await createDictAndData(
    SYS_GENDER, 
    "性别", 
    [
      { dictLabel: "男", dictValue: "1" },
      { dictLabel: "女", dictValue: "0" },
      { dictLabel: "未知", dictValue: "2" }
    ]
  );

  // 系统状态字典
  await createDictAndData(
    SYS_STATUS, 
    "系统状态", 
    [
      { dictLabel: "启用", dictValue: "1" },
      { dictLabel: "停用", dictValue: "0" }
    ]
  );
}
