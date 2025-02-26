import { getMediaCount, getMediaList } from "@/cmf/models/media";
import { parseQuery } from "@/lib/request";
import response from "@/lib/response";
import { Context } from "koa";
import fs from "fs";
import { getDateFolder, saveFile } from "@/lib/file";

// 获取媒体资源列表
export async function getMediaListController(ctx: Context) {
  const query = ctx.query || {};
  const { current, pageSize } = parseQuery(query);
  const total = await getMediaCount();
  const media = await getMediaList(current, pageSize);
  const pagination = {
    page: current,
    pageSize: pageSize,
    total,
    data: media
  };
  ctx.body = response.success("获取成功！", pagination);
}

// 添加媒体资源
export async function addMediaController(ctx: Context) {
  const { type } = ctx.query;
  const files = ctx.request.files?.file;
  if (!files) {
    ctx.body = response.error("上传失败！");
    return;
  }

  // 获取当前日期的文件夹路径
  const dateFolder = getDateFolder();

  // 如果文件夹不存在，则创建
  if (!fs.existsSync(dateFolder)) {
    fs.mkdirSync(dateFolder, { recursive: true });
  }

  // 处理单个文件或多个文件
  const results = Array.isArray(files)
    ? files.map((file) => saveFile(file)) // 处理多个文件
    : [saveFile(files)]; // 处理单个文件

  ctx.body = response.success("上传成功！", results);
  return;
}
