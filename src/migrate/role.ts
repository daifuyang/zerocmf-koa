import { now } from "@/lib/date";
import { getRoleById, getRoleByName, createRoleModel, updateRoleModel } from "@/models/role";
import roles from "./data/roles.json";

// 数据库迁移角色表
export default async function migrateRole() {
  // 是否存在默认的管理员
  const superRole = await getRoleById(1);
  if (!superRole) {
    await createRoleModel({
      name: "超级管理员",
      description: "超级管理员",
      createdAt: now(),
      updatedAt: now()
    });
  }

  for (const element of roles) {
    const role = await getRoleByName(element.name);
    if (!role) {
      await createRoleModel({
        name: element.name,
        description: element.description,
        createdAt: now(),
        updatedAt: now()
      });
    } else {
      await updateRoleModel(role.id, {
        name: element.name,
        description: element.description,
        createdAt: now(),
        updatedAt: now()
      });
    }
  }
}
