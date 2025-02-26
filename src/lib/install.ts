import fs from "fs";

import migrate from "@/migrate";
import { LOCK_DIR, LOCK_FILE } from "@/constants/path";

const isDevelopment = process.env.NODE_ENV === "development";

export const install = (cmf) => {
  if (fs.existsSync(LOCK_FILE) && !isDevelopment) {
    console.log("已经安装过");
    return true;
  }
  // 创建安装锁
  cmf.migrate = migrate;

  if (!fs.existsSync(LOCK_DIR)) {
    fs.mkdirSync(LOCK_DIR);
  }

  fs.writeFileSync(LOCK_FILE, "");
  return false;
};
