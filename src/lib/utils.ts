import bcrypt from "bcrypt";
import crypto from "crypto";

export function excludeFields(data: any, keys: string[]) {
  return Object.fromEntries(Object.entries(data).filter(([key]) => !keys.includes(key)));
}

export function serializeData(data: any) {
  return JSON.stringify(data, (key, value) => {
    typeof value === "bigint" ? value.toString() : value;
  });
}

/**
 * 将对象中的 BigInt 转换为字符串，以避免 JSON.stringify 抛出错误。
 * @param {any} obj - 需要转换的对象。
 * @returns {any} - 转换后的对象。
 */
export function convertToJson(obj) {
  if (typeof obj === "bigint") {
    return obj.toString(); // 将 BigInt 转换为字符串
  } else if (Array.isArray(obj)) {
    return obj.map(convertToJson); // 对数组元素递归处理
  } else if (obj !== null && typeof obj === "object") {
    const newObj = {};
    for (const [key, value] of Object.entries(obj)) {
      newObj[key] = convertToJson(value); // 对对象属性递归处理
    }
    return newObj;
  } else {
    return obj;
  }
}

export function generateSalt(length = 6) {
  return crypto.randomBytes(length).toString("hex").slice(0, length);
}

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}
