import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import { PUBLIC_PATH } from "@/constants/path";
import { Context } from "koa";
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
export function getDateFolder(): string {
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
export function getUploadFolder(): string {
  const uploadName = getUploadName();
  return path.join(uploadName, getDateFolder());
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
  fileKey: string;
  fileName: string;
  remarkName: string;
  fileSize: number;
  mimetype: string;
  extension: string;
} {
  const { originalFilename, filepath, size, mimetype } = file;
  // 生成文件保存路径
  const extension = originalFilename.split(".").pop(); // 获取文件扩展名
  
  const fileKey = uuidv4(); // 新的文件名
  const newFileName = `${fileKey}.${extension}`; // 新的文件名带后缀;
  const uploadFilePath = path.join(getUploadFolder(), newFileName); // 文件根路径
  const targetPath = path.join(PUBLIC_PATH, uploadFilePath); // 文件存储路径

  // 将文件移动到目标文件夹
  fs.renameSync(filepath, targetPath);
  const filePath = path.join("/", uploadFilePath);

  return {
    filePath,
    fileKey,
    fileName: originalFilename,
    remarkName: originalFilename,
    fileSize: size,
    extension,
    mimetype
  };
}

// 计算文件的哈希值
export async function calculateHashes(filePath): Promise<{ fileMd5: string; fileSha1: string }> {
  return new Promise((resolve, reject) => {
    const md5Hash = crypto.createHash("md5");
    const sha1Hash = crypto.createHash("sha1");

    const fileStream = fs.createReadStream(filePath);

    fileStream.on("data", (chunk) => {
      md5Hash.update(chunk);
      sha1Hash.update(chunk);
    });

    fileStream.on("end", () => {
      resolve({
        fileMd5: md5Hash.digest("hex"),
        fileSha1: sha1Hash.digest("hex")
      });
    });

    fileStream.on("error", reject);
  });
}

export function getPrevPath(ctx: Context) {
  const { origin } = ctx.request;
  const proto = ctx.get("X-Forwarded-Proto");
  const forwardedHost = ctx.get("X-Forwarded-Host");
  const originPath = proto ? `${proto}://${forwardedHost}` : `http://${forwardedHost}`;
  return forwardedHost ? originPath : origin;
}

/**
 * 重命名文件
 * @param oldPath 原文件路径（相对于PUBLIC_PATH）
 * @param newName 新文件名（不带路径）
 * @returns 新文件路径（相对于PUBLIC_PATH）
 */
export function renameFile(oldPath: string, newName: string): string {
  const oldFullPath = path.join(PUBLIC_PATH, oldPath);
  const dir = path.dirname(oldFullPath);
  const ext = path.extname(oldFullPath);
  const newFullPath = path.join(dir, `${newName}${ext}`);
  
  fs.renameSync(oldFullPath, newFullPath);
  
  return path.join(path.dirname(oldPath), `${newName}${ext}`);
}
