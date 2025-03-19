import path from "path";

const ROOT_PATH = process.cwd();
/* 
const APP_PATH =
  process.env.NODE_ENV === "development" ? path.resolve(ROOT_PATH, "src") : ROOT_PATH; */

const APP_PATH = path.resolve(ROOT_PATH, "src");

// 上传路径
const PUBLIC_PATH = path.resolve(ROOT_PATH, "public");
const UPLOAD_DIR = path.resolve(PUBLIC_PATH, "uploads");

// 菜单json文件
const MENU_JSON = path.resolve(APP_PATH, "config/data/menus.json");

// enforcer模型文件
const RBAC_MODEL = path.resolve(APP_PATH, "config/casbin/rbac_model.conf");

const LOCK_DIR = path.resolve(APP_PATH, "install");
const LOCK_FILE = path.resolve(LOCK_DIR, "install.lock");

const SWAGGER_APIS = path.resolve(APP_PATH, "**/*.yaml");

export { ROOT_PATH, PUBLIC_PATH, MENU_JSON, UPLOAD_DIR, RBAC_MODEL, LOCK_DIR, LOCK_FILE, SWAGGER_APIS };
