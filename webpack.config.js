const path = require("path");
const webpack = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");
const nodeExternals = require("webpack-node-externals");
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: "./src/index.ts", // 入口文件
  target: "node", // 目标平台是 Node.js，适合 CommonJS
  mode: "production",
  externals: [nodeExternals()],
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'), // 设置生产环境变量
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'src/config'),  // 源文件路径
          to: path.resolve(__dirname, 'dist/config'),    // 目标目录
        },
      ],
    }),
  ],
  cache: {
    type: 'filesystem', // 使用文件系统缓存
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src") // 将 `@` 映射到 `src` 目录
    },
    extensions: [".ts", ".js"] // 解析 .ts 和 .js 文件
  },
  module: {
    rules: [
      {
        test: /\.ts?$/, // 匹配 .ts 和 .tsx 文件
        use: "ts-loader", // 使用 ts-loader 处理 TypeScript 文件
        exclude: /node_modules/ // 排除 node_modules 文件夹
      }
    ]
  },
  optimization: {
    // 启用 Tree Shaking: 生产环境下会自动移除无用的代码
    usedExports: true, // 仅导出在代码中实际使用的部分

    // 代码压缩
    minimize: true,
    minimizer: [
      // 使用 TerserPlugin 压缩 JS
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: false, // 去除 console.log 等调试信息
            drop_debugger: true, // 去除 debugger 语句
            dead_code: true // 删除死代码
          },
          output: {
            comments: false // 去除注释
          }
        },
        extractComments: false // 防止提取评论到单独文件
      })
    ],

    // 代码分割配置
    splitChunks: {
      chunks: "all", // 对所有的 chunk 进行拆分
      minSize: 10000, // 拆分的最小文件大小
      maxSize: 250000, // 拆分的最大文件大小
      minChunks: 1, // 拆分文件的最小重复次数
      automaticNameDelimiter: "-", // 拆分后的文件命名方式
      cacheGroups: {
        // 共享库提取
        vendors: {
          test: /[\\/]node_modules[\\/]/, // 匹配 node_modules 中的模块
          name: "vendors",
          chunks: "all"
        },
        default: {
          minChunks: 2, // 至少被两个文件共享的模块才会被拆分
          priority: -10, // 拆分时的优先级
          reuseExistingChunk: true // 复用已存在的 chunk
        }
      }
    },

    // 启用作用域提升（scope hoisting），减少输出文件的大小
    concatenateModules: true // 开启作用域提升
  },
  output: {
    filename: "index.js", // 输出文件名
    path: path.resolve(__dirname, "dist"), // 输出目录
    clean: true // 清理输出目录
  }
};
