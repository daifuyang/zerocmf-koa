import { now } from "@/lib/date";
import { generateSalt, hashPassword } from "@/lib/utils";
import { createUserModel, getUserModel } from "../models/user";

export default async function migrateUser() {
  // 初始化
  const existUser = await getUserModel({
    loginName: "admin"
  });
  if (!existUser) {
    const salt = generateSalt();
    // 从环境变量获取
    const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD;
    
    if (!defaultPassword) {
      throw new Error("请在环境变量中配置DEFAULT_ADMIN_PASSWORD");
    }

    const password = await hashPassword(`${defaultPassword}${salt}`);
    const user = await createUserModel({
      loginName: "admin",
      password,
      salt,
      nickname: "admin",
      userType: 1,
      status: 1,
      createdAt: now(),
      updatedAt: now()
    });

    if (!user) {
      throw new Error("create admin user failed");
    }
  }
}
