import fs from "fs";
import path from "path";
import migrate from "@/migrate";

const isDevelopment = process.env.NODE_ENV === "development";

export const install = (cmf) => {
  const lockDir = path.resolve(global.ROOT_PATH, "install");
  const lockFile = path.resolve(lockDir, "install.lock");
  if (fs.existsSync(lockFile) && !isDevelopment) {
    console.log("已经安装过");
    return true;
  }
  // 创建安装锁
  cmf.migrate = migrate;

  if (!fs.existsSync(lockDir)) {
    fs.mkdirSync(lockDir);
  }

  fs.writeFileSync(lockFile, "");
  return false;
};
