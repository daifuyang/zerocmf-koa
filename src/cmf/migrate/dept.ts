import { now } from "@/lib/date";
import { createDept, getDeptById, getDeptByName } from "../models/dept";

export default async function migrateDept() {
  // 检查ID为1的部门是否已存在
  const existingDept = await getDeptByName("ZeroCMF");

  // 如果不存在，则创建ZeroCMF部门
  if (!existingDept) {
    await createDept({
      parentId: 0,
      ancestors: "0",
      deptName: "ZeroCMF",
      sortOrder: 1,
      leader: "admin",
      phone: "",
      email: "",
      status: 1, // 默认启用状态
      createdAt: now(),
      updatedAt: now()
    });
  }
}
