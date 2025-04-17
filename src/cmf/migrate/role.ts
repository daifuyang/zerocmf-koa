import { now } from "@/lib/date";
import { getFileJson } from "@/lib/file";
import { getRoleByIdModel, getRoleByNameModel, createRoleModel, updateRoleModel } from "@/cmf/models/role";
import path from "path";
import { MENU_JSON } from "@/constants/path";

// 数据库迁移角色表
export default async function migrateRole() {
  // 是否存在默认的管理员
  const superRole = await getRoleByIdModel(1);
  if (!superRole) {
    await createRoleModel({
      name: "超级管理员",
      description: "超级管理员",
      createdAt: now(),
      updatedAt: now()
    });
  }

  const filePath = path.join(MENU_JSON);
  const roles = getFileJson(filePath);

  for (const element of roles) {
    const role = await getRoleByNameModel(element.name);
    if (!role) {
      await createRoleModel({
        name: element.name,
        description: element.description,
        createdAt: now(),
        updatedAt: now()
      });
    } else {
      await updateRoleModel(role.roleId, {
        name: element.name,
        description: element.description,
        createdAt: now(),
        updatedAt: now()
      });
    }
  }
}
