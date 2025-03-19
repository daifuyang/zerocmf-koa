const fs = require('fs').promises;
const path = require('path');

// 删除文件或目录（包括非空目录）
async function remove(destination) {
    try {
        const stats = await fs.stat(destination);
        if (stats.isDirectory()) {
            // 递归删除目录下的所有内容
            const files = await fs.readdir(destination);
            for (let file of files) {
                const filePath = path.join(destination, file);
                await remove(filePath);
            }
            // 删除空目录本身
            await fs.rmdir(destination);
        } else {
            // 删除文件
            await fs.unlink(destination);
        }
    } catch (error) {
        console.error(`删除失败: ${error.message}`);
    }
}

// 复制文件或目录
async function copy(source, destination) {
    try {
        // 如果目标存在则先删除
        try {
            await fs.access(destination);
            await remove(destination);
        } catch (error) {
            // 目标不存在的情况不需要处理
        }

        const stats = await fs.stat(source);

        if (stats.isFile()) {
            // 复制文件
            await fs.mkdir(path.dirname(destination), { recursive: true });
            await fs.copyFile(source, destination);
        } else if (stats.isDirectory()) {
            // 复制目录
            await fs.mkdir(destination, { recursive: true });
            const files = await fs.readdir(source);
            for (let file of files) {
                const srcPath = path.join(source, file);
                const destPath = path.join(destination, file);
                await copy(srcPath, destPath);
            }
        }
    } catch (error) {
        console.error(`操作失败: ${error.message}`);
    }
}

// 计算根目录
const ROOT_DIR = path.resolve(__dirname, '..');

// 打包配置
const PACKAGING_CONFIG = [
    { source: path.join(ROOT_DIR, 'package.json'), target: path.join(ROOT_DIR, 'dist/package.json') },
    { source: path.join(ROOT_DIR, '.env'), target: path.join(ROOT_DIR, 'dist/.env') },
    { source: path.join(ROOT_DIR, 'prisma'), target: path.join(ROOT_DIR, 'dist/prisma') },
    { source: path.join(ROOT_DIR, 'src/config'), target: path.join(ROOT_DIR, 'dist/config') },
    { source: path.join(ROOT_DIR, 'pm2.config.js'), target: path.join(ROOT_DIR, 'dist/pm2.config.js') }
].map(item => ({
    source: item.source,
    target: path.relative(ROOT_DIR, item.target) // 将目标路径转换为相对于项目根目录的路径
}));

// 根据配置执行打包
async function packageApp() {
    for (const item of PACKAGING_CONFIG) {
        const sourcePath = item.source;
        const destinationPath = path.join(ROOT_DIR, item.target);
        await copy(sourcePath, destinationPath)
            .then(() => console.log(`${item.source} 复制完成`))
            .catch(error => console.error(`发生错误: ${error}`));
    }
}

// 执行打包
packageApp();

const main = require('./fix-paths');
main();