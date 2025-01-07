import fs from 'fs';
/**
 * 从 config/migrate 目录读取 menus.json 文件
 * @returns {Object} 解析后的菜单数据
 * @throws {Error} 如果读取文件失败，则抛出错误
 */
export function getFileJson(filePath?: string) {
    try {
      // 读取文件并解析为对象
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      // 捕获并抛出错误
      // throw new Error(`读取 menus.json 文件失败: ${err.message}`);
      return [];
    }
  }