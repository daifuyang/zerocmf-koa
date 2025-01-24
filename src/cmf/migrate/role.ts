import { now } from "@/lib/date";
import { getFileJson } from "@/lib/file";
import { getRoleById, getRoleByName, createRole, updateRole } from "../models/role";
import path from "path";

// 数据库迁移角色表
export default async function migrateRole() {
  // 是否存在默认的管理员
  const superRole = await getRoleById(1);
  if (!superRole) {
    await createRole({
      name: "超级管理员",
      description: "超级管理员",
      createdAt: now(),
      updatedAt: now()
    });
  }

  const filePath = path.join(global.ROOT_PATH, "config/migrate/menus.json");
  const roles = getFileJson(filePath);

  for (const element of roles) {
    const role = await getRoleByName(element.name);
    if (!role) {
      await createRole({
        name: element.name,
        description: element.description,
        createdAt: now(),
        updatedAt: now()
      });
    } else {
      await updateRole(role.roleId, {
        name: element.name,
        description: element.description,
        createdAt: now(),
        updatedAt: now()
      });
    }
  }
}
