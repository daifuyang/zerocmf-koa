const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const readDir = promisify(fs.readdir);
const stat = promisify(fs.stat);

// Hardcoded paths config based on the known tsconfig.json
const getTsConfigPaths = async () => {
  // We know from reading the file earlier that the path mapping is "@/*": ["src/*"]
  return {
    "@/*": ["src/*"]
  };
};

// Hardcoded output directory from the known tsconfig.json
const getOutputDir = async () => {
  // We know from reading the file earlier that the outDir is "./dist"
  return './dist';
};

// Recursively find all JS files in a directory
const findJsFiles = async (dir) => {
  const files = [];
  const items = await readDir(dir);
  
  for (const item of items) {
    const itemPath = path.join(dir, item);
    const itemStat = await stat(itemPath);
    
    if (itemStat.isDirectory()) {
      const nestedFiles = await findJsFiles(itemPath);
      files.push(...nestedFiles);
    } else if (item.endsWith('.js')) {
      files.push(itemPath);
    }
  }
  
  return files;
};

// Calculate the relative path from a file to the base of the compiled output
const calculateRelativePath = (filePath, baseDir, targetPath) => {
  // Remove 'src/' from the target path since in production build, 
  // there is no src folder. The compiled output in dist becomes the root.
  const adjustedTargetPath = targetPath.replace(/^src\//, '');
  
  const relativePath = path.relative(
    path.dirname(filePath), 
    path.join(baseDir, adjustedTargetPath)
  );
  
  return relativePath.startsWith('.') ? relativePath : './' + relativePath;
};

// Fix all '@/' imports in a file
const fixFileImports = async (filePath, baseDir, pathAliases) => {
  try {
    let content = await readFile(filePath, 'utf8');
    let modified = false;
    let fixes = 0;
    
    for (const [alias, targets] of Object.entries(pathAliases)) {
      if (!alias.endsWith('/*')) continue;
      
      const aliasBase = alias.substring(0, alias.length - 1); // Remove the '*'
      const targetBase = targets[0].substring(0, targets[0].length - 1); // Remove the '*'
      
      // Regular expression to match require statements with the alias
      const requireRegex = new RegExp(`require\\(['"](${aliasBase})([^'"]*)['"](\\))`, 'g');
      
      // Track original content length to see if we made changes
      const originalLength = content.length;
      
      content = content.replace(requireRegex, (match, aliasPath, pathSuffix, closingParen) => {
        const targetPath = targetBase + pathSuffix;
        const relativePath = calculateRelativePath(filePath, baseDir, targetPath);
        fixes++;
        console.log(`  - Replacing '${aliasPath}${pathSuffix}' with '${relativePath}' in require statement`);
        return `require('${relativePath}'${closingParen}`;
      });
      
      if (content.length !== originalLength) {
        modified = true;
      }
      
      // Regular expression to match import statements with the alias
      const importRegex = new RegExp(`from\\s+['"](${aliasBase})([^'"]*)['"](\\s*;)?`, 'g');
      
      const origLength2 = content.length;
      content = content.replace(importRegex, (match, aliasPath, pathSuffix, semicolon) => {
        const targetPath = targetBase + pathSuffix;
        const relativePath = calculateRelativePath(filePath, baseDir, targetPath);
        fixes++;
        console.log(`  - Replacing '${aliasPath}${pathSuffix}' with '${relativePath}' in import statement`);
        return `from '${relativePath}'${semicolon || ''}`;
      });
      
      if (content.length !== origLength2) {
        modified = true;
      }
      
      // Special case for __importStar(require("@/..."))
      const importStarRegex = new RegExp(`__importStar\\(require\\(['"](${aliasBase})([^'"]*)['"](\\))\\)`, 'g');
      
      const origLength3 = content.length;
      content = content.replace(importStarRegex, (match, aliasPath, pathSuffix, closingParen) => {
        const targetPath = targetBase + pathSuffix;
        const relativePath = calculateRelativePath(filePath, baseDir, targetPath);
        fixes++;
        console.log(`  - Replacing '${aliasPath}${pathSuffix}' with '${relativePath}' in __importStar statement`);
        return `__importStar(require('${relativePath}'${closingParen}))`;
      });
      
      if (content.length !== origLength3) {
        modified = true;
      }
    }
    
    if (modified) {
      await writeFile(filePath, content, 'utf8');
      console.log(`Fixed imports in: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error fixing file ${filePath}:`, error);
    return false;
  }
};

// Special handling for index.js file
const fixIndexFile = async (filePath, baseDir) => {
  try {
    console.log('Applying special fix for index.js file');
    let content = await readFile(filePath, 'utf8');
    let modified = false;
    
    // Special pattern for the route import in index.js
    const routeImportRegex = /const route_1 = __importStar\(require\("@\/cmf\/route"\)\);/g;
    
    if (routeImportRegex.test(content)) {
      modified = true;
      content = content.replace(
        routeImportRegex,
        'const route_1 = __importStar(require("./cmf/route"));'
      );
      console.log(`  - Fixed route import in index.js`);
    }
    
    if (modified) {
      await writeFile(filePath, content, 'utf8');
      console.log(`Fixed special imports in: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error fixing index file ${filePath}:`, error);
    return false;
  }
};

// Main function
const main = async () => {
  try {
    const pathAliases = await getTsConfigPaths();
    const outputDir = await getOutputDir();
    const absoluteOutputDir = path.resolve(process.cwd(), outputDir);
    
    console.log('Path aliases found in tsconfig.json:', JSON.stringify(pathAliases, null, 2));
    console.log('Output directory:', absoluteOutputDir);
    
    const jsFiles = await findJsFiles(absoluteOutputDir);
    console.log(`Found ${jsFiles.length} JavaScript files to process`);
    
    // First handle special case for index.js
    const indexJsPath = path.join(absoluteOutputDir, 'index.js');
    if (fs.existsSync(indexJsPath)) {
      await fixIndexFile(indexJsPath, absoluteOutputDir);
    }
    
    let fixedCount = 0;
    for (const file of jsFiles) {
      // Skip index.js since we already processed it
      if (file === indexJsPath) continue;
      
      const fixed = await fixFileImports(file, absoluteOutputDir, pathAliases);
      if (fixed) fixedCount++;
    }
    
    console.log(`Successfully fixed imports in ${fixedCount} files`);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

module.exports = main;