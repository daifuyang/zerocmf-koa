const fs = require('fs');
const path = require('path');

// 定义上级目录路径
const parentDir = path.join(__dirname, '..');
const distDirPath = path.join(parentDir, 'dist');
const swaggerDirPath = path.join(parentDir, 'src');

/**
 * 递归复制源目录下的所有 .yaml 文件到目标目录，保持源目录的层级结构
 * @param {string} srcDir 源目录
 * @param {string} destDir 目标目录
 */
function copyYamlFiles(srcDir, destDir) {
  // 确保目标目录存在
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  // 读取源目录的所有文件
  const files = fs.readdirSync(srcDir);

  files.forEach(file => {
    const srcFilePath = path.join(srcDir, file);
    const destFilePath = path.join(destDir, file);

    // 如果是目录，则递归复制
    if (fs.statSync(srcFilePath).isDirectory()) {
      copyYamlFiles(srcFilePath, destFilePath);
    } else if (file.endsWith('.yaml')) {
      // 如果是 .yaml 文件，复制到目标目录
      fs.copyFileSync(srcFilePath, destFilePath);
      console.log(`复制文件: ${file}`);
    }
  });
}
// 执行脚本
function execute() {
  copyYamlFiles(swaggerDirPath, distDirPath)
}

// 运行脚本
execute();
