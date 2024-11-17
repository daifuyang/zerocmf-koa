import fs from "fs";
import path from "path";
import migrateUser from "../migrate/user";
import migrateMenu from "../migrate/menu";
import migrateRole from "@/migrate/role";

const isDevelopment = process.env.NODE_ENV === 'development';

export const install = async () => {

  const lockDir = path.resolve(process.cwd(), "install");
  const lockFile = path.resolve(lockDir, "install.lock");
  if (fs.existsSync(lockFile) && !isDevelopment) {
    console.log("已经安装过");
    return;
  }

  migrateUser();
  migrateRole();
  migrateMenu();

  // 创建安装锁

  if (!fs.existsSync(lockDir)) {
    fs.mkdirSync(lockDir);
  }

  fs.writeFileSync(lockFile, "");
};
