import path from "path";
import fs from "fs";
import { PUBLIC_PATH } from "@/constants/path";
/**
 * 从 config/migrate 目录读取 menus.json 文件
 * @returns {Object} 解析后的菜单数据
 * @throws {Error} 如果读取文件失败，则抛出错误
 */
export function getFileJson(filePath?: string) {
  try {
    // 读取文件并解析为对象
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    // 捕获并抛出错误
    // throw new Error(`读取 menus.json 文件失败: ${err.message}`);
    return [];
  }
}

// 获取当前日期的文件夹名称
export function getDateName(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // 月份补零
  const day = String(date.getDate()).padStart(2, "0"); // 日期补零
  return `${year}${month}${day}`;
}

// 获取上传文件夹名称（临时处理）
export function getUploadName(): string {
  return "uploads";
}

// 获取当前日期的文件夹路径
export function getDateFolder(): string {
  const uploadName = getUploadName();
  return path.join(PUBLIC_PATH, getUploadName(), getDateName());
}

/**
 * 将字节转换为友好格式（如 KB、MB、GB）
 * @param size 文件大小（字节）
 * @returns 格式化后的文件大小（字符串）
 */
export function formatFileSize(size: number): string {
  if (size < 1024) {
    return `${size} B`; // 字节
  } else if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)} KB`; // 千字节
  } else if (size < 1024 * 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(2)} MB`; // 兆字节
  } else {
    return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`; // 千兆字节
  }
}

// 保存文件的辅助函数
export function saveFile(file: any): {
  filePath: string;
  prevPath: string;
  size: string;
  mimetype: string;
} {
  const origin = global.request.origin;

  const { originalFilename, filepath, size, mimetype } = file;
  const dateFolder = getDateFolder();

  // 生成文件保存路径
  const newPath = path.join(dateFolder, originalFilename);

  // 将文件移动到目标文件夹
  fs.renameSync(filepath, newPath);
  const uploadName = getUploadName();
  const filePath = path.join("/", uploadName, getDateName(), originalFilename);
  const prevPath = path.join(origin, filePath);

  // 格式化文件大小
  const formattedSize = formatFileSize(size);

  return {
    filePath,
    prevPath,
    size: formattedSize,
    mimetype
  };
}
